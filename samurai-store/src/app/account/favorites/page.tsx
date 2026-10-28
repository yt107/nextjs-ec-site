'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import { useCart } from '@/hooks/useCart';

// お気に入り商品の型定義（商品情報を含む）
type FavoriteItem = {
  id: number;
  product_id: number;
  user_id: number;
  created_at: string;
  name: string;
  price: number;
  image_url: string | null;
};

export default function FavoritesPage() {
  const [favorites, setFavorites] = useState<FavoriteItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const { addItem, isInCart } = useCart();

  // 初回表示時にお気に入り一覧を取得
  useEffect(() => {
    const fetchFavorites = async () => {
      try {
        const res = await fetch('/api/favorites');
        if (!res.ok) {
          setErrorMessage('お気に入り一覧の取得に失敗しました。');
          return;
        }
        const data = await res.json();
        setFavorites(data);
      } catch (err) {
        console.error(err);
        setErrorMessage('通信エラーが発生しました。');
      } finally {
        setLoading(false);
      }
    };

    fetchFavorites();
  }, []);

  // お気に入り解除処理
  const handleRemove = async (productId: number) => {
    // 確認ダイアログを表示
    if (!confirm('本当にお気に入りから削除しますか？')) {
      return;
    }

    try {
      const res = await fetch(`/api/favorites/${productId}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        // 削除成功時：画面のリストから該当商品を除外
        setFavorites((prev) => prev.filter((item) => item.product_id !== productId));
      } else {
        alert('削除に失敗しました。');
      }
    } catch (err) {
      console.error(err);
      alert('通信エラーが発生しました。');
    }
  };

  // カートに追加する処理
  const handleAddToCart = (item: FavoriteItem) => {
    addItem(
      {
        id: item.product_id.toString(),
        title: item.name,
        price: item.price,
        imageUrl: item.image_url ?? '',
      },
      1
    );
  };

  if (loading) {
    return <div className="text-center py-12 text-gray-600">読み込み中...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* 1. マイページへ戻るリンク */}
      <div className="my-4">
        <Link href="/account" className="text-indigo-600 hover:underline">
          ← マイページに戻る
        </Link>
      </div>

      {/* 2. お気に入り一覧ページ */}
      <h1 className="text-center text-2xl font-bold mb-8">お気に入り一覧</h1>

      {errorMessage && <p className="text-center text-red-600">{errorMessage}</p>}

      {favorites.length === 0 ? (
        <p className="text-center py-12 text-gray-500">お気に入りに登録されている商品はありません。</p>
      ) : (
        <div className="space-y-4 max-w-4xl mx-auto">
          {favorites.map((item) => {
            const inCart = isInCart(item.product_id.toString());
            const imageUrl = item.image_url ? `/uploads/${item.image_url}` : '/images/no-image.jpg';

            return (
              <div
                key={item.id}
                className="flex flex-col sm:flex-row items-center justify-between border border-gray-200 rounded-lg p-6 gap-6 shadow-sm"
              >
                {/* 商品画像（120x120） */}
                <div className="flex items-center gap-6 w-full sm:w-auto">
                  <Link href={`/products/${item.product_id}`} className="shrink-0">
                    <Image
                      src={imageUrl}
                      alt={item.name}
                      width={120}
                      height={120}
                      className="object-contain w-[120px] h-[120px]"
                    />
                  </Link>

                  {/* 商品名 & 価格 */}
                  <div>
                    <h2 className="text-lg font-semibold text-gray-800">
                      <Link href={`/products/${item.product_id}`} className="hover:underline">
                        {item.name}
                      </Link>
                    </h2>
                    <p className="text-indigo-600 font-bold text-lg mt-1">
                      ¥{item.price.toLocaleString()}
                      <span className="text-sm font-normal text-gray-500">（税込）</span>
                    </p>
                  </div>
                </div>

                <div className="flex sm:flex-col items-center gap-3 w-full sm:w-auto">
                  {/* カートに追加ボタン */}
                  <button
                    onClick={() => handleAddToCart(item)}
                    disabled={inCart}
                    className={`w-full sm:w-36 py-2 px-4 rounded text-sm font-medium ${
                      inCart
                        ? 'bg-gray-300 text-gray-600 cursor-not-allowed'
                        : 'bg-indigo-600 hover:bg-indigo-700 text-white cursor-pointer'
                    }`}
                  >
                    {inCart ? '追加済み' : 'カートに追加'}
                  </button>

                  {/* お気に入り解除ボタン */}
                  <button
                    onClick={() => handleRemove(item.product_id)}
                    className="w-full sm:w-36 py-2 px-4 border border-red-500 text-red-500 hover:bg-red-50 rounded text-sm font-medium cursor-pointer"
                  >
                    お気に入り解除
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
