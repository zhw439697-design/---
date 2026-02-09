import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getUser, updateUser } from "@/lib/db";

export async function GET() {
    try {
        const cookieStore = await cookies();
        const authToken = cookieStore.get("auth_token");

        if (!authToken || !authToken.value) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const username = authToken.value;
        const user: any = getUser(username);

        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        // Don't send password hash to frontend
        const { password_hash, ...userProfile } = user;

        return NextResponse.json({ profile: userProfile });
    } catch (error) {
        console.error("Profile GET Error:", error);
        return NextResponse.json({ error: "Failed to fetch profile" }, { status: 500 });
    }
}

export async function PUT(req: Request) {
    try {
        const cookieStore = await cookies();
        const authToken = cookieStore.get("auth_token");

        if (!authToken || !authToken.value) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const username = authToken.value;
        const updates = await req.json();

        // Update user profile
        const updatedUser: any = updateUser(username, updates);

        if (!updatedUser) {
            return NextResponse.json({ error: "Failed to update profile" }, { status: 500 });
        }

        const { password_hash, ...userProfile } = updatedUser;

        return NextResponse.json({ profile: userProfile });
    } catch (error) {
        console.error("Profile PUT Error:", error);
        return NextResponse.json({ error: "Failed to update profile" }, { status: 500 });
    }
}
