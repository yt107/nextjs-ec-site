// src/app/api/favorites/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { executeQuery } from '@/lib/db';
import { getAuthUser, type AuthUser } from '@/lib/auth';

// お気に入りの存在確認（GET）
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const productId = Number(id);
    if (!Number.isSafeInteger(productId) || productId <= 0) {
      return NextResponse.json({ message: '商品IDが不正です。' }, { status: 400 });
    }

    const user: AuthUser | null = await getAuthUser();
    // 未ログインの場合は「お気に入り未登録」として false を返す
    if (!user) {
      return NextResponse.json(false);
    }

    const result = await executeQuery<{ count: number }>(
        `SELECT COUNT(*) AS count FROM favorites WHERE product_id = ? AND user_id = ?;`,
        [productId, user.userId]
    );
    const isFavorite = result[0].count > 0;

    return NextResponse.json(isFavorite);
  } catch (err) {
    console.error('お気に入り確認エラー：', err);
    return NextResponse.json({ message: 'サーバーエラーが発生しました。' }, { status: 500 });
  }
}

// お気に入り削除（DELETE）
export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const productId = Number(id);
    if (!Number.isSafeInteger(productId) || productId <= 0) {
      return NextResponse.json({ message: '商品IDが不正です。' }, { status: 400 });
    }

    const user: AuthUser | null = await getAuthUser();
    if (!user) {
      return NextResponse.json({ message: 'ログインしてください。' }, { status: 401 });
    }

    await executeQuery(
        `DELETE FROM favorites WHERE product_id = ? AND user_id = ?;`,
        [productId, user.userId]
    );

    return NextResponse.json({ message: 'お気に入りを解除しました。' });
  } catch (err) {
    console.error('お気に入り削除エラー：', err);
    return NextResponse.json({ message: 'サーバーエラーが発生しました。' }, { status: 500 });
  }
}
