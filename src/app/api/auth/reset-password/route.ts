import { NextResponse } from "next/server";
import { updatePassword, getUser } from "@/lib/db";

export async function POST(req: Request) {
    try {
        const { username, newPassword } = await req.json();

        if (!username || !newPassword) {
            return NextResponse.json({ error: "用户名和新密码不能为空" }, { status: 400 });
        }

        if (newPassword.length < 6) {
            return NextResponse.json({ error: "新密码长度不能少于6位" }, { status: 400 });
        }

        const user = getUser(username);
        if (!user) {
            return NextResponse.json({ error: "用户名不存在" }, { status: 404 });
        }

        updatePassword(username, newPassword);
        return NextResponse.json({ success: true, message: "密码重置成功" }, { status: 200 });

    } catch (error) {
        console.error("Password Reset Error:", error);
        return NextResponse.json({ error: "密码重置失败" }, { status: 500 });
    }
}
