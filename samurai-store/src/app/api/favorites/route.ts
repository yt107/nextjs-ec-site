// src/app/api/favorites/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { executeQuery } from '@/lib/db';
import { getAuthUser, type AuthUser } from '@/lib/auth';

// お気に入りデータの型定義
type Favorite = {
  id: number;
  product_id: number;
  user_id: number;
  created_at: string;
};

// ログインユーザーのお気に入り全取得
export async function GET() {
  try {
    const user: AuthUser | null = await getAuthUser();
    if (!user) {
      return NextResponse.json({ message: 'ログインしてください。' }, { status: 401 });
    }

    // src/app/api/favorites/route.ts の GET() 内のSQL文
    const favorites = await executeQuery<Favorite>(`
      SELECT 
        f.id,
        f.product_id,
        f.user_id,
        f.created_at,
        p.name,
        p.price,
        p.image_url
      FROM favorites AS f
      JOIN products AS p ON f.product_id = p.id
      WHERE f.user_id = ?
      ORDER BY f.created_at DESC;
    `, [user.userId]);

    return NextResponse.json(favorites);
  } catch (err) {
    console.error('お気に入り取得エラー：', err);
    return NextResponse.json({ message: 'サーバーエラーが発生しました。' }, { status: 500 });
  }
}

// お気に入り登録
export async function POST(request: NextRequest) {
  try {
    const user: AuthUser | null = await getAuthUser();
    if (!user) {
      return NextResponse.json({ message: 'ログインしてください。' }, { status: 401 });
    }

    // リクエストから商品IDを取得
    const body = await request.json().catch(() => null);
    const value = body?.productId;
    const productId = typeof value === 'number' || typeof value === 'string'
      ? Number(value)
      : NaN;

    if (!Number.isSafeInteger(productId) || productId <= 0) {
      return NextResponse.json({ message: '商品IDが不正です。' }, { status: 400 });
    }

    await executeQuery(
        `INSERT IGNORE INTO favorites (product_id, user_id) VALUES (?, ?);`,
        [productId, user.userId]
    );

    return NextResponse.json({ message: 'お気に入りに追加しました。' });
  } catch (err) {
    console.error('お気に入り登録エラー：', err);
    return NextResponse.json({ message: 'サーバーエラーが発生しました。' }, { status: 500 });
  }
}
