import { NextResponse } from 'next/server';

export async function GET(req: Request) {
  try {
    // 假设从cookie中获取用户ID，这里是伪代码
    const cookie = req.headers.get('cookie');
    if (!cookie) {
      return NextResponse.json({ error: '未登录' }, { status: 401 });
    }

    const userIdCookie = cookie.split('; ').find(row => row.startsWith('u_id='));
    if (!userIdCookie) {
      return NextResponse.json({ error: '未登录' }, { status: 401 });
    }

    const userId = userIdCookie.split('=')[1];
    if (!userId) {
      return NextResponse.json({ error: '未登录' }, { status: 401 });
    }

    // 假设使用wrangler d1 execute查询用户信息
    const { execSync } = require('child_process');
    const command = `wrangler d1 execute funyblog --command "SELECT username FROM users WHERE id = ${userId}" --json`;
    const result = execSync(command, { encoding: 'utf-8' });
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