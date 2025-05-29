import { NextResponse } from 'next/server';
import { execSync } from 'child_process';

export async function POST(req: Request) {
  try {
    const body = await req.json() as { username?: string; password?: string };
    const username = body.username || '';
    const password = body.password || '';

    if (!username || !password) {
      return NextResponse.json({ error: '用户名和密码不能为空' }, { status: 400 });
    }

    const { getUserForLogin } = require('../../../../db/repository');
    // 对密码进行哈希处理
    const crypto = require('crypto');
    const passwordHash = crypto.createHash('sha256').update(String(password)).digest('hex');
    const user = await getUserForLogin(username, passwordHash);

    if (!user) {
      return NextResponse.json({ error: '用户名或密码错误'+passwordHash }, { status: 401 });
    }

    // 使用JWT生成token
    const jwt = require('jsonwebtoken');
    const userId = user.id;
    const userName = user.username;
    const token = jwt.sign({ userId, username: userName, role: 'admin' }, 'your-secret-key', { expiresIn: '7d' });
    const response = NextResponse.json({ message: '登录成功' }, { status: 200 });
    response.cookies.set('auth_token', token, { path: '/', maxAge: 60 * 60 * 24 * 7 }); // 7天有效期
    return response;
  } catch (error) {
    console.error('登录错误:', error);
    return NextResponse.json({ error: '服务器错误' }, { status: 500 });
  }
}