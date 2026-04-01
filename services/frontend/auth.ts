import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import Credentials from "next-auth/providers/credentials";
import { cookies } from "next/headers";
import { MOCK_AUTH_USER } from "@/lib/constants/auth.mocks";


const BACKEND_REQUEST_TIMEOUT_MS = 8000;
const REFRESH_RETRY_BASE_DELAY_MS = 2000;
const REFRESH_RETRY_MAX_DELAY_MS = 30000;
const REFRESH_ERROR_INVALID = "RefreshAccessTokenError";
const REFRESH_ERROR_NETWORK = "RefreshNetworkError";

function getRefreshRetryDelayMs(retryCount: number) {
    const delay = REFRESH_RETRY_BASE_DELAY_MS * Math.pow(2, Math.max(0, retryCount - 1));
    return Math.min(REFRESH_RETRY_MAX_DELAY_MS, delay);
}

async function safeJson(response: Response) {
    try {
        return await response.json();
    } catch {
        return null;
    }
}

function getApiUrl() {
    return process.env.INTERNAL_API_URL || process.env.NEXT_PUBLIC_API_URL || "";
}

async function fetchWithTimeout(url: string, options: RequestInit = {}, timeoutMs = BACKEND_REQUEST_TIMEOUT_MS) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), timeoutMs);

    try {
        return await fetch(url, {
            ...options,
            signal: controller.signal,
        });
    } finally {
        clearTimeout(timeout);
    }
}

export const { handlers, auth, signIn, signOut } = NextAuth({
    providers: [
        Google({
            clientId: process.env.AUTH_GOOGLE_ID,
            clientSecret: process.env.AUTH_GOOGLE_SECRET,
        }),
        Credentials({
            name: "Credentials",
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" }
            },
            async authorize(credentials) {
                if (!credentials?.email || !credentials?.password) return null;

                // Soporte para cuenta Mock si las credenciales coinciden
                if (credentials.email === MOCK_AUTH_USER.email && credentials.password === MOCK_AUTH_USER.password) {
                    console.log('✅ Mock user login detected');
                    const { password, ...userWithoutPassword } = MOCK_AUTH_USER;
                    return userWithoutPassword as any;
                }

                try {

                    const apiUrl = getApiUrl();
                    if (!apiUrl) return null;

                    const response = await fetchWithTimeout(`${apiUrl}/auth/login`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(credentials),
                    });

                    if (!response.ok) {
                        const errorData = await safeJson(response);
                        // Lanzamos el código de error específico del backend
                        throw new Error(errorData?.detail || 'AUTH_ERROR');
                    }

                    const data = await safeJson(response);
                    if (!data?.user || !data?.access_token || !data?.refresh_token) return null;

                    // Retornamos el usuario con sus tokens del backend
                    return {
                        id: data.user.id.toString(),
                        email: data.user.email,
                        name: `${data.user.first_name} ${data.user.last_name}`,
                        image: data.user.profile_picture,
                        backendTokens: {
                            access_token: data.access_token,
                            refresh_token: data.refresh_token,
                            user: data.user,
                        }
                    } as any;
                } catch (error) {
                    console.error('Error en authorize(credentials):', error);
                    return null;
                }
            }
        }),
    ],
    pages: {
        signIn: "/login",
        error: "/login",
    },
    callbacks: {
        async signIn({ user, account, profile }) {
            // Solo procesar login de Google
            if (account?.provider === "google") {
                try {
                    let isRegister = false;
                    try {
                        const cookieStore = await cookies();
                        const authAction = cookieStore.get("auth_action")?.value;
                        isRegister = authAction === "register";
                    } catch {
                        // On some server runtimes request cookies may be unavailable.
                        isRegister = false;
                    }

                    // Usar INTERNAL_API_URL en el servidor (Docker) o NEXT_PUBLIC_API_URL como fallback
                    const apiUrl = getApiUrl();
                    if (!apiUrl) return false;

                    // Seleccionar endpoint basado en la acción (login o registro)
                    const endpoint = isRegister ? '/auth/google-register' : '/auth/google-auth';
                    const fullName = (user.name || '').trim().split(/\s+/).filter(Boolean);
                    const firstName = profile?.given_name || fullName[0] || '';
                    const lastName = profile?.family_name || fullName.slice(1).join(' ') || '';

                    console.log(`DEBUG: Ejecutando ${isRegister ? 'Registro' : 'Login'} de Google para ${user.email}`);

                    // Sincronizar con el backend Django
                    const response = await fetchWithTimeout(`${apiUrl}${endpoint}`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                            google_id: account.providerAccountId,
                            email: user.email,
                            first_name: firstName,
                            last_name: lastName,
                            profile_picture: user.image || null,
                        }),
                    });

                    if (!response.ok) {
                        const errorData = await safeJson(response);
                        console.error(`Error al sincronizar con backend (${endpoint}):`, errorData);

                        if (!isRegister && response.status === 404) {
                            return "/login?error=account_not_registered";
                        }

                        return "/login?error=google_auth_failed";
                    }

                    const data = await safeJson(response);
                    if (!data?.user || !data?.access_token || !data?.refresh_token) {
                        return "/login?error=google_auth_failed";
                    }

                    // Guardar tokens en el objeto user para usarlos en el callback de session
                    (user as any).backendTokens = {
                        access_token: data.access_token,
                        refresh_token: data.refresh_token,
                        user: data.user,
                    };

                    return true;
                } catch (error) {
                    console.error('Error en signIn callback:', error);
                    return "/login?error=google_auth_failed";
                }
            }
            return true;
        },
        async jwt({ token, user, account }): Promise<any> {
            // Inicial: Guardar tokens del backend en el JWT token
            if (user && (user as any).backendTokens) {
                return {
                    ...token,
                    backendTokens: (user as any).backendTokens,
                    // Establecemos la expiración manual basándonos en la duración del backend (1 hora)
                    // Le restamos 5 minutos por seguridad para refrescar antes
                    accessTokenExpires: Date.now() + (60 * 60 * 1000) - (5 * 60 * 1000),
                };
            }

            // Si el token aún no ha expirado, retornarlo tal cual
            if (Date.now() < (token as any).accessTokenExpires) {
                return token;
            }

            // Si el token ha expirado, intentar refrescarlo
            return await refreshAccessToken(token);
        },
        async session({ session, token }) {
            // Pasar tokens del backend a la sesión
            if (token.backendTokens) {
                (session as any).backendTokens = token.backendTokens;
            }

            if (session.user && token.sub) {
                session.user.id = token.sub;
            }

            // Si hay error en el refresco, pasarlo a la sesión para que el cliente sepa que debe desloguear
            if ((token as any).error) {
                (session as any).error = (token as any).error;

                if ((token as any).error === REFRESH_ERROR_INVALID) {
                    // Invalidate session user and tokens for invalid refresh scenarios.
                    (session as any).backendTokens = undefined;
                    (session as any).user = undefined;
                }
            }

            return session;
        },
        async redirect({ url, baseUrl }) {
            // Logic to redirect after login
            if (url.startsWith("/")) return `${baseUrl}${url}`;
            try {
                if (new URL(url).origin === baseUrl) return url;
            } catch {
                return `${baseUrl}/apartamentos`;
            }
            return `${baseUrl}/apartamentos`;
        },
    },
});

/**
 * Función para refrescar el token de acceso con el backend Django
 */
async function refreshAccessToken(token: any) {
    try {
        const apiUrl = getApiUrl();
        if (!apiUrl || !token.backendTokens?.refresh_token) {
            console.error("Refresh token request skipped due to missing tokens or API URL.");
            return {
                ...token,
                error: REFRESH_ERROR_INVALID,
                refreshRetryAt: undefined,
                refreshRetryCount: undefined,
            };
        }

        const now = Date.now();
        if (token.refreshRetryAt && now < token.refreshRetryAt) {
            console.warn("Refresh token retry delayed due to recent network error.", {
                retryAt: token.refreshRetryAt,
            });
            return {
                ...token,
                error: REFRESH_ERROR_NETWORK,
            };
        }

        console.log("🔄 Refrescando token de acceso...");

        const response = await fetch(`${apiUrl}/auth/refresh`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ refresh: token.backendTokens.refresh_token }),
        });

        const refreshedTokens = await safeJson(response);

        if (!response.ok) {
            if (response.status >= 400 && response.status < 500) {
                console.warn("Refresh token rejected by backend.", { status: response.status });
                return {
                    ...token,
                    error: REFRESH_ERROR_INVALID,
                    refreshRetryAt: undefined,
                    refreshRetryCount: undefined,
                };
            }

            const retryCount = (token.refreshRetryCount ?? 0) + 1;
            const retryDelayMs = getRefreshRetryDelayMs(retryCount);
            console.warn("Refresh token request failed due to server error.", {
                status: response.status,
                retryCount,
                retryDelayMs,
            });
            return {
                ...token,
                error: REFRESH_ERROR_NETWORK,
                refreshRetryAt: now + retryDelayMs,
                refreshRetryCount: retryCount,
            };
        }

        if (!refreshedTokens?.access_token) {
            console.error("Refresh token response missing access_token.");
            return {
                ...token,
                error: REFRESH_ERROR_INVALID,
                refreshRetryAt: undefined,
                refreshRetryCount: undefined,
            };
        }

        if (!refreshedTokens.refresh_token) {
            console.warn("⚠️ Refresh token not returned, keeping existing token");
        }

        return {
            ...token,
            backendTokens: {
                ...token.backendTokens,
                access_token: refreshedTokens.access_token,
                // Si el backend rotara el refresh token, lo actualizaríamos aquí también
                refresh_token: refreshedTokens.refresh_token ?? token.backendTokens.refresh_token,
            },
            accessTokenExpires: Date.now() + (60 * 60 * 1000) - (5 * 60 * 1000),
            error: undefined,
            refreshRetryAt: undefined,
            refreshRetryCount: undefined,
        };
    } catch (error) {
        const retryCount = (token.refreshRetryCount ?? 0) + 1;
        const retryDelayMs = getRefreshRetryDelayMs(retryCount);
        console.warn("Refresh token request failed due to network error.", {
            retryCount,
            retryDelayMs,
            error,
        });
        return {
            ...token,
            error: REFRESH_ERROR_NETWORK,
            refreshRetryAt: Date.now() + retryDelayMs,
            refreshRetryCount: retryCount,
        };
    }
}
