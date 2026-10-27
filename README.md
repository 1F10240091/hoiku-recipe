# Hoiku-Recipe（保育園児の親向け献立自動生成アプリ）

少子化が進む現代社会において、子育て世帯（特に共働き世帯）が抱える「毎日の食事準備」という
時間的・精神的負担を、テクノロジーで軽減することを目的とした Web アプリケーションです。

保育園から配布される**献立表をGemini APIで読み取り**、登録済みレシピから園の昼食との重複、
**家庭の在庫・子どものアレルギー・好き嫌い・年齢を考慮して夕食献立を提案**します。

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
| **献立表の AI OCR** | 保育園から配布された献立表（PDF / 画像）をGeminiで解析し、日付とメニューをデータ化 |
| **子ども情報の登録** | 子どもの年齢（生年月）・アレルギー・好き嫌いをデータベースとして一元管理・編集 |
| **献立自動提案** | 園の昼食・在庫・アレルギー・好き嫌い・前日の夕食・年齢を考慮し、登録済みレシピから1〜7日分を選定 |
| **「喜んでた」評価** | 献立の料理ごとにハート（♡）を押して記録。レシピ一覧に回数が表示され、喜ばれた順に並べ替え可能 |
| **レシピ表示** | 提案された献立のレシピ（使用食品・作り方）を表示 |
| **買い物リスト生成** | 提案献立に必要な食材から在庫を差し引いた不足食材の買い物リストを自動作成 |
| **フィードバック収集** | ユーザーテスト・学祭アンケート用の評価（1〜5）・コメント投稿 |

## 技術スタック

| レイヤー | 技術 |
|---------|------|
| フロントエンド | Next.js / React / TypeScript |
| バックエンド | FastAPI（Python） |
| データベース | PostgreSQL（本番想定）/ SQLite（開発） |
| AI | Gemini API（献立表解析） |
| デプロイ | Next.js対応ホスティング / FastAPI対応ホスティング |
| 開発環境 | Node.js / Python / GitHub / Figma / ESLint / Prettier |

## 必要環境

| 要件 | バージョン |
|------|-----------|
| Node.js | 22.x 推奨（最低20.19以上） |
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

- フロントエンド: http://127.0.0.1:3000
- バックエンド API: http://127.0.0.1:8000 （Swagger UI: http://127.0.0.1:8000/docs）

> 学内 Wi-Fi などの共有ネットワークでは、サーバーを LAN に公開しないでください。
> 上記スクリプトは 127.0.0.1 のみにバインドします。

## デモモード（バックエンド不要）

バックエンドを起動せずに、フロントエンドだけで全機能を試すことができます。
デモモードではモック API が動作し、データはブラウザの localStorage に保存されます。

```bash
# frontend/.env.local に追記
NEXT_PUBLIC_DEMO_MODE=true
```

ログイン画面の「デモを試す」ボタンから、ワンクリックでデモログインできます
（あらかじめサンプルデータが用意されています）。デモモード中はどのユーザーネーム・
パスワードでもログインできます。

> デモモードは評価・デモ用途のためのものです。本番利用では使用しないでください。
> デモモードの献立生成・OCR はモック（固定データ）で、実際の AI は呼び出しません。

## NPM Scripts

| コマンド | 内容 |
|---------|------|
| `npm run setup` | フロント・バック同時セットアップ |
| `npm run dev` | フロント・バック同時起動 |
| `npm run dev:frontend` | フロントエンドのみ起動 |
| `npm run dev:backend` | バックエンドのみ起動 |
| `npm run build` | フロントエンドのプロダクションビルド |
| `npm run start:frontend` | ビルド済みフロントを 127.0.0.1 で起動 |
| `npm run start:frontend:production` | ビルド済みフロントを外部ホストから到達可能な状態で起動 |
| `npm run lint` | ESLint 実行 |

## テスト

バックエンドの API テストは pytest で実行します（認証・お子様・レシピ・献立生成・「喜んでた」・買い物リスト・献立表 OCR・セキュリティ・フィードバックの 現行の回帰テスト）。

```bash
cd backend
pip install -r requirements-dev.txt
python -m pytest tests -v
```

## セキュリティ対策

| 対策 | 内容 |
|------|------|
| パスワード | bcrypt でハッシュ化。強度要件（8 文字以上・英字と数字を含む）をバックエンドとフロントの両方で検証 |
| JWT | 発行者（iss）・有効期限（exp）を検証。秘密鍵は環境変数で設定 |
| レート制限 | ログイン・登録の失敗試行を IP ごとに制限（デフォルト 5 回 / 60 秒）。成功したログインは数えない |
| 入力検証 | Pydantic / EmailStr による型・長さ・範囲のバリデーション |
| DB アクセス | SQLAlchemy ORM 使用により SQL インジェクションを防止 |

## 本番デプロイ

本番環境の準備手順、環境変数、DBの永続化と確認項目は[デプロイガイド](./docs/deployment.md)を参照してください。
本番モードでは弱いJWT鍵、SQLite、localhostのCORS設定での起動を拒否します。

## プロジェクト構成

```
hoiku-recipe/
├── package.json              # モノレポ設定（npm workspaces）
├── docs/
│   ├── proposal.md           # 提案書（背景・目的・機能）
│   ├── design.md             # 詳細設計書（アーキテクチャ・API・DB）
│   ├── assignment.md         # タスク割当表・開発スケジュール
│   └── user-manual.md        # ユーザーマニュアル
├── backend/
│   ├── app/
│   │   ├── main.py           # FastAPI エントリポイント
│   │   ├── config.py         # 環境設定（JWT・AI・レート制限）
│   │   ├── database.py       # DB 接続設定
│   │   ├── middleware.py     # レート制限ミドルウェア
│   │   ├── models.py         # SQLAlchemy モデル
│   │   ├── schemas.py        # Pydantic スキーマ
│   │   ├── security.py       # パスワード・JWT ユーティリティ
│   │   ├── routers/
│   │   │   ├── auth.py       # 認証 API
│   │   │   ├── children.py   # お子様管理 API
│   │   │   ├── menus.py      # 献立表 OCR API
│   │   │   ├── recipes.py    # AI 献立提案 API
│   │   │   ├── recipe_master.py # レシピマスタ CRUD
│   │   │   ├── likes.py      # 「喜んでた」評価 API
│   │   │   ├── shopping.py   # 買い物リスト API
│   │   │   └── feedback.py   # フィードバック API
│   │   └── services/
│   │       ├── ocr_ai.py     # AI 画像認識 OCR
│   │       ├── menu_generator.py # AI 献立生成（自由生成・ルールベース）
│   │       ├── shopping_list.py # 買い物リスト集計
│   │       └── seed.py       # レシピシード 23 件
│   ├── tests/                # pytest テスト
│   ├── requirements.txt
│   └── requirements-dev.txt  # pytest 等
└── frontend/
    ├── src/
    │   ├── app/              # Next.js App Router
    │   │   ├── layout.tsx
    │   │   ├── page.tsx      # トップページ
    │   │   ├── login/        # ログイン画面
    │   │   ├── register/     # 新規登録画面
    │   │   ├── dashboard/    # お子様・プロフィール管理
    │   │   ├── meal-plan/    # AI 献立生成画面
    │   │   ├── menus/        # 献立表 OCR 取り込み
    │   │   ├── recipes/      # 提案献立一覧・「喜んでた」
    │   │   ├── shopping/     # 買い物リスト・冷蔵庫
    │   │   └── dashboard/    # お子様・プロフィール・ご意見
    │   ├── components/       # 共通コンポーネント（AppNav・LikeButton 等）
    │   └── lib/              # API クライアント等
    ├── package.json
    └── next.config.js
```

## ドキュメント

- [提案書](./docs/proposal.md) — プロジェクトの背景・目的・機能・市場分析
- [詳細設計書](./docs/design.md) — アーキテクチャ・API・データベース設計
- [タスク割当表](./docs/assignment.md) — メンバー別タスク・開発スケジュール
- [ユーザーマニュアル](./docs/user-manual.md) — 画面ごとの使い方ガイド

## ライセンス

MIT


## 公開品質の検証

```sh
npm ci
npm run lint
npm run test:frontend
npm run build
cd backend
python -m pip install -r requirements.txt -r requirements-dev.txt
python -m pytest tests -q
```

GitHub ActionsはPostgreSQL 17でマイグレーションとAPIテストを検証します。本番のDB更新は公開前に`python -m app.release`で実行してください。Vercelは`frontend`と`backend`をそれぞれRoot Directoryに設定する構成です。詳細は[デプロイガイド](docs/deployment.md)を参照してください。
