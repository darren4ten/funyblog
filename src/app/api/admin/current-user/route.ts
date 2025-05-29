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
    // 临时使用execSync进行查询
    const command = `wrangler d1 execute funyblog --command="SELECT username FROM users WHERE id = ${userId}" --json`;
    let result;
    try {
      result = execSync(command, { encoding: 'utf-8' });
    } catch (err) {
      console.error('数据库查询错误:', err);
      return NextResponse.json({ error: '服务器错误' }, { status: 500 });
    }
    const parsedResult = JSON.parse(result);

    if (parsedResult && parsedResult[0].results && parsedResult[0].results.length > 0) {
      return NextResponse.json({ username: parsedResult[0].results[0].username }, { status: 200 });
    } else {
      return NextResponse.json({ error: '用户未找到' }, { status: 404 });
    }
  } catch (error) {
    console.error('获取当前用户信息出错:', error);
    return NextResponse.json({ error: '服务器错误' }, { status: 500 });
  }
}