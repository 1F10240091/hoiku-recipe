export default function AllergyScope() {
  return <aside className="card" aria-label="アレルギー照合の範囲">
    <h2>アレルギー照合の範囲</h2>
    <p>献立提案では、お子さんに登録したアレルギーと、レシピに登録された食材名・原材料を照合します。</p>
    <p>未登録の原材料、実際に使う商品の成分、調理中の混入は確認できません。園の献立の読み取り結果は、夕食の重複を避ける参考に使います。</p>
    <p className="note">表示は安全の保証ではありません。使用する商品の原材料表示も確認してください。</p>
  </aside>;
}
