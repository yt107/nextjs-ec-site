import { NextRequest, NextResponse } from 'next/server';
import { executeQuery } from '@/lib/db';

// お問い合わせデータの型定義
type Inquiry = {
  id: number;
  name: string;
  email: string;
  message: string;
  created_at: string;
};

// すべてのお問い合わせデータを送信日時が新しい順に取得
export async function GET() {
  try {
    const inquiries = await executeQuery<Inquiry>(`
      SELECT *
      FROM inquiries
      ORDER BY created_at DESC;
    `);

    return NextResponse.json(inquiries);
  } catch (err) {
    console.error('お問い合わせデータ取得エラー：', err);
    return NextResponse.json({ message: 'お問い合わせデータの取得に失敗しました。' }, { status: 500 }); 
  }
}

// 新しいお問い合わせデータを登録
export async function POST(request: NextRequest) {
  try {
    // リクエストに含まれる各データを取得
    const { name, email, message } = await request.json();

    // 未入力チェック
    if (!name?.trim() || !email?.trim() || !message?.trim()) {
      return NextResponse.json({ message: 'すべての項目を入力してください。' }, { status: 400 });
    }

    // お問い合わせデータをinquiriesテーブルに追加
    await executeQuery(`
      INSERT INTO inquiries (name, email, message)
      VALUES (?, ?, ?);
    `, [name, email, message]);

    return NextResponse.json({ message: 'お問い合わせが送信されました。' });
  } catch (err) {
    console.error('お問い合わせデータ登録エラー：', err);
    return NextResponse.json({ message: 'サーバーエラーが発生しました。' }, { status: 500 });
  }
}
