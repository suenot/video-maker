#!/usr/bin/env python3
"""Research YouTube tags: thematic phrases with viewer intent, not generic words."""
import argparse
import json
import os
import re
import subprocess
import sys
import time
import urllib.request
from collections import Counter

try:
    from pytrends.request import TrendReq
except Exception:
    TrendReq = None

# NEVER use these as tags — too broad, off-topic, or other people's brands
BAD_PATTERNS = re.compile(
    r'\b(pdf|python|course|tutorial|app|audiobook|india|kya|hindi|'
    r'vevo|official|music video|clip|download|free|review|book|'
    r'salary|software|platform|bot|playlist|episode|part|chapter|'
    r' explained|for beginners|introduction|guide|using|vs)\b',
    re.IGNORECASE
)

# Single words that are too broad to be useful tags
TOO_BROAD = {
    'trading', 'analysis', 'optimization', 'strategy', 'finance', 'investing',
    'stock', 'market', 'forex', 'crypto', 'bitcoin', 'money', 'profit',
    'data', 'research', 'code', 'test', 'backtest', 'overfit', 'optuna',
}

BRAND_TAGS = ['marketmaker', 'marketmaker_cc']


def get_youtube_suggestions(query: str) -> list:
    """Fetch YouTube search suggestions from Google Suggest API (ds=yt)."""
    try:
        url = f"https://suggestqueries.google.com/complete/search?client=firefox&ds=yt&q={urllib.parse.quote(query)}"
        req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
        with urllib.request.urlopen(req, timeout=15) as resp:
            data = json.loads(resp.read().decode("utf-8"))
        if len(data) > 1 and isinstance(data[1], list):
            return [s for s in data[1] if isinstance(s, str)]
    except Exception as e:
        print(f"suggest error for '{query}': {e}", file=sys.stderr)
    return []


def search_youtube_competitors(query: str, max_results: int = 10):
    """Use yt-dlp to search YouTube and return title snippets."""
    try:
        cmd = [
            "yt-dlp",
            f"ytsearch{max_results}:{query}",
            "--skip-download",
            "--print", "%(title)s",
            "--quiet",
        ]
        result = subprocess.run(cmd, capture_output=True, text=True, timeout=120)
        return [l.strip() for l in result.stdout.splitlines() if l.strip()]
    except Exception as e:
        print(f"yt-dlp error: {e}", file=sys.stderr)
        return []


def extract_phrases_from_titles(titles: list, lang: str = "en") -> list:
    """Extract 2-4 word thematic phrases from competitor titles."""
    phrases = []
    for title in titles:
        title = title.lower()
        # remove bad patterns
        title = BAD_PATTERNS.sub(' ', title)
        words = re.findall(r"[\w#-]+", title)
        # build 2-4 grams
        for n in (2, 3, 4):
            for i in range(len(words) - n + 1):
                gram = words[i:i + n]
                joined = ' '.join(gram)
                # skip if too short or contains too-broad only
                if len(joined) < 10:
                    continue
                if all(w in TOO_BROAD for w in gram):
                    continue
                phrases.append(joined)
    return phrases


def clean_tag(tag: str) -> str:
    tag = tag.strip().lower()
    # Remove content in parentheses — keep part before and after as separate tags
    tag = re.sub(r"\s*[\(（][^)）]*[\)）]\s*", " ", tag)
    tag = re.sub(r"[^\w\s#-]", "", tag)
    tag = re.sub(r"\s+", " ", tag).strip()
    tag = re.sub(r"\b20\d{2}\b", "", tag).strip()
    tag = re.sub(r"\s+", " ", tag).strip()
    return tag


def is_good_tag(tag: str) -> bool:
    """Filter out bad tags."""
    if not tag or len(tag) < 10 or len(tag) > 50:
        return False
    # must be multi-word
    if ' ' not in tag:
        return False
    # no bad patterns
    if BAD_PATTERNS.search(tag):
        return False
    # not all broad words
    words = tag.split()
    if all(w in TOO_BROAD for w in words):
        return False
    return True


def research_tags(seed_keywords: list, article_keywords: list, lang: str = "en", max_tags: int = 15):
    hl = "en-US" if lang == "en" else "ru-RU"
    geo = "US" if lang == "en" else "RU"

    # 1. YouTube Suggest API — already viewer-intent phrases
    print("Fetching YouTube search suggestions...", file=sys.stderr)
    suggest_phrases = []
    for kw in seed_keywords[:5]:
        for sug in get_youtube_suggestions(kw):
            ct = clean_tag(sug)
            if is_good_tag(ct):
                suggest_phrases.append(ct)
    suggest_phrases = list(dict.fromkeys(suggest_phrases))[:25]
    print(f"  suggest good phrases: {len(suggest_phrases)}", file=sys.stderr)

    # 2. Competitor title phrase extraction
    print("Searching YouTube competitors...", file=sys.stderr)
    competitor_phrases = []
    for q in seed_keywords[:3]:
        titles = search_youtube_competitors(q, max_results=10)
        print(f"  '{q}' -> {len(titles)} videos", file=sys.stderr)
        competitor_phrases.extend(extract_phrases_from_titles(titles, lang=lang))
    # Keep most common phrases from competitors
    counts = Counter(competitor_phrases)
    competitor_phrases = [p for p, _ in counts.most_common(25) if is_good_tag(p)]
    print(f"  competitor good phrases: {len(competitor_phrases)}", file=sys.stderr)

    # 3. Article keyword combos — build thematic phrases from article words
    article_phrases = []
    for kw in article_keywords:
        kw = clean_tag(kw)
        if is_good_tag(kw):
            article_phrases.append(kw)
    # combine article keywords into 2-word combos
    for i in range(len(article_keywords)):
        for j in range(i + 1, len(article_keywords)):
            combo = f"{article_keywords[i]} {article_keywords[j]}"
            combo = clean_tag(combo)
            if is_good_tag(combo):
                article_phrases.append(combo)
    article_phrases = list(dict.fromkeys(article_phrases))[:20]

    # 4. Seed keyword thematic variations (manual intent-based combos)
    intent_phrases = [
        'algorithmic trading strategies',
        'backtesting strategies',
        'avoid overfitting backtest',
        'trading strategy optimization',
        'parameter stability trading',
        'robust trading strategy',
        'optuna backtesting',
        'optuna trading strategy',
        'plateau analysis trading',
        'quantitative trading strategies',
        'backtest without overfitting',
        'strategy robustness test',
        'trading parameter optimization',
    ]
    if lang == 'ru':
        intent_phrases = [
            'алготрейдинг стратегии',
            'бэктест стратегии',
            'переобучение бэктест',
            'оптимизация торговой стратегии',
            'стабильность параметров',
            'робастная стратегия',
            'optuna трейдинг',
            'анализ плато',
            'квантовый трейдинг',
            'бэктест без переобучения',
            'тестирование стратегии',
            'оптимизация параметров трейдинг',
        ]

    # 5. Score and rank
    all_candidates = list(dict.fromkeys(
        intent_phrases + article_phrases + suggest_phrases + competitor_phrases + BRAND_TAGS
    ))

    scored = []
    for tag in all_candidates:
        s = 0.0
        if tag in intent_phrases:
            s += 5.0
        if tag in article_phrases:
            s += 4.0
        if tag in suggest_phrases:
            s += 3.5
        if tag in competitor_phrases:
            s += 3.0
        # boost 3-word phrases (often best balance)
        if tag.count(' ') == 2:
            s += 0.5
        scored.append((tag, s))

    scored.sort(key=lambda x: (-x[1], x[0]))
    final_tags = [t for t, _ in scored[:max_tags]]

    # Ensure brand tags
    for bt in BRAND_TAGS:
        if bt not in final_tags and len(final_tags) < max_tags:
            final_tags.append(bt)

    return final_tags


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--seed-keywords", required=True)
    parser.add_argument("--article-keywords", default="")
    parser.add_argument("--lang", default="en")
    parser.add_argument("--max-tags", type=int, default=15)
    parser.add_argument("--output", required=True)
    args = parser.parse_args()

    seeds = [k.strip() for k in args.seed_keywords.split(",") if k.strip()]
    article_kw = [k.strip().lower() for k in args.article_keywords.split(",") if k.strip()]

    tags = research_tags(seeds, article_kw, lang=args.lang, max_tags=args.max_tags)

    result = {"tags": tags}
    os.makedirs(os.path.dirname(args.output) or ".", exist_ok=True)
    with open(args.output, "w", encoding="utf-8") as f:
        json.dump(result, f, ensure_ascii=False, indent=2)

    print(f"Tags ({len(tags)}): {', '.join(tags)}")


if __name__ == "__main__":
    main()
