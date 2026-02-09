import { NextResponse } from "next/server";
import { verifyUser } from "@/lib/db";
import { cookies } from "next/headers";

export async function POST(req: Request) {
    try {
        const { username, password } = await req.json();

        if (!username || !password) {
            return NextResponse.json({ error: "用户名和密码不能为空" }, { status: 400 });
        }

        const isValid = verifyUser(username, password);

        if (isValid) {
            // Set auth cookie
            // In a real app, use JWT or Session ID. Here we use a simple flag for demo.
            // Note: Cloudflare Pages might have specific constraints, but Node runtime handles cookies fine.
            const cookieStore = await cookies();
            // Store username in cookie for simple auth identification
            cookieStore.set("auth_token", username, {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
                maxAge: 60 * 60 * 24 * 7, // 1 week
                path: "/",
            });

            return NextResponse.json({ success: true });
        } else {
            return NextResponse.json({ error: "用户名或密码错误" }, { status: 401 });
        }
    } catch (error) {
        console.error("Login Error:", error);
        return NextResponse.json({ error: "登录服务异常" }, { status: 500 });
    }
}
