---
marp: true
paginate: true
size: 16:9
footer: ほいくレシピ ／ 進捗報告 2026-10-26
style: |
  :root {
    --paper: #fffaf3;
    --ink: #4a3f38;
    --muted: #7c6d60;
    --line: #f0e0cc;
    --card: #ffffff;
    --pink: #d9577a;
    --pink-w: #fdeef2;
    --blue: #3b7fb5;
    --blue-w: #eaf4fc;
    --green: #3e9b74;
    --green-w: #e8f6ee;
    --amber: #a97d08;
    --amber-w: #fdf6e3;
  }
  section {
    background: var(--paper);
    color: var(--ink);
    font-family: "M PLUS Rounded 1c", "Zen Maru Gothic", "Hiragino Maru Gothic ProN", "Yu Gothic", sans-serif;
    font-size: 26px;
    line-height: 1.5;
    letter-spacing: 0.01em;
    padding: 38px 56px 48px;
  }
  h1 { font-size: 52px; margin: 0 0 8px; line-height: 1.2; }
  h2 { font-size: 38px; margin: 0 0 16px; padding-bottom: 8px; border-bottom: 3px solid var(--line); line-height: 1.25; }
  h3 { font-size: 22px; margin: 0 0 4px; }
  p { margin: 6px 0; }
  strong { color: var(--pink); }
  .note { font-size: 18px; color: var(--muted); }
  .tag {
    display: inline-block; font-size: 15px; font-weight: 800; letter-spacing: 0.14em;
    padding: 3px 12px; margin-bottom: 10px; border: 2px solid;
  }
  .t1 { color: var(--blue); border-color: #bcd9f0; background: var(--blue-w); }
  .t2 { color: var(--green); border-color: #bfe3d0; background: var(--green-w); }
  .t3 { color: var(--amber); border-color: #ecd9a4; background: var(--amber-w); }
  .t4 { color: var(--pink); border-color: #f3c3d0; background: var(--pink-w); }
  .agenda { display: flex; flex-direction: column; gap: 8px; margin-top: 6px; }
  .agenda > div { display: flex; align-items: center; gap: 14px; background: var(--card); border: 3px solid var(--line); padding: 8px 16px; }
  .agenda b { font-size: 26px; color: var(--pink); width: 32px; }
  .agenda span { font-size: 22px; flex: 1; }
  .agenda em { font-style: normal; font-size: 18px; color: var(--muted); }
  .stats { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; margin: 8px 0; }
  .stat { background: var(--card); border: 3px solid var(--line); padding: 12px 18px; }
  .stat b { display: block; font-size: 50px; line-height: 1.05; color: var(--pink); }
  .stat span { font-size: 18px; color: var(--muted); }
  .cols2 { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
  .cols3 { display: grid; grid-template-columns: repeat(3, 1fr); gap: 14px; }
  .card { background: var(--card); border: 3px solid var(--line); padding: 12px 16px; }
  .card p { font-size: 19px; margin: 2px 0; line-height: 1.45; }
  .day { display: grid; grid-template-columns: repeat(5, 1fr); gap: 8px; margin: 12px 0; }
  .day > div { border-top: 6px solid var(--line); padding-top: 8px; font-size: 18px; }
  .day b { display: block; font-size: 20px; color: var(--blue); }
  .day .hot { border-top-color: var(--pink); background: var(--pink-w); padding: 8px 8px 6px; }
  .day .hot b { color: var(--pink); }
  .steps { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; }
  .step { background: var(--card); border: 3px solid var(--line); padding: 12px 14px; font-size: 19px; line-height: 1.4; }
  .step b { display: block; font-size: 14px; color: var(--pink); letter-spacing: 0.12em; margin-bottom: 4px; }
  .road { display: grid; grid-template-columns: repeat(4, 1fr); margin: 8px 0; }
  .road > div { border-left: 5px solid var(--line); padding: 8px 14px; font-size: 18px; line-height: 1.4; }
  .road > div:first-child { border-left-color: var(--pink); }
  .road b { display: block; font-size: 20px; color: var(--pink); margin-bottom: 4px; }
  .metrics { display: grid; grid-template-columns: repeat(3, 1fr); gap: 14px; margin: 10px 0; }
  .metric { background: var(--card); border: 3px solid var(--line); text-align: center; padding: 10px; }
  .metric b { display: block; font-size: 46px; color: var(--green); line-height: 1.1; }
  .metric span { font-size: 17px; color: var(--muted); }
  .chip { display: inline-block; background: var(--green-w); color: var(--green); border: 2px solid #bfe3d0; padding: 3px 12px; margin: 3px; font-size: 19px; }
  .demo { display: grid; grid-template-columns: repeat(7, 1fr); gap: 6px; }
  .demo > div { background: var(--card); border: 2px solid var(--line); border-top: 5px solid var(--green); padding: 8px 2px; text-align: center; font-size: 16px; line-height: 1.35; }
  .demo b { display: block; font-size: 18px; color: var(--green); }
  .changes { display: flex; flex-direction: column; gap: 9px; }
  .changes > div { display: flex; align-items: center; gap: 10px; font-size: 20px; }
  .before { background: #f4f0ea; color: #8b7c70; padding: 3px 12px; text-decoration: line-through; border: 2px solid var(--line); }
  .after { background: var(--green-w); color: var(--green); padding: 3px 12px; border: 2px solid #bfe3d0; font-weight: 800; }
  .arrow { color: var(--muted); font-weight: 800; }
  section.lead { text-align: center; padding-top: 150px; }
  section.lead h1 { font-size: 62px; }
  section.lead h2 { border: none; font-size: 30px; color: var(--muted); }
---

<!-- _class: lead -->

<div class="tag t1">PROGRESS REPORT ／ 2026-10-26</div>

# ほいくレシピ

## 少子高齢化への対抗として、<br>子育て世帯の「毎日のごはん」を軽くする

<p class="note">10分・5本立て　／　報告後、<b>今月中（10/31）の完成・リリース</b>を目指す</p>

---

<div class="tag t1">CONTENTS</div>

## 本日の内容

<div class="agenda">
<div><b>1</b><span>アプリの概要</span><em>1.5分</em></div>
<div><b>2</b><span>進捗内容（デモ）＝0からやってきたこと</span><em>4.5分</em></div>
<div><b>3</b><span>問題点・改善点</span><em>1.5分</em></div>
<div><b>4</b><span>解決に向けてのアプローチ</span><em>1.5分</em></div>
<div><b>5</b><span>今後のスケジュール＝ここから</span><em>1.0分</em></div>
</div>

<p class="note">②では、プロトタイプを実際に操作します。</p>

---

<div class="tag t1">① アプリの概要</div>

## 少子高齢化は、待ったなし

<div class="stats">
<div class="stat"><b>67万人</b><span>2025年の出生数（過去最少）</span></div>
<div class="stat"><b>1.14</b><span>合計特殊出生率（過去最低）</span></div>
<div class="stat"><b>42.5%</b><span>子育て世代「自分の時間が取れない」</span></div>
<div class="stat"><b>28日分</b><span>子育て家庭の家事・育児時間の差（1年）</span></div>
</div>

<p style="margin-top:10px;"><strong>少子化は「産む・産まない」だけの問題ではない。</strong><br>子育て世帯の日常の負担が、もう一人をためらわせている。</p>

<p class="note">出典：厚生労働省「令和7年版 厚生労働白書」ほか（提案書より）</p>

---

<div class="tag t1">① アプリの概要</div>

## ボトルネックは「18:30からの1時間」

<div class="day">
<div><b>6:30</b>起床・朝食</div>
<div><b>8:00</b>登園</div>
<div><b>17:30</b>お迎え</div>
<div class="hot"><b>18:30</b>夕食づくり</div>
<div><b>20:00</b>お風呂・就寝</div>
</div>

<div class="cols2" style="margin-top:14px;">
<div class="card"><h3>仕事から帰って…</h3><p>献立を考え、在庫を確認し、買い物へ。毎日・休みなし。</p></div>
<div class="card"><h3>しかも判断が多い</h3><p>アレルギー、偏食、園の昼食との重複。考えることが多すぎる。</p></div>
</div>

---

<div class="tag t1">① アプリの概要</div>

## ほいくレシピがやること

<div class="steps">
<div class="step"><b>STEP 1</b>園の献立表を<br>アップロード</div>
<div class="step"><b>STEP 2</b>アレルギー・<br>好き嫌いを登録</div>
<div class="step"><b>STEP 3</b>ボタン1つで<br>提案</div>
<div class="step"><b>STEP 4</b>買い物リスト<br>まで一気に</div>
</div>

<p style="margin-top:20px; font-size:29px;"><strong>昼と重ならない夜ごはんを、毎日自動で。</strong></p>

<p class="note" style="margin-top:14px;">Next.js ／ FastAPI ／ SQLite→Supabase ／ AI（MiMo）</p>

---

<div class="tag t1">① アプリの概要</div>

## リリースの狙い — 少子化への対抗

<div class="cols3">
<div class="card"><h3>時間の余裕</h3><p>献立を考える時間を、<br>子どもと過ごす時間へ。</p></div>
<div class="card"><h3>心の余裕</h3><p>「何を作ろう」の迷いをなくし、<br>毎日を軽くする。</p></div>
<div class="card"><h3>社会への貢献</h3><p>子育てしやすい社会づくりへ。</p></div>
</div>

<p style="margin-top:16px;">こども家庭庁「<strong>こどもまんなか社会</strong>」の方向性に沿う。</p>

<p><strong>子育て世帯の日常の負担を減らすことが、少子高齢化への具体的な対抗策になる。</strong></p>

---

<div class="tag t2">② 進捗内容（デモ）</div>

## 0からやってきたこと

<div class="road">
<div><b>企画</b>課題設定・STP分析・差別化</div>
<div><b>設計</b>DB・API・画面設計</div>
<div><b>実装</b>認証／AI OCR／AI献立／検索／買い物／評価</div>
<div><b>改善・検証</b>デザイン統一・テスト68件</div>
</div>

<p style="margin-top:18px; font-size:28px;"><strong>何もない状態から、企画 → 設計 → 実装 → 改善 → 検証まで。</strong></p>

<p style="margin-top:12px;">提案書・設計書を書き、動くプロトタイプまで到達。主要機能を実装済み。</p>

---

<div class="tag t2">② 進捗内容（デモ）</div>

## デモの流れ

<div class="demo">
<div><b>1</b>トップ</div>
<div><b>2</b>ログイン</div>
<div><b>3</b>レシピ検索</div>
<div><b>4</b>こんだて提案</div>
<div><b>5</b>献立表</div>
<div><b>6</b>買い物メモ</div>
<div><b>7</b>プロフィール</div>
</div>

<div class="cols2" style="margin-top:18px;">
<div class="card"><h3>見せどころ 1</h3><p><strong>園の昼と重複しない</strong>献立を提案。<br>昼＝鮭の塩焼き → 夜＝鶏の照り焼き。</p></div>
<div class="card"><h3>見せどころ 2</h3><p>アレルギーを除外し、<strong>在庫を引いた<br>買い物リスト</strong>を自動作成。喜んだ料理は「喜んでた」で記録。</p></div>
</div>

---

<div class="tag t2">② 進捗内容（デモ）</div>

## 今回の変更点

<div class="changes">
<div><span class="before">メール認証</span><span class="arrow">→</span><span class="after">ユーザーネーム</span></div>
<div><span class="before">生年月日</span><span class="arrow">→</span><span class="after">年月のみ</span></div>
<div><span class="before">アレルギー自由入力</span><span class="arrow">→</span><span class="after">レシピ食材から選択</span></div>
<div><span class="before">レシピ検索が下</span><span class="arrow">→</span><span class="after">アプリのトップに</span></div>
<div><span class="before">PCのみ</span><span class="arrow">→</span><span class="after">モバイル下部ナビ</span></div>
<div><span class="before">DBの料理から選択</span><span class="arrow">→</span><span class="after">年齢に合わせAIが考案</span></div>
<div><span class="before">献立は見るだけ</span><span class="arrow">→</span><span class="after">「喜んでた」で記録・並べ替え</span></div>
</div>

<p class="note" style="margin-top:16px;">ねらい：入力ミスを防ぐ ／ 個人情報を最小化する ／ 迷わない導線にする</p>

---

<div class="tag t2">② 進捗内容（デモ）</div>

## 実装状況と品質

<div>
<span class="chip">認証</span><span class="chip">お子さん管理</span><span class="chip">献立表AI OCR</span><span class="chip">AI献立生成</span><span class="chip">レシピ自動登録</span><span class="chip">喜んでた評価</span><span class="chip">レシピ検索</span><span class="chip">買い物メモ</span><span class="chip">デモモード</span>
</div>

<div class="metrics" style="margin-top:16px;">
<div class="metric"><b>68</b><span>APIテスト成功</span></div>
<div class="metric"><b>0</b><span>Lintエラー</span></div>
<div class="metric"><b>0</b><span>型エラー</span></div>
</div>

<p style="margin-top:12px;">bcrypt・JWT検証・レート制限などのセキュリティ対策も実装。</p>

---

<div class="tag t3">③ 問題点・改善点</div>

## いま残っている課題

<div class="cols3">
<div class="card"><h3>優先度 高</h3><p><strong>AIは実装済み・キー待ち</strong><br>年齢適応の献立生成とAI OCRを実装。実キーでの精度検証が残る。</p></div>
<div class="card"><h3>優先度 高</h3><p><strong>デプロイ未実施</strong><br>開発はSQLiteのまま。公開できていない。</p></div>
<div class="card"><h3>優先度 中</h3><p><strong>OCRの精度</strong><br>手書き・薄い文字・園ごとの形式差。</p></div>
</div>

<div class="cols3" style="margin-top:12px;">
<div class="card"><h3>優先度 中</h3><p><strong>重複回避が主菜だけ</strong><br>副菜・食材レベルは未対応。</p></div>
<div class="card"><h3>優先度 中</h3><p><strong>テストがバックエンド中心</strong><br>フロントのE2Eが未整備。</p></div>
<div class="card"><h3>その他</h3><p>ドキュメントの乖離／自動リロード不安定／性能・アクセシビリティ未計測。</p></div>
</div>

---

<div class="tag t3">④ 解決に向けてのアプローチ</div>

## どう解決するか

<div class="cols3">
<div class="card"><h3>AI</h3><p>Xiaomi MiMo（OpenAI互換）を<strong>.env</strong>で接続。キー未設定時はルールベース。</p></div>
<div class="card"><h3>OCR</h3><p>AI画像認識＋失敗時の<strong>テキスト抽出フォールバック</strong>で誤読を吸収。</p></div>
<div class="card"><h3>デプロイ</h3><p><strong>Vercel</strong>でフロント公開。バックエンドは別途ホスティング。</p></div>
</div>

<div class="cols2" style="margin-top:12px;">
<div class="card"><h3>品質</h3><p>Playwrightで主要動線のE2E。ドキュメントは実装に追従。</p></div>
<div class="card"><h3>検証</h3><p>学祭アンケートで<strong>負担軽減の実感</strong>を測定（ビフォー／アフター）。</p></div>
</div>

---

<div class="tag t4">⑤ 今後のスケジュール</div>

## ここから — 10/31の完成へ

<div class="road">
<div><b>10/26（月）</b>進捗報告<br>方針確定</div>
<div><b>10/27（火）</b>AIキー設定<br>実データ検証</div>
<div><b>10/28〜29</b>Vercel<br>デプロイ</div>
<div><b>10/30〜31</b>テスト・修正<br><strong>完成・リリース</strong></div>
</div>

<p style="margin-top:20px; font-size:29px;"><strong>残り5日。Mustに絞って、今月中に完成させる。</strong></p>

<p class="note" style="margin-top:12px;">最大のリスクはデプロイ → 10/28〜29 に前倒しして実施</p>

---

<div class="tag t4">⑤ 今後のスケジュール</div>

## 今月中に完成させるための優先順位

<div class="cols3">
<div class="card"><h3>Must（今月中）</h3><p>・デプロイ＋公開URL<br>・主要バグ修正<br>・マニュアル更新<br>・AIキー設定と精度確認</p></div>
<div class="card"><h3>Should（間に合えば）</h3><p>・OCR読み取り補正UI<br>・重複回避の食材レベル拡張</p></div>
<div class="card"><h3>Later（来月以降）</h3><p>・E2Eテスト拡充<br>・性能・アクセシビリティ<br>・AI精度の定量評価</p></div>
</div>

---

<!-- _class: lead -->

<div class="tag t4">SUMMARY</div>

# 子育て世帯の<br>「毎日のごはん」を軽くする。

<p style="font-size:29px; margin-top:18px;">その余裕が、少子高齢化への対抗につながる。</p>

<p class="note">ご意見・フィードバックをお待ちしています</p>
