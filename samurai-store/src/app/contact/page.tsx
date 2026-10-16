'use client'; // クライアント（ブラウザ）側で動作

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

// お問い合わせページ
export default function ContactPage() {
    const router = useRouter();
    const [errorMessage, setErrorMessage] = useState(''); // エラーメッセージ

    // フォーム送信時のイベントハンドラ
    const handleSubmit = async (e: React.SubmitEvent<HTMLFormElement>) => {
        e.preventDefault(); // デフォルトの送信動作をキャンセル
        setErrorMessage(''); // 送信前にエラーをクリア

        const formData = new FormData(e.currentTarget);
        const name = formData.get('name') as string;
        const email = formData.get('email') as string;
        const message = formData.get('message') as string;

        // 入力データのバリデーション（未入力チェック）
        if (!name?.trim() || !email?.trim() || !message?.trim()) {
            setErrorMessage('すべての項目を入力してください。');
            return;
        }

        try {
            // お問い合わせ登録APIにPOSTリクエストを送信
            const res = await fetch('/api/inquiries', {
                method: 'POST',
                body: JSON.stringify({ name, email, message }),
                headers: { 'Content-Type': 'application/json' }
            });

            if (res.ok) {
                // 送信成功時はトップページへ遷移（クエリパラメータを付加）
                router.push('/?submitted=1');
            } else {
                // 送信失敗時はエラー情報を表示
                const data = await res.json();
                setErrorMessage(data.message || 'お問い合わせの送信に失敗しました。');
            }
        } catch {
            setErrorMessage('通信エラーが発生しました。');
        }
    };

    // 入力欄の共通スタイル
    const inputStyle = 'w-full border border-gray-300 px-3 py-2 rounded-sm focus:ring-2 focus:ring-indigo-500';
    // ラベルの共通スタイル
    const labelStyle = 'block font-bold mb-1';
    // バッジの共通スタイル
    const badgeStyle = 'ml-2 px-2 py-0.5 bg-red-500 text-white text-xs font-semibold rounded-md';

    return (
        <main className="w-full max-w-xl mx-auto py-10">
            {/* 1. トップページへ戻るリンク */}
            <div className="mb-4">
                <Link href="/" className="text-indigo-600 hover:underline">
                    ← トップページへ戻る
                </Link>
            </div>

            {/* 2. お問い合わせページの見出し（h1） */}
            <h1 className="text-center mb-4">お問い合わせ</h1>

            {/* 3. エラーメッセージ */}
            {errorMessage && (
                <p className="text-red-600 text-center mt-8">{errorMessage}</p>
            )}

            {/* 4. お問い合わせフォーム */}
            <form onSubmit={handleSubmit} className="w-full space-y-6 p-8 bg-white shadow-lg rounded-xl">
                <div>
                    <label className={labelStyle} htmlFor="name">
                        氏名<span className={badgeStyle}>必須</span>
                    </label>
                    <input type="text" id="name" name="name" required className={inputStyle} />
                </div>

                <div>
                    <label className={labelStyle} htmlFor="email">
                        メールアドレス<span className={badgeStyle}>必須</span>
                    </label>
                    <input type="email" id="email" name="email" required className={inputStyle} />
                </div>

                <div>
                    <label className={labelStyle} htmlFor="message">
                        お問い合わせ内容<span className={badgeStyle}>必須</span>
                    </label>
                    <textarea id="message" name="message" rows={5} required className={inputStyle} />
                </div>

                <button
                    type="submit"
                    className="w-full mt-2 bg-indigo-500 hover:bg-indigo-600 text-white py-2 rounded-sm"
                >
                    送信
                </button>
            </form>
        </main>
    );
}
