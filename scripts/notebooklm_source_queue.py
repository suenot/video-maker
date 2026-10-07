#!/usr/bin/env python3
"""Resume separate NotebookLM PDF/audio drafts using Gaia's saved Camoufox session.

No cookie import, video generation, rendering, or publication. Mutation intents
are saved before clicks; reconcile uncertain submissions before recovery.
"""
import argparse
import asyncio
import copy
import fcntl
import hashlib
import json
import re
import shutil
import subprocess
import sys
from datetime import datetime, timedelta, timezone
from pathlib import Path
from urllib.parse import urlparse
from zoneinfo import ZoneInfo

ROOT = Path(__file__).resolve().parents[1]
QUEUE = ROOT / "storyboards/notebooklm-source-queue"
RUNTIME = ROOT / "temp/notebooklm-source-queue"
ACTIVE = {"submitting", "submission_unknown", "generating", "scheduled", "requires_manual_binding", "ambiguous", "unknown", "wrong_artifact_kind"}
UNRESOLVED = {"requires_manual_binding", "ambiguous", "unknown", "wrong_artifact_kind", "submission_unknown", "submitting"}
OUTPUT_LANGUAGES = {
    "en": "English",
    "ru": "Russian",
    "zh-CN": "Chinese (Simplified)",
    "zh-TW": "Chinese (Traditional)",
}
# A generic "Chinese"/"中文" label cannot establish which writing system was
# selected. Require an explicit variant before submitting either Chinese job.
CHINESE_LANGUAGE_ALIASES = {
    "Chinese (Simplified)": ("中文（简体）", "中文(简体)", "简体中文", "Chinese (Simplified)"),
    "Chinese (Traditional)": ("中文（繁體）", "中文(繁體)", "繁體中文", "中文（繁体）", "中文(繁体)", "繁体中文", "Chinese (Traditional)"),
}


def now():
    return datetime.now(timezone.utc).isoformat()


def sha(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()


def permanent_notebook_url(url):
    parsed = urlparse(url)
    if parsed.scheme != "https" or parsed.hostname not in ("notebook.google.com", "notebooklm.google.com"):
        return None
    if not re.fullmatch(r"/notebook/[0-9a-f]{8}(?:-[0-9a-f]{4}){3}-[0-9a-f]{12}", parsed.path, re.I):
        return None
    return parsed._replace(query="", fragment="").geturl()


def normal_browser_geometry():
    """Use the real macOS work area, not the old laptop fingerprint dimensions."""
    fallback = {"width": 1920, "height": 1080, "screen_width": 1920, "screen_height": 1080, "x": 0, "y": 0}
    if sys.platform != "darwin":
        return fallback
    script = 'ObjC.import("AppKit");var s=$.NSScreen.mainScreen;var v=s.visibleFrame;var f=s.frame;JSON.stringify({width:Math.round(v.size.width),height:Math.round(v.size.height),screen_width:Math.round(f.size.width),screen_height:Math.round(f.size.height),x:Math.round(v.origin.x-f.origin.x),y:Math.round(f.size.height-v.size.height-v.origin.y+f.origin.y)});'
    result = subprocess.run(["osascript", "-l", "JavaScript", "-e", script], capture_output=True, text=True, timeout=10)
    if result.returncode:
        return fallback
    geometry = json.loads(result.stdout)
    return geometry if geometry["width"] >= 800 and geometry["height"] >= 600 else fallback


def normal_camoufox(common, geometry):
    processes = subprocess.check_output(["ps", "-axo", "args="], text=True)
    if any("/MacOS/camoufox " in line and str(common.CAMOUFOX_PROFILE_DIR) in line for line in processes.splitlines()):
        raise RuntimeError("Camoufox profile already has a live owner; do not open another browser")
    # Native restored bounds are independent of the fingerprint's JS dimensions.
    native_path = common.CAMOUFOX_PROFILE_DIR / "xulstore.json"
    if native_path.exists():
        native = json.loads(native_path.read_text())
        main = native.setdefault("chrome://browser/content/browser.xhtml", {}).setdefault("main-window", {})
        bounds = {"width": str(geometry["width"]), "height": str(geometry["height"]), "screenX": str(geometry["x"]), "screenY": str(geometry["y"]), "sizemode": "normal"}
        if any(main.get(k) != v for k, v in bounds.items()):
            backup = RUNTIME / ("xulstore-before-normal-" + sha(native_path)[:12] + ".json")
            if not backup.exists():
                shutil.copy2(native_path, backup)
                backup.chmod(0o600)
            main.update(bounds)
            save_json(native_path, native)
            native_path.chmod(0o600)
    manager = common.make_camoufox()
    width, height = geometry["width"], geometry["height"]
    # `window=` alone is ignored by Camoufox when a saved fingerprint is supplied.
    # Override only launch geometry; retain the saved profile and fingerprint file.
    config = dict(manager.launch_options.get("config", {}))
    fingerprint = manager.launch_options.get("fingerprint")
    if fingerprint is not None:
        fingerprint = copy.deepcopy(fingerprint)
        # Read viewport from the real window; fixed inner dimensions deadlock
        # Juggler when browser chrome or the native window differs.
        fingerprint.screen.innerWidth = 0
        fingerprint.screen.innerHeight = 0
        manager.launch_options["fingerprint"] = fingerprint
    config.update({"screen.width": geometry["screen_width"], "screen.height": geometry["screen_height"], "screen.availWidth": width, "screen.availHeight": height, "screen.availLeft": geometry["x"], "screen.availTop": geometry["y"], "window.outerWidth": width, "window.outerHeight": height, "window.screenX": geometry["x"], "window.screenY": geometry["y"]})
    manager.launch_options.update(window=(width, height), no_viewport=True, config=config, args=["-width", str(width), "-height", str(height)])
    return manager


def save_json(path, data):
    path.parent.mkdir(parents=True, exist_ok=True)
    temp = path.with_suffix(path.suffix + ".tmp")
    temp.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n")
    temp.replace(path)


def classify(text):
    text = text.casefold()
    if re.search(r"failed to generate|generation failed|could not generate|couldn't generate|error generating", text):
        return "failed"
    if "scheduled" in text:
        return "scheduled"
    if re.search(r"generating|rendering|processing", text):
        return "generating"
    return "ready" if "more_vert" in text else "unknown"


async def dismiss_rebrand_dialog(page):
    # A substring match for "OK" also matches "Create notebook". Never use
    # header controls to dismiss a dialog that is not present.
    dialogs = page.get_by_role("dialog")
    visible = [dialogs.nth(i) for i in range(await dialogs.count()) if await dialogs.nth(i).is_visible()]
    if len(visible) != 1:
        return
    if "gemini notebook" not in (await visible[0].inner_text()).casefold():
        return
    button = visible[0].get_by_role("button", name="Let's go", exact=True)
    if await button.count() == 1 and await button.is_visible() and await button.is_enabled():
        await button.click(timeout=3000)
        await page.wait_for_timeout(1000)


def reconcile(artifact, cards, kind, *, bind_new=False):
    if artifact.get("artifact_id"):
        matches = [c for c in cards if c["id"] == artifact["artifact_id"]]
    else:
        if not bind_new:
            artifact["state"] = "requires_manual_binding"
            artifact["recovery_reason"] = "Interrupted submission has no saved artifact ID; inspect request evidence before binding."
            return
        baseline = set(artifact.get("baseline_ids", []))
        matches = [c for c in cards if c["id"] not in baseline]
    if len(matches) != 1:
        artifact["state"] = "ambiguous" if len(matches) > 1 else "submission_unknown"
        return
    card = matches[0]
    expected = "audio_spark" if kind == "audio" else "tablet"
    status = classify(card["text"])
    if status == "ready" and expected not in card["text"]:
        artifact["state"] = "wrong_artifact_kind"
        return
    artifact.update(artifact_id=card["id"], state=status, card_text=card["text"], observed_at=now())


class Runner:
    def __init__(self, args):
        self.args = args
        self.path = QUEUE / "state.json"
        self.state = json.loads(self.path.read_text()) if self.path.exists() else {"schema_version": 1, "scope": "slides_and_audio_drafts", "jobs": {}}
        self.nlm = None

    def save(self):
        self.state["checked_at"] = now()
        save_json(self.path, self.state)

    def quota_active(self):
        until = self.state.get("quota", {}).get("not_before")
        return bool(until and datetime.now(timezone.utc) < datetime.fromisoformat(until))

    def verify_downloaded(self, jobs=None):
        verified = 0
        for job in self.state["jobs"].values() if jobs is None else jobs:
            for artifact in job.get("artifacts", {}).values():
                if artifact.get("state") == "downloaded_pending_editorial_review":
                    if sha(ROOT / artifact["path"]) != artifact["sha256"]:
                        raise RuntimeError("Downloaded source hash changed")
                    verified += 1
        return verified

    def deferred_jobs(self, briefs):
        current = datetime.now(timezone.utc)
        deferred = {}
        for brief in briefs:
            key = self.identity(brief)
            job = self.state["jobs"].get(key)
            if not job:
                return None
            artifacts = job.get("artifacts", {})
            if len(artifacts) == 2 and all(a.get("state") == "downloaded_pending_editorial_review" for a in artifacts.values()):
                continue
            retry_after = (job.get("last_error") or {}).get("retry_not_before")
            if not retry_after or current >= datetime.fromisoformat(retry_after):
                return None
            deferred[key] = retry_after
        return deferred

    async def source_quota(self, page, *, scheduled=False):
        text = await page.locator("body").inner_text()
        notice = re.search(r"AI usage limit reached\.[^\n]*", text, re.I)
        if not notice and scheduled:
            notice = re.search(r"You're (?:almost at|getting close to) your AI usage limit\.[^\n]*Limit resets at \d{2}:\d{2}\.[^\n]*", text, re.I)
        if not notice:
            return False
        zone = await page.evaluate("Intl.DateTimeFormat().resolvedOptions().timeZone")
        current = datetime.now(ZoneInfo(zone))
        reset = re.search(r"(?:after|resets at)\s+(\d{2}):(\d{2})", notice[0], re.I)
        until = current.replace(hour=int(reset[1]), minute=int(reset[2]), second=0, microsecond=0) if reset else None
        if until and until <= current:
            until += timedelta(days=1)
        self.state["quota"] = {"notice": notice[0], "browser_timezone": zone, "observed_at": now(), "not_before": until.astimezone(timezone.utc).isoformat() if until else None}
        self.save()
        return True

    def briefs(self):
        paths = set(QUEUE.glob("briefs/*.json")) | set(QUEUE.glob("**/brief.json"))
        briefs = [json.loads(p.read_text()) for p in paths]
        priorities = json.loads((ROOT / "storyboards/article-video-queue.json").read_text())["priority_order"]
        # Reconcile saved requests before admitting newly prepared locales.
        return sorted(briefs, key=lambda b: (self.identity(b) not in self.state["jobs"], priorities.index(b["slug"]) if b["slug"] in priorities else len(priorities), b["slug"], b["language"]))

    def input_hashes(self, brief):
        hashes = {"article": brief["article_sha256"]}
        for name in ("source_text", "slides_prompt", "audio_prompt"):
            actual = sha(ROOT / brief[name + "_path"])
            if actual != brief[name + "_sha256"]:
                raise RuntimeError(f"Frozen {name} changed; review before generation")
            hashes[name] = actual
        return hashes

    def identity(self, brief):
        slug, lang = brief["slug"], brief["language"]
        if not re.fullmatch(r"[a-z0-9-]+", slug) or lang not in OUTPUT_LANGUAGES:
            raise RuntimeError("Invalid article/language identity")
        return f"{slug}:{lang}"

    def validate(self, brief):
        key = self.identity(brief)
        slug, lang = brief["slug"], brief["language"]
        article = (ROOT / brief["article_path"]).resolve()
        if sha(article) != brief["article_sha256"]:
            raise RuntimeError("Article changed; freeze and review the new input before generation")
        front = article.read_text().split("---", 2)[1]
        if re.search(r"^draft:\s*true\s*$", front, re.M | re.I) or re.search(r"^youtube:\s*[^\s\"']", front, re.M):
            raise RuntimeError("Article is a draft or already has a video")
        for folder in (ROOT / "output" / slug, ROOT / "output" / "articles" / slug):
            if folder.exists() and any(folder.rglob("*.mp4")):
                raise RuntimeError("Existing video requires reconciliation before new source generation")
        source = ROOT / brief["source_text_path"]
        if source.read_text().splitlines()[0] != brief["source_title"]:
            raise RuntimeError("Copied-text source title must match its frozen first line")
        self.input_hashes(brief)
        return key

    async def account(self, page):
        if urlparse(page.url).hostname not in ("notebook.google.com", "notebooklm.google.com"):
            raise RuntimeError("Page outside NotebookLM; saved account cannot be verified")
        for _ in range(3):
            labels = await page.locator("a[aria-label]").evaluate_all('els=>els.map(e=>e.getAttribute("aria-label")).filter(s=>s && s.includes("@") && s.includes("Google"))')
            emails = [set(re.findall(r"[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}", s.casefold())) for s in labels]
            if len(emails) == 1 and emails[0] == {self.settings["expected_account"].casefold()}:
                return
            if emails:
                raise RuntimeError("Different Google account; generation blocked")
            await page.wait_for_timeout(2500)
        raise RuntimeError("Saved Camoufox account not signed in")

    async def panel(self, page, name):
        button = page.get_by_role("button", name=name, exact=True)
        if await button.count() and await button.first.is_visible():
            await button.first.click()
        await page.wait_for_timeout(1000)

    async def cards(self, page):
        await self.panel(page, "Studio")
        return await page.locator("artifact-library-item").evaluate_all('els=>els.map(e=>({id:e.querySelector("[id^=artifact-labels-]")?.id.replace("artifact-labels-",""),text:e.innerText})).filter(e=>e.id)')

    async def home(self, page):
        await self.nlm.goto_retry(page, "https://notebook.google.com/")
        await page.wait_for_timeout(4000)
        await self.account(page)
        await dismiss_rebrand_dialog(page)
        return await page.locator("project-button").evaluate_all('els=>els.map(e=>({title:e.querySelector(".project-button-title")?.textContent.trim(),href:e.querySelector("a[href*=\\"/notebook/\\"]")?.getAttribute("href")})).filter(e=>e.href)')

    async def notebook(self, page, brief, job):
        if job.get("notebook"):
            if not permanent_notebook_url(job["notebook"]):
                raise RuntimeError("Saved notebook has no permanent ID; reconcile its creation intent before navigation")
            await page.bring_to_front()
            await self.nlm.goto_retry(page, job["notebook"])
            await page.wait_for_timeout(4000)
            await self.account(page)
            return
        notebooks = await self.home(page)
        matches = [n for n in notebooks if n["title"] in (brief["notebook_title"], brief["source_title"])]
        if len(matches) > 1:
            raise RuntimeError("Several matching notebooks; resolve duplicates before continuing")
        if matches:
            job["unbound_notebook_candidates"] = matches
            self.save()
            raise RuntimeError("Title-only notebook match requires identity verification before binding")
        elif job.get("notebook_intent"):
            intent = job["notebook_intent"]
            baseline_path = ROOT / intent["baseline_path"]
            if sha(baseline_path) != intent["baseline_sha256"]:
                raise RuntimeError("Notebook baseline changed; reconcile before creation")
            baseline = json.loads(baseline_path.read_text())
            new = [n for n in notebooks if n["href"] not in baseline]
            if intent.get("dispatch_state") != "not_dispatched" or {n["href"] for n in notebooks} != set(baseline):
                job["unbound_notebook_candidates"] = new
                self.save()
                raise RuntimeError("Interrupted notebook creation requires binding its saved candidate; no duplicate creation")
            intent["pre_click_recovery_verified_at"] = now()
        else:
            baseline_path = RUNTIME / (brief["slug"] + "-" + brief["language"] + "-notebook-baseline.json")
            save_json(baseline_path, [n["href"] for n in notebooks])
            baseline_path.chmod(0o600)
            job["notebook_intent"] = {"at": now(), "baseline_path": str(baseline_path.relative_to(ROOT)), "baseline_sha256": sha(baseline_path), "baseline_count": len(notebooks), "dispatch_state": "not_dispatched"}
        self.save()
        create = page.get_by_role("button", name="New notebook", exact=True)
        if await create.count() != 1:
            raise RuntimeError("Unique new-notebook control unavailable")
        job["notebook_intent"]["dispatch_state"] = "dispatch_unknown"
        self.save()
        await create.evaluate("e=>{if(!e.isConnected || !e.getClientRects().length || e.disabled || e.getAttribute('aria-disabled')==='true')throw new Error('New-notebook control unavailable before dispatch');e.click()}")
        job["notebook_intent"]["dispatch_state"] = "dispatched"
        self.save()
        for _ in range(25):
            if permanent_notebook_url(page.url):
                break
            await page.wait_for_timeout(1000)
        notebook = permanent_notebook_url(page.url)
        if not notebook:
            job["notebook_intent"].update(last_observed_url=page.url, last_observed_at=now())
            self.save()
            raise RuntimeError("Permanent new-notebook ID unavailable; creation intent retained")
        job["notebook"] = notebook
        if job.get("notebook_intent"):
            job["notebook_intent"]["resolved_at"] = now()
        self.save()
        await self.nlm.goto_retry(page, job["notebook"])
        await page.wait_for_timeout(2500)
        await self.account(page)
        job.update(account_guard="passed", browser="saved_camoufox")
        self.save()

    async def source(self, page, brief, job):
        if job["input_hashes"] != self.input_hashes(brief):
            raise RuntimeError("Frozen source inputs changed before insertion")
        await self.panel(page, "Sources")
        needs_first_insertion = not job.get("source_intent") or job["source_intent"].get("dispatch_state") == "not_dispatched"
        if not job.get("source_id") and needs_first_insertion and (self.quota_active() or await self.source_quota(page)):
            job["state"] = "quota_wait"
            job.pop("last_error", None)
            self.save()
            return False
        # NotebookLM replaces upload placeholders with permanent source IDs.
        # Preserve the insertion intent and reconcile that ID; never re-upload.
        if job.get("source_id", "").startswith("pending_upload_doc_id_"):
            if any(a.get("artifact_id") for a in job["artifacts"].values()):
                raise RuntimeError("Artifact bound to a temporary source; inspect before recovery")
            job.setdefault("temporary_source_ids", []).append(job.pop("source_id"))
            self.save()
        async def source_ids():
            return await page.locator("button[id^='source-item-more-button-']").evaluate_all('els=>els.map(e=>e.id.replace("source-item-more-button-",""))')
        insert = False
        if not job.get("source_id") and not job.get("source_intent"):
            source = ROOT / brief["source_text_path"]
            baseline = await source_ids()
            job["source_intent"] = {"at": now(), "sha256": sha(source), "baseline_ids": baseline}
            insert = True
        elif not job.get("source_id") and job.get("source_intent", {}).get("dispatch_state") == "not_dispatched":
            intent = job["source_intent"]
            evidence = intent.get("pre_dispatch_evidence", {})
            if not evidence or any(sha(ROOT / e["path"]) != e["sha256"] for e in evidence.values()):
                raise RuntimeError("Source pre-dispatch evidence unavailable or changed; no insertion")
            notebook = permanent_notebook_url(job.get("notebook", ""))
            if not notebook or permanent_notebook_url(page.url) != notebook or job["artifacts"]:
                raise RuntimeError("Source pre-dispatch recovery lacks the exact empty bound notebook")
            if intent["sha256"] != brief["source_text_sha256"] or set(await source_ids()) != set(intent["baseline_ids"]):
                raise RuntimeError("Source pre-dispatch baseline changed; inspect before insertion")
            intent["pre_dispatch_recovery_verified_at"] = now()
            insert = True
        elif not job.get("source_id") and self.state.get("recovery_policy", {}).get("retry_empty_source_uploads"):
            intent = job["source_intent"]
            if intent["sha256"] != brief["source_text_sha256"]:
                raise RuntimeError("Submitted source hash differs from frozen input")
            # Reconcile permanent/processing additions first. A failed upload
            # may be retried only in the same, freshly verified empty notebook.
            if not await source_ids():
                notebook = permanent_notebook_url(job.get("notebook", ""))
                if not notebook or permanent_notebook_url(page.url) != notebook or job["artifacts"]:
                    raise RuntimeError("Source recovery lacks the exact empty bound notebook")
                await self.account(page)
                live_cards = await self.cards(page)
                await self.panel(page, "Sources")
                await page.wait_for_timeout(2500)
                if not await source_ids() and not await page.locator(".single-source-container").count():
                    if live_cards:
                        raise RuntimeError("Source recovery found existing artifact cards; reconcile before insertion")
                    if self.quota_active() or await self.source_quota(page):
                        job["state"] = "quota_wait"
                        self.save()
                        return False
                    observed = now()
                    job.setdefault("source_intent_history", []).append({
                        "intent": copy.deepcopy(intent), "superseded_at": observed,
                        "reason": "Authorized recovery after live zero-source/zero-artifact reconciliation",
                        "notebook": notebook, "source_ids": [], "artifact_ids": [],
                    })
                    job["source_intent"] = {
                        "at": observed, "sha256": brief["source_text_sha256"], "baseline_ids": [],
                        "retry_of_at": intent["at"],
                        "recovery_authorized_at": self.state["recovery_policy"]["authorized_at"],
                    }
                    insert = True
        if insert:
            source = ROOT / brief["source_text_path"]
            job["source_intent"]["dispatch_state"] = "dispatch_unknown"
            self.save()
            if not await asyncio.wait_for(self.nlm.add_source_text(page, source.read_text(), False), timeout=120):
                raise RuntimeError("Source submission unconfirmed")
        if not job.get("source_id"):
            intent = job["source_intent"]
            if intent["sha256"] != brief["source_text_sha256"]:
                raise RuntimeError("Submitted source hash differs from frozen input")
            added = set(await source_ids()) - set(intent["baseline_ids"])
            pending = {i for i in added if i.startswith("pending_upload_doc_id_")}
            history = job.setdefault("temporary_source_ids", [])
            history.extend(sorted(pending - set(history)))
            stable = added - pending
            if not stable and pending:
                job["state"] = "source_processing"
                job.pop("last_error", None)
                self.save()
                return False
            if len(stable) != 1:
                raise RuntimeError("Source insertion unconfirmed or ambiguous; inspect before retry")
            job["source_id"] = stable.pop()
            intent["resolved_at"] = now()
            self.save()
        source_id = job["source_id"]
        row = page.locator(".single-source-container").filter(has=page.locator("#source-item-more-button-" + source_id))
        if await row.count() != 1:
            raise RuntimeError("Bound source ID unavailable")
        checkbox = row.get_by_role("checkbox")
        try:
            await checkbox.wait_for(state="visible", timeout=30000)
        except Exception:
            pass
        if await checkbox.count() != 1:
            text = (await row.inner_text()).casefold()
            if not await row.get_by_role("progressbar").count() and not re.search(r"progress_activity|processing|loading", text):
                raise RuntimeError("Bound source has neither a selection control nor processing evidence")
            job["state"] = "source_processing"
            job.pop("last_error", None)
            self.save()
            return False
        display_name = (await checkbox.get_attribute("aria-label")).removeprefix("Select ")
        prefix = display_name.rstrip("… ")
        if not brief["source_title"].startswith(prefix):
            raise RuntimeError("Bound source label does not match the uploaded article")
        job.update(source_id=source_id, source_title=brief["source_title"], source_sha256=sha(ROOT / brief["source_text_path"]), state="source_ready")
        job["source_display_name"] = display_name
        allbox = page.get_by_role("checkbox", name="Select all sources", exact=True)
        await allbox.evaluate("e=>{if(e.checked)e.click()}")
        await checkbox.evaluate("e=>{if(!e.checked)e.click()}")
        if not await checkbox.is_checked():
            raise RuntimeError("Bound source checkbox did not retain its selection")
        selected = await page.get_by_role("checkbox").evaluate_all('els=>els.filter(e=>e.checked && e.getAttribute("aria-label")!=="Select all sources").map(e=>e.closest(".single-source-container")?.querySelector("[id^=source-item-more-button-]")?.id.replace("source-item-more-button-",""))')
        if selected != [source_id]:
            raise RuntimeError("Exactly one frozen article source must be selected")
        job["selected_source_ids"] = selected
        self.save()
        return True

    async def set_language(self, page, dialog, language):
        names = CHINESE_LANGUAGE_ALIASES[language] if language in CHINESE_LANGUAGE_ALIASES else self.nlm.LANG_ALIASES[language.casefold()]
        allowed = {name.casefold() for name in names}
        trigger = dialog.locator("mat-select")
        if await trigger.count() != 1:
            raise RuntimeError("Unique language selector unavailable")
        current = (await trigger.inner_text()).strip()
        if current.casefold() in allowed:
            return [current]
        if not await self.nlm.robust_click(trigger):
            raise RuntimeError("Language selector did not open")
        panel = page.get_by_role("listbox")
        await panel.wait_for(state="visible", timeout=15000)
        for _ in range(40):
            for name in names:
                # The current UI uses lower-case "русский" in some notebooks.
                option = panel.get_by_role("option", name=re.compile("^" + re.escape(name) + "$", re.I))
                if await option.count() == 1:
                    if not await self.nlm.robust_click(option):
                        raise RuntimeError("Language option did not select")
                    for _ in range(10):
                        current = (await trigger.inner_text()).strip()
                        if current.casefold() in allowed:
                            return [current]
                        await page.wait_for_timeout(500)
                    raise RuntimeError("Requested language not retained")
            position = await panel.evaluate("e=>{const before=e.scrollTop;e.scrollTop+=e.clientHeight*.8;return [before,e.scrollTop]}")
            if position[0] == position[1]:
                break
            await page.wait_for_timeout(250)
        raise RuntimeError("Requested language option unavailable")

    async def submit(self, page, brief, job, kind, artifact):
        if job["input_hashes"] != self.input_hashes(brief):
            raise RuntimeError("Frozen generation inputs changed before submission")
        baseline = await self.cards(page)
        recovery = artifact.get("pre_click_recovery")
        if recovery and {c["id"] for c in baseline} != set(recovery["baseline_ids"]):
            raise RuntimeError("Artifact cards changed after the recorded pre-click failure; reconcile before submission")
        label = "Customize Audio Overview" if kind == "audio" else "Customize Slide Deck"
        tile = "Audio Overview" if kind == "audio" else "Slide Deck"
        button = page.locator(f"button[aria-label='{label}']")
        if not await button.count():
            button = page.get_by_role("button", name=tile, exact=True)
        if await button.count() != 1 or not await self.nlm.robust_click(button):
            raise RuntimeError("Unique generation control unavailable")
        # A new NotebookLM dialog may arrive after the tile's click animation.
        # Wait for its own visible prompt, rather than reading a stale selector.
        selector = "textarea[aria-label*='focus on in this episode' i]" if kind == "audio" else "textarea[aria-label*='Describe the slide deck' i]"
        textbox = page.locator(selector)
        await textbox.wait_for(state="visible", timeout=30000)
        dialog = page.get_by_role("dialog").filter(has=textbox)
        if await dialog.count() != 1:
            raise RuntimeError("Unique customize dialog unavailable")
        language = OUTPUT_LANGUAGES[brief["language"]]
        values = await self.set_language(page, dialog, language)
        if kind == "audio":
            if not await self.nlm._select_format_tile(page, "Deep Dive"):
                raise RuntimeError("Deep Dive format not selected")
            if not await self.nlm._select_audio_length(page, "Default"):
                raise RuntimeError("Default audio length not verified")
        if await textbox.count() != 1:
            raise RuntimeError("Prompt field unavailable")
        prompt_path = ROOT / brief[kind + "_prompt_path"]
        prompt = prompt_path.read_text()
        await textbox.fill(prompt)
        if await textbox.input_value() != prompt:
            raise RuntimeError("Prompt not retained")
        await textbox.blur()
        await page.wait_for_timeout(500)
        source_button = dialog.get_by_role("button", name=re.compile(r"^\d+ sources?\b", re.I))
        controls = await source_button.all_text_contents()
        if not any(re.fullmatch(r"\s*1 source\s*", text.replace("keyboard_arrow_down", ""), re.I) for text in controls):
            raise RuntimeError("Customize dialog must confirm one selected source")
        await self.account(page)
        generate = dialog.get_by_role("button", name="Generate now", exact=True)
        mode = "now"
        if await generate.count() != 1 or not await generate.is_enabled():
            later = dialog.get_by_role("button", name="Generate later", exact=True)
            quota = await dialog.inner_text()
            if await later.count() != 1 or not await later.is_enabled() or not re.search(r"generate in a few hours|usage limit|limit reset", quota, re.I):
                raise RuntimeError("No enabled generation control; no submission attempted")
            generate, mode = later, "later"
            banner = await page.locator("body").inner_text()
            resets = re.findall(r"[^\n]*limit resets[^\n]*", banner, re.I)
            artifact["quota_notice"] = quota[-1600:]
            artifact["quota_reset_display"] = resets
            artifact["browser_timezone"] = await page.evaluate("Intl.DateTimeFormat().resolvedOptions().timeZone")
        artifact.update(state="submitting", baseline_ids=[c["id"] for c in baseline], prompt_sha256=sha(prompt_path), requested_at=now(), language_selection=values, source_id=job["source_id"])
        artifact["submission_mode"] = mode
        self.save()
        # Dispatch once after guards; native animation must not delay the action
        # or trigger a second click after an uncertain dispatch.
        await generate.evaluate("e=>{if(!e.isConnected || !e.getClientRects().length || e.disabled || e.getAttribute('aria-disabled')==='true')throw new Error('Generation control unavailable before dispatch');e.click()}")
        artifact["state"] = "submission_unknown"
        self.save()
        await page.wait_for_timeout(3500)
        later = page.get_by_role("button", name="Generate later", exact=True)
        if mode == "now" and await later.count() and await later.first.is_visible() and await later.first.is_enabled():
            dialogs = await page.get_by_role("dialog").all_text_contents()
            artifact["quota_notice"] = "\n".join(dialogs)[:1600]
            await later.first.click()
            artifact["scheduled_by_quota_dialog"] = True
            await page.wait_for_timeout(2500)
        for _ in range(10):
            cards = await self.cards(page)
            if any(c["id"] not in artifact["baseline_ids"] for c in cards):
                break
            await page.wait_for_timeout(500)
        reconcile(artifact, cards, kind, bind_new=True)
        self.save()

    async def download(self, page, brief, artifact, kind):
        card = page.locator("artifact-library-item").filter(has=page.locator("#artifact-labels-" + artifact["artifact_id"]))
        if await card.count() != 1:
            raise RuntimeError("Bound artifact unavailable")
        more = card.get_by_role("button", name="More", exact=True)
        if await more.count() != 1:
            raise RuntimeError("Unique bound-artifact menu control unavailable")
        # Studio hover tooltips can intercept native pointer clicks. Open only
        # this verified artifact's menu once, without hitting another control.
        await more.evaluate("e=>{if(!e.isConnected || !e.getClientRects().length || e.disabled || e.getAttribute('aria-disabled')==='true')throw new Error('Bound-artifact menu control unavailable before dispatch');e.click()}")
        label = re.compile(r"Download PDF Document") if kind == "slides" else re.compile(r"\bDownload$")
        item = page.get_by_role("menuitem", name=label)
        if await item.count() != 1:
            raise RuntimeError("Exact artifact download menu unavailable")
        await item.wait_for(state="visible", timeout=30000)
        async with page.expect_download(timeout=60000) as info:
            # Native pointer dispatch can stall even on a visible menu item.
            # Keep the exact bound menu match and dispatch its enabled item once.
            await item.evaluate("e=>{if(!e.isConnected || !e.getClientRects().length || e.disabled || e.getAttribute('aria-disabled')==='true' || e.getAttribute('role')!=='menuitem')throw new Error('Bound-artifact download item unavailable before dispatch');e.click()}")
        data, ext = await asyncio.wait_for(self.nlm._grab_download(page, await info.value, kind), timeout=180)
        if not data or len(data) <= self.nlm.MIN_BYTES or (kind == "slides" and (ext != "pdf" or not data.startswith(b"%PDF-"))):
            raise RuntimeError("Artifact bytes invalid")
        folder = ROOT / "input/notebooklm-sources" / brief["slug"] / brief["language"]
        folder.mkdir(parents=True, exist_ok=True)
        path = folder / (kind + "." + ext)
        if path.exists() and path.read_bytes() != data:
            raise RuntimeError("Existing source file differs; preserve it before replacing")
        pending = path.with_name("." + path.name + ".pending")
        pending.write_bytes(data)
        if kind == "slides":
            check = subprocess.run(["pdfinfo", str(pending)], capture_output=True, text=True)
            if check.returncode:
                raise RuntimeError("PDF integrity check failed")
            artifact["pages"] = int(re.search(r"^Pages:\s+(\d+)", check.stdout, re.M)[1])
            if artifact["pages"] < 1:
                raise RuntimeError("PDF contains no pages")
        else:
            check = subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration:stream=codec_type,codec_name", "-of", "json", str(pending)], capture_output=True, text=True)
            if check.returncode:
                raise RuntimeError("Audio integrity check failed")
            probe = json.loads(check.stdout)
            if not any(s.get("codec_type") == "audio" for s in probe["streams"]):
                raise RuntimeError("Audio stream absent")
            artifact["duration_seconds"] = float(probe["format"]["duration"])
            if artifact["duration_seconds"] <= 0:
                raise RuntimeError("Audio duration invalid")
            decode = subprocess.run(["ffmpeg", "-v", "error", "-i", str(pending), "-f", "null", "-"], capture_output=True, text=True)
            if decode.returncode:
                raise RuntimeError("Audio full decode failed")
        pending.replace(path)
        artifact.update(state="downloaded_pending_editorial_review", path=str(path.relative_to(ROOT)), sha256=sha(path), bytes=len(data), integrity="passed", downloaded_at=now(), editorial_review="pending")
        self.save()

    async def run(self):
        if self.quota_active():
            verified = self.verify_downloaded()
            print(json.dumps({"state": "quota_wait", "not_before": self.state["quota"]["not_before"], "browser_opened": False, "local_originals_verified": verified}), flush=True)
            return
        briefs = self.briefs()
        if not briefs:
            raise RuntimeError("No frozen source briefs")
        deferred = self.deferred_jobs(briefs)
        if deferred is not None:
            verified = self.verify_downloaded()
            print(json.dumps({"state": "retry_wait" if deferred else "source_queue_complete", "deferred_jobs": deferred, "browser_opened": False, "local_originals_verified": verified}), flush=True)
            return
        self.settings = json.loads(self.args.settings.read_text())
        sys.path[:0] = [self.settings["gaia_path"], str(ROOT.parent / "video_youtube_publish")]
        import gemini_common as common
        import notebooklm_gen as nlm
        self.nlm = nlm
        common.CAMOUFOX_PROFILE_DIR = Path(self.settings["profile"])
        common.FINGERPRINT_FILE = Path(self.settings["fingerprint"])
        if not common.CAMOUFOX_PROFILE_DIR.is_dir() or not common.FINGERPRINT_FILE.is_file():
            raise RuntimeError("Saved Camoufox profile/fingerprint unavailable; no bootstrap")
        nlm.OUTPUT_DIR = RUNTIME
        new_jobs = 0
        geometry = normal_browser_geometry()
        self.state["browser_geometry_requested"] = geometry
        self.save()
        async with normal_camoufox(common, geometry) as context:
            page = context.pages[0] if context.pages else await context.new_page()
            await page.bring_to_front()
            measured = await page.evaluate('()=>({outer_width:outerWidth,outer_height:outerHeight,inner_width:innerWidth,inner_height:innerHeight,device_pixel_ratio:devicePixelRatio})')
            self.state["browser_geometry_verified"] = measured
            self.save()
            if measured["outer_width"] < geometry["width"] - 20 or measured["outer_height"] < geometry["height"] - 20 or measured["inner_width"] < geometry["width"] * .94:
                raise RuntimeError("Camoufox opened below the required work-area dimensions")
            print(json.dumps({"browser_geometry": measured}), flush=True)
            for brief in briefs:
                key = self.identity(brief)
                completed = self.state["jobs"].get(key)
                retry_after = ((completed or {}).get("last_error") or {}).get("retry_not_before")
                if retry_after and datetime.now(timezone.utc) < datetime.fromisoformat(retry_after):
                    print(json.dumps({"job": key, "state": "retry_wait", "not_before": retry_after}), flush=True)
                    continue
                active = sum(a.get("state") in ACTIVE for j in self.state["jobs"].values() for a in j.get("artifacts", {}).values())
                needs_admission = not completed or completed.get("admission_state") == "preflight_pending"
                if needs_admission:
                    if new_jobs >= self.args.max_new_jobs or active >= self.args.max_active or self.quota_active():
                        continue
                if key not in self.state["jobs"]:
                    frozen_hashes = {"article": brief["article_sha256"], **{name: brief[name + "_sha256"] for name in ("source_text", "slides_prompt", "audio_prompt")}}
                    self.state["jobs"][key] = {"slug": brief["slug"], "language": brief["language"], "article_sha256": brief["article_sha256"], "input_hashes": frozen_hashes, "artifacts": {}, "admission_state": "preflight_pending"}
                    self.save()
                job = self.state["jobs"][key]
                stage = "inputs"
                try:
                    # Completed drafts retain their frozen evidence if the
                    # published article changes later. Verify only originals.
                    if len(job["artifacts"]) == 2 and all(a.get("state") == "downloaded_pending_editorial_review" for a in job["artifacts"].values()):
                        stage = "local_originals"
                        self.verify_downloaded([job])
                        job.pop("last_error", None)
                        continue
                    self.validate(brief)
                    if job["input_hashes"] != self.input_hashes(brief):
                        raise RuntimeError("Job inputs differ from frozen brief; resume blocked")
                    if needs_admission:
                        new_jobs += 1
                        job.update(admission_state="admitted", admitted_at=now())
                        self.save()
                    stage = "notebook"
                    print(json.dumps({"job": key, "stage": "reconcile_notebook_and_sources"}), flush=True)
                    await self.notebook(page, brief, job)
                    stage = "source"
                    if not await self.source(page, brief, job):
                        continue
                    stage = "artifacts"
                    for kind in ("slides", "audio"):
                        artifact = job["artifacts"].setdefault(kind, {"state": "not_submitted"})
                        if artifact["state"] == "downloaded_pending_editorial_review":
                            continue
                        if artifact["state"] == "failed" and artifact.get("failure_evidence"):
                            # Failed cards may omit their UUID from the DOM.
                            # Keep an independently verified failure bound to its
                            # original ID until a deliberate recovery is chosen.
                            continue
                        if artifact["state"] == "not_submitted":
                            active = sum(a.get("state") in ACTIVE for j in self.state["jobs"].values() for a in j.get("artifacts", {}).values())
                            if active >= self.args.max_active:
                                continue
                            await self.submit(page, brief, job, kind, artifact)
                        else:
                            reconcile(artifact, await self.cards(page), kind)
                            self.save()
                        if artifact["state"] in UNRESOLVED:
                            raise RuntimeError("Artifact submission unresolved; inspect saved evidence before more generation")
                        if artifact["state"] == "ready":
                            await self.download(page, brief, artifact, kind)
                    if job.get("last_error") and not any(a.get("state") == "failed" for a in job["artifacts"].values()):
                        job.setdefault("error_history", []).append(job.pop("last_error"))
                except Exception as error:
                    if job.get("last_error"):
                        job.setdefault("error_history", []).append(copy.deepcopy(job["last_error"]))
                    job["last_error"] = {"type": type(error).__name__, "message": (str(error).splitlines() or [type(error).__name__])[0][:240], "at": now(), "stage": stage}
                    self.save()
                    print(json.dumps({"job": key, "error": job["last_error"]}), flush=True)
                    if stage in ("inputs", "local_originals"):
                        job["last_error"].update(
                            retry_not_before=(datetime.now(timezone.utc) + timedelta(minutes=15)).isoformat(),
                            next_safe_step="Repair this job's frozen input or original-file mismatch using its retained hashes and bound IDs; do not dispatch its notebook/source/Generate actions. Continue independent jobs.",
                        )
                        self.save()
                        continue
                    try:
                        diagnostic_prefix = key.replace(":", "-") + "-" + datetime.now(timezone.utc).strftime("%Y%m%dT%H%M%S%fZ")
                        screenshot_path = RUNTIME / (diagnostic_prefix + "-error.png")
                        controls_path = RUNTIME / (diagnostic_prefix + "-controls.json")
                        await page.screenshot(path=str(screenshot_path), timeout=10000)
                        controls = await page.locator("button,input,textarea,mat-select").evaluate_all('els=>els.filter(e=>e.getBoundingClientRect().width>0).map(e=>({tag:e.tagName,label:e.getAttribute("aria-label"),placeholder:e.getAttribute("placeholder"),text:e.innerText?.slice(0,90)}))')
                        save_json(controls_path, controls)
                        job["last_error"]["evidence"] = {name: {"path": str(path.relative_to(ROOT)), "sha256": sha(path)} for name, path in (("screenshot", screenshot_path), ("controls", controls_path))}
                    except Exception as diagnostic_error:
                        job["diagnostic_error"] = type(diagnostic_error).__name__
                    self.save()
                    # Account/login failures remain global. Identity failures
                    # defer this job without dispatching its uncertain action.
                    await self.account(page)
                    if self.quota_active() or await self.source_quota(page):
                        break
                    job["last_error"].update(
                        retry_not_before=(datetime.now(timezone.utc) + timedelta(minutes=15)).isoformat(),
                        next_safe_step="Reconcile this job's exact notebook/source/artifact IDs and retained intents after backoff; recover only a verified empty source upload under the saved policy. Never repeat an uncertain Generate action.",
                    )
                    self.save()
                    await page.close()
                    page = await context.new_page()
                    await page.bring_to_front()
                    continue
                self.save()
                print(json.dumps({"job": key, "notebook": job["notebook"], "artifacts": {k: {"state": a["state"], "artifact_id": a.get("artifact_id")} for k, a in job["artifacts"].items()}}, ensure_ascii=False), flush=True)
                if any(a.get("state") == "scheduled" for a in job["artifacts"].values()) and await self.source_quota(page, scheduled=True):
                    break


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("command", choices=("run", "status"))
    parser.add_argument("--settings", type=Path, default=RUNTIME / "session-settings.json")
    parser.add_argument("--max-new-jobs", type=int, default=2)
    parser.add_argument("--max-active", type=int, default=8)
    args = parser.parse_args()
    RUNTIME.mkdir(parents=True, exist_ok=True)
    runner = Runner(args)
    if args.command == "status":
        print(json.dumps({k: {"notebook": j.get("notebook"), "source_id": j.get("source_id"), "artifacts": j.get("artifacts", {}), "last_error": j.get("last_error")} for k, j in runner.state["jobs"].items()}, ensure_ascii=False, indent=2))
        return
    with (RUNTIME / "worker.lock").open("a+") as lock:
        try:
            fcntl.flock(lock, fcntl.LOCK_EX | fcntl.LOCK_NB)
        except BlockingIOError:
            print("A source worker is already running; no duplicate browser opened.")
            return
        asyncio.run(runner.run())


if __name__ == "__main__":
    main()
