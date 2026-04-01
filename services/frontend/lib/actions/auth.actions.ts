"use client";

import { getSession, signOut } from "next-auth/react";
import type { AppSessionLike } from "@/types/auth";

const LOGOUT_REDIRECT_PATH = "/login";
const BACKEND_LOGOUT_URL =
    `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api"}/auth/logout`;

async function revokeBackendSession(refreshToken?: string) {
    if (!refreshToken) {
        console.warn("Logout without refresh token in session");
        return;
    }

    try {
        const response = await fetch(BACKEND_LOGOUT_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ refresh: refreshToken }),
            cache: "no-store",
            keepalive: true,
        });

        if (!response.ok) {
            console.warn("Backend logout returned a non-200 response.", {
                status: response.status,
            });
        }
    } catch (error) {
        console.error("Error al cerrar sesión en el backend:", error);
    }
}

export async function logout(sessionOverride?: AppSessionLike | null) {
    let session = sessionOverride;

    if (typeof session === "undefined") {
        try {
            session = await getSession();
        } catch (error) {
            console.error("Error al obtener la sesión antes del logout:", error);
            session = null;
        }
    }

    const refreshToken = session?.backendTokens?.refresh_token;

    // Revocar la sesión del backend como mejor esfuerzo, sin bloquear el sign-out del frontend.
    void revokeBackendSession(refreshToken);

    try {
        const result = await signOut({
            redirect: false,
            callbackUrl: LOGOUT_REDIRECT_PATH,
        });

        const redirectUrl =
            typeof result?.url === "string" && result.url.length > 0
                ? result.url
                : LOGOUT_REDIRECT_PATH;

        window.location.replace(redirectUrl);
    } catch (error) {
        console.error("Error al cerrar sesión en NextAuth:", error);
        window.location.replace(LOGOUT_REDIRECT_PATH);
    }
}
