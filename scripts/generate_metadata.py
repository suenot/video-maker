#!/usr/bin/env python3
"""Generate YouTube title, description, tags, and timestamps from article + subtitles + slides."""
import argparse
import json
import os
import re
from collections import Counter
from pathlib import Path


SCRIPT_DIR = Path(__file__).resolve().parent
PROJECT_DIR = SCRIPT_DIR.parent
CHANNELS_DIR = PROJECT_DIR / "channels"

# Fallback config used when --channel points at a missing config file.
# Kept byte-for-byte identical to the pre-refactor marketmaker behavior.
_DEFAULT_CHANNEL_CONFIG = {
    "name": "marketmaker",
    "handle": "@marketmaker_cc",
    "brand_tags": ["marketmaker", "marketmaker_cc"],
    "article_base_url": "https://marketmaker.cc/{lang}/blog/post/{slug}",
    "discuss_url": "https://t.me/marketmaker_cc",
    "discuss_label_en": "💬 Discuss:",
    "discuss_label_ru": "💬 Обсудить:",
    "article_label_en": "📖 Read the full article:",
    "article_label_ru": "📖 Полная статья:",
    "subscribe_en": "👍 Subscribe to our Telegram channel https://t.me/marketmaker_cc for more algorithmic trading content.",
    "subscribe_ru": "👍 Подписывайтесь на телеграм канал https://t.me/marketmaker_cc, чтобы получать больше материалов по алготрейдингу.",
    "extra_contact_urls": [],
}


def load_channel_config(channel: str) -> dict:
    """Load channels/<channel>.json, falling back to the marketmaker defaults."""
    path = CHANNELS_DIR / f"{channel}.json"
    if path.exists():
        with open(path, "r", encoding="utf-8") as f:
            return json.load(f)
    return dict(_DEFAULT_CHANNEL_CONFIG)


def derive_article_url(config: dict, lang: str, slug: str) -> str:
    """Render article_base_url with {lang} and {slug} placeholders."""
    template = config.get("article_base_url", "")
    return template.replace("{lang}", lang).replace("{slug}", slug)


def derive_slug(slug: str, article_path: str, config: dict) -> str:
    """Resolve the article slug from explicit arg, article filename, or channel name."""
    if slug:
        return slug
    if article_path:
        return Path(article_path).stem
    return config.get("name", "marketmaker")


def parse_markdown_frontmatter(path: str) -> dict:
    data = {"title": "", "description": "", "tags": [], "body": ""}
    if not os.path.exists(path):
        return data
    with open(path, "r", encoding="utf-8") as f:
        text = f.read()
    # Simple YAML frontmatter parser
    if text.startswith("---"):
        _, front, body = text.split("---", 2)
        data["body"] = body.strip()
        for line in front.strip().splitlines():
            if ":" in line:
                key, val = line.split(":", 1)
                key = key.strip()
                val = val.strip().strip('"').strip("'")
                if key == "tags":
                    # parse ["a", "b"] or a, b
                    val = val.strip("[]")
                    data["tags"] = [t.strip().strip('"').strip("'") for t in val.split(",") if t.strip()]
                else:
                    data[key] = val
    else:
        data["body"] = text.strip()
    return data


def extract_keywords(text: str, lang: str = "en", top_n: int = 10) -> list:
    text = text.lower()
    text = re.sub(r"[^\w\s]", " ", text)
    words = text.split()
    stopwords = set()
    if lang == "ru":
        stopwords = {
            "и", "в", "не", "на", "я", "быть", "он", "с", "что", "а", "по", "это", "она",
            "к", "но", "мы", "как", "из", "у", "то", "за", "свой", "его", "весь", "вы",
            "для", "о", "же", "ну", "вы", "бы", "чтобы", "который", "от", "так", "этот",
            "тот", "такой", "все", "да", "нет", "а", "или", "если", "тогда", "когда",
            "уже", "еще", "только", "даже", "вот", "всем", "можно", "надо", "нужно",
        }
    else:
        stopwords = {
            "the", "a", "an", "is", "are", "was", "were", "be", "been", "being",
            "to", "of", "and", "in", "for", "on", "with", "at", "by", "from",
            "as", "it", "this", "that", "these", "those", "i", "you", "he", "she",
            "we", "they", "me", "him", "her", "us", "them", "my", "your", "his",
            "its", "our", "their", "what", "which", "who", "when", "where", "why",
            "how", "all", "any", "both", "each", "few", "more", "most", "other",
            "some", "such", "no", "nor", "not", "only", "own", "same", "so",
            "than", "too", "very", "can", "will", "just", "should", "now",
        }
    filtered = [w for w in words if len(w) > 3 and w not in stopwords]
    counts = Counter(filtered)
    return [w for w, _ in counts.most_common(top_n)]


def title_to_question(title: str, lang: str = "en") -> str:
    """Heuristic: turn a slide title into a problem/question for YouTube Education."""
    title = title.strip()
    if not title:
        return ""
    lower = title.lower()
    if lang == "ru":
        if lower.startswith(("как ", "почему ", "что ", "когда ", "где ", "зачем ")):
            return title[0].upper() + title[1:] + ("" if title.endswith("?") else "?")
        if any(w in lower for w in ["оптимизация", "поиск", "выбор", "детекция", "отличить", "найти", "избежать", "предотвратить", "построить", "создать", "использовать", "применить", "заменить", "выявить", "определить", "проверить", "оценить"]):
            return f"Как {title}?"
        return f"Что такое {title}?"
    if lower.startswith(("how ", "why ", "what ", "when ", "where ")):
        return title[0].upper() + title[1:] + ("" if title.endswith("?") else "?")
    if any(w in lower for w in ["optimization", "optimisation", "search", "select", "detect", "distinguish", "find", "avoid", "prevent", "build", "create", "use"]):
        return f"How to {title}?"
    return f"What is {title}?"


RU_FRAGMENT_ENDINGS = {
    "без", "в", "для", "за", "из", "к", "на", "над", "о", "об", "от", "по", "под", "при", "про", "с", "у",
    "через", "между", "перед", "около", "возле", "вокруг", "ввиду", "вместо", "ради", "согласно", "вопреки",
    "благодаря", "несмотря", "определяет", "определять", "заменить", "заменяет", "требует", "зависит",
    "выявляет", "выявить", "показывает", "показать", "демонстрирует", "демонстрировать", "объясняет",
    "объяснить", "решает", "решить", "устраняет", "устранить", "преодолевает", "преодолеть", "является",
    "становится", "стать", "есть", "имеет", "иметь", "выявляют", "отличить", "отличает", "отличить",
    "надежный", "надежная", "надежное", "субъективную", "субъективный", "субъективное", "субъективная",
    "хрупкости", "хрупкость", "хрупкий",
}
EN_FRAGMENT_ENDINGS = {
    "in", "on", "at", "by", "for", "with", "to", "from", "of", "about", "into", "through", "during",
    "before", "after", "above", "below", "between", "under", "without", "within", "along", "among",
    "around", "against", "behind", "beyond", "despite", "except", "inside", "outside", "upon", "via",
    "per", "the", "a", "an",
    "determines", "define", "defines", "require", "requires", "depend", "depends", "show",
    "shows", "demonstrate", "demonstrates", "explain", "explains", "solve", "solves", "remove", "removes",
    "overcome", "overcomes", "is", "becomes", "has", "have", "penalizes", "penalize", "penalises",
    "inevitably", "strictly", "integrating", "distinguishing", "signalling", "signaling",
}


EN_IMP_START = {
    "focus", "avoid", "use", "check", "see", "build", "create", "find", "search", "select",
    "detect", "distinguish", "integrate", "replace", "define", "determine", "explain", "solve",
    "remove", "overcome", "prevent", "start", "stop", "try", "make", "take", "get", "put",
    "set", "run", "write", "read", "add", "edit", "delete", "distinguishing", "integrating",
    "focusing", "using", "finding", "searching", "selecting", "detecting", "replacing", "defining",
    "determining", "explaining", "solving", "removing", "overcoming", "preventing", "starting",
    "stopping", "trying", "making", "taking", "getting", "putting", "setting", "running",
    "writing", "reading", "adding", "editing", "deleting",
}
RU_IMP_START = {
    "фокусируйтесь", "сфокусируйтесь", "используйте", "применяйте", "постройте", "создайте",
    "найдите", "избегайте", "предотвратите", "проверьте", "оцените", "определите", "выявите",
    "замените", "объясните", "решите", "устраните", "начните", "остановитесь", "попробуйте",
    "сделайте", "возьмите", "получите", "поставьте", "установите", "запустите", "напишите",
    "прочитайте", "добавьте", "редактируйте", "удалите", "выявляют", "показывают", "объясняют",
    "требует", "определяет", "зависит", "демонстрирует", "решает", "устраняет", "становится",
    "является", "имеет", "есть", "было", "была", "были", "будет", "будут",
}


def _is_complete_title(title: str, lang: str = "en") -> bool:
    """Skip titles that are fragments, imperatives, or long statements."""
    t = title.strip().rstrip(".,:;—–-!?…")
    if not t or "..." in title or title.endswith((":", "—", "–", "-")):
        return False
    words = t.split()
    if len(words) > 6:
        return False
    first = words[0].lower().rstrip(".,:;—–-!?…")
    last = words[-1].lower().rstrip(".,:;—–-!?…")
    if lang == "ru":
        if first in RU_IMP_START or last in RU_FRAGMENT_ENDINGS:
            return False
        return not any(w.lower().rstrip(".,:;—–-!?…") in RU_IMP_START for w in words)
    if first in EN_IMP_START or last in EN_FRAGMENT_ENDINGS:
        return False
    return not any(w.lower().rstrip(".,:;—–-!?…") in EN_IMP_START for w in words)


def build_problems(stamps: list, lang: str = "en", video_title: str = "", max_problems: int = 6) -> str:
    lines = []
    # Main problem from video title at 0:00
    vt = video_title.strip()
    if vt:
        q = vt if vt.endswith("?") else vt + "?"
        lines.append(f"0:00 {q}")
    for s in stamps[:max_problems * 2]:
        if not _is_complete_title(s["text"], lang):
            continue
        q = title_to_question(s["text"], lang=lang)
        if q:
            lines.append(f"{s['time']} {q}")
        if len(lines) >= max_problems:
            break
    return "\n".join(lines)


RU_END_FRAGMENTS = {"без", "в", "для", "за", "из", "к", "на", "над", "о", "об", "от", "по", "под", "при", "про", "с", "у", "через", "между", "перед", "около", "возле", "вокруг", "ввиду", "вместо", "ради", "согласно", "вопреки", "благодаря", "несмотря", "как", "что", "или", "и", "но", "а", "же"}
EN_END_FRAGMENTS = {"in", "on", "at", "by", "for", "with", "to", "from", "of", "about", "into", "through", "during", "before", "after", "above", "below", "between", "under", "without", "within", "along", "among", "around", "against", "behind", "beyond", "despite", "except", "inside", "outside", "upon", "via", "per", "the", "a", "an", "and", "or", "but", "as", "is", "are", "was", "were", "be", "been", "being", "have", "has", "had", "do", "does", "did", "will", "would", "shall", "should", "may", "might", "can", "could", "must", "shall"}


def _clean_line(line: str) -> str:
    line = re.sub(r'[\\/|<>{\[\]}#@$%^&*]+', '', line)
    line = re.sub(r'\s+', ' ', line).strip()
    return line


def _is_meaningful_line(line: str) -> bool:
    if not line:
        return False
    letters = sum(1 for c in line if c.isalpha() or ('а' <= c <= 'я' or 'А' <= c <= 'Я' or c in 'ёЁ'))
    non_letters = sum(1 for c in line if not c.isalpha() and not c.isspace() and not ('а' <= c <= 'я' or 'А' <= c <= 'Я' or c in 'ёЁ'))
    if letters / max(len(line), 1) < 0.4 or len(line) < 10 or len(line.split()) < 2 or non_letters / max(len(line), 1) > 0.30:
        return False
    # Skip lines ending with em-dash or en-dash (likely truncated)
    if line.endswith(("—", "–", "-", ":")):
        return False
    # Skip lines with exclamation inside a short word (OCR artifact like "Рип!")
    if re.search(r'\b\w{1,4}!', line):
        return False
    # Skip obvious OCR garbage words
    if re.search(r'\b(ыы|ЫЫ|yy|YY)\b', line):
        return False
    # Skip lines with pipe or underscore artifacts
    if '|' in line or ' _ ' in line or line.startswith('_ ') or line.endswith(' _'):
        return False
    return True


def _is_fragment_end(line: str) -> bool:
    last = line.lower().rstrip(".,:;—–-!?…").split()[-1]
    return last in RU_END_FRAGMENTS or last in EN_END_FRAGMENTS


def _is_all_caps_line(line: str) -> bool:
    """Check if line is mostly uppercase words (slide title style)."""
    words = line.split()
    if not words:
        return False
    return all(w.isupper() or w in {'.', ',', '!', '?', '-', '—', '–', ':', ';'} for w in words)


def _slide_title(slide_text: str, max_len: int = 100) -> str:
    """Extract clean title from slide OCR text (first meaningful line)."""
    lines = [l.strip() for l in slide_text.splitlines() if l.strip()]
    # First, try to merge consecutive ALL CAPS lines (EN title style)
    for i, line in enumerate(lines):
        if _is_all_caps_line(line):
            merged = _clean_line(line)
            for j in range(i + 1, len(lines)):
                nxt = lines[j]
                if _is_all_caps_line(nxt):
                    if merged.endswith(('.', '!', '?')):
                        break
                    cand = f"{merged} {nxt}"
                    if len(cand) <= max_len:
                        merged = cand
                    else:
                        break
                else:
                    break
            if len(merged.split()) >= 2:
                return merged[:max_len]
    # Then, look for normal meaningful lines
    for i, line in enumerate(lines):
        if not _is_meaningful_line(line):
            continue
        cleaned = _clean_line(line)
        # If line ends with a fragment word and next line exists, try merging
        if _is_fragment_end(cleaned) and i + 1 < len(lines):
            next_line = _clean_line(lines[i + 1])
            if _is_meaningful_line(next_line):
                merged = f"{cleaned} {next_line}"
                if len(merged) <= max_len * 1.5:
                    return merged[:max_len]
        # If line doesn't end with sentence punctuation and next line starts lowercase, merge
        if not cleaned.endswith(('.', '!', '?')) and i + 1 < len(lines):
            nxt = lines[i + 1]
            if nxt and nxt[0].islower():
                merged = f"{cleaned} {_clean_line(nxt)}"
                if len(merged) <= max_len * 1.5:
                    return merged[:max_len]
        return cleaned[:max_len]
    return ""

def build_timestamps(timeline: list, slides_data: dict, interval_sec: int = 0) -> list:
    """Build YouTube chapter timestamps at slide changes using slide titles."""
    pages = slides_data.get("pages", [])
    stamps = []
    last_t = -999
    seen_texts = set()
    for item in timeline:
        t0 = item["start"]
        slide_idx = item.get("slide", 0)
        t = int(t0)
        if t - last_t < interval_sec:
            continue
        title = ""
        if 0 <= slide_idx < len(pages):
            title = _slide_title(pages[slide_idx].get("text", ""))
        # Skip empty or duplicate titles
        if not title or title.lower() in seen_texts:
            continue
        seen_texts.add(title.lower())
        m = t // 60
        s = t % 60
        stamps.append({"time": f"{m}:{s:02d}", "text": title})
        last_t = t
    return stamps


def build_description(frontmatter: dict, slides_data: dict, subs: dict, stamps: list,
                      lang: str, tags: list, config: dict, slug: str) -> str:
    lines = []
    if frontmatter.get("description"):
        lines.append(frontmatter["description"])
    elif frontmatter.get("body"):
        # first paragraph
        para = frontmatter["body"].split("\n\n")[0].strip("# ").strip()
        lines.append(para)
    else:
        # fallback: first slide title + subtitle
        pages = slides_data.get("pages", [])
        if pages:
            slide_lines = [l.strip() for l in pages[0].get("text", "").splitlines() if l.strip()]
            summary = " ".join(slide_lines[:3])
            summary = re.sub(r'[\\/|<>\[\]{}#@$%^&*]+', '', summary)
            summary = re.sub(r'\s+', ' ', summary).strip()
            if summary:
                lines.append(summary)
        if not lines:
            # ultimate fallback: first subtitle segment
            segs = subs.get("segments", [])[:3]
            summary = " ".join(s.get("text", "").strip() for s in segs)
            if summary:
                lines.append(summary)
        if not lines:
            lines.append(frontmatter.get("title", ""))

    lines.append("")
    lines.append("🔍 Timestamps:" if lang == "en" else "🔍 Таймкоды:")
    for s in stamps[:12]:
        lines.append(f"{s['time']} {s['text']}")

    article_url = derive_article_url(config, lang, slug)
    article_label = config.get("article_label_en") if lang == "en" else config.get("article_label_ru")
    lines.append("")
    lines.append(article_label)
    lines.append(article_url)

    discuss_label = config.get("discuss_label_en") if lang == "en" else config.get("discuss_label_ru")
    lines.append("")
    lines.append(discuss_label)
    lines.append(config.get("discuss_url", ""))

    extra_contacts = config.get("extra_contact_urls") or []
    if extra_contacts:
        links_label = "🔗 Links:" if lang == "en" else "🔗 Ссылки:"
        lines.append("")
        lines.append(links_label)
        for url in extra_contacts:
            lines.append(url)

    lines.append("")
    lines.append("🔗 Tags:")
    lines.append(", ".join(tags))

    lines.append("")
    subscribe_line = config.get("subscribe_en") if lang == "en" else config.get("subscribe_ru")
    lines.append(subscribe_line)
    return "\n".join(lines)


def generate(subtitles_path: str, slides_text_path: str, article_path: str,
             timeline_path: str, output_json: str, output_txt: str, lang: str,
             tags_file: str = "", category: str = "Education",
             type_: str = "Concept overview", level: str = "Advanced",
             channel: str = "marketmaker", slug: str = ""):
    config = load_channel_config(channel)
    resolved_slug = derive_slug(slug, article_path, config)

    frontmatter = parse_markdown_frontmatter(article_path)

    with open(subtitles_path, "r", encoding="utf-8") as f:
        subs = json.load(f)
    with open(slides_text_path, "r", encoding="utf-8") as f:
        slides_data = json.load(f)
    with open(timeline_path, "r", encoding="utf-8") as f:
        timeline = json.load(f)["timeline"]

    # Use researched tags if available
    if tags_file and os.path.exists(tags_file):
        with open(tags_file, "r", encoding="utf-8") as f:
            tags_data = json.load(f)
        tags = tags_data.get("tags", [])
        print(f"Using researched tags from {tags_file}")
    else:
        # Combine all text for keyword extraction
        all_text = frontmatter.get("body", "") + " " + frontmatter.get("description", "")
        for seg in subs.get("segments", []):
            all_text += " " + seg.get("text", "")
        for page in slides_data.get("pages", []):
            all_text += " " + page.get("text", "")

        keywords = extract_keywords(all_text, lang=lang, top_n=15)
        tags = list(set(frontmatter.get("tags", []) + keywords))[:15]

    # Title
    title = frontmatter.get("title", "")
    if not title:
        # fallback to first slide text (first 2-3 lines merged)
        pages = slides_data.get("pages", [])
        if pages:
            lines = [l.strip() for l in pages[0].get("text", "").splitlines() if l.strip()]
            title = " ".join(lines[:2])
    if not title:
        # ultimate fallback: first subtitle segment
        segs = subs.get("segments", [])
        if segs:
            title = segs[0].get("text", "")[:80]
    # YouTube title limit is 100 chars; keep under 90 for safety
    if len(title) > 90:
        title = title[:87] + "..."

    stamps = build_timestamps(timeline, slides_data)
    description = build_description(frontmatter, slides_data, subs, stamps, lang, tags, config, resolved_slug)
    problems = build_problems(stamps, lang=lang, video_title=title)

    metadata = {
        "title": title,
        "description": description,
        "tags": tags,
        "timestamps": stamps,
        "category": category,
        "type": type_,
        "level": level,
        "problems": problems,
    }

    os.makedirs(os.path.dirname(output_json) or ".", exist_ok=True)
    with open(output_json, "w", encoding="utf-8") as f:
        json.dump(metadata, f, ensure_ascii=False, indent=2)

    with open(output_txt, "w", encoding="utf-8") as f:
        f.write(f"Title:\n{title}\n\n")
        f.write(f"Description:\n{description}\n\n")
        f.write(f"Category:\n{category}\n\n")
        f.write(f"Type:\n{type_}\n\n")
        f.write(f"Level:\n{level}\n\n")
        f.write(f"Problems:\n{problems}\n\n")
        f.write(f"Tags:\n{', '.join(tags)}\n")

    print(f"Metadata saved to {output_json} and {output_txt}")


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--subtitles", required=True)
    parser.add_argument("--slides-text", required=True)
    parser.add_argument("--article", default="")
    parser.add_argument("--timeline", required=True)
    parser.add_argument("--output-json", required=True)
    parser.add_argument("--output-txt", required=True)
    parser.add_argument("--tags-file", default="", help="Optional JSON file with researched tags")
    parser.add_argument("--lang", default="en")
    parser.add_argument("--category", default="Education", help="YouTube category")
    parser.add_argument("--type", default="Concept overview", help="YouTube Education type")
    parser.add_argument("--level", default="Advanced", help="YouTube Education level")
    parser.add_argument("--channel", default="marketmaker",
                        help="Channel config name (loads channels/<channel>.json)")
    parser.add_argument("--slug", default="",
                        help="Article slug; falls back to article filename stem, then channel name")
    args = parser.parse_args()
    generate(args.subtitles, args.slides_text, args.article,
             args.timeline, args.output_json, args.output_txt, args.lang,
             tags_file=args.tags_file, category=args.category, type_=args.type, level=args.level,
             channel=args.channel, slug=args.slug)


if __name__ == "__main__":
    main()
