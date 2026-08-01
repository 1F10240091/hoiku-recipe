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
