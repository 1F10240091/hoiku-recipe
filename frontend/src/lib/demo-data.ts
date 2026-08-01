// デモモード用のシードデータ（バックエンドなしで動作させるためのモックデータ）

export interface DemoRecipe {
  id: string;
  name: string;
  meal_type: string;
  ingredients: { name: string; quantity?: string; unit?: string }[];
  instructions: string;
  cook_time_minutes?: number | null;
}

// レシピマスタのサンプル（バックエンドのシード 23 件から代表的なものを抜粋）
export const DEMO_RECIPES: DemoRecipe[] = [
  {
    id: "r-001",
    name: "和風ハンバーグ",
    meal_type: "main",
    cook_time_minutes: 25,
    ingredients: [
      { name: "豚ひき肉", quantity: "200", unit: "g" },
      { name: "玉ねぎ", quantity: "1/2", unit: "個" },
      { name: "卵", quantity: "1", unit: "個" },
      { name: "パン粉", quantity: "大さじ", unit: "3" },
      { name: "牛乳", quantity: "大さじ", unit: "2" },
      { name: "塩", quantity: "少々", unit: "" },
    ],
    instructions: "1. 玉ねぎと塩を刻んで炒め、冷ましておく。\n2. ひき肉・玉ねぎ・卵・パン粉・牛乳をよくこねる。\n3. 小判形に成形し、フライパンで両面焼く。\n4. 水と調味料を入れて蒸し焼きにする。",
  },
  {
    id: "r-002",
    name: "鶏の照り焼き",
    meal_type: "main",
    cook_time_minutes: 15,
    ingredients: [
      { name: "鶏もも肉", quantity: "1", unit: "枚" },
      { name: "酒", quantity: "大さじ", unit: "1" },
      { name: "みりん", quantity: "大さじ", unit: "1" },
      { name: "砂糖", quantity: "小さじ", unit: "1" },
    ],
    instructions: "1. 鶏肉に塩を振り、10分おく。\n2. 皮を下にしてフライパンで両面焼く。\n3. 調味料を入れて照りが出るまで煮る。",
  },
  {
    id: "r-003",
    name: "肉じゃが",
    meal_type: "main",
    cook_time_minutes: 30,
    ingredients: [
      { name: "牛肉", quantity: "150", unit: "g" },
      { name: "じゃがいも", quantity: "3", unit: "個" },
      { name: "玉ねぎ", quantity: "1", unit: "個" },
      { name: "にんじん", quantity: "1/2", unit: "本" },
      { name: "しょうゆ", quantity: "大さじ", unit: "3" },
      { name: "みりん", quantity: "大さじ", unit: "2" },
    ],
    instructions: "1. 野菜を食べやすい大きさに切る。\n2. 肉と野菜を炒め、水を加えて煮込む。\n3. 調味料を入れて野菜が柔らかくなるまで煮る。",
  },
  {
    id: "r-004",
    name: "鮭の塩焼き",
    meal_type: "main",
    cook_time_minutes: 15,
    ingredients: [
      { name: "鮭", quantity: "2", unit: "切れ" },
      { name: "塩", quantity: "少々", unit: "" },
    ],
    instructions: "1. 鮭に塩を振って10分おく。\n2. グリルで両面焼く。\n3. 大根おろしを添える。",
  },
  {
    id: "r-005",
    name: "オムライス",
    meal_type: "main",
    cook_time_minutes: 20,
    ingredients: [
      { name: "ごはん", quantity: "300", unit: "g" },
      { name: "卵", quantity: "2", unit: "個" },
      { name: "ケチャップ", quantity: "大さじ", unit: "3" },
      { name: "鶏肉", quantity: "100", unit: "g" },
    ],
    instructions: "1. ごはんと鶏肉をケチャップで炒める。\n2. 卵を薄焼きにしてごはんを包む。\n3. 上からケチャップをかける。",
  },
  {
    id: "r-006",
    name: "カレーライス",
    meal_type: "main",
    cook_time_minutes: 35,
    ingredients: [
      { name: "豚肉", quantity: "200", unit: "g" },
      { name: "玉ねぎ", quantity: "2", unit: "個" },
      { name: "にんじん", quantity: "1", unit: "本" },
      { name: "じゃがいも", quantity: "2", unit: "個" },
      { name: "カレールー", quantity: "1/2", unit: "箱" },
    ],
    instructions: "1. 野菜を切り、肉と一緒に炒める。\n2. 水を加えて煮込む。\n3. 火を止めてカレールーを溶かし、再び煮る。",
  },
  {
    id: "r-007",
    name: "さばの味噌煮",
    meal_type: "main",
    cook_time_minutes: 20,
    ingredients: [
      { name: "さば", quantity: "2", unit: "切れ" },
      { name: "しょうが", quantity: "1", unit: "かけ" },
      { name: "みそ", quantity: "大さじ", unit: "2" },
      { name: "みりん", quantity: "大さじ", unit: "2" },
    ],
    instructions: "1. さばを切り、フライパンに並べる。\n2. 調味料と水を入れて煮る。\n3. 汁が少なくなるまで煮詰める。",
  },
  { id: "r-008", name: "みそ汁", meal_type: "soup", cook_time_minutes: 10, ingredients: [{ name: "豆腐", quantity: "1/2", unit: "丁" }, { name: "わかめ", quantity: "少々", unit: "" }, { name: "みそ", quantity: "大さじ", unit: "2" }], instructions: "1. だし汁を沸かす。\n2. 具材を入れて煮る。\n3. 火を止めてみそを溶かす。" },
  { id: "r-009", name: "おひたし", meal_type: "side", cook_time_minutes: 5, ingredients: [{ name: "ほうれん草", quantity: "1", unit: "束" }, { name: "しょうゆ", quantity: "少々", unit: "" }], instructions: "1. ほうれん草を茹でる。\n2. 冷水にとり、絞る。\n3. しょうゆをかける。" },
  { id: "r-010", name: "ごはん", meal_type: "staple", cook_time_minutes: 20, ingredients: [{ name: "米", quantity: "2", unit: "合" }], instructions: "1. 米を研いで水に浸す。\n2. 炊飯器で炊く。" },
  { id: "r-011", name: "鶏の唐揚げ", meal_type: "main", cook_time_minutes: 25, ingredients: [{ name: "鶏もも肉", quantity: "300", unit: "g" }, { name: "しょうゆ", quantity: "大さじ", unit: "2" }, { name: "にんにく", quantity: "1", unit: "かけ" }, { name: "片栗粉", quantity: "適量", unit: "" }], instructions: "1. 鶏肉を一口大に切り、調味料に漬ける。\n2. 片栗粉をまぶす。\n3. 180度の油で揚げる。" },
  { id: "r-012", name: "豚の生姜焼き", meal_type: "main", cook_time_minutes: 15, ingredients: [{ name: "豚ロース", quantity: "250", unit: "g" }, { name: "玉ねぎ", quantity: "1/2", unit: "個" }, { name: "しょうが", quantity: "1", unit: "かけ" }, { name: "しょうゆ", quantity: "大さじ", unit: "2" }, { name: "みりん", quantity: "大さじ", unit: "1" }], instructions: "1. 豚肉を炒める。\n2. 玉ねぎとしょうがを加える。\n3. 調味料を入れて絡める。" },
  { id: "r-013", name: "とんかつ", meal_type: "main", cook_time_minutes: 25, ingredients: [{ name: "豚ロース", quantity: "2", unit: "枚" }, { name: "パン粉", quantity: "適量", unit: "" }, { name: "卵", quantity: "1", unit: "個" }, { name: "小麦粉", quantity: "適量", unit: "" }], instructions: "1. 豚肉に塩こしょうする。\n2. 小麦粉・卵・パン粉の順につける。\n3. 油で揚げる。" },
  { id: "r-014", name: "チキン南蛮", meal_type: "main", cook_time_minutes: 30, ingredients: [{ name: "鶏もも肉", quantity: "300", unit: "g" }, { name: "卵", quantity: "1", unit: "個" }, { name: "小麦粉", quantity: "適量", unit: "" }, { name: "タルタルソース", quantity: "適量", unit: "" }], instructions: "1. 鶏肉に小麦粉と卵をつける。\n2. 揚げて甘酢に浸す。\n3. タルタルソースをかける。" },
  { id: "r-015", name: "酢豚", meal_type: "main", cook_time_minutes: 30, ingredients: [{ name: "豚肉", quantity: "250", unit: "g" }, { name: "ピーマン", quantity: "2", unit: "個" }, { name: "玉ねぎ", quantity: "1/2", unit: "個" }, { name: "ケチャップ", quantity: "大さじ", unit: "3" }, { name: "酢", quantity: "大さじ", unit: "1" }], instructions: "1. 豚肉を揚げる。\n2. 野菜を炒める。\n3. 合わせ調味料で絡める。" },
  { id: "r-016", name: "麻婆豆腐", meal_type: "main", cook_time_minutes: 20, ingredients: [{ name: "豆腐", quantity: "1", unit: "丁" }, { name: "豚ひき肉", quantity: "150", unit: "g" }, { name: "にんにく", quantity: "1", unit: "かけ" }, { name: "みそ", quantity: "大さじ", unit: "1" }, { name: "豆板醤", quantity: "小さじ", unit: "1" }], instructions: "1. ひき肉とにんにくを炒める。\n2. 豆腐と調味料を加える。\n3. とろみをつける。" },
  { id: "r-017", name: "親子丼", meal_type: "main", cook_time_minutes: 15, ingredients: [{ name: "鶏もも肉", quantity: "200", unit: "g" }, { name: "玉ねぎ", quantity: "1/2", unit: "個" }, { name: "卵", quantity: "2", unit: "個" }, { name: "ごはん", quantity: "2", unit: "杯" }], instructions: "1. 鶏肉と玉ねぎを煮る。\n2. 溶き卵を回し入れる。\n3. ごはんにのせる。" },
  { id: "r-018", name: "牛丼", meal_type: "main", cook_time_minutes: 15, ingredients: [{ name: "牛肉", quantity: "200", unit: "g" }, { name: "玉ねぎ", quantity: "1", unit: "個" }, { name: "ごはん", quantity: "2", unit: "杯" }, { name: "しょうゆ", quantity: "大さじ", unit: "2" }, { name: "みりん", quantity: "大さじ", unit: "2" }], instructions: "1. 玉ねぎと牛肉を煮る。\n2. 調味料で味付けする。\n3. ごはんにかける。" },
  { id: "r-019", name: "カツ丼", meal_type: "main", cook_time_minutes: 20, ingredients: [{ name: "とんかつ", quantity: "1", unit: "枚" }, { name: "玉ねぎ", quantity: "1/2", unit: "個" }, { name: "卵", quantity: "2", unit: "個" }, { name: "ごはん", quantity: "2", unit: "杯" }], instructions: "1. 玉ねぎを煮てとんかつを入れる。\n2. 溶き卵を流し入れる。\n3. ごはんにのせる。" },
  { id: "r-020", name: "肉団子の甘酢あん", meal_type: "main", cook_time_minutes: 25, ingredients: [{ name: "豚ひき肉", quantity: "250", unit: "g" }, { name: "玉ねぎ", quantity: "1/2", unit: "個" }, { name: "卵", quantity: "1", unit: "個" }, { name: "片栗粉", quantity: "大さじ", unit: "2" }, { name: "ケチャップ", quantity: "大さじ", unit: "3" }], instructions: "1. 材料をこねて丸める。\n2. 揚げる。\n3. 甘酢あんで絡める。" },
  { id: "r-021", name: "ハンバーグ", meal_type: "main", cook_time_minutes: 30, ingredients: [{ name: "合いびき肉", quantity: "300", unit: "g" }, { name: "玉ねぎ", quantity: "1/2", unit: "個" }, { name: "卵", quantity: "1", unit: "個" }, { name: "パン粉", quantity: "大さじ", unit: "3" }], instructions: "1. 玉ねぎを炒めて冷ます。\n2. 材料をこねて成形する。\n3. 焼いて煮込む。" },
  { id: "r-022", name: "コロッケ", meal_type: "main", cook_time_minutes: 35, ingredients: [{ name: "じゃがいも", quantity: "4", unit: "個" }, { name: "豚ひき肉", quantity: "100", unit: "g" }, { name: "玉ねぎ", quantity: "1/2", unit: "個" }, { name: "卵", quantity: "1", unit: "個" }, { name: "パン粉", quantity: "適量", unit: "" }], instructions: "1. じゃがいもを茹でて潰す。\n2. 炒めた具と混ぜる。\n3. 衣をつけて揚げる。" },
  { id: "r-023", name: "ミートローフ", meal_type: "main", cook_time_minutes: 40, ingredients: [{ name: "合いびき肉", quantity: "400", unit: "g" }, { name: "玉ねぎ", quantity: "1", unit: "個" }, { name: "卵", quantity: "1", unit: "個" }, { name: "パン粉", quantity: "大さじ", unit: "4" }], instructions: "1. 材料を混ぜて成形する。\n2. オーブンで焼く。\n3. ソースをかける。" },
  { id: "r-024", name: "ロールキャベツ", meal_type: "main", cook_time_minutes: 40, ingredients: [{ name: "キャベツ", quantity: "4", unit: "枚" }, { name: "合いびき肉", quantity: "250", unit: "g" }, { name: "玉ねぎ", quantity: "1/2", unit: "個" }, { name: "トマト缶", quantity: "1", unit: "缶" }], instructions: "1. キャベツを茹でる。\n2. 具を包む。\n3. トマトで煮込む。" },
  { id: "r-025", name: "餃子", meal_type: "main", cook_time_minutes: 30, ingredients: [{ name: "餃子の皮", quantity: "20", unit: "枚" }, { name: "豚ひき肉", quantity: "200", unit: "g" }, { name: "キャベツ", quantity: "1/4", unit: "個" }, { name: "にら", quantity: "1/2", unit: "束" }], instructions: "1. 具を混ぜて皮に包む。\n2. フライパンで焼く。\n3. 水を入れて蒸し焼きにする。" },
  { id: "r-026", name: "エビチリ", meal_type: "main", cook_time_minutes: 20, ingredients: [{ name: "えび", quantity: "200", unit: "g" }, { name: "長ねぎ", quantity: "1/2", unit: "本" }, { name: "ケチャップ", quantity: "大さじ", unit: "3" }, { name: "豆板醤", quantity: "小さじ", unit: "1" }], instructions: "1. えびを炒める。\n2. 調味料を加える。\n3. とろみをつける。" },
  { id: "r-027", name: "ブリの照り焼き", meal_type: "main", cook_time_minutes: 15, ingredients: [{ name: "ぶり", quantity: "2", unit: "切れ" }, { name: "しょうゆ", quantity: "大さじ", unit: "2" }, { name: "みりん", quantity: "大さじ", unit: "2" }, { name: "砂糖", quantity: "小さじ", unit: "1" }], instructions: "1. ぶりを焼く。\n2. 調味料を加える。\n3. 照りが出るまで煮詰める。" },
  { id: "r-028", name: "あじの開き", meal_type: "main", cook_time_minutes: 12, ingredients: [{ name: "あじ", quantity: "2", unit: "尾" }, { name: "塩", quantity: "少々", unit: "" }], instructions: "1. あじに塩を振る。\n2. グリルで焼く。" },
  { id: "r-029", name: "さんまの蒲焼", meal_type: "main", cook_time_minutes: 15, ingredients: [{ name: "さんま", quantity: "2", unit: "尾" }, { name: "しょうゆ", quantity: "大さじ", unit: "2" }, { name: "みりん", quantity: "大さじ", unit: "2" }], instructions: "1. さんまを焼く。\n2. たれに絡める。" },
  { id: "r-030", name: "ししゃも", meal_type: "main", cook_time_minutes: 10, ingredients: [{ name: "ししゃも", quantity: "4", unit: "尾" }, { name: "レモン", quantity: "1/2", unit: "個" }], instructions: "1. グリルで焼く。\n2. レモンを添える。" },
  { id: "r-031", name: "まぐろの竜田揚げ", meal_type: "main", cook_time_minutes: 20, ingredients: [{ name: "まぐろ", quantity: "250", unit: "g" }, { name: "しょうゆ", quantity: "大さじ", unit: "2" }, { name: "片栗粉", quantity: "適量", unit: "" }, { name: "しょうが", quantity: "1", unit: "かけ" }], instructions: "1. まぐろを調味料に漬ける。\n2. 片栗粉をまぶす。\n3. 揚げる。" },
  { id: "r-032", name: "ポテトグラタン", meal_type: "main", cook_time_minutes: 30, ingredients: [{ name: "じゃがいも", quantity: "3", unit: "個" }, { name: "牛乳", quantity: "200", unit: "ml" }, { name: "チーズ", quantity: "適量", unit: "" }, { name: "バター", quantity: "20", unit: "g" }], instructions: "1. じゃがいもを切る。\n2. 牛乳とバターで煮る。\n3. チーズをかけて焼く。" },
  { id: "r-033", name: "クリームシチュー", meal_type: "main", cook_time_minutes: 35, ingredients: [{ name: "鶏もも肉", quantity: "200", unit: "g" }, { name: "じゃがいも", quantity: "2", unit: "個" }, { name: "にんじん", quantity: "1/2", unit: "本" }, { name: "牛乳", quantity: "300", unit: "ml" }, { name: "シチュールー", quantity: "1/2", unit: "箱" }], instructions: "1. 肉と野菜を炒める。\n2. 水で煮込む。\n3. ルーと牛乳を加える。" },
  { id: "r-034", name: "ビーフシチュー", meal_type: "main", cook_time_minutes: 60, ingredients: [{ name: "牛肉", quantity: "300", unit: "g" }, { name: "じゃがいも", quantity: "2", unit: "個" }, { name: "にんじん", quantity: "1", unit: "本" }, { name: "デミグラスソース", quantity: "1", unit: "缶" }], instructions: "1. 牛肉を炒める。\n2. 野菜を加えて煮込む。\n3. ソースを入れて煮込む。" },
  { id: "r-035", name: "肉じゃが", meal_type: "main", cook_time_minutes: 30, ingredients: [{ name: "牛肉", quantity: "150", unit: "g" }, { name: "じゃがいも", quantity: "3", unit: "個" }, { name: "玉ねぎ", quantity: "1", unit: "個" }, { name: "にんじん", quantity: "1/2", unit: "本" }, { name: "しょうゆ", quantity: "大さじ", unit: "3" }], instructions: "1. 肉と野菜を炒める。\n2. 水と調味料を加える。\n3. 煮込む。" },
  { id: "r-036", name: "回鍋肉", meal_type: "main", cook_time_minutes: 20, ingredients: [{ name: "豚バラ肉", quantity: "200", unit: "g" }, { name: "キャベツ", quantity: "1/4", unit: "個" }, { name: "ピーマン", quantity: "2", unit: "個" }, { name: "みそ", quantity: "大さじ", unit: "2" }], instructions: "1. 肉と野菜を炒める。\n2. みそで味付けする。" },
  { id: "r-037", name: "野菜炒め", meal_type: "side", cook_time_minutes: 10, ingredients: [{ name: "キャベツ", quantity: "1/4", unit: "個" }, { name: "にんじん", quantity: "1/2", unit: "本" }, { name: "ピーマン", quantity: "1", unit: "個" }, { name: "しょうゆ", quantity: "大さじ", unit: "1" }], instructions: "1. 野菜を切る。\n2. 炒める。\n3. 調味する。" },
  { id: "r-038", name: "きんぴらごぼう", meal_type: "side", cook_time_minutes: 15, ingredients: [{ name: "ごぼう", quantity: "1/2", unit: "本" }, { name: "にんじん", quantity: "1/2", unit: "本" }, { name: "しょうゆ", quantity: "大さじ", unit: "2" }, { name: "みりん", quantity: "大さじ", unit: "1" }], instructions: "1. ごぼうをささがきにする。\n2. 炒めて調味する。" },
  { id: "r-039", name: "ひじきの煮物", meal_type: "side", cook_time_minutes: 20, ingredients: [{ name: "ひじき", quantity: "20", unit: "g" }, { name: "にんじん", quantity: "1/2", unit: "本" }, { name: "油揚げ", quantity: "1/2", unit: "枚" }, { name: "しょうゆ", quantity: "大さじ", unit: "2" }], instructions: "1. ひじきを戻す。\n2. 具を炒めて煮る。" },
  { id: "r-040", name: "ポテトサラダ", meal_type: "side", cook_time_minutes: 20, ingredients: [{ name: "じゃがいも", quantity: "3", unit: "個" }, { name: "にんじん", quantity: "1/3", unit: "本" }, { name: "きゅうり", quantity: "1/2", unit: "本" }, { name: "マヨネーズ", quantity: "大さじ", unit: "3" }], instructions: "1. じゃがいもを茹でて潰す。\n2. 野菜を混ぜる。\n3. マヨネーズで和える。" },
  { id: "r-041", name: "マカロニサラダ", meal_type: "side", cook_time_minutes: 15, ingredients: [{ name: "マカロニ", quantity: "100", unit: "g" }, { name: "きゅうり", quantity: "1/2", unit: "本" }, { name: "にんじん", quantity: "1/3", unit: "本" }, { name: "マヨネーズ", quantity: "大さじ", unit: "3" }], instructions: "1. マカロニを茹でる。\n2. 野菜と和える。" },
  { id: "r-042", name: "春雨サラダ", meal_type: "side", cook_time_minutes: 15, ingredients: [{ name: "春雨", quantity: "50", unit: "g" }, { name: "きゅうり", quantity: "1/2", unit: "本" }, { name: "ハム", quantity: "4", unit: "枚" }, { name: "ごま", quantity: "少々", unit: "" }], instructions: "1. 春雨を茹でる。\n2. 具材と和える。" },
  { id: "r-043", name: "ブロッコリーの胡麻和え", meal_type: "side", cook_time_minutes: 10, ingredients: [{ name: "ブロッコリー", quantity: "1", unit: "株" }, { name: "ごま", quantity: "大さじ", unit: "1" }, { name: "しょうゆ", quantity: "大さじ", unit: "1" }], instructions: "1. ブロッコリーを茹でる。\n2. すりごま・しょうゆで和える。" },
  { id: "r-044", name: "かぼちゃの煮物", meal_type: "side", cook_time_minutes: 20, ingredients: [{ name: "かぼちゃ", quantity: "1/4", unit: "個" }, { name: "しょうゆ", quantity: "大さじ", unit: "1" }, { name: "砂糖", quantity: "大さじ", unit: "1" }], instructions: "1. かぼちゃを切る。\n2. 調味料で煮る。" },
  { id: "r-045", name: "切り干し大根の煮物", meal_type: "side", cook_time_minutes: 20, ingredients: [{ name: "切り干し大根", quantity: "30", unit: "g" }, { name: "にんじん", quantity: "1/3", unit: "本" }, { name: "油揚げ", quantity: "1/2", unit: "枚" }, { name: "しょうゆ", quantity: "大さじ", unit: "2" }], instructions: "1. 切り干し大根を戻す。\n2. 具と煮る。" },
  { id: "r-046", name: "高野豆腐の煮物", meal_type: "side", cook_time_minutes: 20, ingredients: [{ name: "高野豆腐", quantity: "3", unit: "枚" }, { name: "にんじん", quantity: "1/3", unit: "本" }, { name: "しょうゆ", quantity: "大さじ", unit: "2" }], instructions: "1. 高野豆腐を戻す。\n2. 煮る。" },
  { id: "r-047", name: "筑前煮", meal_type: "side", cook_time_minutes: 30, ingredients: [{ name: "鶏もも肉", quantity: "150", unit: "g" }, { name: "ごぼう", quantity: "1/2", unit: "本" }, { name: "にんじん", quantity: "1/2", unit: "本" }, { name: "れんこん", quantity: "1/2", unit: "節" }, { name: "しょうゆ", quantity: "大さじ", unit: "3" }], instructions: "1. 具材を切る。\n2. 炒めて煮る。" },
  { id: "r-048", name: "ナムル", meal_type: "side", cook_time_minutes: 10, ingredients: [{ name: "ほうれん草", quantity: "1", unit: "束" }, { name: "もやし", quantity: "1/2", unit: "袋" }, { name: "ごま油", quantity: "大さじ", unit: "1" }, { name: "塩", quantity: "少々", unit: "" }], instructions: "1. 野菜を茹でる。\n2. ごま油と塩で和える。" },
  { id: "r-049", name: "浅漬け", meal_type: "side", cook_time_minutes: 15, ingredients: [{ name: "きゅうり", quantity: "2", unit: "本" }, { name: "大根", quantity: "1/4", unit: "本" }, { name: "塩", quantity: "小さじ", unit: "1" }], instructions: "1. 野菜を切る。\n2. 塩もみして漬ける。" },
  { id: "r-050", name: "豚汁", meal_type: "soup", cook_time_minutes: 25, ingredients: [{ name: "豚肉", quantity: "150", unit: "g" }, { name: "ごぼう", quantity: "1/3", unit: "本" }, { name: "にんじん", quantity: "1/3", unit: "本" }, { name: "こんにゃく", quantity: "1/2", unit: "枚" }, { name: "みそ", quantity: "大さじ", unit: "3" }], instructions: "1. 具材を炒める。\n2. 水を加えて煮る。\n3. みそを溶かす。" },
  { id: "r-051", name: "すまし汁", meal_type: "soup", cook_time_minutes: 10, ingredients: [{ name: "だし汁", quantity: "500", unit: "ml" }, { name: "豆腐", quantity: "1/2", unit: "丁" }, { name: "わかめ", quantity: "少々", unit: "" }, { name: "しょうゆ", quantity: "小さじ", unit: "1" }], instructions: "1. だし汁を沸かす。\n2. 具材を入れ、しょうゆで味付けする。" },
  { id: "r-052", name: "かきたま汁", meal_type: "soup", cook_time_minutes: 10, ingredients: [{ name: "だし汁", quantity: "500", unit: "ml" }, { name: "卵", quantity: "2", unit: "個" }, { name: "三つ葉", quantity: "少々", unit: "" }, { name: "塩", quantity: "少々", unit: "" }], instructions: "1. だし汁を沸かす。\n2. 溶き卵を回し入れる。" },
  { id: "r-053", name: "コーンスープ", meal_type: "soup", cook_time_minutes: 15, ingredients: [{ name: "コーン缶", quantity: "1", unit: "缶" }, { name: "牛乳", quantity: "300", unit: "ml" }, { name: "バター", quantity: "10", unit: "g" }, { name: "塩", quantity: "少々", unit: "" }], instructions: "1. コーンをミキサーにかける。\n2. 牛乳と加熱する。" },
  { id: "r-054", name: "かぼちゃのポタージュ", meal_type: "soup", cook_time_minutes: 20, ingredients: [{ name: "かぼちゃ", quantity: "1/4", unit: "個" }, { name: "牛乳", quantity: "300", unit: "ml" }, { name: "玉ねぎ", quantity: "1/4", unit: "個" }], instructions: "1. かぼちゃを煮る。\n2. 牛乳と一緒にミキサーにかける。" },
  { id: "r-055", name: "コンソメスープ", meal_type: "soup", cook_time_minutes: 15, ingredients: [{ name: "水", quantity: "500", unit: "ml" }, { name: "コンソメ", quantity: "1", unit: "個" }, { name: "にんじん", quantity: "1/3", unit: "本" }, { name: "玉ねぎ", quantity: "1/4", unit: "個" }], instructions: "1. 野菜を切る。\n2. コンソメで煮る。" },
  { id: "r-056", name: "トマトスープ", meal_type: "soup", cook_time_minutes: 20, ingredients: [{ name: "トマト缶", quantity: "1", unit: "缶" }, { name: "玉ねぎ", quantity: "1/2", unit: "個" }, { name: "コンソメ", quantity: "1", unit: "個" }], instructions: "1. 玉ねぎを炒める。\n2. トマトとコンソメで煮る。" },
  { id: "r-057", name: "わかめスープ", meal_type: "soup", cook_time_minutes: 8, ingredients: [{ name: "わかめ", quantity: "少々", unit: "" }, { name: "鶏がらスープ", quantity: "400", unit: "ml" }, { name: "長ねぎ", quantity: "1/4", unit: "本" }], instructions: "1. スープを沸かす。\n2. わかめとねぎを入れる。" },
  { id: "r-058", name: "チャーハン", meal_type: "staple", cook_time_minutes: 15, ingredients: [{ name: "ごはん", quantity: "400", unit: "g" }, { name: "卵", quantity: "1", unit: "個" }, { name: "長ねぎ", quantity: "1/2", unit: "本" }, { name: "ハム", quantity: "4", unit: "枚" }, { name: "しょうゆ", quantity: "大さじ", unit: "1" }], instructions: "1. 具材を炒める。\n2. ごはんを入れて炒める。" },
  { id: "r-059", name: "おにぎり", meal_type: "staple", cook_time_minutes: 15, ingredients: [{ name: "米", quantity: "2", unit: "合" }, { name: "塩", quantity: "少々", unit: "" }, { name: "海苔", quantity: "1", unit: "枚" }], instructions: "1. ごはんを炊く。\n2. 塩で握る。" },
  { id: "r-060", name: "炊き込みご飯", meal_type: "staple", cook_time_minutes: 40, ingredients: [{ name: "米", quantity: "2", unit: "合" }, { name: "鶏もも肉", quantity: "100", unit: "g" }, { name: "にんじん", quantity: "1/2", unit: "本" }, { name: "しょうゆ", quantity: "大さじ", unit: "2" }], instructions: "1. 具材を切る。\n2. 炊飯器で炊く。" },
];

// デモのお子様データ
export interface DemoChild {
  id: string;
  name: string;
  birth_date: string | null;
  allergies: { id: string; ingredient: string }[];
  preferences: { id: string; ingredient: string; mode: string }[];
}

export const DEMO_CHILDREN: DemoChild[] = [
  {
    id: "c-001",
    name: "ゆうた",
    birth_date: "2021-04-15",
    allergies: [{ id: "a-001", ingredient: "卵" }],
    preferences: [{ id: "p-001", ingredient: "なす", mode: "exclude" }],
  },
  {
    id: "c-002",
    name: "さくら",
    birth_date: "2022-07-01",
    allergies: [],
    preferences: [{ id: "p-002", ingredient: "きのこ", mode: "exclude" }],
  },
];

// デモの献立表（保育園の昼食）
export const DEMO_NURSERY_MENUS = [
  {
    id: "m-001",
    date: "2026-08-03",
    menu_text: "8/3(月) ごはん・みそ汁・鶏の唐揚げ・サラダ",
    ingredients: { dishes: ["ごはん", "みそ汁", "鶏の唐揚げ", "サラダ"] },
  },
  {
    id: "m-002",
    date: "2026-08-04",
    menu_text: "8/4(火) パン・コーンスープ・魚のフライ・ポテトサラダ",
    ingredients: { dishes: ["パン", "コーンスープ", "魚のフライ", "ポテトサラダ"] },
  },
  {
    id: "m-003",
    date: "2026-08-05",
    menu_text: "8/5(水) ごはん・すまし汁・ハンバーグ・ひじきの煮物",
    ingredients: { dishes: ["ごはん", "すまし汁", "ハンバーグ", "ひじきの煮物"] },
  },
];
