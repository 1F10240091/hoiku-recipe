"""レシピ検索用の食材表記ゆれ・関連語・誤字補正。安全判定には使用しない。"""

import re
import unicodedata


def normalize(text: str) -> str:
    value = unicodedata.normalize("NFKC", text).casefold().strip()
    return "".join(chr(ord(char) - 0x60) if "ァ" <= char <= "ヶ" else char for char in value)


_ALIAS_GROUPS = (
    ("玉ねぎ", "玉葱", "たまねぎ", "オニオン", "onion", "onions"),
    ("豚肉", "ぶたにく", "ポーク", "pork"),
    ("牛肉", "ぎゅうにく", "ビーフ", "beef"),
    ("鮭", "さけ", "しゃけ", "サーモン", "salmon"),
    ("鯖", "さば", "mackerel"),
    ("卵", "玉子", "たまご", "エッグ", "egg", "eggs"),
    ("牛乳", "ぎゅうにゅう", "ミルク", "milk"),
    ("小麦粉", "こむぎこ", "flour"),
    ("豆腐", "とうふ", "tofu"),
    ("ほうれん草", "ほうれんそう", "スピナッチ", "spinach"),
    ("大根", "だいこん", "daikon"),
    ("とまと", "tomato", "tomatoes"),
    ("南瓜", "かぼちゃ", "パンプキン", "pumpkin"),
    ("醤油", "しょうゆ", "ソイソース", "soy sauce"),
    ("味噌", "みそ", "miso"),
    ("唐揚げ", "からあげ", "唐揚", "から揚げ", "karaage", "fried chicken"),
    ("肉じゃが", "にくじゃが", "nikujaga"),
    ("カレー", "curry"),
    ("オムライス", "omurice"),
    ("ハンバーグ", "hamburg steak"),
    ("照り焼き", "照焼き", "照焼", "てりやき", "teriyaki"),
    ("じゃがいも", "じゃが芋", "馬鈴薯", "ポテト", "potato", "potatoes"),
    ("きゃべつ", "キャベツ", "cabbage"),
    ("にんじん", "人参", "キャロット", "carrot", "carrots"),
    ("とり", "鶏", "鳥", "鶏肉", "鳥肉", "とりにく", "チキン", "chicken"),
    ("えび", "海老", "エビ", "シュリンプ", "shrimp"),
)
_ALIAS_LOOKUP = {
    normalize(alias): tuple(normalize(value) for value in group)
    for group in _ALIAS_GROUPS
    for alias in group
}
_RELATED = {
    "とまと": ("みにとまと", "ぷちとまと"),
}


def _edit_distance_at_most_one(left: str, right: str) -> bool:
    """Return whether strings are at most one insertion, deletion, or substitution apart."""
    if abs(len(left) - len(right)) > 1:
        return False
    i = j = differences = 0
    while i < len(left) and j < len(right):
        if left[i] == right[j]:
            i += 1
            j += 1
            continue
        differences += 1
        if differences > 1:
            return False
        if len(left) > len(right):
            i += 1
        elif len(right) > len(left):
            j += 1
        else:
            i += 1
            j += 1
    if i < len(left) or j < len(right):
        differences += 1
    return differences <= 1


def match_score(query: str, ingredient: str) -> int | None:
    """Lower is better: exact, alias/substring, related ingredient, then typo correction."""
    needle = normalize(query)
    name = normalize(ingredient)
    if not needle or not name:
        return None
    terms = _ALIAS_LOOKUP.get(needle, (needle,))
    if name in terms:
        return 0
    related = _RELATED.get(needle, ())
    if any(term in name for term in related):
        return 2
    if any(term in name or name in term for term in terms):
        return 1
    if len(needle) >= 4 and _edit_distance_at_most_one(needle, name):
        return 3
    return None


def suggestion_score(query: str, ingredient: str) -> int | None:
    score = match_score(query, ingredient)
    if score is not None:
        return score
    needle = normalize(query)
    name = normalize(ingredient)
    if len(needle) >= 4 and _edit_distance_at_most_one(needle, name):
        return 3
    return None


_ALIAS_PATTERN = re.compile("|".join(
    re.escape(alias) for alias in sorted(_ALIAS_LOOKUP, key=len, reverse=True)
))


def _canonical(text: str) -> str:
    return _ALIAS_PATTERN.sub(lambda match: _ALIAS_LOOKUP[match.group()][0], normalize(text))


def keyword_matches(query: str, text: str) -> bool:
    """Normalize aliases inside dish names as well as standalone search terms."""
    return normalize(query) in normalize(text) or _canonical(query) in _canonical(text)
