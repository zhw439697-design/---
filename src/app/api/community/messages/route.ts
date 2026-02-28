import { NextRequest, NextResponse } from 'next/server';
import { saveMessage, getMessagesBetween, markMessagesAsRead } from '@/lib/db';
import { cookies } from 'next/headers';

export async function GET(request: NextRequest) {
    try {
        const cookieStore = await cookies();
        const authToken = cookieStore.get('auth_token');

        if (!authToken || !authToken.value) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const currentUser = authToken.value;
        const searchParams = request.nextUrl.searchParams;
        const withUser = searchParams.get('with');

        if (!withUser) {
            return NextResponse.json({ error: 'Target user is required' }, { status: 400 });
        }

        const rawMessages = getMessagesBetween(currentUser, withUser);

        // Transform to frontend format
        const transformedMessages = rawMessages.map((msg: any) => {
            const date = new Date(msg.created_at + ' UTC');
            const formattedTime = date.toLocaleString('zh-CN', {
                timeZone: 'Asia/Shanghai',
                hour: '2-digit',
                minute: '2-digit',
                hour12: false
            });

            return {
                id: msg.id.toString(),
                senderId: msg.sender_username,
                content: msg.content,
                time: formattedTime,
                isMe: msg.sender_username === currentUser
            };
        });

        return NextResponse.json({
            success: true,
            messages: transformedMessages
        });

    } catch (error) {
        console.error('Get messages error:', error);
        return NextResponse.json({ error: 'Failed to fetch messages' }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        const cookieStore = await cookies();
        const authToken = cookieStore.get('auth_token');

        if (!authToken || !authToken.value) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const sender = authToken.value;
        const { receiver_username, content } = await request.json();

        if (!receiver_username || !content) {
            return NextResponse.json({ error: 'Receiver and content are required' }, { status: 400 });
        }

        const newMessage = saveMessage(sender, receiver_username, content);

        return NextResponse.json({
            success: true,
            message: {
                id: newMessage.id,
                senderId: sender,
                content: content,
                time: '刚刚',
                isMe: true
            }
        });

    } catch (error) {
        console.error('Persist message error:', error);
        return NextResponse.json({ error: 'Failed to send message' }, { status: 500 });
    }
}

export async function PATCH(request: NextRequest) {
    try {
        const cookieStore = await cookies();
        const authToken = cookieStore.get('auth_token');

        if (!authToken || !authToken.value) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const currentUser = authToken.value;
        const { sender_username } = await request.json();

        if (!sender_username) {
            return NextResponse.json({ error: 'Sender username is required' }, { status: 400 });
        }

        markMessagesAsRead(currentUser, sender_username);

        return NextResponse.json({
            success: true,
            message: 'Messages marked as read'
        });

    } catch (error) {
        console.error('Mark as read error:', error);
        return NextResponse.json({ error: 'Failed to mark messages as read' }, { status: 500 });
    }
}
