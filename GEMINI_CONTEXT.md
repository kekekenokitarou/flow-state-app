# Flow State — アプリ全体コンテキスト（Gemini向け）

## アプリ概要

**Flow State** は、集中モード（フロー状態）のオン・オフをワンクリックで切り替えるシンプルなWebアプリ。
炎のボタンをクリックすると画面が暗転し、炎がゆらめき、オレンジのグロウが広がる視覚演出で「集中している」感覚を強化する。
フロー中はApple Musicのプレイリストを自動再生し、セッション終了時に時間を記録する。

- URL: https://flow-station.vercel.app/
- 言語: 日本語UI

---

## Tech Stack

| 項目 | 採用技術 |
|------|---------|
| Framework | Next.js 16 (App Router) |
| Runtime | React 19 |
| Language | TypeScript 5 |
| Styling | Tailwind CSS v4 |
| Animation | Framer Motion 12 |
| Auth | NextAuth.js v5 (Google OAuth) |
| ORM | Prisma 7 (Neon Postgres adapter) |
| DB | Neon (PostgreSQL, serverless) |
| Storage | Vercel Blob (アバター画像) |
| Music | MusicKit JS v3 (Apple Music) |
| Validation | Zod 4 |
| Deploy | Vercel |

---

## 主要機能

1. **Google認証ログイン** — NextAuth v5 + Google OAuth
2. **フロー状態トグル** — 炎ボタンクリックでオン/オフ。3秒クールダウンあり
3. **フローセッション記録** — 終了時に経過秒数をDBへ保存（60秒未満は破棄）
4. **記録パネル** — 今日・今週・通算の集中時間、直近30件のログ、過去14週のヒートマップ
5. **Apple Music連携** — プレイリストをフロー開始と同時に再生、終了で停止
6. **プロフィール編集** — 表示名（最大30文字）・アバター画像（5MB以下、JPEG/PNG/WebP）

---

## ディレクトリ構成

```
src/
  app/
    page.tsx                      # ログインページ（未認証時）
    home/page.tsx                 # メインページ（要認証）
    layout.tsx                    # ルートレイアウト（MusicKit JS読み込み）
    api/apple-music/token/        # Apple Music developer token API
    error.tsx / loading.tsx       # グローバルエラー・ローディング
  auth.ts                         # NextAuth設定（Google OAuth + Prisma連携）
  components/
    FlowScreen.tsx                # メイン画面（MusicProvider + FlowScreenInner）
    FlameButton.tsx               # 炎ボタン（SVGアイコン + ラベル）
    HamburgerMenu.tsx             # サイドバーメニュー（記録/音楽/プロフィール）
    ProfileCard.tsx               # 右上のプロフィールカード
    LogoutButton.tsx              # ログアウトボタン（Apple Music unauthorize含む）
    RecordsPanel.tsx              # 記録パネル（統計 + ヒートマップ）
    MusicSettings.tsx             # Apple Music設定UI
    ProfileSettings.tsx           # プロフィール設定UI
  hooks/
    useFlowState.ts               # フロー状態管理（toggle/cooldown/saveSession）
    useAppleMusic.ts              # Apple Music制御（init/authorize/playlist/play）
  contexts/
    MusicContext.tsx              # useAppleMusic を Context 経由で共有
  actions/
    saveFlowSession.ts            # Server Action: フローセッションをDBへ保存
    getFlowRecords.ts             # Server Action: 統計・ヒートマップデータ取得
    updateProfile.ts              # Server Action: 表示名・アバター更新
  constants/
    app.ts                        # 数値定数（クールダウン、制限値、閾値など）
    flow.ts                       # UI文言・アクセシビリティラベル
  lib/
    prisma.ts                     # Prismaクライアントシングルトン（Neon adapter）
    appleMusicToken.ts            # Apple Music JWT生成（ES256）
    env.ts                        # 環境変数バリデーション
    utils.ts                      # cn() (clsx + tailwind-merge)
  generated/prisma/               # Prisma生成コード
```

---

## データモデル（Prisma schema）

```prisma
model User {
  id          String      @id
  email       String      @unique
  displayName String?
  avatarUrl   String?
  bio         String?
  role        Role        @default(USER)
  createdAt   DateTime    @default(now())
  updatedAt   DateTime
  Account     Account[]
  DailyWork   DailyWork[]
}

model Account {
  id                String   @id
  userId            String
  provider          String
  providerAccountId String
  createdAt         DateTime @default(now())
  User              User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([provider, providerAccountId])
}

model DailyWork {
  id       String   @id
  userId   String
  date     DateTime @db.Date
  duration Int      // 秒単位
  User     User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([userId, date])
}

enum Role { USER ADMIN }
```

---

## 主要定数（src/constants/app.ts）

```ts
FLOW_COOLDOWN_MS = 3_000            // フロートグルのクールダウン（3秒）
MIN_FLOW_DURATION_SECONDS = 60      // 記録する最小セッション時間（60秒）
MUSICKIT_LOAD_TIMEOUT_MS = 10_000   // MusicKit JS読み込みタイムアウト
APPLE_MUSIC_TOKEN_EXPIRY_SECONDS = 15_777_000  // ~6ヶ月
MUSICKIT_PLAYLIST_LIMIT = 100       // ライブラリ取得上限
HEATMAP_DAYS = 98                   // ヒートマップ表示日数（14週）
RECENT_RECORDS_LIMIT = 30           // 直近記録の取得件数
MAX_DISPLAY_NAME_LENGTH = 30
MAX_AVATAR_SIZE_BYTES = 5 * 1024 * 1024
HEATMAP_LEVEL_THRESHOLDS = { LOW: 1800, MEDIUM: 3600, HIGH: 7200 }  // 秒
```

---

## 主要コンポーネントの責務

### FlowScreen
- `MusicProvider` でラップし、`useFlowState` と `useMusicContext` を統合
- フロー状態に応じて背景色（白⇔黒）・グロー・ビネット効果を切り替え
- フロー中はハンバーガーメニューを非表示

### FlameButton
- SVGで描いた3層の炎（外炎/中炎/内核）をフロー状態で色変化
- フロー中は `animate-flame` CSSアニメーションでゆらぎ

### HamburgerMenu
- スライドイン式サイドバー（`MenuPage: "top" | "profile" | "records" | "music"`）
- ページ間はFramer Motionでスライドアニメーション

### useFlowState
- `isFlow` state + `startTimeRef` でセッション計測
- `toggle()` : クールダウンチェック → state反転 → 終了時に `saveFlowSession()` を呼ぶ

### useAppleMusic
- `status: "idle" | "loading" | "authorized" | "unauthorized" | "error"`
- 設定は `localStorage` の `"flow-app:music-settings"` に永続化
- `init()` → MusicKit JS待機 → developer token取得 → `MusicKit.configure()`
- `startFlowMusic()` / `stopFlowMusic()` でフロー連動再生制御

---

## 認証フロー

1. 未認証ユーザー → `/` のログインページ
2. Googleログイン → `signIn` コールバックでDBのUser/Account作成 or 更新
3. 認証済み → `/home` にリダイレクト
4. ログアウト時: Apple Music unauthorize → `localStorage` クリア → `signOut()`

---

## Apple Music連携フロー

1. `FlowScreen` マウント時に `init()` 実行
2. MusicKit JS (`/api/apple-music/token` から取得したJWT) で初期化
3. ユーザーが「Apple Musicと接続」→ `authorize()`
4. ライブラリのプレイリスト一覧を取得 → 保存リストに追加
5. アクティブプレイリストを選択 → `setQueue()` でキュー設定
6. フロー開始 → `play()` / フロー終了 → `pause()`

---

## 環境変数

```
AUTH_SECRET=                  # NextAuth署名シークレット
AUTH_GOOGLE_ID=               # Google OAuthクライアントID
AUTH_GOOGLE_SECRET=           # Google OAuthクライアントシークレット
DATABASE_URL=                 # Neon PostgreSQL接続URL
BLOB_READ_WRITE_TOKEN=        # Vercel Blob読み書きトークン
APPLE_MUSIC_TEAM_ID=          # Apple Developer Team ID
APPLE_MUSIC_KEY_ID=           # Apple Music API Key ID
APPLE_MUSIC_PRIVATE_KEY=      # ES256秘密鍵（PEM、改行を\nに変換した1行）
```

---

## 現在のgitブランチ

- 作業ブランチ: `sandbox`
- 直近コミット例: `ea55f45 delete session related to apple music when logout`
- 変更中ファイル: `src/components/HamburgerMenu.tsx`
