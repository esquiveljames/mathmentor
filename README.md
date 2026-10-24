# MathMentor — Your Step-by-Step Math Learning Companion

A free, mobile-friendly math tutor for **Grade 11 students**. MathMentor coaches students through problems instead of handing out answers: it asks what they already know, gives progressive hints, checks their answers (with targeted feedback for common mistakes), and shows a fully structured worked solution.

> **Honesty note:** MathMentor is **not** powered by a live AI model. It uses a curated problem bank with hand-written hints and worked solutions, plus deterministic tutoring rules in `app.js`. The audio lessons are ordinary prerecorded MP3 files. The interface says this clearly to students.

---

## Intended users

- Senior high school students (about 16–18 years old) practising General Mathematics, Pre-Calculus, and Statistics & Probability skills.
- Teachers who want a free, ad-free practice tool they can share by link or demo in class.

## Features (implemented)

| Feature | Details |
|---|---|
| Home screen | Name, avatar ("Menti"), welcome text, **Start Learning**, how-it-works, honesty notice, topic cards |
| 6 topics, 24 problems | Functions · Rational Functions · Exponential & Logarithmic · Basic Trigonometry · Sequences & Series · Probability & Statistics — 4 problems each, arranged as 2 "similar pairs" |
| Socratic opener | Each problem opens with a "what do you know?" question and three quick replies |
| Progressive hints | 3 hints per problem, smallest nudge first, then a **Next Step** walkthrough that stops *before* the final answer |
| Answer checking | Accepts equivalent numeric forms: `3/2`, `1.5`, `x = 1.5`, `√3/2`, `5π/6`, `1 + 3/4`; sets in any order (`3, -3`); multiple choice |
| Misconception feedback | Known wrong answers get specific feedback (e.g. "(−2)² was treated as −4") |
| "Very close" | A rounded decimal (0.333 for 1/3) is recognised and the student is asked for the exact value |
| Safe input handling | Letters, division by zero, unbalanced parentheses, √ of negatives → friendly message, never a crash; no `eval()` |
| Worked solutions | Given · Find · Concept · First/Next/Final steps · Final answer · Key idea · Verification · Common mistake |
| Full solution | On request (asks once to try a hint first if nothing was tried) or automatically after a correct answer |
| Similar problem | "Try Another Problem" and a post-solution card link to the paired problem |
| 🎧 Audio lessons | One prerecorded 2–2½-minute lesson per topic, played in a "classroom": a chalkboard that changes with each part of the lesson, Menti with a speaking indicator, Play/Pause, ±10 s, previous/next part, speed 0.75×–1.5×, a seek bar with part markers, and a clickable transcript that highlights what is being said. Lock-screen/headphone controls on phones. Missing audio file → clear message and "read-along" mode |
| Teacher Timing Helper | Open `#/lesson/<topic>/timing`, play your own recording, tap **Mark** at each part, and copy the timings into `lessons.js` |
| Session progress | Attempted · Correct · Hints used · Completed · Audio lessons finished, per-topic bars, header "★ solved" counter |
| Optional saving | "Remember my progress on this device" (off by default, localStorage), two-tap reset |
| Responsive & accessible | Mobile-first, 44px+ touch targets, symbol buttons (/ − √ π ^ ( )), skip link, focus rings, labelled inputs, `aria-live` tutor feed, reduced-motion support, print styles |
| No dependencies | No frameworks, CDNs, fonts, analytics, or API keys. Also works offline by opening `index.html` |

## Screenshots

Add screenshots later in a `screenshots/` folder and reference them here, for example:

```markdown
![Home screen](screenshots/home.png)
![Problem workspace on a phone](screenshots/workspace-phone.png)
```

Tip: on a phone, open the site and take a normal screenshot; on a computer, use your browser's DevTools device toolbar (Ctrl+Shift+M in Chrome) to capture a phone-sized view.

## Project structure

```
mathmentor-ai/
├── index.html          Page skeleton: header, <main id="app">, footer, script tags
├── styles.css          All styling: colours (in :root), layout, components, print
├── app.js              Screens, navigation (#/ addresses), tutoring flow, progress
├── checker.js          Safe answer parser and comparison (no eval)
├── problems.js         Topics + problem bank (the file you edit most)
├── lessons.js          Audio lesson scripts, chalkboard text, and timings
├── audio-lesson.js     The classroom audio player (board/transcript sync)
├── lesson-*.mp3        Prerecorded lesson audio, one per topic (~0.7–0.9 MB each)
├── README.md           This file
├── LICENSE             MIT License
├── .nojekyll           Tells GitHub Pages to serve files as-is
├── tools/
│   └── make_audio.py   Optional: regenerate the synthetic-voice MP3s from lessons.js
└── tests/
    ├── test-cases.md   Manual test checklist with expected results
    └── verify.js       Optional automated checks (needs Node.js)
```

`checker.js` is separate from `app.js` so the answer checker can be tested on its own with Node.js.

## Run it on your computer

No installation needed: **double-click `index.html`** and it opens in your browser.

Optional (closer to how GitHub Pages serves it): in the project folder run `npx serve` (Node.js) and open the address it prints.
Note: Python's `python -m http.server` also works, but it does not support jumping around inside audio, so the lesson seek bar and ⏮ ⏭ buttons may snap back to 0:00 there. Double-clicking `index.html` and GitHub Pages both work correctly.

## How to add a new problem

1. Open `problems.js` and find the `PROBLEMS` list.
2. Copy an existing problem of the same `answerType` and paste it below the others in its topic.
3. Change the fields. The schema is documented at the top of `problems.js`. Key rules:
   - `id` must be unique (e.g. `fn-5`).
   - `acceptedAnswers` holds the correct value as text — `"3/2"` automatically also accepts `1.5`, `x = 1.5`, `6/4`.
   - `hints` must **not** contain the final answer.
   - The **last** item in `solutionSteps` must be the one that states the answer (the Next Step walkthrough stops just before it).
   - `misconceptions` (optional) lists typical wrong answers with feedback.
   - `practiceProblemId` must point to another existing problem.
4. Math formatting helpers: `m("...")` for math, `frac("top", "bottom")` for fractions, `root("3")` for √3, and `<sup>`/`<sub>` for exponents and subscripts. Use the real minus sign `−` for display.
5. Save and refresh the browser. If Node.js is installed, run `node tests/verify.js` (also add an independent check for your new id in that file).

## How to add a new topic

1. Add an entry to `TOPICS` in `problems.js` (`id`, `name`, `icon`, `difficulty`, `description`).
2. For `icon`, reuse an existing icon name or add a new SVG to `TOPIC_ICONS` in `app.js` plus an `.icon-<name>` colour rule in `styles.css`.
3. Add at least three problems with `topic` set to the new topic's `id`.

## How to edit hints and worked solutions

Everything a student reads about a problem lives in that problem's object in `problems.js`: `prompt`, `hints`, `given`, `find`, `concept`, `solutionSteps`, `finalExplanation`, `verification`, `commonMistake`, `misconceptions`. The generic tutor messages (praise, encouragement, reflection replies) live in `app.js` — search for `WRONG_OPENERS` and `addReflectionChoices`.


## Audio lessons

Each topic has a short prerecorded lesson (`#/lesson/<topic>`), reachable from the **🎧 Listen to the Lesson** button on topic cards, the topic page, and the problem workspace. When a student says "I'm not sure where to start," Menti also suggests the lesson.

**About the bundled audio.** The six MP3s were generated offline with [Piper](https://github.com/rhasspy/piper) text-to-speech using its en-US *LibriTTS* voice. It is a natural-sounding **synthetic** voice, and the lesson page says so. The voice was trained on the LibriTTS dataset (CC BY 4.0, <https://www.openslr.org/60/>), so keep the credit line that the lesson page shows.

### Recording your own audio lessons (recommended)

Students respond best to their own teacher's voice. No special tools are needed:

1. Open `lessons.js`. Each lesson's `script` texts are your reading script, in order (they are also shown as the transcript, so if you change a sentence, edit the `script` too).
2. Record yourself reading the whole lesson in one take with your phone's voice recorder or [Audacity](https://www.audacityteam.org/) (free). Pause for about one second between parts.
3. Export as **MP3, mono, 48–64 kbps**. Name it exactly like the existing file (e.g. `lesson-functions.mp3`) and replace that file (it sits next to `index.html`).
4. Open the site at `#/lesson/functions/timing` (add `/timing` to the lesson's address). Press **Play** and tap **Mark** the moment each new part begins.
5. Copy the two lines it produces (`duration: …` and `starts: […]`) into that lesson in `lessons.js`, replacing the old ones.
6. Update `narrator:` in `lessons.js` (e.g. `"Dr. Esquivel"`) so students see who is speaking.

### Adding a lesson for a new topic

Copy one lesson object in `lessons.js`, set `topic` to the new topic's id, write the `segments` (each with `title`, `board` lines, and a `script` written in words — "x squared", not "x²"), record or generate the MP3, then set `duration` and `starts` with the Timing Helper. `node tests/verify.js` checks that the file exists, the timings fit, and the scripts contain no raw math symbols.

### Regenerating the synthetic voice (optional)

If you edit scripts and want new synthetic audio rather than recording yourself: install Python, Node.js, ffmpeg and `pip install piper-tts numpy`, download the voice from the link at the top of `tools/make_audio.py`, then run `python tools/make_audio.py --voice path/to/en-us-libritts-high.onnx`. It rebuilds the MP3s **and** writes the correct `duration`/`starts` into `lessons.js`. (The bundled files took about 6 minutes to generate on an ordinary computer.)

## Testing

**Automated (optional, Node.js 16+):**

```bash
node tests/verify.js
```

It checks the problem bank and audio lessons, **re-computes every answer and every lesson example independently** (e.g. it actually rolls through all 36 dice pairs, and tests that x = 3 is excluded in the rational-equation problem), confirms every misconception is wrong and triggers its feedback, tests accepted equivalent forms, and throws 14 kinds of bad input at the checker.

**Manual:** follow `tests/test-cases.md` on a phone and on a computer.

## Publish free with GitHub Pages

GitHub Pages hosts static websites for free. Your site will be at **`https://YOUR-USERNAME.github.io/mathmentor-ai/`**. All file paths in this project are relative, so they work correctly under the `/mathmentor-ai/` sub-folder.

### Option A — GitHub website only (no Git needed)

1. Sign in at <https://github.com>. Click **+** (top right) → **New repository**.
2. Repository name: `mathmentor-ai`. Visibility: **Public** (required for Pages on a free account). Click **Create repository**.
3. On the new repository page, click **uploading an existing file**.
4. Unzip **`mathmentor-ai-upload.zip`**. It contains only the 16 files the website needs, with **no sub-folders**. Select all of them and drag them into the browser upload area (or click **choose your files** and select them all).
   - Everything the site needs sits next to `index.html`, so there is nothing to put in folders.
   - `index.html` must end up at the **top level** of the repository.
   - `.nojekyll` is a hidden file. If your computer hides it, the site still works without it. To create it on GitHub: **Add file → Create new file**, name it `.nojekyll`, leave it empty, commit.
5. Type a message such as "First version" and click **Commit changes**.
6. Go to **Settings → Pages** (left sidebar).
7. Under **Build and deployment → Source**, choose **Deploy from a branch**. Under **Branch**, choose **main** and **/ (root)**. Click **Save**.
8. Wait 1–3 minutes, then refresh the Pages settings page. It will show **"Your site is live at https://YOUR-USERNAME.github.io/mathmentor-ai/"**. You can also see progress in the repository's **Actions** tab.

#### Optional: adding the `tests` and `tools` folders on the GitHub website

The site does not need them. If you want them in the repository anyway, the GitHub website only uploads into the folder you are currently viewing, so create the folder first:

1. **Add file → Create new file**. In the name box type `tests/` — GitHub turns the slash into a folder — then type `notes.txt`, put any text in it, and **Commit changes**.
2. Open the new `tests` folder, then **Add file → Upload files** and drop in `verify.js` and `test-cases.md` from the full project zip.
3. Repeat with `tools/` for `make_audio.py`.

(Chrome and Edge on a computer can usually drag a whole folder into the upload area; Safari, Firefox, and phones often cannot.)

### Option B — Git command line

```bash
cd mathmentor-ai
git init
git add .
git commit -m "First version of MathMentor"
git branch -M main
git remote add origin https://github.com/YOUR-USERNAME/mathmentor-ai.git
git push -u origin main
```

Then do steps 6–8 above.

### Test on a phone

Open the URL on your phone's browser. Check: topic cards stack in one column; you can tap a hint, type an answer with the symbol buttons, and open the solution without sideways scrolling. Share the link (or turn it into a QR code) for students. Optional: "Add to Home Screen" gives an app-like icon.

### Update the site later

- **Website:** open the file in the repository → pencil icon (✏️) → edit → **Commit changes**. Or **Add file → Upload files** to replace files with new versions of the same name.
- **Git:** `git add . && git commit -m "Describe change" && git push`.

The live site updates within a few minutes. If you don't see changes, hard-refresh (Ctrl+F5, or on a phone close and reopen the tab) — browsers cache files.

### Troubleshooting

| Symptom | Likely cause | Fix |
|---|---|---|
| **404 "There isn't a GitHub Pages site here"** | Pages not enabled yet, or still building | Check Settings → Pages shows the main branch / root; wait a few minutes; check the Actions tab for a failed run |
| 404, but Pages is enabled | `index.html` is inside a sub-folder (e.g. `mathmentor-ai/mathmentor-ai/index.html`) | Move the files to the repository root, or set the Pages folder accordingly |
| **Blank page or "Something didn't load"** | `problems.js`, `checker.js`, or `app.js` is missing or misnamed | File names are case-sensitive on GitHub (`App.js` ≠ `app.js`). Re-upload with exact names |
| Page shows but has no styling | `styles.css` missing or misnamed | Re-upload `styles.css` next to `index.html` |
| Lesson says "audio file couldn't be loaded" | The `lesson-*.mp3` files weren't uploaded, or a name differs (e.g. `Lesson-Trig.mp3`) | Upload the MP3s next to `index.html`; names must match `lessons.js` exactly |
| Old version still shows | Browser cache | Hard-refresh / wait 5 minutes |
| Changed a link to `/styles.css` and it broke | A leading `/` points to the domain root, not your project folder | Keep paths relative: `styles.css`, not `/styles.css` |

To see the real error, open the page on a computer, press **F12** → **Console** tab.

### Important: what "public" means

GitHub Pages serves static files only — there is no server or database. With a public repository, **anyone can read all the source code**, including the answers in `problems.js`. That is fine for a practice tool, but don't use this setup for graded tests, and never put passwords or API keys in these files.

## Accessibility & privacy

- Semantic HTML, a skip link, visible focus indicators, labelled inputs, and keyboard support (Enter submits an answer).
- The tutor conversation is an `aria-live` region; fractions and roots have spoken labels ("3 over 4").
- Animations are disabled when the device's "reduce motion" setting is on.
- Colour contrast meets WCAG AA for text; "not quite" feedback uses warm amber rather than alarming red.
- Audio lessons always have a full text transcript (for deaf/hard-of-hearing students, noisy rooms, or no headphones), adjustable speed, and keyboard-operable controls. The chalkboard does not auto-announce changes to screen readers, so it never talks over the audio.
- **No personal data is collected.** No accounts, names, emails, or school identifiers. No analytics, ads, cookies, or third-party requests. Progress is in memory unless the student turns on saving, which stores only problem ids and counts in that browser's localStorage.

## Current limitations

- **Not generative AI.** The tutor cannot answer free-form questions or solve problems outside the bank.
- **Numeric answers only.** The checker compares numbers; it does not test whether two *algebraic expressions* are equivalent (e.g. `2(x+1)` vs `2x+2`). Problems were chosen so final answers are numbers, sets of numbers, or multiple choice.
- **Audio is synthetic.** The bundled narration is text-to-speech; some words may sound slightly unnatural. Recording your own voice (see above) is the recommended upgrade.
- **Board syncs by section, not by sentence.** Each chalkboard part appears when its section begins; lines within a part appear together.
- **24 problems.** Enough for a demonstration and short practice sessions, not full course coverage.
- **Curriculum alignment not verified.** Topics reflect common senior high school content (General Mathematics, Pre-Calculus, Statistics & Probability) but have not been checked line by line against the DepEd Most Essential Learning Competencies.
- **Answers are visible in the source** to anyone who opens the browser's developer tools.
- Tested in Chromium (desktop and phone-size viewport). Not yet tested on physical iOS/Safari or older Android browsers.

## Possible future improvements (not implemented)

- More problems per topic, and randomised number variants generated from templates.
- Step-level answer checking (students enter intermediate results).
- Topics such as simple & compound interest, logic, and radians.
- KaTeX for more complex notation (would add a dependency; current HTML/CSS math is enough for these problems).
- Captions synced sentence by sentence (WebVTT `<track>`), and Filipino/Tagalog versions of the lessons.
- A teacher page to export a student's session summary (still with no accounts).
- **Optional conversational AI.** A real AI tutor would need a small server (e.g. a serverless function) to keep the API key secret, since anything in a GitHub Pages site is public. It would also add per-use cost, require safety review for minors, and need rules so it hints rather than gives answers. The free version here should stay fully functional without it.

## License

Code: MIT — see `LICENSE`. Replace the placeholder name with your own.
Bundled audio: generated with the Piper LibriTTS voice; the LibriTTS dataset is licensed CC BY 4.0 — keep the attribution shown on the lesson pages.
