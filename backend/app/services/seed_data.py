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
