# Motion storyboard: Self-Learning Company

Это новая, предметная версия раскадровки. Она сохраняет исходное объяснение NotebookLM: тексты, цифры, подписи, диаграммы и порядок аргументации. Меняется только подача: элементы появляются по смыслу, линии проходят по схемам, графики строятся на глазах, а камера делает аккуратные наезды и проходы.

Seedance 2.0 и Higgsfield на этом этапе не запускались.

## Правило источника истины

Основой остается [оригинальный PDF NotebookLM](../../input/self-learning-ai-company/slides_en.pdf). Фактический текст и цифры не генерируются моделью изображений. Их нужно сохранить как редактируемые слои или как чистые фрагменты исходного слайда.

Генерация изображений может использоваться только для:

- восстановления или расширения фона за пределами исходного кадра;
- создания недостающих декоративных фрагментов схемы без текста;
- аккуратных переходных кадров между двумя объяснительными состояниями;
- улучшения качества отдельных иллюстративных элементов после согласования.

Для текста, подписей, чисел, стрелок и диаграмм используем детерминированную сборку: маски, векторные линии, анимацию opacity/position/scale и последовательное появление.

## Визуальный обзор исходного материала

[Контактный лист 15 исходных слайдов](motion-storyboard-overview.png)

## Сквозной прием

Каждый слайд проходит четыре стадии:

1. **Establish** — полный слайд на 0.5–1 секунду, зритель понимает композицию.
2. **Explain** — камера или маска выделяет именно тот блок, о котором говорит диктор.
3. **Animate** — двигаются только смысловые элементы: стрелки, линии данных, счетчики, графики, предупреждения.
4. **Resolve** — итоговый вывод или связка с последующим слайдом остается на экране перед переходом.

Фон и сетка движутся едва заметно. Текст не перерисовывается, не морфится и не заменяется случайными надписями. Переходы делаются через общие элементы: линия данных, стрелка, круг feedback loop, рамка панели.

## Покадровый план

Тайминг ниже рабочий: его нужно уточнить после получения word-level транскрипции аудио. Порядок слайдов менять не нужно.

| Слайд | Время | Исходное объяснение | Анимационная раскадровка |
|---:|---|---|---|
| 01 | 00:00–00:35 | **ARCHITECTING AI FOR MEASURABLE ROI**. Closed-loop engineering and operational framework. | Темный фон уже присутствует. Сначала появляется заголовок и подзаголовок слева. Справа узлы сети включаются сверху вниз, затем тонкие линии соединяют их с одним центральным контуром. Финальная пауза на всей композиции. Переход: одна линия уходит вправо и становится рамкой следующего слайда. |
| 02 | 00:35–02:10 | **The financial crisis of unmeasurable AI**. 14% finance chiefs see ROI; 42% of companies abandoned at least one AI initiative; sunk costs $7.2M. | Левая шкала последовательно поднимается от нуля к **14%**. Под ней пульсирует линия сигнала. Затем камера переходит в правую панель: поток проходит по трубе и ломается на отметке **42%**. Внизу появляется takeaway: static automation breaks under scale; isolated AI lacks operational rigor. Цифры остаются на экране, пока диктор их объясняет. |
| 03 | 02:10–03:45 | **The root cause is the attribution problem**. The Illusion vs The Reality. | Слева узлы Survey Question → Employee Response → Perception Analysis → Aggregated Feedback собираются в пунктирный цикл и приходят к X. После этого левая половина слегка тускнеет. Справа линии строят измеримую цепочку: Operational System Data → AI Cohort / Non-AI Cohort → Controlled Comparison, а Performance Metrics и Revenue/Cost Data сходятся в **P&L Impact**. В конце подсвечиваются два bullet-пункта про controlled comparison и cohorts. |
| 04 | 03:45–05:15 | **Transitioning to closed-loop AI architectures**. Traditional Automation vs Closed-Loop AI across adaptability, measurement, orchestration overhead, scalability. | Таблица не появляется целиком сразу. Сначала строится левая колонка Traditional Automation серым цветом. Затем по каждой строке проходит вертикальный wipe: Static runbooks → Dynamic routing, Anecdotal surveys → Operational tracing, High manual coding → Autonomous agent negotiation, Linear cost scaling → Distributed asynchronous architecture. Правая колонка загорается cyan после каждой смысловой пары. |
| 05 | 05:15–06:40 | **The missing engine: The AI feedback loop**. Data Accumulation and Data Exploitation reinforce each other. | Камера мягко приближает центральную перемычку между двумя петлями. Янтарный поток данных проходит по Data Accumulation, собирая точки от user inputs, system infrastructure и market operations. В центре поток переходит в cyan Data Exploitation, затем возвращается в левую петлю. Нижний takeaway появляется последним: accumulated data feeds smarter exploitation, which captures higher-quality data. |
| 06 | 06:40–08:10 | **Multi-agent orchestration minimizes operational overhead**. Input, Agent 1/2/3, task routing, handoffs, error recovery, human-in-the-loop escalation. | Из Input выходит одна линия и разветвляется на Agent 1, Agent 2 и Agent 3. По очереди проходят импульсы Task Routing и Handoffs. Правая карточка Orchestration Overhead подсвечивается, когда поток проходит через несколько агентов. Затем одна ветка становится янтарной: Error Recovery → Escalation → Human-in-the-Loop. Финальный кадр показывает, что человек принимает только исключения. |
| 07 | 08:10–09:20 | **Atomic design builds modular, reusable workflows**. Static programs vs modular meaningful units. | Слева bullets появляются по одному. Справа большой монолитный блок получает трещины, но это не разрушение: из него вынимаются небольшие cyan-кубы и собираются в регулярную модульную структуру. Один куб отделяется и возвращается в другое место, показывая reuse. Последним подсвечивается фраза **mixed, matched, and dynamically orchestrated**. |
| 08 | 09:20–11:00 | **The AI ROI measurement workflow (Pre-Deployment)**. Step 1 total cost, Step 2 operational baseline, Step 3 financial model. | Три карточки раскрываются слева направо. Step 1 получает рамку вокруг software, integration labor, change management and maintenance; рядом появляется акцент **40–60%**. Step 2 становится amber warning и пульсирует на словах **Do Not Skip**. После паузы Step 3 строит стрелку к expected returns against baseline data. |
| 09 | 11:00–12:35 | **The AI ROI measurement workflow (Post-Deployment)**. Step 4 operational data and Step 5 structured reviews. | Входящая стрелка продолжает движение со слайда 8. Step 4 раскрывает cycle time, error rates and exception frequencies. Amber warning появляется как контраст: do not replace telemetry with employee surveys. Затем камера проходит к Step 5: маркеры **90 days** и **12 months** загораются отдельно, а линия сравнения возвращается к assumptions из Step 3. |
| 10 | 12:35–13:50 | **Native observability and real-time tracing**. Agent Trace View, Pipeline Metrics, Feedback Loop. | Это самый UI-похожий слайд. В Agent Trace View курсор проходит через USER REQUEST → AGENT START → TOOL CALL → DECISION POINT → RESULT DATA FOUND. В Pipeline Metrics одновременно оживают throughput, latency, queue length и failure rate. В Feedback Loop стрелки запускают failed tool calls & edge cases → retraining data → model & workflow update. Три внешние подписи появляются после соответствующей панели, а не все сразу. |
| 11 | 13:50–15:10 | **One architecture, three stakeholder lenses**. Executive Panel, Product Panel, Technical Panel, AI Engine. | Из AI Engine выходят три направленные линии. Сначала появляется Executive Panel: hard cost savings, revenue impact, time saved, roadmap alignment. Затем Product Panel: task resolution funnels, fallback frequency, session-level friction. Затем Technical Panel: orchestration latency, tool invocation success, error recovery. В конце три линии замыкаются обратно в AI Engine, показывая единую систему метрик. |
| 12 | 15:10–16:45 | **Proof at scale: Enterprise Finance**. $3.70 average return, up to $10.30 for mature deployments, month-end close context. | Слева пункты появляются в порядке диктора. Справа график стартует с горизонтального нуля, затем после точки времени около 30 постепенно растет. На паузе выделяются **$3.70** и **$10.30**. В конце короткий zoom-out показывает, что график относится к operational context, а не к абстрактной оценке. |
| 13 | 16:45–18:00 | **Proof at scale: IT Operations**. 85% auto-triaged, up to 50% fully automated, 60% noise suppression. | Воронка строится сверху вниз: Massive Inbound Volume → System-Generated Events → Auto-Triaged & Resolved → Human-Escalated Tickets. Каждый уровень заполняется потоком; amber остается только узкая нижняя часть human escalation. Слева цифры 85%, 50% и 60% подсвечиваются в моменты, когда соответствующий слой воронки сужается. |
| 14 | 18:00–19:20 | **Proof at scale: Closed-Loop Manufacturing**. 12% less raw material, 25% higher recovery, up to 15% lower operating cost. | Circular arrows начинают вращаться по часовой стрелке. По очереди подсвечиваются Material Intake, Process, Recycle и Recovery. Внешние показатели 12%, 25%, 15% и 33–45% появляются как привязанные callout-метки, без движения самой диаграммы. Один цикл полностью замыкается и передает стрелку в финальный слайд. |
| 15 | 19:20–20:45 | **The mandate for the autonomous enterprise**. 330% return over three years; the gap is measurement and architecture, not technology. | Концентрические кольца включаются от центра наружу. В центре остается **The Autonomous Enterprise**. Затем появляется первая нижняя плашка с **330% return**, после нее вторая: **measurement and architecture problem**. Последний импульс проходит по всем кольцам; экран удерживает финальный тезис и только затем уходит в end card. |

## Что именно будет делать Seedance после согласования

Seedance нужен не для генерации содержания слайдов, а для коротких motion-вставок поверх уже утвержденных кадров:

- плавный наезд на нужный участок схемы;
- движение потока по существующей стрелке;
- легкая глубина и параллакс между фоном, рамкой и диаграммой;
- контролируемое свечение и пульсация метрики;
- короткий переход по общей линии или кругу между соседними слайдами.

Текстовые блоки, числа и диаграммы лучше анимировать в монтажном слое. Это сохраняет читаемость, позволяет синхронизировать появление с голосом и не дает модели исказить подписи.

## Следующий этап после одобрения

1. Зафиксировать эту 15-слайдовую структуру и разметить аудио точными таймкодами.
2. Для каждого слайда выделить 3–6 слоев: background, title, body, diagram, callouts, highlight.
3. Сделать один демонстрационный слайд в анимации — предлагаю начать со слайда 03 или 08, где эффект от движения особенно понятен.
4. После подтверждения образца нарезать остальные слайды и выполнить upscale только нужных иллюстративных областей.
5. Затем подготовить Seedance-шоты и собрать финальное видео с исходным аудио NotebookLM.
