"""レシピマスタのシードデータ。

保育園の夕食で定番の料理レシピ。レシピ名・使用食品・作り方をセットで管理する。
使用食品（ingredients）はアレルゲン判定と買い物リスト集計に使われる。
"""

SEED_RECIPES: list[dict] = [
    # --- 主菜 ---
    {
        "name": "和風ハンバーグ",
        "meal_type": "main",
        "cook_time_minutes": 25,
        "ingredients": [
            {"name": "合いびき肉", "quantity": "200", "unit": "g"},
            {"name": "玉ねぎ", "quantity": "1/2", "unit": "個"},
            {"name": "卵", "quantity": "1", "unit": "個"},
            {"name": "パン粉", "quantity": "大さじ", "unit": "3"},
            {"name": "牛乳", "quantity": "大さじ", "unit": "2"},
            {"name": "みそ", "quantity": "大さじ", "unit": "1"},
        ],
        "instructions": (
            "1. 玉ねぎをみじん切りにして炒め、冷ましておく。\n"
            "2. 合いびき肉・玉ねぎ・卵・パン粉・牛乳を混ぜて捏ねる。\n"
            "3. 小判形に成形し、フライパンで両面を焼く。\n"
            "4. みそと水を加えて蓋をし、蒸し焼きにする。"
        ),
    },
    {
        "name": "鮭の塩焼き",
        "meal_type": "main",
        "cook_time_minutes": 15,
        "ingredients": [
            {"name": "鮭", "quantity": "1", "unit": "切れ"},
            {"name": "塩", "quantity": "少々", "unit": ""},
            {"name": "レモン", "quantity": "1/4", "unit": "個"},
        ],
        "instructions": "1. 鮭に塩をふって10分置く。\n2. グリルまたはフライパンで両面を焼く。\n3. レモンを添える。",
    },
    {
        "name": "鶏の照り焼き",
        "meal_type": "main",
        "cook_time_minutes": 20,
        "ingredients": [
            {"name": "鶏もも肉", "quantity": "200", "unit": "g"},
            {"name": "しょうゆ", "quantity": "大さじ", "unit": "2"},
            {"name": "みりん", "quantity": "大さじ", "unit": "2"},
            {"name": "砂糖", "quantity": "小さじ", "unit": "1"},
        ],
        "instructions": (
            "1. 鶏肉を一口大に切り、皮目から焼く。\n"
            "2. しょうゆ・みりん・砂糖を混ぜて加える。\n"
            "3. 煮絡めて照りが出たら完成。"
        ),
    },
    {
        "name": "肉じゃが",
        "meal_type": "main",
        "cook_time_minutes": 30,
        "ingredients": [
            {"name": "牛肉", "quantity": "150", "unit": "g"},
            {"name": "じゃがいも", "quantity": "2", "unit": "個"},
            {"name": "玉ねぎ", "quantity": "1", "unit": "個"},
            {"name": "にんじん", "quantity": "1/2", "unit": "本"},
            {"name": "しょうゆ", "quantity": "大さじ", "unit": "2"},
            {"name": "砂糖", "quantity": "大さじ", "unit": "1"},
        ],
        "instructions": (
            "1. じゃがいも・にんじん・玉ねぎを食べやすい大きさに切る。\n"
            "2. 鍋で牛肉を炒め、野菜を加える。\n"
            "3. 水・しょうゆ・砂糖を加えて煮込む。"
        ),
    },
    {
        "name": "豚の生姜焼き",
        "meal_type": "main",
        "cook_time_minutes": 15,
        "ingredients": [
            {"name": "豚ロース肉", "quantity": "200", "unit": "g"},
            {"name": "しょうが", "quantity": "1", "unit": "片"},
            {"name": "しょうゆ", "quantity": "大さじ", "unit": "2"},
            {"name": "みりん", "quantity": "大さじ", "unit": "2"},
        ],
        "instructions": (
            "1. しょうがをすりおろし、調味料と混ぜる。\n"
            "2. 豚肉をフライパンで焼く。\n"
            "3. タレを加えて絡める。"
        ),
    },
    {
        "name": "豆腐ハンバーグ",
        "meal_type": "main",
        "cook_time_minutes": 25,
        "ingredients": [
            {"name": "木綿豆腐", "quantity": "1/2", "unit": "丁"},
            {"name": "鶏ひき肉", "quantity": "150", "unit": "g"},
            {"name": "玉ねぎ", "quantity": "1/2", "unit": "個"},
            {"name": "片栗粉", "quantity": "大さじ", "unit": "2"},
            {"name": "しょうゆ", "quantity": "大さじ", "unit": "1"},
        ],
        "instructions": (
            "1. 豆腐を水切りして崩す。\n"
            "2. 鶏ひき肉・玉ねぎ・片栗粉と混ぜる。\n"
            "3. 成形して焼き、しょうゆで味付けする。"
        ),
    },
    {
        "name": "さばのみそ煮",
        "meal_type": "main",
        "cook_time_minutes": 20,
        "ingredients": [
            {"name": "さば", "quantity": "2", "unit": "切れ"},
            {"name": "みそ", "quantity": "大さじ", "unit": "2"},
            {"name": "砂糖", "quantity": "大さじ", "unit": "1"},
            {"name": "しょうが", "quantity": "1", "unit": "片"},
        ],
        "instructions": (
            "1. さばに熱湯をかけて臭みを取る。\n"
            "2. 調味料と水で煮汁を作り、さばを入れて煮る。\n"
            "3. 落し蓋をして10分煮込む。"
        ),
    },
    {
        "name": "鶏のから揚げ",
        "meal_type": "main",
        "cook_time_minutes": 25,
        "ingredients": [
            {"name": "鶏もも肉", "quantity": "300", "unit": "g"},
            {"name": "しょうゆ", "quantity": "大さじ", "unit": "2"},
            {"name": "にんにく", "quantity": "1", "unit": "片"},
            {"name": "片栗粉", "quantity": "適量", "unit": ""},
            {"name": "揚げ油", "quantity": "適量", "unit": ""},
        ],
        "instructions": (
            "1. 鶏肉を一口大に切り、調味料に漬ける。\n"
            "2. 片栗粉をまぶして180度の油で揚げる。"
        ),
    },
    {
        "name": "焼き魚（さんま）",
        "meal_type": "main",
        "cook_time_minutes": 15,
        "ingredients": [
            {"name": "さんま", "quantity": "1", "unit": "尾"},
            {"name": "大根おろし", "quantity": "適量", "unit": ""},
            {"name": "しょうゆ", "quantity": "適量", "unit": ""},
        ],
        "instructions": "1. さんまをグリルで焼く。\n2. 大根おろしとしょうゆを添える。",
    },
    {
        "name": "オムライス",
        "meal_type": "main",
        "cook_time_minutes": 20,
        "ingredients": [
            {"name": "ごはん", "quantity": "2", "unit": "膳分"},
            {"name": "卵", "quantity": "3", "unit": "個"},
            {"name": "鶏もも肉", "quantity": "100", "unit": "g"},
            {"name": "玉ねぎ", "quantity": "1/2", "unit": "個"},
            {"name": "ケチャップ", "quantity": "大さじ", "unit": "3"},
        ],
        "instructions": (
            "1. 玉ねぎと鶏肉を炒め、ごはんとケチャップを加えて炒める。\n"
            "2. 溶き卵で薄焼きを作る。\n"
            "3. 炒飯を包んで盛り付ける。"
        ),
    },
    # --- 汁物 ---
    {
        "name": "みそ汁",
        "meal_type": "soup",
        "cook_time_minutes": 10,
        "ingredients": [
            {"name": "みそ", "quantity": "大さじ", "unit": "2"},
            {"name": "豆腐", "quantity": "1/4", "unit": "丁"},
            {"name": "わかめ", "quantity": "適量", "unit": ""},
            {"name": "ねぎ", "quantity": "1/2", "unit": "本"},
            {"name": "だし", "quantity": "600", "unit": "ml"},
        ],
        "instructions": "1. だしを沸かし、豆腐とわかめを入れる。\n2. みそを溶き入れてねぎを散らす。",
    },
    {
        "name": "野菜スープ",
        "meal_type": "soup",
        "cook_time_minutes": 15,
        "ingredients": [
            {"name": "にんじん", "quantity": "1/2", "unit": "本"},
            {"name": "玉ねぎ", "quantity": "1/2", "unit": "個"},
            {"name": "キャベツ", "quantity": "2", "unit": "枚"},
            {"name": "コンソメ", "quantity": "適量", "unit": ""},
        ],
        "instructions": "1. 野菜を食べやすい大きさに切る。\n2. 鍋で煮込み、コンソメで味付けする。",
    },
    {
        "name": "豚汁",
        "meal_type": "soup",
        "cook_time_minutes": 25,
        "ingredients": [
            {"name": "豚肉", "quantity": "100", "unit": "g"},
            {"name": "大根", "quantity": "1/4", "unit": "本"},
            {"name": "にんじん", "quantity": "1/2", "unit": "本"},
            {"name": "ごぼう", "quantity": "1/2", "unit": "本"},
            {"name": "みそ", "quantity": "大さじ", "unit": "2"},
        ],
        "instructions": "1. 野菜と豚肉を食べやすい大きさに切る。\n2. 鍋で炒めてから煮込む。\n3. みそで味付けする。",
    },
    # --- 副菜 ---
    {
        "name": "おひたし",
        "meal_type": "side",
        "cook_time_minutes": 10,
        "ingredients": [
            {"name": "ほうれん草", "quantity": "1/2", "unit": "束"},
            {"name": "しょうゆ", "quantity": "小さじ", "unit": "1"},
            {"name": "かつお節", "quantity": "適量", "unit": ""},
        ],
        "instructions": "1. ほうれん草を茹でて冷水に取る。\n2. 水気を絞って切り、しょうゆとかつお節を和える。",
    },
    {
        "name": "キャベツの浅漬け",
        "meal_type": "side",
        "cook_time_minutes": 5,
        "ingredients": [
            {"name": "キャベツ", "quantity": "2", "unit": "枚"},
            {"name": "塩", "quantity": "小さじ", "unit": "1/2"},
        ],
        "instructions": "1. キャベツを千切りにする。\n2. 塩をまぶして軽く揉む。",
    },
    {
        "name": "ほうれん草のごま和え",
        "meal_type": "side",
        "cook_time_minutes": 10,
        "ingredients": [
            {"name": "ほうれん草", "quantity": "1/2", "unit": "束"},
            {"name": "ごま", "quantity": "大さじ", "unit": "1"},
            {"name": "しょうゆ", "quantity": "小さじ", "unit": "1"},
        ],
        "instructions": "1. ほうれん草を茹でて絞る。\n2. すりごま・しょうゆで和える。",
    },
    {
        "name": "ひじきの煮物",
        "meal_type": "side",
        "cook_time_minutes": 20,
        "ingredients": [
            {"name": "ひじき", "quantity": "30", "unit": "g"},
            {"name": "にんじん", "quantity": "1/3", "unit": "本"},
            {"name": "油揚げ", "quantity": "1/2", "unit": "枚"},
            {"name": "しょうゆ", "quantity": "大さじ", "unit": "1"},
            {"name": "みりん", "quantity": "大さじ", "unit": "1"},
        ],
        "instructions": "1. ひじきを戻す。\n2. にんじん・油揚げと炒めて煮る。",
    },
    {
        "name": "コールスローサラダ",
        "meal_type": "side",
        "cook_time_minutes": 10,
        "ingredients": [
            {"name": "キャベツ", "quantity": "2", "unit": "枚"},
            {"name": "にんじん", "quantity": "1/4", "unit": "本"},
            {"name": "マヨネーズ", "quantity": "大さじ", "unit": "2"},
            {"name": "塩", "quantity": "少々", "unit": ""},
        ],
        "instructions": "1. 野菜を千切りにする。\n2. 塩でもみ、マヨネーズで和える。",
    },
    {
        "name": "小松菜のおひたし",
        "meal_type": "side",
        "cook_time_minutes": 10,
        "ingredients": [
            {"name": "小松菜", "quantity": "1/2", "unit": "束"},
            {"name": "しょうゆ", "quantity": "小さじ", "unit": "1"},
        ],
        "instructions": "1. 小松菜を茹でて冷水に取る。\n2. 水気を絞って切り、しょうゆで和える。",
    },
    # --- 主食 ---
    {
        "name": "ごはん",
        "meal_type": "staple",
        "cook_time_minutes": 30,
        "ingredients": [{"name": "米", "quantity": "2", "unit": "合"}],
        "instructions": "炊飯器で炊く。",
    },
    {
        "name": "カレーライス",
        "meal_type": "main",
        "cook_time_minutes": 35,
        "ingredients": [
            {"name": "ごはん", "quantity": "2", "unit": "膳分"},
            {"name": "豚肉", "quantity": "150", "unit": "g"},
            {"name": "玉ねぎ", "quantity": "1", "unit": "個"},
            {"name": "にんじん", "quantity": "1/2", "unit": "本"},
            {"name": "じゃがいも", "quantity": "2", "unit": "個"},
            {"name": "カレールー", "quantity": "適量", "unit": ""},
        ],
        "instructions": "1. 野菜と肉を炒める。\n2. 水を加えて煮込む。\n3. カレールーを溶かしてごはんにかける。",
    },
    {
        "name": "ハヤシライス",
        "meal_type": "main",
        "cook_time_minutes": 30,
        "ingredients": [
            {"name": "ごはん", "quantity": "2", "unit": "膳分"},
            {"name": "牛肉", "quantity": "150", "unit": "g"},
            {"name": "玉ねぎ", "quantity": "1", "unit": "個"},
            {"name": "ハヤシルー", "quantity": "適量", "unit": ""},
        ],
        "instructions": "1. 玉ねぎと牛肉を炒める。\n2. 水を加えて煮込み、ハヤシルーを溶かす。",
    },
    {
        "name": "野菜たっぷりうどん",
        "meal_type": "main",
        "cook_time_minutes": 15,
        "ingredients": [
            {"name": "うどん", "quantity": "2", "unit": "玉"},
            {"name": "にんじん", "quantity": "1/3", "unit": "本"},
            {"name": "キャベツ", "quantity": "2", "unit": "枚"},
            {"name": "だし", "quantity": "600", "unit": "ml"},
            {"name": "しょうゆ", "quantity": "大さじ", "unit": "2"},
        ],
        "instructions": "1. 野菜を食べやすい大きさに切る。\n2. だしで野菜を煮る。\n3. うどんを入れて温める。",
    },
]

# 追加の公式カタログ。初期レシピへ分類ごとの不足分を補い、全120品にする。
# name, meal_type, cuisine, cook_time, 主材料, 野菜, 味付け
_EXTRA_RECIPES = [
    ("鶏肉と根菜の煮物", "main", "和", 30, "鶏もも肉", "大根", "しょうゆ"),
    ("豆腐入りつくね", "main", "和", 25, "鶏ひき肉", "豆腐", "しょうゆ"),
    ("鮭のちゃんちゃん焼き", "main", "和", 25, "鮭", "キャベツ", "みそ"),
    ("豚肉のしょうが焼き", "main", "和", 20, "豚薄切り肉", "玉ねぎ", "しょうが"),
    ("鶏そぼろ丼", "main", "和", 20, "鶏ひき肉", "いんげん", "しょうゆ"),
    ("豆腐と野菜のあんかけ", "main", "和", 20, "木綿豆腐", "白菜", "だし"),
    ("豚肉と白菜の重ね蒸し", "main", "和", 25, "豚薄切り肉", "白菜", "ポン酢"),
    ("ぶり大根", "main", "和", 35, "ぶり", "大根", "しょうゆ"),
    ("鶏肉のさっぱり煮", "main", "和", 30, "鶏手羽元", "大根", "酢"),
    ("厚揚げと野菜のみそ炒め", "main", "和", 20, "厚揚げ", "ピーマン", "みそ"),
    ("豚肉とごぼうの甘辛炒め", "main", "和", 20, "豚こま切れ肉", "ごぼう", "しょうゆ"),
    ("たらの野菜あんかけ", "main", "和", 25, "たら", "にんじん", "だし"),
    ("鶏肉とじゃがいもの甘辛煮", "main", "和", 30, "鶏もも肉", "じゃがいも", "しょうゆ"),
    ("豚肉と小松菜の炒め物", "main", "和", 15, "豚薄切り肉", "小松菜", "しょうゆ"),
    ("白身魚の煮付け", "main", "和", 20, "白身魚", "ごぼう", "しょうゆ"),
    ("鶏肉のトマト煮", "main", "洋", 30, "鶏もも肉", "玉ねぎ", "トマト缶"),
    ("鮭のクリーム煮", "main", "洋", 25, "鮭", "ブロッコリー", "牛乳"),
    ("ミートボールのトマト煮", "main", "洋", 30, "合いびき肉", "玉ねぎ", "トマト缶"),
    ("鶏肉のレモン焼き", "main", "洋", 25, "鶏もも肉", "レモン", "オリーブ油"),
    ("白身魚のムニエル", "main", "洋", 20, "たら", "ブロッコリー", "バター"),
    ("ポークチャップ", "main", "洋", 20, "豚ロース肉", "玉ねぎ", "ケチャップ"),
    ("鶏肉ときのこのグラタン", "main", "洋", 35, "鶏もも肉", "しめじ", "牛乳"),
    ("野菜入りオムレツ", "main", "洋", 20, "卵", "ほうれん草", "牛乳"),
    ("白身魚のフライ風", "main", "洋", 25, "たら", "キャベツ", "パン粉"),
    ("豚肉と野菜のカレー炒め", "main", "洋", 20, "豚こま切れ肉", "ピーマン", "カレー粉"),
    ("鶏肉のチーズ焼き", "main", "洋", 25, "鶏むね肉", "トマト", "チーズ"),
    ("ミートソーススパゲティ", "main", "伊", 30, "合いびき肉", "玉ねぎ", "トマト缶"),
    ("鶏肉と野菜のクリームパスタ", "main", "伊", 25, "鶏むね肉", "ブロッコリー", "牛乳"),
    ("豆腐の中華そぼろあん", "main", "中", 20, "豚ひき肉", "木綿豆腐", "しょうゆ"),
    ("キャベツとにんじんのおかか和え", "side", "和", 10, "キャベツ", "にんじん", "かつお節"),
    ("小松菜と油揚げの煮びたし", "side", "和", 15, "小松菜", "油揚げ", "だし"),
    ("かぼちゃのそぼろ煮", "side", "和", 20, "かぼちゃ", "鶏ひき肉", "しょうゆ"),
    ("切干大根の煮物", "side", "和", 25, "切干大根", "にんじん", "しょうゆ"),
    ("ひじきと大豆の煮物", "side", "和", 25, "ひじき", "大豆水煮", "しょうゆ"),
    ("ブロッコリーのごま和え", "side", "和", 10, "ブロッコリー", "すりごま", "しょうゆ"),
    ("大根とツナのサラダ", "side", "和", 10, "大根", "ツナ", "マヨネーズ"),
    ("さつまいもの甘煮", "side", "和", 20, "さつまいも", "レモン", "砂糖"),
    ("きゅうりとわかめの酢の物", "side", "和", 10, "きゅうり", "わかめ", "酢"),
    ("れんこんのきんぴら", "side", "和", 15, "れんこん", "にんじん", "しょうゆ"),
    ("ほうれん草の白和え", "side", "和", 15, "ほうれん草", "木綿豆腐", "すりごま"),
    ("なすの煮びたし", "side", "和", 15, "なす", "しょうが", "だし"),
    ("じゃがいものそぼろあん", "side", "和", 20, "じゃがいも", "豚ひき肉", "しょうゆ"),
    ("キャベツとコーンのサラダ", "side", "洋", 10, "キャベツ", "コーン", "ヨーグルト"),
    ("ブロッコリーと卵のサラダ", "side", "洋", 15, "ブロッコリー", "卵", "マヨネーズ"),
    ("にんじんのグラッセ", "side", "洋", 20, "にんじん", "バター", "砂糖"),
    ("かぼちゃサラダ", "side", "洋", 15, "かぼちゃ", "きゅうり", "ヨーグルト"),
    ("きのこのマリネ", "side", "洋", 15, "しめじ", "玉ねぎ", "酢"),
    ("ラタトゥイユ", "side", "仏", 30, "なす", "ズッキーニ", "トマト缶"),
    ("トマトときゅうりのサラダ", "side", "洋", 10, "トマト", "きゅうり", "オリーブ油"),
    ("さつまいものレモン煮", "side", "洋", 20, "さつまいも", "レモン", "砂糖"),
    ("ほうれん草のソテー", "side", "洋", 10, "ほうれん草", "コーン", "バター"),
    ("豆腐とトマトのサラダ", "side", "洋", 10, "木綿豆腐", "トマト", "オリーブ油"),
    ("キャベツの中華和え", "side", "中", 10, "キャベツ", "にんじん", "ごま油"),
    ("もやしと小松菜のナムル", "side", "中", 10, "もやし", "小松菜", "ごま油"),
    ("豆苗とにんじんの炒め物", "side", "中", 10, "豆苗", "にんじん", "ごま油"),
    ("大根とツナのごまサラダ", "side", "和", 10, "大根", "ツナ", "すりごま"),
    ("春雨サラダ", "side", "中", 15, "春雨", "きゅうり", "酢"),
    ("チンゲン菜の中華炒め", "side", "中", 10, "チンゲン菜", "にんじん", "しょうゆ"),
    ("白菜の中華風クリーム煮", "side", "中", 20, "白菜", "コーン", "牛乳"),
    ("玉ねぎとわかめのみそ汁", "soup", "和", 10, "玉ねぎ", "わかめ", "みそ"),
    ("豆腐と小松菜のみそ汁", "soup", "和", 10, "木綿豆腐", "小松菜", "みそ"),
    ("大根と油揚げのみそ汁", "soup", "和", 15, "大根", "油揚げ", "みそ"),
    ("かぼちゃのみそ汁", "soup", "和", 15, "かぼちゃ", "玉ねぎ", "みそ"),
    ("なめこと豆腐のみそ汁", "soup", "和", 10, "なめこ", "木綿豆腐", "みそ"),
    ("白菜とにんじんのすまし汁", "soup", "和", 15, "白菜", "にんじん", "だし"),
    ("きのこのすまし汁", "soup", "和", 15, "しめじ", "えのき", "だし"),
    ("じゃがいもと玉ねぎのみそ汁", "soup", "和", 15, "じゃがいも", "玉ねぎ", "みそ"),
    ("ほうれん草と卵のスープ", "soup", "洋", 12, "卵", "ほうれん草", "コンソメ"),
    ("野菜たっぷりコンソメスープ", "soup", "洋", 20, "キャベツ", "にんじん", "コンソメ"),
    ("かぼちゃのポタージュ", "soup", "洋", 25, "かぼちゃ", "玉ねぎ", "牛乳"),
    ("トマトと豆のスープ", "soup", "洋", 20, "大豆水煮", "トマト", "コンソメ"),
    ("ブロッコリーのミルクスープ", "soup", "洋", 15, "ブロッコリー", "玉ねぎ", "牛乳"),
    ("きのこのクリームスープ", "soup", "洋", 20, "しめじ", "玉ねぎ", "牛乳"),
    ("ミネストローネ", "soup", "伊", 25, "ベーコン", "キャベツ", "トマト缶"),
    ("野菜とマカロニのスープ", "soup", "洋", 20, "マカロニ", "にんじん", "コンソメ"),
    ("豆腐とわかめの中華スープ", "soup", "中", 12, "木綿豆腐", "わかめ", "鶏ガラスープ"),
    ("卵とコーンの中華スープ", "soup", "中", 12, "卵", "コーン", "鶏ガラスープ"),
    ("白菜と春雨の中華スープ", "soup", "中", 18, "白菜", "春雨", "鶏ガラスープ"),
    ("チンゲン菜ときのこのスープ", "soup", "中", 15, "チンゲン菜", "しめじ", "鶏ガラスープ"),
    ("大根とにんじんの中華スープ", "soup", "中", 15, "大根", "にんじん", "鶏ガラスープ"),
    ("野菜たっぷりおじや", "soup", "和", 20, "ごはん", "にんじん", "だし"),
    ("さつまいもと玉ねぎのスープ", "soup", "洋", 18, "さつまいも", "玉ねぎ", "コンソメ"),
    ("ほうれん草と豆腐のすまし汁", "soup", "和", 15, "木綿豆腐", "ほうれん草", "だし"),
    ("キャベツとコーンのスープ", "soup", "洋", 15, "キャベツ", "コーン", "コンソメ"),
    ("かぶとにんじんのスープ", "soup", "洋", 18, "かぶ", "にんじん", "コンソメ"),
    ("豆腐と白菜の中華スープ", "soup", "中", 15, "木綿豆腐", "白菜", "鶏ガラスープ"),
    ("玉ねぎとじゃがいものスープ", "soup", "洋", 18, "じゃがいも", "玉ねぎ", "コンソメ"),
    ("わかめと卵のすまし汁", "soup", "和", 12, "卵", "わかめ", "だし"),
    ("じゃがいもとわかめのみそ汁", "soup", "和", 15, "じゃがいも", "わかめ", "みそ"),
    ("雑穀ごはん", "staple", "和", 35, "米", "雑穀", "水"),
    ("わかめごはん", "staple", "和", 35, "米", "わかめ", "塩"),
    ("ひじきごはん", "staple", "和", 40, "米", "ひじき", "しょうゆ"),
    ("鮭と青菜のおにぎり", "staple", "和", 20, "ごはん", "鮭", "塩"),
    ("さつまいもごはん", "staple", "和", 40, "米", "さつまいも", "塩"),
    ("鶏ごぼうごはん", "staple", "和", 40, "米", "鶏もも肉", "しょうゆ"),
    ("枝豆ごはん", "staple", "和", 35, "米", "枝豆", "塩"),
    ("しらすと青菜の混ぜごはん", "staple", "和", 20, "ごはん", "しらす", "しょうゆ"),
    ("野菜チャーハン", "staple", "中", 15, "ごはん", "にんじん", "しょうゆ"),
    ("鶏そぼろごはん", "staple", "和", 25, "ごはん", "鶏ひき肉", "しょうゆ"),
    ("小松菜としらすの混ぜごはん", "staple", "和", 20, "ごはん", "小松菜", "しょうゆ"),
    ("コーンピラフ", "staple", "洋", 40, "米", "コーン", "コンソメ"),
    ("トマトリゾット", "staple", "伊", 30, "米", "トマト", "チーズ"),
    ("きのこピラフ", "staple", "洋", 40, "米", "しめじ", "コンソメ"),
    ("青のりおにぎり", "staple", "和", 15, "ごはん", "青のり", "塩"),
    ("しらすわかめごはん", "staple", "和", 20, "ごはん", "しらす", "わかめ"),
    ("野菜たっぷり焼きうどん", "staple", "和", 20, "うどん", "キャベツ", "しょうゆ"),
    ("ナポリタン", "staple", "伊", 25, "スパゲティ", "玉ねぎ", "ケチャップ"),
    ("ツナと野菜のパスタ", "staple", "伊", 20, "スパゲティ", "ツナ", "トマト缶"),
    ("卵とじにゅうめん", "staple", "和", 20, "そうめん", "卵", "だし"),
    ("野菜入りお好み焼き", "staple", "和", 25, "小麦粉", "キャベツ", "卵"),
    ("じゃこと青菜のチャーハン", "staple", "中", 15, "ごはん", "小松菜", "しょうゆ"),
    ("豆乳クリームリゾット", "staple", "洋", 25, "ごはん", "ブロッコリー", "豆乳"),
    ("鶏肉と野菜のあんかけ丼", "staple", "中", 25, "ごはん", "白菜", "しょうゆ"),
    ("鮭ときのこの炊き込みごはん", "staple", "和", 45, "米", "鮭", "しょうゆ"),
    ("豆腐入り野菜雑炊", "staple", "和", 20, "ごはん", "木綿豆腐", "だし"),
    ("かぼちゃと鶏肉のドリア", "staple", "洋", 35, "ごはん", "かぼちゃ", "牛乳"),
    ("野菜たっぷり焼きビーフン", "staple", "中", 20, "ビーフン", "キャベツ", "しょうゆ"),
    ("しらすと青菜の和風パスタ", "staple", "伊", 20, "スパゲティ", "小松菜", "しょうゆ"),
    ("かぼちゃと豆のカレー", "staple", "洋", 30, "大豆水煮", "かぼちゃ", "カレー粉"),
]

RETIRED_RECIPE_NAMES = {row[0] for row in _EXTRA_RECIPES}

# 材料・分量・工程が料理ごとに整備されるまで、テンプレート生成分は配信しない。
# 出典と子ども用の分量が確認できる公的機関の保育園・食育レシピ。
# 既存の一般レシピと区別できるよう、出典・対象年齢・分量メモを保存する。
_CHILD_RECIPE_NOTE = (
    "食べる量、具材の大きさ・固さは、"
    "お子さんの発達や咀嚼・嚥下の様子に合わせて調整してください。"
)
SEED_RECIPES.extend([
    {
        "name": "野菜ジュースのハヤシライス", "meal_type": "staple", "cuisine": "洋",
        "cook_time_minutes": 35, "age_min_months": 36, "age_max_months": 72,
        "servings_note": "子ども5人分（家庭では大人2人＋子ども1〜2人分程度）",
        "source_name": "八王子市 公立保育園給食レシピ",
        "source_url": "https://kosodate.city.hachioji.tokyo.jp/material/files/group/7/recipe2R3.pdf",
        "child_notes": _CHILD_RECIPE_NOTE,
        "ingredients": [
            {"name": "米", "quantity": "250", "unit": "g"}, {"name": "豚もも小間肉", "quantity": "100", "unit": "g"},
            {"name": "じゃがいも", "quantity": "150", "unit": "g"}, {"name": "玉ねぎ", "quantity": "175", "unit": "g"},
            {"name": "にんじん", "quantity": "100", "unit": "g"}, {"name": "ハヤシライスのルウ", "quantity": "40", "unit": "g"},
            {"name": "野菜ジュース", "quantity": "190", "unit": "ml"}, {"name": "ケチャップ", "quantity": "15", "unit": "g"},
            {"name": "油", "quantity": "適量", "unit": ""},
        ],
        "instructions": "1. 米を炊く。\n2. 豚肉と野菜を食べやすい大きさに切る。\n3. 油で豚肉、にんじん、玉ねぎを炒め、じゃがいもと具材が浸る水を加えて煮る。\n4. 具材がやわらかくなったらルウ、野菜ジュース、ケチャップを加えて煮込み、ごはんにかける。",
    },
    {
        "name": "マーボーライス", "meal_type": "staple", "cuisine": "中",
        "cook_time_minutes": 30, "age_min_months": 36, "age_max_months": 72,
        "servings_note": "子ども5人分（家庭では大人2人＋子ども1〜2人分程度）",
        "source_name": "八王子市 公立保育園給食レシピ",
        "source_url": "https://kosodate.city.hachioji.tokyo.jp/material/files/group/7/recipe2R3.pdf",
        "child_notes": _CHILD_RECIPE_NOTE + " 豆腐は水切りし、辛味調味料は加えず、食べやすい温度に冷ましてください。",
        "ingredients": [
            {"name": "米", "quantity": "250", "unit": "g"}, {"name": "木綿豆腐", "quantity": "175", "unit": "g"},
            {"name": "豚ももひき肉", "quantity": "125", "unit": "g"}, {"name": "にんじん", "quantity": "50", "unit": "g"},
            {"name": "長ねぎ", "quantity": "75", "unit": "g"}, {"name": "干ししいたけ", "quantity": "4", "unit": "g"},
            {"name": "にんにく", "quantity": "1", "unit": "片"}, {"name": "油", "quantity": "5", "unit": "g"},
            {"name": "砂糖", "quantity": "15", "unit": "g"}, {"name": "しょうゆ", "quantity": "10", "unit": "g"},
            {"name": "赤みそ", "quantity": "25", "unit": "g"}, {"name": "片栗粉", "quantity": "8", "unit": "g"},
        ],
        "instructions": "1. 米を炊き、干ししいたけを戻す。\n2. にんじん、ねぎ、しいたけ、にんにくを細かく刻む。\n3. 油でにんにくと豚ひき肉を炒め、肉に火が通ったら野菜を加えて炒める。\n4. 水切りした豆腐を加えて煮て、砂糖・しょうゆ・みそで味を調える。\n5. 水溶き片栗粉でとろみをつけ、ごはんにかける。",
    },
    {
        "name": "さばのカレー焼き", "meal_type": "main", "cuisine": "洋",
        "cook_time_minutes": 25, "age_min_months": 36, "age_max_months": 72,
        "servings_note": "子ども5人分（さば約40gを5切れ）",
        "source_name": "八王子市 公立保育園給食レシピ",
        "source_url": "https://kosodate.city.hachioji.tokyo.jp/material/files/group/7/recipe2R3.pdf",
        "child_notes": _CHILD_RECIPE_NOTE + " 骨を取り除いてから盛り付けてください。",
        "ingredients": [
            {"name": "さば", "quantity": "5", "unit": "切れ（約40gずつ）"}, {"name": "しょうが", "quantity": "2", "unit": "g"},
            {"name": "カレー粉", "quantity": "0.5", "unit": "g"}, {"name": "酒", "quantity": "15", "unit": "g"},
            {"name": "しょうゆ", "quantity": "10", "unit": "g"},
        ],
        "instructions": "1. しょうがをすりおろし、カレー粉・酒・しょうゆと混ぜる。\n2. さばを調味液に約30分漬ける。\n3. 180℃のオーブンで15〜20分を目安に焼き、中心まで火が通ったことを確認する。\n4. 骨を丁寧に取り、子どもが食べやすい大きさにほぐす。",
    },
    {
        "name": "バーベキューチキン", "meal_type": "main", "cuisine": "洋",
        "cook_time_minutes": 30, "age_min_months": 36, "age_max_months": 72,
        "servings_note": "子ども5人分",
        "source_name": "八王子市 公立保育園給食レシピ",
        "source_url": "https://kosodate.city.hachioji.tokyo.jp/material/files/group/7/recipe2R3.pdf",
        "child_notes": _CHILD_RECIPE_NOTE + " 焼き上がり後に硬い皮や大きな筋を除き、食べやすく切ってください。",
        "ingredients": [
            {"name": "鶏もも肉", "quantity": "200", "unit": "g"}, {"name": "オリーブ油", "quantity": "5", "unit": "g"},
            {"name": "酒", "quantity": "5", "unit": "g"}, {"name": "にんにく", "quantity": "少々", "unit": ""},
            {"name": "ケチャップ", "quantity": "25", "unit": "g"}, {"name": "中濃ソース", "quantity": "15", "unit": "g"},
            {"name": "砂糖", "quantity": "10", "unit": "g"}, {"name": "しょうゆ", "quantity": "10", "unit": "g"},
        ],
        "instructions": "1. 鶏肉を食べやすい大きさに切り、にんにくをすりおろす。\n2. 調味料を混ぜ、鶏肉を約1時間漬ける。\n3. 180℃のオーブンで20分を目安に焼き、中心まで火が通ったことを確認する。",
    },
    {
        "name": "切干し大根のサラダ風煮", "meal_type": "side", "cuisine": "和",
        "cook_time_minutes": 25, "age_min_months": 36, "age_max_months": 72,
        "servings_note": "子ども5人分",
        "source_name": "八王子市 公立保育園給食レシピ",
        "source_url": "https://kosodate.city.hachioji.tokyo.jp/material/files/group/7/recipe2R3.pdf",
        "child_notes": _CHILD_RECIPE_NOTE + " 切干し大根は戻した後、短く切ってやわらかく煮ます。",
        "ingredients": [
            {"name": "切干し大根", "quantity": "30", "unit": "g"}, {"name": "にんじん", "quantity": "40", "unit": "g"},
            {"name": "きゅうり", "quantity": "50", "unit": "g"}, {"name": "冷凍コーン", "quantity": "40", "unit": "g"},
            {"name": "砂糖", "quantity": "5", "unit": "g"}, {"name": "しょうゆ", "quantity": "15", "unit": "g"},
            {"name": "酢", "quantity": "10", "unit": "g"}, {"name": "ごま油", "quantity": "5", "unit": "g"},
        ],
        "instructions": "1. 切干し大根を洗って水で戻し、下ゆでして短く切る。\n2. にんじんときゅうりを細切りにし、火を通す。\n3. 鍋に砂糖・しょうゆ・酢を入れ、具材とコーンを加えて軽く煮る。\n4. 最後にごま油を加えて混ぜる。",
    },
    {
        "name": "冬瓜の鶏そぼろ煮", "meal_type": "side", "cuisine": "和",
        "cook_time_minutes": 25, "age_min_months": 36, "age_max_months": 72,
        "servings_note": "子ども5人分",
        "source_name": "八王子市 公立保育園給食レシピ",
        "source_url": "https://kosodate.city.hachioji.tokyo.jp/material/files/group/7/recipe2R3.pdf",
        "child_notes": _CHILD_RECIPE_NOTE + " 冬瓜は皮と種を除き、指でつぶせる程度まで煮ます。",
        "ingredients": [
            {"name": "鶏ももひき肉", "quantity": "50", "unit": "g"}, {"name": "冬瓜", "quantity": "150", "unit": "g"},
            {"name": "油", "quantity": "5", "unit": "g"}, {"name": "砂糖", "quantity": "5", "unit": "g"},
            {"name": "しょうゆ", "quantity": "8", "unit": "g"}, {"name": "片栗粉", "quantity": "5", "unit": "g"},
            {"name": "だし汁", "quantity": "適量", "unit": ""},
        ],
        "instructions": "1. 鍋に油を熱し、鶏ひき肉を弱火で炒める。\n2. 皮と種を除いて小さく切った冬瓜を加え、水とだしをひたひたに注ぐ。\n3. 冬瓜がやわらかくなるまで煮て、砂糖・しょうゆで調味する。\n4. 水溶き片栗粉で軽くとろみをつける。",
    },
    {
        "name": "押し麦と野菜のスープ", "meal_type": "soup", "cuisine": "洋",
        "cook_time_minutes": 30, "age_min_months": 36, "age_max_months": 72,
        "servings_note": "子ども5人分（1人180〜200ml目安）",
        "source_name": "八王子市 公立保育園給食レシピ",
        "source_url": "https://kosodate.city.hachioji.tokyo.jp/material/files/group/7/recipe2R3.pdf",
        "child_notes": _CHILD_RECIPE_NOTE + " 押し麦がやわらかくなるまで十分に煮てください。",
        "ingredients": [
            {"name": "押し麦", "quantity": "15", "unit": "g"}, {"name": "大根", "quantity": "100", "unit": "g"},
            {"name": "ベーコン", "quantity": "50", "unit": "g"}, {"name": "ピーマン", "quantity": "25", "unit": "g"},
            {"name": "えのき", "quantity": "50", "unit": "g"}, {"name": "にんじん", "quantity": "50", "unit": "g"},
            {"name": "削り節", "quantity": "15", "unit": "g"}, {"name": "塩", "quantity": "2.5", "unit": "g"},
            {"name": "しょうゆ", "quantity": "5", "unit": "g"},
        ],
        "instructions": "1. 削り節でだしを取る。\n2. 大根・にんじんは小さめに切って先にやわらかくし、ベーコン・ピーマン・えのきも細かく切る。\n3. だしに野菜と押し麦を入れて、麦がやわらかくなるまで煮る。\n4. 塩としょうゆで薄めに味を整える。",
    },
    {
        "name": "豆乳みそ野菜スープ", "meal_type": "soup", "cuisine": "和",
        "cook_time_minutes": 25, "age_min_months": 36, "age_max_months": 72,
        "servings_note": "子ども5人分（1人180〜200ml目安）",
        "source_name": "八王子市 公立保育園給食レシピ",
        "source_url": "https://kosodate.city.hachioji.tokyo.jp/material/files/group/7/recipe2R3.pdf",
        "child_notes": _CHILD_RECIPE_NOTE + " 豆乳を加えた後は吹きこぼれに注意し、煮立てすぎないでください。",
        "ingredients": [
            {"name": "白菜", "quantity": "100", "unit": "g"}, {"name": "玉ねぎ", "quantity": "75", "unit": "g"},
            {"name": "にんじん", "quantity": "50", "unit": "g"}, {"name": "えのき", "quantity": "50", "unit": "g"},
            {"name": "ベーコン", "quantity": "50", "unit": "g"}, {"name": "削り節", "quantity": "15", "unit": "g"},
            {"name": "白みそ", "quantity": "45", "unit": "g"}, {"name": "調製豆乳", "quantity": "200", "unit": "ml"},
            {"name": "水", "quantity": "200", "unit": "ml"},
        ],
        "instructions": "1. 削り節でだしを取る。\n2. 野菜とベーコンを食べやすい大きさに切る。\n3. だしでにんじんと玉ねぎを煮て、白菜・えのきを加え、具材がやわらかくなるまで加熱する。\n4. 豆乳とみそを加えて温める。吹きこぼれに注意する。",
    },
    {
        "name": "レモントースト", "meal_type": "staple", "cuisine": "洋",
        "cook_time_minutes": 15, "age_min_months": 36, "age_max_months": 72,
        "servings_note": "子ども6人分",
        "source_name": "八王子市 公立保育園給食レシピ",
        "source_url": "https://kosodate.city.hachioji.tokyo.jp/material/files/group/7/recipe2R3.pdf",
        "child_notes": _CHILD_RECIPE_NOTE + " 焼いた後、耳や硬い部分をお子さんが食べやすい大きさに切ります。",
        "ingredients": [
            {"name": "食パン（6枚切り）", "quantity": "3", "unit": "枚"}, {"name": "レモン汁", "quantity": "10", "unit": "g"},
            {"name": "バター", "quantity": "25", "unit": "g"}, {"name": "砂糖", "quantity": "25", "unit": "g"},
        ],
        "instructions": "1. 溶かしたバターに砂糖とレモン汁を混ぜる。\n2. 食パンに塗る。\n3. 180〜200℃のオーブンで10〜15分焼く。\n4. 粗熱を取り、食べやすい大きさに切る。",
    },
    {
        "name": "じゅーしー（沖縄風炊き込みご飯）", "meal_type": "staple", "cuisine": "沖縄",
        "cook_time_minutes": 25, "age_min_months": 36, "age_max_months": 72,
        "servings_note": "子ども6人分（大人約4人分）",
        "source_name": "板橋区立保育園 給食レシピ",
        "source_url": "https://www.city.itabashi.tokyo.jp/_res/projects/default_project/_page_/001/004/404/1004404-1.pdf",
        "child_notes": _CHILD_RECIPE_NOTE + " ごはんは炊飯器でやわらかく炊き、具材を細かくします。",
        "ingredients": [
            {"name": "米", "quantity": "2", "unit": "合"}, {"name": "豚肉", "quantity": "72", "unit": "g"},
            {"name": "乾燥ひじき", "quantity": "6", "unit": "g"}, {"name": "にんじん", "quantity": "42", "unit": "g"},
            {"name": "油", "quantity": "6", "unit": "g"}, {"name": "だし汁", "quantity": "390", "unit": "ml"},
            {"name": "削り節", "quantity": "4.2", "unit": "g"}, {"name": "砂糖", "quantity": "6", "unit": "g"},
            {"name": "しょうゆ", "quantity": "9", "unit": "g"}, {"name": "酒", "quantity": "6", "unit": "g"},
            {"name": "塩", "quantity": "ひとつまみ", "unit": ""},
        ],
        "instructions": "1. 米を洗って30分以上浸水する。ひじきは戻し、にんじんは短い千切りにする。\n2. だしを取り、豚肉・にんじん・ひじきを油で炒める。\n3. だしと砂糖・しょうゆ・酒・塩を加えて煮る。\n4. 具と煮汁を分け、煮汁を使って米を炊く。\n5. 炊き上がったごはんに具を混ぜる。",
    },
    {
        "name": "だし香るカレーうどん", "meal_type": "staple", "cuisine": "和",
        "cook_time_minutes": 30, "age_min_months": 36, "age_max_months": 72,
        "servings_note": "子ども6人分（大人約4人分）",
        "source_name": "板橋区立保育園 給食レシピ",
        "source_url": "https://www.city.itabashi.tokyo.jp/_res/projects/default_project/_page_/001/004/371/shushoku/kareudo.pdf",
        "child_notes": _CHILD_RECIPE_NOTE + " うどんは短く切り、熱さと長さを確認してから出してください。",
        "ingredients": [
            {"name": "乾麺", "quantity": "300", "unit": "g"}, {"name": "豚肉", "quantity": "180", "unit": "g"},
            {"name": "にんじん", "quantity": "90", "unit": "g"}, {"name": "玉ねぎ", "quantity": "130", "unit": "g"},
            {"name": "油", "quantity": "6", "unit": "g"}, {"name": "だし汁", "quantity": "1.2", "unit": "L"},
            {"name": "水", "quantity": "1.35", "unit": "L"}, {"name": "削り節", "quantity": "21.6", "unit": "g"},
            {"name": "カレー粉", "quantity": "1.8", "unit": "g"}, {"name": "砂糖", "quantity": "3", "unit": "g"},
            {"name": "しょうゆ", "quantity": "45", "unit": "g"}, {"name": "みりん", "quantity": "6", "unit": "g"},
            {"name": "片栗粉", "quantity": "15", "unit": "g"},
        ],
        "instructions": "1. にんじん・玉ねぎ・豚肉を小さめに切る。削り節でだしを取る。\n2. 油で玉ねぎを炒め、豚肉とにんじんを加える。\n3. だしを加え、具材がやわらかくなるまで煮る。\n4. カレー粉・砂糖・しょうゆ・みりんで味付けし、水溶き片栗粉でとろみをつける。\n5. 乾麺を表示通りゆで、短く切って器に盛り、汁をかける。",
    },
    {
        "name": "和風スパニッシュオムレツ", "meal_type": "main", "cuisine": "和",
        "cook_time_minutes": 25, "age_min_months": 36, "age_max_months": 72,
        "servings_note": "4人分",
        "source_name": "農林水産省 食育レシピ（吉岡有紀子氏監修）",
        "source_url": "https://www.maff.go.jp/j/pr/aff/2006/spe1_02.html",
        "child_notes": _CHILD_RECIPE_NOTE + " オクラは薄切り、ミニトマトは4等分にし、卵は中心までしっかり加熱します。",
        "ingredients": [
            {"name": "卵", "quantity": "4〜5", "unit": "個"}, {"name": "しらす", "quantity": "15〜20", "unit": "g"},
            {"name": "ミニトマト", "quantity": "4", "unit": "個"}, {"name": "オクラ", "quantity": "4", "unit": "本"},
            {"name": "だし", "quantity": "小さじ1/2", "unit": ""}, {"name": "ごま油", "quantity": "小さじ1", "unit": ""},
            {"name": "白こしょう", "quantity": "少々", "unit": ""},
        ],
        "instructions": "1. 野菜を洗う。オクラは薄切り、ミニトマトは4等分にする。\n2. 卵を溶き、しらすとだしを混ぜる。\n3. フライパンにごま油を熱してオクラを炒め、卵液を流し入れる。\n4. ミニトマトを並べ、ふたをして弱めの中火で焼く。裏返して中心までしっかり火を通す。\n5. 粗熱を取り、食べやすい大きさに切る。",
    },
    {
        "name": "ミートソーススパゲティ（家族4人分）", "meal_type": "staple", "cuisine": "伊",
        "cook_time_minutes": 35, "age_min_months": 36, "age_max_months": 72,
        "servings_note": "大人2人＋子ども2人分",
        "source_name": "大田区立保育園の給食レシピ（作り置きレシピ）",
        "source_url": "https://www.city.ota.tokyo.jp/seikatsu/hoken/kenko_dukuri/syokuseikatsu_joho/kenkou_menu/youjityousyokumenyu-.files/tukurioki1.pdf",
        "child_notes": _CHILD_RECIPE_NOTE + " 子ども用は麺を短く切り、ソースは取り分けてから味を調整します。",
        "ingredients": [
            {"name": "スパゲティ", "quantity": "300", "unit": "g"}, {"name": "豚ひき肉", "quantity": "120", "unit": "g"},
            {"name": "牛ひき肉", "quantity": "60", "unit": "g"}, {"name": "玉ねぎ", "quantity": "1", "unit": "個"},
            {"name": "マッシュルーム缶", "quantity": "25", "unit": "g"}, {"name": "サラダ油", "quantity": "小さじ2", "unit": ""},
            {"name": "小麦粉", "quantity": "30", "unit": "g"}, {"name": "水", "quantity": "360", "unit": "ml"},
            {"name": "カットトマト缶", "quantity": "90", "unit": "g"}, {"name": "ケチャップ", "quantity": "60", "unit": "g"},
            {"name": "ウスターソース", "quantity": "小さじ1", "unit": ""}, {"name": "塩", "quantity": "少々", "unit": ""},
            {"name": "砂糖", "quantity": "小さじ1", "unit": ""},
        ],
        "instructions": "1. スパゲティを表示通りにゆでる。玉ねぎとマッシュルームは細かく刻む。\n2. 油でひき肉・玉ねぎ・マッシュルームを炒める。\n3. 小麦粉を加えて炒め、水を少しずつ加えてのばす。\n4. トマト・ケチャップ・ソース・砂糖を加えて煮込み、味を見て塩を控えめに加える。\n5. 子ども用の麺は短く切り、ソースをかける。",
    },
    {
        "name": "ポークビーンズ（家族4人分）", "meal_type": "main", "cuisine": "洋",
        "cook_time_minutes": 35, "age_min_months": 36, "age_max_months": 72,
        "servings_note": "大人2人＋子ども2人分",
        "source_name": "大田区立保育園の給食レシピ（作り置きレシピ）",
        "source_url": "https://www.city.ota.tokyo.jp/seikatsu/hoken/kenko_dukuri/syokuseikatsu_joho/kenkou_menu/youjityousyokumenyu-.files/tukurioki1.pdf",
        "child_notes": _CHILD_RECIPE_NOTE + " 大豆は十分にやわらかく煮て、子どもの食べる様子に合わせてつぶす・刻むなど調整します。",
        "ingredients": [
            {"name": "豚こま肉", "quantity": "100", "unit": "g"}, {"name": "玉ねぎ", "quantity": "1", "unit": "個"},
            {"name": "にんじん", "quantity": "1/2", "unit": "本"}, {"name": "じゃがいも", "quantity": "3", "unit": "個"},
            {"name": "マッシュルーム缶", "quantity": "30", "unit": "g"}, {"name": "大豆水煮", "quantity": "80", "unit": "g"},
            {"name": "サラダ油", "quantity": "大さじ1", "unit": ""}, {"name": "ケチャップ", "quantity": "大さじ3", "unit": ""},
            {"name": "トマトピューレ", "quantity": "大さじ1", "unit": ""}, {"name": "ウスターソース", "quantity": "小さじ1/3", "unit": ""},
            {"name": "塩", "quantity": "小さじ1/4", "unit": ""}, {"name": "砂糖", "quantity": "小さじ1", "unit": ""},
        ],
        "instructions": "1. 玉ねぎ・にんじん・じゃがいもを1cm角程度に切る。\n2. 鍋に油を熱し、豚肉を炒める。野菜とマッシュルームを加えてさらに炒める。\n3. 材料がかぶる程度の水と大豆を加え、具材がやわらかくなるまで煮る。\n4. ケチャップ・トマトピューレ・ソース・砂糖を加えて煮込み、塩は味を確認しながら控えめに使う。",
    },
])

# レシピマスタに登録する全カタログへ、幼児食としての提供目安を付与する。
# 出典のないレシピは「公式」ではなく、アプリ内の家庭向けレシピとして扱う。
for _recipe in SEED_RECIPES:
    _recipe["age_min_months"] = 36
    _recipe["age_max_months"] = 72
    if _recipe.get("source_url"):
        _recipe.setdefault("servings_note", "記載の分量。子どもの食べる量に合わせて調整")
        _recipe.setdefault("child_notes", _CHILD_RECIPE_NOTE)
        continue

    _recipe["servings_note"] = "2人分の目安。幼児の食べる量に合わせて取り分け"
    _recipe["child_notes"] = (
        "味付けは控えめにし、濃い味の調味料は少量から加えてください。"
        "肉・魚・卵は中心まで十分に加熱し、魚の骨や肉の筋を取り除きます。"
        "具材はお子さんの発達や咀嚼・嚥下に合わせて小さく切る、やわらかく煮るなど調整してください。"
    )
    _recipe["instructions"] = (
        _recipe["instructions"].rstrip()
        + "\n仕上げに具材のやわらかさと大きさを確認し、幼児が食べやすい状態に整えます。"
        "味付けは控えめにし、肉・魚・卵は中心まで十分に加熱してください。"
    )
