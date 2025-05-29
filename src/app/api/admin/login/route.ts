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

    // 由于getUserForLogin函数可能未正确导出，临时使用execSync进行查询
    const query = `SELECT id, username FROM users WHERE username = '${username}' AND password_hash = '${password}'`;
    const command = `wrangler d1 execute funyblog --command="${query}" --json`;
    let result;
    try {
      result = execSync(command, { encoding: 'utf-8' });
    } catch (err) {
      console.error('数据库查询错误:', err);
      return NextResponse.json({ error: '服务器错误' }, { status: 500 });
    }
    const parsedResult = JSON.parse(result);

    if (!parsedResult || !parsedResult[0].results || parsedResult[0].results.length === 0) {
      return NextResponse.json({ error: '用户名或密码错误' }, { status: 401 });
    }

    // 使用JWT生成token
    const jwt = require('jsonwebtoken');
    const userId = parsedResult[0].results[0].id;
    const userName = parsedResult[0].results[0].username;
    const token = jwt.sign({ userId, username: userName, role: 'admin' }, 'your-secret-key', { expiresIn: '7d' });
    const response = NextResponse.json({ message: '登录成功' }, { status: 200 });
    response.cookies.set('auth_token', token, { path: '/', maxAge: 60 * 60 * 24 * 7 }); // 7天有效期
    return response;
  } catch (error) {
    console.error('登录错误:', error);
    return NextResponse.json({ error: '服务器错误' }, { status: 500 });
  }
}