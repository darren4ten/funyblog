import { NextResponse } from 'next/server';
import { execSync } from 'child_process';

export async function GET(req: Request) {
  try {
    // 从cookie中获取token
    const cookie = req.headers.get('cookie');
    if (!cookie) {
      return NextResponse.json({ error: '未登录' }, { status: 401 });
    }

    const tokenCookie = cookie.split('; ').find(row => row.startsWith('auth_token='));
    if (!tokenCookie) {
      return NextResponse.json({ error: '未登录' }, { status: 401 });
    }

    const token = tokenCookie.split('=')[1];
    if (!token) {
      return NextResponse.json({ error: '未登录' }, { status: 401 });
    }

    // 验证JWT token
    const jwt = require('jsonwebtoken');
    let decoded;
    try {
      decoded = jwt.verify(token, 'your-secret-key');
    } catch (err) {
      return NextResponse.json({ error: '无效的令牌' }, { status: 401 });
    }

    const userId = decoded.userId;
    const { getUserById } = require('../../../../db/repository');
    const user = await getUserById(userId);

    if (user) {
      return NextResponse.json({ username: user.username }, { status: 200 });
    } else {
      return NextResponse.json({ error: '用户未找到' }, { status: 404 });
    }
  } catch (error) {
    console.error('获取当前用户信息出错:', error);
    return NextResponse.json({ error: '服务器错误' }, { status: 500 });
  }
}