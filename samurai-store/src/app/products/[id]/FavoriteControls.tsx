// src/app/products/[id]/FavoriteControls.tsx
'use client';

import { useEffect, useState } from 'react';

type FavoriteControlsProps = {
  productId: number;
  initialIsFavorite: boolean;
};

export default function FavoriteControls({ productId, initialIsFavorite }: FavoriteControlsProps) {
  const [isFavorite, setIsFavorite] = useState(initialIsFavorite);
  const [loading, setLoading] = useState(true);

  // 履歴から戻った場合も、古い初期値ではなくDBの最新状態を表示する
  useEffect(() => {
    let active = true;

    const fetchFavoriteStatus = async () => {
      try {
        const res = await fetch(`/api/favorites/${productId}`, {
          cache: 'no-store',
        });
        if (res.ok) {
          const status: boolean = await res.json();
          if (active) setIsFavorite(status);
        }
      } catch (err) {
        console.error('お気に入り状態取得エラー：', err);
      } finally {
        if (active) setLoading(false);
      }
    };

    fetchFavoriteStatus();
    return () => { active = false; };
  }, [productId]);

  const handleFavoriteClick = async () => {
    if (loading) return;
    setLoading(true);

    try {
      if (isFavorite) {
        // お気に入り解除: DELETE リクエスト
        const res = await fetch(`/api/favorites/${productId}`, {
          method: 'DELETE',
        });
        if (res.ok) {
          setIsFavorite(false);
        }
      } else {
        // お気に入り追加: POST リクエスト
        const res = await fetch('/api/favorites', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ productId }),
        });
        if (res.ok) {
          setIsFavorite(true);
        }
      }
    } catch (err) {
      console.error('お気に入り操作エラー：', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mt-4">
      <button
        onClick={handleFavoriteClick}
        disabled={loading}
        style={{ fontFamily: 'sans-serif' }}
        className="text-red-500 hover:text-red-600 disabled:opacity-50 text-sm font-medium"
      >
        {isFavorite ? '♥ お気に入り解除' : '♡ お気に入り追加'}
      </button>
    </div>
  );
}
