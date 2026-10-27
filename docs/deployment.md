# 本番デプロイガイド

このアプリはNext.jsフロントエンド、FastAPIバックエンド、PostgreSQLで構成します。フロントエンドとAPIはHTTPSで公開し、SQLiteファイルを一時ストレージ上で運用しないでください。

## 1. バックエンド環境変数

ホスティングサービスの環境変数画面に設定します。`.env`やAPIキーをGitへ登録しないでください。

| 変数 | 本番値 |
|---|---|
| `ENVIRONMENT` | `production` |
| `DATABASE_URL` | PostgreSQL接続URL。`postgresql+psycopg://...`または`postgresql://...` |
| `JWT_SECRET_KEY` | 下記コマンドで生成したランダム値 |
| `CORS_ORIGINS` | `https://`から始まるフロントエンドのオリジンをJSON配列で指定 |
| `GEMINI_API_KEY` | 献立表解析を使う場合に設定 |
| `GEMINI_MODEL` | `gemini-3.5-flash-lite`（必要に応じて変更） |
| `TRUSTED_PROXY_IPS` | 既知のリバースプロキシIPがある場合だけJSON配列で指定 |

JWT鍵の生成例（Pythonが使える端末で実行）：

```sh
python -c "import secrets; print(secrets.token_hex(32))"
```

本番モードは、短い/既知のJWT鍵、SQLite、HTTPまたはlocalhostのCORS設定では起動しません。PostgreSQL用の依存パッケージは`backend/requirements.txt`に含まれています。

## 2. バックエンドの起動

ホスティングサービスのビルドコマンドを`pip install -r requirements.txt`、起動コマンドを次のように設定します。`PORT`はサービスが割り当てるポートを利用します。

```sh
uvicorn app.main:app --host 0.0.0.0 --port $PORT
```

サービスに永続PostgreSQLを割り当ててからAPIを起動してください。初回起動ではSQLAlchemyが不足テーブルを作成します。既存DBを更新する場合は、バックアップを取り、`backend/app/models.py`に合わせたスキーマ変更を先に適用してください。現状、Alembic等の自動バージョン管理は導入していません。

ヘルスチェックには`/health`を指定できます。

## 3. フロントエンドのビルドと起動

`NEXT_PUBLIC_API_URL`には公開されたバックエンドのHTTPSオリジン（例：`https://api.example.com`）を設定してからビルドします。APIキーなどの秘密情報を`NEXT_PUBLIC_`変数に入れないでください。

```sh
npm ci
npm run build
npm run start:frontend:production -- -p $PORT
```

`NEXT_PUBLIC_API_URL`はブラウザーの献立表アップロード先とNext.jsのAPIプロキシ先に使われるため、フロントエンドのビルド時に正しい公開URLを設定してください。API側の`CORS_ORIGINS`にはフロントエンドの本番オリジンを設定します。

## 4. 公開前の確認

- 本番環境変数がすべて設定され、APIキーがログやフロントエンド配信物に出ていない。
- API `/health`、フロントページ、ログイン/新規登録をHTTPS経由で確認した。
- PostgreSQLの永続化、バックアップ、復元手順を確認した。
- 献立表PDF/画像をアップロードし、解析・ユーザー別保存・一覧表示を確認した。
- 別アカウントから子ども情報、献立、在庫、非公開レシピが見えないことを確認した。
- 運営者の問い合わせ先、データ削除依頼の対応、Geminiへの送信内容を利用者へ案内した。
- Gemini APIの利用上限と課金設定を確認した。

本番公開前に、実際のホスティング事業者のネットワーク設定でCORS、プロキシIP、環境変数名を照合してください。レート制限は現在プロセス内メモリ方式のため、複数APIインスタンスでは共有されません。複数インスタンスで公開する場合は、ホスティング側/WAFまたは共有ストアを使った制限へ切り替えてください。
