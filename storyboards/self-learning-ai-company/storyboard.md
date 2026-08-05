# Storyboard: Self-Learning Company

Статус: концепт на согласование. Seedance 2.0 и Higgsfield пока не запускались.

Рабочая тема: **Build a Self-Learning Company with Closed Feedback Loops**.

Исходники NotebookLM:

- [slides_en.pdf](../../input/self-learning-ai-company/slides_en.pdf)
- [audio_en.m4a](../../input/self-learning-ai-company/audio_en.m4a), примерно 20:45
- [youtube_ab.json](../../input/self-learning-ai-company/youtube_ab.json)

Визуальная идея: показать компанию как живую инженерную систему. В начале AI-пилот изолирован и не получает обратной связи. В финале тот же светящийся центр становится частью устойчивого контура, который измеряет работу, учится на сбоях и масштабируется через всю организацию.

[Обзор восьми ключевых кадров](storyboard-overview.png)

## Визуальный язык

- Формат: 16:9, кинематографичная технологическая документалистика.
- Основа: графитово-черная среда, стальная синяя глубина, тонкая инженерная сетка.
- Сигнал: холодный циан для работающей системы, янтарный для ошибки, задержки или незамкнутого контура.
- Камера: медленные движения с понятной геометрией; каждый кадр должен читаться как самостоятельный слайд.
- Генерируемые изображения: без текста, цифр, логотипов и случайных символов. Все подписи добавляются отдельно на этапе сборки.
- Переходы: преимущественно match cut по светящемуся ядру, линии данных или кругу обратной связи.

## Общая драматургия

| Время | Блок | Ключевой кадр | Что видит зритель | Движение для следующего этапа |
|---|---|---|---|---|
| 00:00–00:35 | Hook | [01](frames/01-pilot-disconnected.png) | Один AI-пилот, вокруг него сигналы обрываются. | Медленный наезд; импульсы доходят до ядра и рассыпаются. |
| 00:35–02:10 | Пилот не учится | [02](frames/02-pilot-plateau.png) | Пилот заперт в стеклянной капсуле; канал возвращается в себя, результат застыл. | Легкое дыхание света; круговой канал повторяет один и тот же путь. |
| 02:10–04:30 | Сначала измерение | [03](frames/03-measurement-gate.png) | Рабочие потоки подходят к измерительным воротам; один янтарный шлюз удерживает систему. | Верхний пролет камеры; потоки замедляются перед воротами, один baseline становится циановым. |
| 04:30–07:00 | Оставлять след работы | [04](frames/04-operational-tracing.png) | Каждый рабочий модуль оставляет трассу действий; одна причинная связь выделена. | Трекинг за одним модулем; трасса сохраняется и соединяется с соседними узлами. |
| 07:00–10:00 | Замкнутый контур | [05](frames/05-closed-loop.png) | Четыре этапа системы собираются в один устойчивый круг вокруг ядра. | Орбитальный проход на 180°; свет последовательно обходит круг и возвращается в центр. |
| 10:00–13:00 | Ошибка становится обучением | [06](frames/06-learning-from-failure.png) | Янтарные фрагменты ошибки проходят через преобразователь и выходят чистыми циановыми сигналами. | Движение слева направо; фрагменты втягиваются внутрь, на выходе поток становится ровным. |
| 13:00–17:30 | Эффект масштаба | [07](frames/07-compounding-at-scale.png) | Один контур связывает множество рабочих узлов и команд; люди наблюдают со стороны. | Плавный crane out; сеть расширяется, но остается читаемой и организованной. |
| 17:30–20:45 | Автономное предприятие | [08](frames/08-autonomous-enterprise.png) | Центр, кольца и узлы работают синхронно; человек управляет рамками, а не каждой операцией. | Медленный push-in к ядру; финальный импульс проходит по всем кольцам и уходит в end card. |

Тайминг является рабочим распределением для аудио длиной около 20:45. После транскрипции его следует подправить по смысловым переходам, не меняя порядок блоков.

## План будущих Seedance-шотов

Это не запуск модели, а спецификация для следующего этапа. На каждый блок стоит сделать 2–3 коротких варианта, сохраняя один и тот же anchor-кадр.

1. **Disconnected pilot** — slow dolly-in, three data pulses approach the core, one amber node flickers, pulses dissolve before contact. No morphing of the core.
2. **Pilot plateau** — locked camera with subtle light breathing, the return channel traces the same loop twice, the amber line remains flat.
3. **Measurement gate** — top-down camera drift, three streams advance, the amber gate pauses one stream, then the gate turns cyan only after the flow stabilizes.
4. **Operational tracing** — lateral tracking shot following one module, thin traces remain in space and connect to the ledger path; no teleporting modules.
5. **Closed loop** — slow half-orbit around the core, light travels through the four arcs in order and returns to the center; maintain circular geometry.
6. **Learning from failure** — amber fragments move through the ring, become clean cyan threads, and reconnect to the loop; avoid explosions and particle noise.
7. **Compounding at scale** — crane out from one node to the full enterprise floor, new connections illuminate in clusters, observers stay still in the foreground.
8. **Autonomous enterprise** — slow push toward the center, concentric rings synchronize, one calm pulse reaches every node, human silhouette remains supervisory.

## Что станет слайдами после одобрения

Сейчас каждый PNG — это опорный кадр, а не финальный слайд. После согласования:

1. Разбить каждый из 8 блоков на 3–5 слайдов: establishing frame, action frame, explanatory frame, transition frame.
2. Перегенерировать нужные изображения в более высоком качестве, сохраняя композицию и положение объектов.
3. Добавить типографику и схемы поверх чистых изображений; текст не вшивать в генерацию.
4. Собрать image-to-video шоты в Seedance через Higgsfield и проверить continuity между соседними anchor-кадрами.
5. Синхронизировать обновленные слайды и motion-шоты с исходным NotebookLM-аудио.

## Критерий согласования

Согласовать нужно три вещи: направление истории, визуальный язык и степень абстракции. Если они устраивают, следующий шаг — не менять сюжет, а только детализировать 8 блоков до набора финальных слайдов и промптов для Seedance.
