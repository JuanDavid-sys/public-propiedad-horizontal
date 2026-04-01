export interface SessionUserLike {
    id?: string;
    name?: string | null;
    email?: string | null;
    first_name?: string;
    last_name?: string;
}

export interface BackendTokensLike {
    access_token?: string;
    refresh_token?: string;
    user?: SessionUserLike;
}

export interface AppSessionLike {
    user?: SessionUserLike;
    error?: string;
    backendTokens?: BackendTokensLike;
}
