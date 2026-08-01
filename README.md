# Hoiku-Recipe（保育園児の親向け献立自動生成アプリ）

少子化が進む現代社会において、子育て世帯（特に共働き世帯）が抱える「毎日の食事準備」という
時間的・精神的負担を、テクノロジーで軽減することを目的とした Web アプリケーションです。

保育園から配布される**献立表を OCR で読み取り**、園の昼食と食材が重複せず、
**家庭の冷蔵庫の在庫・子どものアレルギー・好き嫌いを考慮した夕食献立を AI が自動提案**します。

## プロジェクトの背景

- 最新（2025 年）の出生数は約 67 万人と過去最少、合計特殊出生率も 1.14 と過去最低
- 子育て世代の 42.5% が「自分の時間が取れない」ことに悩んでいる
- 子どもを持つ家庭は家事・育児に費やす時間が大きく（1 日あたり約 110 分の差）、食事準備は
  保護者にとって大きな負担となる家事の代表格

国が推進する少子化対策・子育て支援（こどもまんなか社会）の方向性に沿い、
「毎日発生する食事準備の負担を軽減することで、子育てしやすい社会づくりに貢献する」ことを目指します。

## 主要機能

| 機能 | 内容 |
|------|------|
| **献立表の OCR 読み取り** | 保育園から配布された献立表 PDF をアプリに読み込み、メニュー名や食材を自動でデータ化 |
| **子ども情報の登録** | 子どもの年齢・アレルギー・好き嫌いをデータベースとして一元管理 |
| **冷蔵庫の在庫入力** | 主要な食材ボタン / 自由入力で在庫を記録 |
| **AI 献立自動提案** | 園の昼食・在庫・アレルギー・好き嫌いを考慮し、夕食献立を AI が自動生成 |
| **レシピ表示** | 提案された献立のレシピを表示し、調理をスムーズにサポート |
| **買い物リスト生成** | 不足食材の必要分量をまとめたチェックリストを一瞬で作成 |

## 技術スタック

| レイヤー | 技術 |
|---------|------|
| フロントエンド | Next.js / React / TypeScript |
| バックエンド | FastAPI（Python） |
| データベース | PostgreSQL（本番）/ SQLite（開発） |
| BaaS | Supabase |
| AI | Xiaomi MiMo |
| デプロイ | Vercel |
| 開発環境 | Node.js / Python / GitHub / Figma / ESLint / Prettier |

## 必要環境

| 要件 | バージョン |
|------|-----------|
| Node.js | 18 以上 |
| Python | 3.10 以上 |
| OS | Windows / macOS / Linux |

## クイックスタート

### 1. セットアップ

```bash
npm run setup
```

フロントエンド（npm install）とバックエンド（Python venv + pip install）を同時にセットアップします。

### 2. 開発サーバーを起動

```bash
npm run dev
```

- フロントエンド: http://localhost:3000
- バックエンド API: http://localhost:8000 （Swagger UI: http://localhost:8000/docs）

## NPM Scripts

| コマンド | 内容 |
|---------|------|
| `npm run setup` | フロント・バック同時セットアップ |
| `npm run dev` | フロント・バック同時起動 |
| `npm run dev:frontend` | フロントエンドのみ起動 |
| `npm run dev:backend` | バックエンドのみ起動 |
| `npm run build` | フロントエンドのプロダクションビルド |
| `npm run lint` | ESLint 実行 |

## プロジェクト構成

```
hoiku-recipe/
├── package.json              # モノレポ設定（npm workspaces）
├── docs/
│   ├── proposal.md           # 提案書（背景・目的・機能）
│   ├── design.md             # 詳細設計書（アーキテクチャ・API・DB）
│   └── assignment.md         # タスク割当表・開発スケジュール
├── backend/
│   ├── app/
│   │   ├── main.py           # FastAPI エントリポイント
│   │   ├── database.py       # DB 接続設定
│   │   ├── models.py         # SQLAlchemy モデル
│   │   ├── schemas.py        # Pydantic スキーマ
│   │   └── routers/
│   │       ├── auth.py       # 認証 API
│   │       ├── children.py   # お子様管理 API
│   │       ├── menus.py      # 献立表 OCR API
│   │       ├── recipes.py    # AI 献立提案 API
│   │       └── shopping.py   # 買い物リスト API
│   └── requirements.txt
└── frontend/
    ├── src/
    │   ├── app/              # Next.js App Router
    │   │   ├── layout.tsx
    │   │   ├── page.tsx      # トップページ
    │   │   ├── login/        # ログイン画面
    │   │   ├── register/     # 新規登録画面
    │   │   ├── dashboard/    # お子様管理ダッシュボード
    │   │   ├── meal-plan/    # 献立作成画面
    │   │   └── recipes/      # レシピ・買い物リスト画面
    │   ├── components/       # 共通コンポーネント
    │   └── lib/              # API クライアント等
    ├── package.json
    └── next.config.js
```

## ドキュメント

- [提案書](./docs/proposal.md) — プロジェクトの背景・目的・機能・市場分析
- [詳細設計書](./docs/design.md) — アーキテクチャ・API・データベース設計
- [タスク割当表](./docs/assignment.md) — メンバー別タスク・開発スケジュール

## ライセンス

MIT
