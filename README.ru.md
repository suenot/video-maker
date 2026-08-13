# Video Maker

Автоматизированный пайплайн для генерации YouTube-видео из аудио-нарратива и PDF-презентации. Создает MP4-видео с синхронизированными слайдами, SRT-субтитры, метаданные для YouTube и миниатюры.

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
├── .agents/skills/
│   └── youtube-content-pipeline/    # Канонический скилл полного процесса
├── .claude/skills/
│   └── youtube-content-pipeline -> ../../.agents/skills/youtube-content-pipeline
├── scripts/
│   ├── run_pipeline.sh          # Основной запуск пайплайна
│   ├── pdf_to_images.py         # PDF → PNG-изображения слайдов
│   ├── extract_pdf_text.py      # OCR-извлечение текста из изображений
│   ├── extract_subtitles.py     # Аудио → JSON-транскрипция Whisper
│   ├── subtitles_to_srt.py      # JSON Whisper → SRT-субтитры
│   ├── sync_slides.py           # Построение маппинга слайд-время
│   ├── generate_video.py        # Слайды + аудио → MP4
│   ├── make_short.py            # Старый режим нарезки горизонтального видео
│   ├── append_endcard.py        # Финальный экран 16:9 или 9:16
│   ├── ingest_youtube.py        # Чужое видео с YouTube → source.md для NotebookLM
│   ├── research_youtube_tags.py # Исследование YouTube-тегов
│   ├── generate_metadata.py     # Генерация метаданных YouTube
│   └── generate_thumbnail.py    # Генерация миниатюры 1280×720
├── input/                       # Исходные файлы (аудио, PDF-слайды)
├── output/                      # Финальное видео, метаданные, субтитры, миниатюра
├── temp/                        # Промежуточные файлы (изображения слайдов, OCR, timeline)
├── ingest/                      # Скачанные чужие видео (исключены из git)
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

# Если OCR пропустил слайды, передайте точное время старта каждого слайда
python scripts/sync_slides.py --subtitles temp/subtitles.json --slides-text temp/slides_text.json --slide-starts temp/slide-starts.json --output temp/timeline.json

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

Основной производственный режим использует отдельный набор **нативных слайдов
1080x1920**, созданных по тем же смысловым контрактам, что и desktop-версия.
Short нельзя получать обрезкой, размытием, полями или уменьшением видео 16:9.

```bash
python scripts/generate_video.py \
    --timeline temp/<slug>/timeline.json \
    --slides-dir output/<slug>/slides-shorts \
    --audio input/<slug>/audio_ru.m4a \
    --scale-width 1080 --scale-height 1920 \
    --fps 30 \
    --codec libx264 \
    --output output/<slug>/<slug>-short-body.mp4

python scripts/append_endcard.py \
    --video output/<slug>/<slug>-short-body.mp4 \
    --card output/<slug>/slides-shorts/endcard.png \
    --duration 10 --music silent \
    --output output/<slug>/<slug>-short.mp4
```

Весь важный текст должен находиться внутри `x=80..850, y=180..1430`; справа и
снизу нужно оставить место для интерфейса YouTube. На финальном экране Shorts
остаются только контакты, без блока `NEXT VIDEO`. Полные правила и проверки
описаны в [процессе нативных Shorts](docs/shorts-flow.md) и каноническом скилле.

`scripts/make_short.py` остается только для явно запрошенной нарезки уже
существующего горизонтального видео. Это не основной режим производства деки.

## Загрузка исходного видео

Темы приходят с двух отслеживаемых каналов. Когда тема стоит того, чтобы ее
раскрыть, видео разбирается только как исследовательский материал — мы не
перезаливаем его, не перемонтируем и не переводим, а статью и свое видео пишем
с нуля. Скрипт `scripts/ingest_youtube.py` собирает скачивание, транскрипт и
разбор слайдов в одну команду и пишет единый markdown-файл для NotebookLM.

```bash
python scripts/ingest_youtube.py 22iy2mDFiF8 --out-dir ingest
```

На выходе `ingest/<video_id>/source.md` — заголовочный блок, затем транскрипт,
переложенный слайдами по их тайм-кодам, — плюс PNG слайдов в
`ingest/<video_id>/slides/`.

| Флаг | Описание |
|---|---|
| `video` | Идентификатор видео или любая ссылка YouTube (позиционный) |
| `--out-dir` | Куда положить `<video_id>/` (`ingest`) |
| `--scene-threshold` | Оценка смены сцены в ffmpeg, выше которой кадр считается новым слайдом (0.25) |
| `--dedup-threshold` | Средняя разница пикселей, ниже которой два кадра — один и тот же слайд (4.0) |
| `--sample-fps` | Частота выборки, когда в презентации нет различимых склеек (0.5) |
| `--keep-video` | Оставить исходный mp4; по умолчанию он удаляется |
| `--whisper-model` | Модель для запасного пути без субтитров (`large-v3-turbo`) |
| `--ocr-lang` | Язык Tesseract (`eng`) |

**Транскрипт.** Приоритет у собственных субтитров YouTube — они бесплатны и
доступны сразу. Приходят они бегущей строкой: каждая реплика повторяет хвост
предыдущей, а новые слова размечены встроенными тегами вида
`<00:00:01.234><c>`, поэтому наивная выгрузка дублирует каждую строку. Теги
вырезаются, а строка, уже встречавшаяся среди нескольких последних, отбрасывается:
на тестовом видео 529 реплик сжимаются в 265 уникальных строк без единого
повтора. Результат перегруппируется в абзацы примерно по 30 с. Whisper
включается, только если субтитров нет совсем, и тогда на `large-v3-turbo` —
`base` калечит названия продуктов и числа.

**Слайды.** Эти каналы показывают статичные презентации, так что фильтр смены
сцены должен их восстанавливать. На практике их слайды почти черные: `scene` в
ffmpeg считает абсолютную разницу, поэтому два совершенно разных темных слайда
дают около 0.02, и привычный порог 0.25 возвращает *один* кадр на
десятиминутную презентацию. Если фильтр вернул так мало, скрипт сообщает об
этом и переходит на выборку с частотой `--sample-fps`. Дальше кандидаты в любом
случае группируются по восприятию: каждый кадр сравнивается с первым кадром
открытой группы по копии 64×36 в оттенках серого с обрезанными нижними 8%, так
что говорящая голова в углу или ползущая полоса прогресса не открывают новый
слайд. От группы остается один кадр — средний, он уже после анимации появления
и показывает устоявшийся слайд. На тестовом видео 293 кадра-кандидата дают 47
слайдов.

**Текст слайдов.** Tesseract распознает каждый уцелевший слайд, и текст попадает
в `source.md` в блоке кода под картинкой, так что NotebookLM читает презентацию
как текст. Если `tesseract` не установлен, скрипт предупреждает об этом и
перечисляет слайды с тайм-кодами для чтения вручную — вместо того чтобы тянуть
тяжелую зависимость.

## Алгоритм синхронизации слайдов

`sync_slides.py` использует жадный алгоритм прямого сопоставления:
- Слайды продвигаются только вперед (монотонно неубывающий индекс)
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

## Канонический агентный скилл

Единый версионируемый источник процесса находится в
`.agents/skills/youtube-content-pipeline/SKILL.md`. Claude Code открывает тот же
каталог через `.claude/skills/youtube-content-pipeline`, поэтому разные агенты
не получают расходящиеся копии правил.

Скилл описывает поиск исходников, проверку фактов и озвучки, выбор стиля,
смысловые контракты сцен, нативную генерацию 16:9 и 9:16, точный timeline,
проверку рендера, публикацию через Private, добавление видео в статьи и жесткий
запрет на коммит сгенерированных видео и аудио.

## Связанные проекты

- [gaia](https://github.com/suenot/gaia) — генерирует аудио + слайды, которые потребляет этот пайплайн
- [video-metadata](https://github.com/suenot/video-metadata) — title/description/теги/тайм-коды для YouTube (до публикации)
- [video-publisher](https://github.com/suenot/video-publisher) — заливает готовое видео на YouTube

## Лицензия

MIT
