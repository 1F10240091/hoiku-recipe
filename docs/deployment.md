# Vercel 本番デプロイガイド

フロントエンドとAPIを同じGitリポジトリから別々のVercelプロジェクトとして作成します。DBはVercel Marketplaceなどで用意する永続PostgreSQL（Neon等）を使用します。SQLiteは本番では使えません。

## 1. データベースと秘密情報

- 本番とPreviewのDBは必ず分けます。Previewに本番の子ども情報を接続しないでください。
- `DATABASE_URL`にはTLS接続のURLを設定します。サーバーレス用のプール接続URLを推奨します。
- ランダムなJWT鍵は `python -c "import secrets; print(secrets.token_hex(32))"` で生成できます。
- DBバックアップと復元手順をホスティング側で設定します。
- `.env`、DB接続URL、APIキーをGitに追加しないでください。

## 2. FastAPI用のVercelプロジェクト

同じリポジトリをImportし、Root Directoryを **backend**、Framework Presetを **FastAPI** にします。Pythonは`.python-version`で3.12を指定済みです。エントリポイントは`app/main.py`です。外部公開用のuvicorn常駐プロセスは不要です。

| 環境変数 | 設定 |
|---|---|
| `ENVIRONMENT` | `production`（Previewでも必須） |
| `DATABASE_URL` | 永続PostgreSQLのTLS接続URL |
| `JWT_SECRET_KEY` | 32文字以上のランダム値 |
| `CORS_ORIGINS` | `["https://実際のフロントのドメイン"]` |
| `GEMINI_API_KEY` | 献立表解析用のAPIキー |
| `GEMINI_MODEL` | 利用するGeminiモデルID。利用アカウントで提供状況を確認 |
| `GEMINI_MAX_PAGES` | `5` |
| `RATE_LIMIT_ENABLED` | `true` |
| `RATE_LIMIT_MAX_REQUESTS` | `5`（1分間・IP・対象パスごと） |
| `RATE_LIMIT_WINDOW_SECONDS` | `60` |

`backend/vercel.json`で東京リージョンと180秒の実行上限を指定しています。利用するプランがこの値を許可することを確認してください。

### DB初期化・更新（API公開前に1回）

必要な環境変数を設定した信頼できる端末またはリリースジョブから、`backend`ディレクトリで実行します。

```sh
python -m pip install -r requirements.txt
python -m app.release
alembic check
```

`app.release`はAlembicによるスキーマ更新とレシピシード投入を実行します。APIワーカー起動時にテーブル作成やシード更新を実行しないため、複数ワーカーや読み取り専用ファイルシステムで動作します。同じリリース処理を同時実行しないでください。

新規DBではそのまま実行できます。既存DBでは必ずバックアップし、モデルと実スキーマを照合してから導入してください。既存テーブルのあるDBに初期マイグレーションをそのまま適用できません。全テーブル・列・外部キー・インデックスが0001と一致する既存DBに限り `alembic stamp 0001` の後に更新します。SQLiteの開発データを本番へ自動移行する処理はありません。

`/health`が200を返すことを確認します。このエンドポイントはDBへの接続も確認します。

## 3. Next.js用のVercelプロジェクト

同じリポジトリをImportし、Root Directoryを **frontend**、Framework Presetを **Next.js** に設定します。Node.jsは **22.x** を選択します。Install/Build CommandはVercelのNext.js自動設定を利用します（ローカルのルートからの検証は`npm ci && npm run build`）。

| 環境変数 | 設定 |
|---|---|
| `NEXT_PUBLIC_API_URL` | `https://実際のAPIのドメイン`（パスなし） |
| `NEXT_PUBLIC_DEMO_MODE` | `false` |

`NEXT_PUBLIC_API_URL`はビルド時に埋め込まれるため、変更後は再デプロイします。VercelビルドはAPI URLの未設定・HTTP指定・デモモード有効時に失敗するようにしています。

ブラウザからAPIへ直接接続するので、APIのCORS設定には正確なフロントドメインが必要です。ProductionとPreviewそれぞれで設定してください。Previewは固定ブランチドメイン等を使い、`*`による全面許可を避けます。

APIのDeployment Protectionが有効だと、ブラウザからのCORSプリフライトやAPIアクセスがブロックされます。本番APIはトークン認証を前提として到達可能にするか、組織の保護設定に合わせた経路を別途設計してください。保護バイパス用の秘密情報を`NEXT_PUBLIC_`変数に設定してはいけません。

## 4. Vercel向けの動作制限

- 献立表は **4MB以下**。Vercel Functionsの4.5MBリクエスト上限にmultipartの余裕を確保しています。
- PDFは設定したページ数以下に分割してください。上限を超えるPDFを黙って途中まで保存しません。
- 本番の認証・登録・OCR・フィードバックPOSTはPostgreSQL上の共有カウンターで制限します。成功も含めて数えるので、複数インスタンスから同時アクセスしても制限が共有されます。IPはHMAC化して保存し、古い枠は次回対象リクエスト時に削除します。
- Vercel実行環境のみ、Vercelが上書きする`x-vercel-forwarded-for`を利用します。他のホストでは明示した信頼プロキシ以外の転送ヘッダーを信用しません。
- DB接続は本番でNullPoolを使い、実行環境ごとの遊休接続の増加を抑えます。DB側の接続プールも設定してください。
- フィードバックの全件取得APIは本番で無効です。

## 5. 公開前に実環境で行う確認

- GitHub ActionsのFrontend/Backendチェックが成功する。
- HTTPSで新規登録、ログイン、子どもの登録、アレルギー設定、献立提案、レシピ詳細、お気に入り、買い物リスト、在庫追加・削除が動く。
- 異なるアカウントで非公開レシピ・子ども・献立・在庫へアクセスできない。
- Geminiの実際のAPIキーを使い、PDFと画像の解析・複数日保存・日付確認を行う。キー未設定やAPI障害で既存データが壊れないことも確認する。
- APIへの直接アクセスでCORS、タイムアウト、レート制限、Vercel保護設定を確認する。
- 実在する運営者・問い合わせ先、データ削除依頼窓口を利用者へ案内する。現在のプライバシーページの一般表現だけでは窓口が分からないので、公開前に実際の連絡先を確定する。
- Geminiの利用上限・課金上限、DBバックアップ、障害時の復元と運用担当を確定する。

## 公式資料

- [FastAPI on Vercel](https://vercel.com/docs/frameworks/backend/fastapi)
- [Vercel Functionsの制限](https://vercel.com/docs/functions/limitations)
- [Vercelのリクエストヘッダー](https://vercel.com/docs/headers/request-headers)


## レシピ写真の保存

レシピ投稿では任意で1枚の料理写真を添付できます。入力はJPEG・PNG・WebPの4MB以下の写真で、ブラウザ側で縮小し、サーバーで形式と内容を検証して最大1200pxのWebPへ再変換します。アニメーションとSVGには対応していません。保存画像は512KB以下に制限し、EXIF/GPS等の付加情報を除去します。

写真はPostgreSQLの`recipe_photos`テーブルに保存されます。Vercelの一時ディスクや公開URLには保存しません。APIの認証とレシピの公開範囲に従って配信し、レシピ削除時には写真も削除します。写真なしの既存レシピは従来のイラストで表示します。既存環境では公開前に`python -m app.release`を実行して0003マイグレーションを適用してください。

DBバックアップには画像も含まれます。投稿数に応じてDB容量を監視してください。多数の投稿を扱う段階では、認証付きオブジェクトストレージへの移行を検討します。
