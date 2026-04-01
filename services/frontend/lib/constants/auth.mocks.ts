export const MOCK_AUTH_USER = {
    id: "mock-1",
    email: "admin@example.com",
    password: "admin123",
    name: "Administrador de Prueba",
    image: null,
    backendTokens: {
        access_token: "mock_access_token_valid_jwt_format_header.payload.signature",
        refresh_token: "mock_refresh_token_valid_format",
        user: {
            id: "mock-1",
            email: "admin@example.com",
            username: "admin_mock",
            first_name: "Administrador",
            last_name: "de Prueba",
            phone: "123456789",
            role: "admin",
            unit_number: "0-000",
            is_verified: true,
            profile_picture: null,
        }
    }
};
