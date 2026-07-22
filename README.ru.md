# Video Maker

Автоматизированный пайплайн для генерации YouTube-видео из аудио-нарратива и PDF-презентации. Создаёт MP4-видео с синхронизированными слайдами, SRT-субтитры, метаданные для YouTube и миниатюры.

## 🏭 Контент-завод

video-maker — **этап 2** автоматического конвейера, который превращает **статью
в блоге в опубликованное видео на YouTube** — без API-ключей, целиком через
залогиненные браузерные сессии (Camoufox) и локальные медиа-инструменты.

| # | Этап | Репозиторий | Что делает |
|---|------|-------------|-----------|
| 1 | Генерация | [gaia](https://github.com/suenot/gaia) | Управляет NotebookLM / Gemini / Flow из залогиненной сессии → аудио-обзор + слайды |
| **2** | **Сборка** | **[video-maker](https://github.com/suenot/video-maker)** ⬅ *этот репозиторий* | Аудио + PDF-слайды → синхронизированный MP4 (+ SRT, миниатюра) |
| 3 | Описание | [video-metadata](https://github.com/suenot/video-metadata) | Видео + статья → title / description / теги / тайм-коды глав для YouTube |
| 4 | Публикация | [video-publisher](https://github.com/suenot/video-publisher) | Управляет YouTube Studio → заливка с метаданными, выбор канала, видимость |

**Поток:** `статья → gaia → video-maker → video-metadata → video-publisher → YouTube`
(опубликованное видео затем встраивается обратно в статью блога).

## Что делает

На вход принимает аудиофайл (нарратив) и PDF со слайдами, на выходе:

1. **Конвертирует PDF в изображения** — каждый слайд становится PNG через `pdftoppm` (Poppler)
2. **Извлекает текст со слайдов** — OCR через Tesseract
3. **Транскрибирует аудио** — speech-to-text через OpenAI Whisper с пословными таймкодами
4. **Генерирует SRT-субтитры** — сегменты Whisper конвертируются в формат SRT для YouTube
5. **Синхронизирует слайды с аудио** — сопоставляет текст транскрипции с OCR-текстом слайдов для определения момента смены каждого слайда
6. **Генерирует видео** — собирает слайды + аудио в MP4 через FFmpeg с аппаратным ускорением (HEVC/H.264 через VideoToolbox на macOS)
7. **Исследует YouTube-теги** — комбинирует YouTube Suggest API, анализ заголовков конкурентов (через yt-dlp) и intent-фразы
8. **Генерирует метаданные** — заголовок, описание с таймкодами, теги, категория, вопросы (для YouTube Education)
9. **Генерирует миниатюру** — PNG 1280×720 из первого слайда

## Требования

- Python 3.9+
- [FFmpeg](https://ffmpeg.org/) с поддержкой VideoToolbox (по умолчанию на macOS)
- [Poppler](https://poppler.freedesktop.org/) (команда `pdftoppm`) — `brew install poppler`
- [Tesseract OCR](https://github.com/tesseract-ocr/tesseract) — `brew install tesseract`
- [yt-dlp](https://github.com/yt-dlp/yt-dlp) (опционально, для исследования тегов)

### Python-зависимости

```bash
python -m venv venv
source venv/bin/activate
pip install openai-whisper pillow pytesseract
```

Опционально (для исследования тегов через Google Trends):
```bash
pip install pytrends
```

## Структура проекта

```
video_maker/
├── .claude/skills/
│   └── youtube-video-publishing.md  # Агентный скилл: полный воркфлоу публикации
├── scripts/
│   ├── run_pipeline.sh          # Основной запуск пайплайна
│   ├── pdf_to_images.py         # PDF → PNG-изображения слайдов
│   ├── extract_pdf_text.py      # OCR-извлечение текста из изображений
│   ├── extract_subtitles.py     # Аудио → JSON-транскрипция Whisper
│   ├── subtitles_to_srt.py      # JSON Whisper → SRT-субтитры
│   ├── sync_slides.py           # Построение маппинга слайд-время
│   ├── generate_video.py        # Слайды + аудио → MP4
│   ├── make_short.py            # Горизонтальное видео + SRT → Short 1080×1920
│   ├── research_youtube_tags.py # Исследование YouTube-тегов
│   ├── generate_metadata.py     # Генерация метаданных YouTube
│   └── generate_thumbnail.py    # Генерация миниатюры 1280×720
├── input/                       # Исходные файлы (аудио, PDF-слайды)
├── output/                      # Финальное видео, метаданные, субтитры, миниатюра
├── temp/                        # Промежуточные файлы (изображения слайдов, OCR, timeline)
└── venv/                        # Виртуальное окружение Python
```

## Использование

### Запуск полного пайплайна

```bash
bash scripts/run_pipeline.sh en   # Английская версия
bash scripts/run_pipeline.sh ru   # Русская версия
```

### Запуск отдельных шагов

Каждый скрипт можно запускать независимо:

```bash
# 1. Конвертация PDF в изображения
python scripts/pdf_to_images.py --pdf input/slides.pdf --out-dir temp/slides --dpi 200

# 2. OCR-извлечение текста из слайдов
python scripts/extract_pdf_text.py --images-dir temp/slides --output temp/slides_text.json --lang rus

# 3. Транскрипция аудио через Whisper
python scripts/extract_subtitles.py --audio input/audio.m4a --output temp/subtitles.json --model base --language ru

# 4. Конвертация субтитров в SRT
python scripts/subtitles_to_srt.py --subtitles temp/subtitles.json --output output/video.srt

# 5. Синхронизация слайдов с аудио
python scripts/sync_slides.py --subtitles temp/subtitles.json --slides-text temp/slides_text.json --output temp/timeline.json

# 6. Генерация видео
python scripts/generate_video.py --timeline temp/timeline.json --slides-dir temp/slides --audio input/audio.m4a --output output/video.mp4

# 7. Исследование YouTube-тегов
python scripts/research_youtube_tags.py --seed-keywords "keyword1,keyword2" --lang ru --max-tags 15 --output temp/tags.json

# 8. Генерация метаданных
python scripts/generate_metadata.py --subtitles temp/subtitles.json --slides-text temp/slides_text.json --timeline temp/timeline.json --output-json output/metadata.json --output-txt output/metadata.txt --lang ru --tags-file temp/tags.json

# 9. Генерация миниатюры
python scripts/generate_thumbnail.py --slides-dir temp/slides --output output/thumbnail.png
```

## Кодирование видео

Пайплайн поддерживает три кодека:

| Кодек | Скорость | Размер файла | Примечания |
|---|---|---|---|
| `hevc_videotoolbox` | Быстро (GPU) | Минимальный | По умолчанию. Аппаратное HEVC на Apple Silicon |
| `h264_videotoolbox` | Очень быстро (GPU) | Средний | Аппаратное H.264 на Apple Silicon |
| `libx264` | Медленно (CPU) | Малый | Лучшее сжатие, но может вызвать OOM на больших слайдах |

По умолчанию: `hevc_videotoolbox`, разрешение 1920×1080, 1 fps (оптимально для статичных слайдов).

## Вертикальные Shorts

Функция NotebookLM "Short Video Overview" рендерит **только латиницу** — на русских и
китайских источниках надписи в кадре возвращаются на английском, а вшитые субтитры
выглядят как пустые квадраты-тофу. Поэтому Shorts для `@marketmaker-school-ru` и
`@marketmaker-zh` собираются локально: `scripts/make_short.py` берет уже готовое
горизонтальное видео вместе с его SRT и делает вертикальный ролик 1080×1920 с корректно
отрисованной кириллицей и иероглифами.

```bash
python scripts/make_short.py \
    --video output/<slug>/<slug>_ru.mp4 \
    --srt   output/<slug>/<slug>_ru.srt \
    --start 1:00 --end 1:52 \
    --lang ru \
    --title "Почему маркет-мейкер теряет деньги" \
    --out output/<slug>/<slug>_ru_short.mp4
```

| Флаг | Описание |
|---|---|
| `--video`, `--srt` | Готовый MP4 16:9 и его SRT |
| `--start`, `--end` | Вырезаемый отрезок, `SS.s` или `MM:SS`; без `--end` берется конец исходника |
| `--lang` | `ru` \| `zh` \| `en` — выбирает шрифт и правила переноса строк |
| `--title` | Необязательный хук-заголовок, закрепленный сверху на весь ролик |
| `--font`, `--font-index` | Переопределить файл шрифта / начертание внутри `.ttc` |
| `--sub-size`, `--title-size` | Кегль в пикселях (72 / 82) |
| `--sub-fps` | Частота кадров PNG-последовательности субтитров (10) |
| `--codec` | `libx264` (по умолчанию) или `h264_videotoolbox` |
| `--keep-temp` | Оставить отрисованные PNG субтитров для проверки |

**Кадрирование.** Исходник масштабируется до ширины 1080 и центрируется по вертикали;
пустые поля сверху и снизу заполняются размытой, затемненной и увеличенной копией того же
кадра (`split` → `scale`+`crop`+`boxblur` → `overlay`), так что черных полос нет.

**Субтитры.** Локальный FFmpeg собран без libass и freetype, поэтому фильтров `subtitles`,
`ass` и `drawtext` просто нет — `ffmpeg -filters | grep -E "subtitles|drawtext|ass"` не
находит ничего. Дорожка субтитров растрируется через Pillow в последовательность
прозрачных PNG (10 fps; одинаковые слои связываются жесткими ссылками, так что ролику на
50 с нужно около 25 уникальных PNG) и накладывается вторым входом через `overlay`.

**Шрифты.** Arial Black для `ru`/`en`, Hiragino Sans GB W6 для `zh`. Каждый символ
субтитров и заголовка сверяется с глифом notdef до начала рендера; если символ вышел бы
квадратом-тофу, скрипт падает с ошибкой и перечисляет проблемные символы, а не выпускает
сломанный текст.

**Типографика.** Белый текст с темной обводкой на полупрозрачной скругленной подложке, в
нижней трети кадра. Кириллица и латиница переносятся по словам, иероглифы — посимвольно
(без переноса перед закрывающей пунктуацией). Реплики длиннее 3 строк уменьшаются до
46 px, чтобы не закрывать слайд.

**Выход.** H.264 High / yuv420p, 30 fps, AAC 192 kb/s, `+faststart`. На отрезок длиннее
180 с выводится предупреждение — это потолок YouTube для Shorts.

## Алгоритм синхронизации слайдов

`sync_slides.py` использует жадный алгоритм прямого сопоставления:
- Слайды продвигаются только вперёд (монотонно неубывающий индекс)
- Каждый сегмент транскрипции оценивается относительно текущего слайда и `look_ahead` следующих
- Переход на новый слайд происходит, когда оценка следующего слайда превышает текущую в `advance_ratio` раз (по умолчанию 1.3×) **и** текущий слайд показывался не менее `min_duration` секунд (по умолчанию 5 с)
- Оценка использует пересечение слов + биграммное сопоставление между текстом транскрипции и OCR-текстом слайда

## Структура входных файлов

```
input/<slug>/
├── audio_en.m4a      # Английский нарратив
├── audio_ru.m4a      # Русский нарратив (опционально)
├── slides_en.pdf     # Английские слайды
├── slides_ru.pdf     # Русские слайды (опционально)
└── article_ru.md     # Статья с YAML frontmatter (опционально)
```

## Выходные файлы

| Файл | Описание |
|---|---|
| `<slug>.mp4` | Финальное видео (слайды + аудио) |
| `<slug>.srt` | SRT-субтитры для YouTube |
| `<slug>_metadata.json` | Структурированные метаданные (заголовок, описание, теги, таймкоды) |
| `<slug>_metadata.txt` | Человекочитаемые метаданные для YouTube Studio |
| `<slug>_thumbnail.png` | Миниатюра 1280×720 |

## Агентный скилл (.claude/skills)

Файл `.claude/skills/youtube-video-publishing.md` — ключевая часть этого проекта. Это определение агентного скилла для [Claude Code](https://docs.anthropic.com/en/docs/claude-code), которое обучает ИИ-ассистента полному воркфлоу публикации YouTube-видео:

- **Правила заголовков** — размещение ключевых слов, ограничения длины, без кликбейта
- **Шаблон описания** — SEO-хук, таймкоды, ссылка на статью, Telegram CTA, теги
- **Пайплайн тегов** — как исследовать и фильтровать тематические YouTube-теги
- **Поля YouTube Education** — генерация Category, Type, Level, Problems
- **Правила извлечения заголовков слайдов** — фильтрация OCR, детекция фрагментов, объединение строк
- **Правила кодирования видео** — выбор кодека, разрешение, обоснование framerate
- **Интеграция пайплайна** — как все скрипты связаны между собой

Когда вы открываете этот проект в Claude Code, агент автоматически подхватывает скилл и может запускать весь пайплайн, генерировать метаданные, исправлять проблемы кодирования и т.д. — с полным контекстом о соглашениях и правилах качества проекта.

## Связанные проекты

- [gaia](https://github.com/suenot/gaia) — генерирует аудио + слайды, которые потребляет этот пайплайн
- [video-metadata](https://github.com/suenot/video-metadata) — title/description/теги/тайм-коды для YouTube (до публикации)
- [video-publisher](https://github.com/suenot/video-publisher) — заливает готовое видео на YouTube

## Лицензия

MIT
