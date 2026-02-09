import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getUser } from "@/lib/db";

export async function GET() {
    try {
        const cookieStore = await cookies();
        const authToken = cookieStore.get("auth_token");

        if (!authToken || !authToken.value) {
            return NextResponse.json({ user: null }, { status: 401 });
        }

        // In this simple implementation, the auth_token is the username
        // In production, you should use JWT verify here
        const username = authToken.value;

        // Check if user actually exists in DB
        const user: any = getUser(username);

        if (!user) {
            return NextResponse.json({ user: null }, { status: 401 });
        }

        return NextResponse.json({
            user: {
                username: user.username,
                role: user.role,
                created_at: user.created_at
            }
        });
    } catch (error) {
        console.error("Auth Check Error:", error);
        return NextResponse.json({ error: "Failed to check auth status" }, { status: 500 });
    }
}
