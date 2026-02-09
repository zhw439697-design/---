import { NextResponse } from "next/server";
import { createUser } from "@/lib/db";

export async function POST(req: Request) {
    try {
        const { username, password } = await req.json();

        if (!username || !password) {
            return NextResponse.json({ error: "用户名和密码不能为空" }, { status: 400 });
        }

        if (password.length < 6) {
            return NextResponse.json({ error: "密码长度不能少于6位" }, { status: 400 });
        }

        try {
            createUser(username, password);
            return NextResponse.json({ success: true }, { status: 201 });
        } catch (err: any) {
            if (err.message === "Username already exists") {
                return NextResponse.json({ error: "用户名已存在" }, { status: 409 }); // 409 Conflict
            }
            throw err;
        }

    } catch (error) {
        console.error("Registration Error:", error);
        return NextResponse.json({ error: "注册服务异常" }, { status: 500 });
    }
}
