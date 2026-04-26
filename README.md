# Flow State

https://flow-station.vercel.app/

フレームボタンをクリックするだけで、集中モード（フロー状態）のオン・オフを切り替えるシンプルなUIアプリ。

フロー状態に入ると画面が暗転し、炎がゆらめき、オレンジのグロウが広がる。視覚的な変化が「今は集中している」という感覚を強化する。

## Stack

- Next.js (App Router)
- Prisma + Neon (PostgreSQL)
- NextAuth.js v5 (Google OAuth)
- Vercel Blob (アバター画像)
- MusicKit JS v3 (Apple Music連携)
- Framer Motion
- Tailwind CSS v4
- Zod

## Features

- Googleアカウントでログイン
- フロー状態のオン・オフ切り替え（3秒クールダウン）
- フローセッションの自動記録・累計
- 活動ヒートマップ（過去14週）
- Apple Musicプレイリストをフロー中に再生
- プロフィール編集（表示名・アバター画像）

## Environment Variables

```
AUTH_SECRET=
AUTH_GOOGLE_ID=
AUTH_GOOGLE_SECRET=
DATABASE_URL=
BLOB_READ_WRITE_TOKEN=
APPLE_MUSIC_TEAM_ID=
APPLE_MUSIC_KEY_ID=
APPLE_MUSIC_PRIVATE_KEY=   # PEM形式の秘密鍵（改行を \n に変換して1行で設定）
```

