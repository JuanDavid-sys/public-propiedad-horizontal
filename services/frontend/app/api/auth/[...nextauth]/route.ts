import { handlers } from "@/auth";
import { NextResponse } from "next/server";

export async function GET(...args: Parameters<typeof handlers.GET>) {
    try {
        return await handlers.GET(...args);
    } catch (error) {
        console.error("NextAuth GET handler error:", error);
        return NextResponse.json(
            { error: "AUTH_HANDLER_ERROR", message: "No fue posible completar la autenticacion." },
            { status: 503 }
        );
    }
}

export async function POST(...args: Parameters<typeof handlers.POST>) {
    try {
        return await handlers.POST(...args);
    } catch (error) {
        console.error("NextAuth POST handler error:", error);
        return NextResponse.json(
            { error: "AUTH_HANDLER_ERROR", message: "No fue posible completar la autenticacion." },
            { status: 503 }
        );
    }
}
