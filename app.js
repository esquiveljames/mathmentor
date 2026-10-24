/* =====================================================================
   app.js  —  SCREENS, NAVIGATION AND THE TUTORING FLOW
   ---------------------------------------------------------------------
   How this file is organised:
     1. Setup: grab the data, icons, small helpers
     2. Session progress (in memory, optionally saved on this device)
     3. Router: reads the address bar (#/topics, #/problem/fn-1 …)
     4. Screens: Home, Topics, Topic detail, Problem workspace, Progress
     5. Tutoring logic: reflection → hints → steps → check → solution

   IMPORTANT HONESTY NOTE
   This tutor does not call any AI model. Every message it shows comes
   from problems.js or from the fixed rules written in this file.
   ===================================================================== */

(function () {
  "use strict";

  /* =================================================================
     1. SETUP
     ================================================================= */

  var app = document.getElementById("app"); // the <main> element we draw into
  var DATA = window.MathMentorData;          // from problems.js
  var Checker = window.MathChecker;          // from checker.js
  var LESSON_DATA = window.MathMentorLessons;     // from lessons.js (optional)
  var AudioLesson = window.MathMentorAudioLesson; // from audio-lesson.js (optional)

  // If a script file failed to load (wrong file name, missing upload…)
  // show a helpful message instead of a blank page.
  if (!DATA || !Checker) {
    app.innerHTML =
      '<div class="container"><div class="card error-card"><h1>Something didn\'t load</h1>' +
      "<p>The files <code>problems.js</code> and <code>checker.js</code> must be in the same folder as " +
      "<code>index.html</code>. Check that they were uploaded with exactly those names (lower-case).</p></div></div>";
    return;
  }

  // Quick lookups: find a topic or problem by its id.
  function getTopic(id) {
    return DATA.topics.filter(function (t) { return t.id === id; })[0];
  }
  function getProblem(id) {
    return DATA.problems.filter(function (p) { return p.id === id; })[0];
  }
  function problemsInTopic(topicId) {
    return DATA.problems.filter(function (p) { return p.topic === topicId; });
  }
  // The audio lesson for a topic, or undefined if there isn't one.
  // (If lessons.js or audio-lesson.js is missing, lessons simply don't appear.)
  function getLesson(topicId) {
    if (!LESSON_DATA || !AudioLesson) return undefined;
    return LESSON_DATA.lessons.filter(function (l) { return l.topic === topicId; })[0];
  }
  // "about 2 min" label for a lesson
  function lessonMinutes(lesson) {
    return Math.max(1, Math.round((lesson.duration || 0) / 60));
  }

  // Make any text safe to put inside HTML. We use this for ANYTHING the
  // student typed, so their input can never become HTML or code.
  function escapeHtml(text) {
    return String(text)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  // Turn "Intermediate" into a CSS-friendly class like "level-intermediate".
  function levelClass(difficulty) {
    return "level-" + difficulty.toLowerCase();
  }

  // ---- Simple inline SVG icons (no icon library needed) ----
  // Each is drawn on a 24×24 grid using lines and curves.
  var TOPIC_ICONS = {
    functions:
      '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 20 L21 20 M4 21 L4 3" /><path d="M5 18 C9 18 10 6 14 6 S19 9 20 8" /></svg>',
    rational:
      '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M10 3 L10 21 M3 14 L21 14" stroke-dasharray="2 2" /><path d="M12 4 C12 10 14 12 20 12.5 M8 20 C8 16 6 15.5 3 15.5" /></svg>',
    explog:
      '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 20 L21 20 M4 21 L4 3" /><path d="M5 19 C12 19 15 15 19 4" /></svg>',
    trig:
      '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 19 L20 19 L20 5 Z" /><path d="M17 19 L17 16 L20 16" /><path d="M8 19 A5 5 0 0 0 7.2 16.4" /></svg>',
    sequences:
      '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="5" cy="17" r="1.6" /><circle cx="10" cy="13.5" r="1.6" /><circle cx="15" cy="10" r="1.6" /><circle cx="20" cy="6.5" r="1.6" /><path d="M3 21 L21 21" /></svg>',
    probstat:
      '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="4" y="4" width="16" height="16" rx="3.5" /><circle cx="9" cy="9" r="1.2" class="fill" /><circle cx="15" cy="15" r="1.2" class="fill" /><circle cx="15" cy="9" r="1.2" class="fill" /><circle cx="9" cy="15" r="1.2" class="fill" /></svg>'
  };

  // The tutor's avatar: a friendly owl named Menti, drawn in SVG.
  function avatarSvg(size) {
    return (
      '<svg class="avatar" width="' + size + '" height="' + size + '" viewBox="0 0 64 64" aria-hidden="true">' +
      '<defs><linearGradient id="owlg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#7c5cff"/><stop offset="1" stop-color="#14b8a6"/></linearGradient></defs>' +
      '<rect x="2" y="2" width="60" height="60" rx="18" fill="url(#owlg)"/>' +
      '<path d="M16 20 L20 12 L26 18 M48 20 L44 12 L38 18" fill="#fff" opacity=".9"/>' +
      '<ellipse cx="32" cy="38" rx="18" ry="17" fill="#fff" opacity=".18"/>' +
      '<circle cx="24" cy="29" r="8" fill="#fff"/><circle cx="40" cy="29" r="8" fill="#fff"/>' +
      '<circle cx="25" cy="30" r="3.4" fill="#111a44"/><circle cx="41" cy="30" r="3.4" fill="#111a44"/>' +
      '<circle cx="26.2" cy="28.6" r="1.1" fill="#fff"/><circle cx="42.2" cy="28.6" r="1.1" fill="#fff"/>' +
      '<path d="M29 37 L35 37 L32 41 Z" fill="#ffc94d"/>' +
      '<text x="32" y="55" text-anchor="middle" font-size="10" font-family="Georgia, serif" font-style="italic" fill="#fff">π</text>' +
      "</svg>"
    );
  }

  /* =================================================================
     2. SESSION PROGRESS
     -----------------------------------------------------------------
     By default progress lives only in memory and disappears when the
     page is closed. The student can opt in to "Remember my progress on
     this device", which uses the browser's localStorage. We never store
     names, emails, or anything personal — only problem ids and counts.
     ================================================================= */

  var STORAGE_KEY = "mathmentor:progress:v1";
  var REMEMBER_KEY = "mathmentor:remember";

  // A fresh, empty progress record.
  function emptyProgress() {
    return {
      attempted: {}, // problem ids where an answer was checked
      solved: {},    // problem ids answered correctly
      completed: {}, // solved OR full solution studied
      hintsUsed: 0,  // total hints revealed
      lessons: {}    // topic ids whose audio lesson was listened to the end
    };
  }

  // Safely read/write localStorage (it can be blocked in private mode).
  function storageGet(key) {
    try { return window.localStorage.getItem(key); } catch (e) { return null; }
  }
  function storageSet(key, value) {
    try { window.localStorage.setItem(key, value); return true; } catch (e) { return false; }
  }
  function storageRemove(key) {
    try { window.localStorage.removeItem(key); } catch (e) { /* ignore */ }
  }

  var remember = storageGet(REMEMBER_KEY) === "yes";
  var progress = emptyProgress();

  // If the student chose "remember", load what was saved last time.
  if (remember) {
    try {
      var saved = JSON.parse(storageGet(STORAGE_KEY) || "null");
      if (saved && typeof saved === "object") {
        progress.attempted = saved.attempted || {};
        progress.solved = saved.solved || {};
        progress.completed = saved.completed || {};
        progress.hintsUsed = Number(saved.hintsUsed) || 0;
        progress.lessons = saved.lessons || {};
      }
    } catch (e) {
      progress = emptyProgress(); // corrupted data → start fresh
    }
  }

  // Call after every change so the saved copy (if any) stays current.
  function saveProgress() {
    if (remember) storageSet(STORAGE_KEY, JSON.stringify(progress));
    updateHeaderChip();
  }

  function count(map) {
    return Object.keys(map).length;
  }

  // Status of one problem, used for badges.
  function problemStatus(id) {
    if (progress.solved[id]) return "solved";
    if (progress.completed[id]) return "studied";
    if (progress.attempted[id]) return "tried";
    return "new";
  }
  var STATUS_LABEL = { solved: "Solved", studied: "Solution studied", tried: "In progress", new: "Not started" };

  // The first problem in a topic that is not yet solved (or the first one).
  function firstUnsolved(topicId) {
    var list = problemsInTopic(topicId);
    var open = list.filter(function (p) { return !progress.solved[p.id]; });
    return (open[0] || list[0]).id;
  }

  // Small "★ 3 solved" chip in the header.
  function updateHeaderChip() {
    var chip = document.getElementById("progress-chip-count");
    if (chip) chip.textContent = String(count(progress.solved));
  }

  /* =================================================================
     3. ROUTER
     -----------------------------------------------------------------
     The part after "#" in the address decides which screen to show.
     Using "#" means the browser Back button works, and it works on
     GitHub Pages without any server configuration.
     ================================================================= */

  function route() {
    var hash = window.location.hash.replace(/^#\/?/, ""); // "#/topic/trig" → "topic/trig"
    var parts = hash.split("/");

    if (hash === "") return renderHome();
    if (parts[0] === "topics") return renderTopics();
    if (parts[0] === "topic" && getTopic(parts[1])) return renderTopic(parts[1]);
    if (parts[0] === "problem" && getProblem(parts[1])) return renderProblem(parts[1]);
    if (parts[0] === "progress") return renderProgress();
    // "#/lesson/trig" plays the lesson; "#/lesson/trig/timing" adds the teacher Timing Helper
    if (parts[0] === "lesson" && getLesson(parts[1])) return renderLesson(parts[1], parts[2] === "timing");
    return renderNotFound();
  }

  // Draw a screen, scroll to the top, and move keyboard/screen-reader
  // focus to its main heading so users know the page changed.
  var firstRender = true;
  function show(html, title) {
    // Stop any lesson audio that is playing before we replace the screen.
    app.querySelectorAll("audio").forEach(function (a) { a.pause(); });
    app.innerHTML = html;
    document.title = title ? title + " · MathMentor" : "MathMentor — Your Step-by-Step Math Learning Companion";
    window.scrollTo(0, 0);
    var heading = app.querySelector("h1");
    if (heading && !firstRender) {
      heading.setAttribute("tabindex", "-1");
      heading.focus({ preventScroll: true });
    }
    firstRender = false;
    updateNav();
  }

  // Highlight the current item in the top navigation.
  function updateNav() {
    var hash = window.location.hash || "#/";
    document.querySelectorAll(".site-nav a").forEach(function (a) {
      var active =
        (a.getAttribute("href") === "#/topics" && /^#\/(topics|topic|problem|lesson)/.test(hash)) ||
        (a.getAttribute("href") === "#/progress" && hash.indexOf("#/progress") === 0);
      if (active) a.setAttribute("aria-current", "page");
      else a.removeAttribute("aria-current");
    });
  }

  /* =================================================================
     4. SCREENS
     ================================================================= */

  // ---- One topic card (used on Home and Topics screens) ----
  function topicCardHtml(topic) {
    var list = problemsInTopic(topic.id);
    var solved = list.filter(function (p) { return progress.solved[p.id]; }).length;
    var pct = Math.round((solved / list.length) * 100);
    return (
      '<li class="topic-card card">' +
      '<div class="topic-card-head">' +
      '<span class="topic-icon icon-' + topic.icon + '">' + TOPIC_ICONS[topic.icon] + "</span>" +
      '<span class="badge ' + levelClass(topic.difficulty) + '">' + topic.difficulty + "</span>" +
      "</div>" +
      '<h3><a class="stretched" href="#/topic/' + topic.id + '">' + topic.name + "</a></h3>" +
      "<p>" + topic.description + "</p>" +
      '<div class="mini-progress" aria-label="' + solved + " of " + list.length + ' problems solved">' +
      '<div class="bar"><span style="width:' + pct + '%"></span></div>' +
      "<small>" + list.length + " problems · " + solved + " solved</small></div>" +
      '<a class="btn btn-primary btn-block raise" href="#/problem/' + firstUnsolved(topic.id) + '">Practice This Topic</a>' +
      lessonLinkHtml(topic.id, "btn btn-listen btn-block raise") +
      "</li>"
    );
  }

  // "🎧 Listen to the lesson" button (only if the topic has an audio lesson).
  function lessonLinkHtml(topicId, classes) {
    var lesson = getLesson(topicId);
    if (!lesson) return "";
    var done = progress.lessons[topicId] ? ' <span class="listened">✓ listened</span>' : "";
    return (
      '<a class="' + classes + '" href="#/lesson/' + topicId + '"><span aria-hidden="true">🎧</span> Listen to the Lesson ' +
      "<small>(" + lessonMinutes(lesson) + " min)</small>" + done + "</a>"
    );
  }

  function topicGridHtml() {
    return '<ul class="topic-grid" role="list">' + DATA.topics.map(topicCardHtml).join("") + "</ul>";
  }

  // ---- HOME ----
  function renderHome() {
    show(
      '<section class="hero">' +
      '<div class="container hero-inner">' +
      '<div class="hero-text">' +
      '<p class="eyebrow">For Senior High School · Grade 11</p>' +
      "<h1>Math<span>Mentor</span></h1>" +
      '<p class="tagline">Your step-by-step math learning companion.</p>' +
      '<p class="lead">Instead of handing you answers, MathMentor coaches you: it asks what you think, gives small hints when you\'re stuck, checks your work, and explains every step.</p>' +
      '<div class="hero-actions">' +
      '<a class="btn btn-accent btn-lg" href="#/topics">Start Learning</a>' +
      // A button (not a "#how" link), because "#…" addresses are used by the router.
      '<button class="btn btn-ghost btn-lg" type="button" id="how-btn">How it works</button>' +
      "</div></div>" +
      '<div class="hero-art" aria-hidden="true">' +
      '<div class="bubble-card">' + avatarSvg(56) +
      "<div><strong>Menti</strong><p>What do you already know about this problem? Let's start there.</p></div></div>" +
      '<div class="float-eq eq1">log<sub>3</sub> 9 = 2</div>' +
      '<div class="float-eq eq2">a<sub>n</sub> = a<sub>1</sub> + (n − 1)d</div>' +
      '<div class="float-eq eq3">sin 30° = ½</div>' +
      "</div></div></section>" +

      '<div class="container">' +
      '<section id="how" class="how" aria-labelledby="how-title">' +
      '<h2 id="how-title">How MathMentor helps you learn</h2>' +
      '<ol class="steps-grid" role="list">' +
      "<li><span class=\"step-num\">1</span><h3>Listen & think</h3><p>Pick a topic. New to it? Play a short 🎧 audio lesson. Then Menti asks what you already know.</p></li>" +
      "<li><span class=\"step-num\">2</span><h3>Get small hints</h3><p>Stuck? Hints come one at a time, so you do the thinking.</p></li>" +
      "<li><span class=\"step-num\">3</span><h3>Check your answer</h3><p>Type fractions, decimals, √ or π. Common mistakes get specific feedback.</p></li>" +
      "<li><span class=\"step-num\">4</span><h3>Study & practise</h3><p>See the full worked solution, then try a similar problem.</p></li>" +
      "</ol></section>" +

      '<aside class="honesty card" aria-labelledby="honesty-title">' +
      '<h2 id="honesty-title"><span aria-hidden="true">ℹ️</span> How this tutor works</h2>' +
      "<p>MathMentor is <strong>not a live AI chatbot</strong>. It uses a curated bank of problems with hints and worked solutions that were written and checked in advance, plus built-in tutoring rules. The audio lessons are prerecorded files. It works without an account, never asks for your name, and has no ads or tracking.</p>" +
      "</aside>" +

      '<section aria-labelledby="topics-title" class="section">' +
      '<div class="section-head"><h2 id="topics-title">Choose a topic</h2><a href="#/topics">See all topics →</a></div>' +
      topicGridHtml() +
      "</section></div>",
      null
    );

    // "How it works" scrolls down to the explanation section.
    document.getElementById("how-btn").addEventListener("click", function () {
      var section = document.getElementById("how");
      section.scrollIntoView({ behavior: prefersReducedMotion() ? "auto" : "smooth" });
      var title = document.getElementById("how-title");
      title.setAttribute("tabindex", "-1");
      title.focus({ preventScroll: true });
    });
  }

  // ---- ALL TOPICS ----
  function renderTopics() {
    show(
      '<div class="container page">' +
      '<header class="page-head"><h1>Topics</h1>' +
      "<p>Each topic has four carefully checked problems arranged in similar pairs. Start anywhere.</p></header>" +
      topicGridHtml() +
      "</div>",
      "Topics"
    );
  }

  // ---- ONE TOPIC ----
  function renderTopic(topicId) {
    var topic = getTopic(topicId);
    var list = problemsInTopic(topicId);
    var rows = list
      .map(function (p, i) {
        var status = problemStatus(p.id);
        return (
          '<li class="problem-row card">' +
          '<span class="row-num" aria-hidden="true">' + (i + 1) + "</span>" +
          '<div class="row-body"><a class="stretched" href="#/problem/' + p.id + '">' + p.title + "</a>" +
          '<div class="row-meta"><span class="badge ' + levelClass(p.difficulty) + '">' + p.difficulty + "</span>" +
          '<span class="status status-' + status + '">' + STATUS_LABEL[status] + "</span></div></div>" +
          '<span class="row-arrow" aria-hidden="true">→</span></li>'
        );
      })
      .join("");

    show(
      '<div class="container page">' +
      '<a class="back-link" href="#/topics">← Back to Topics</a>' +
      '<header class="topic-hero card">' +
      '<span class="topic-icon big icon-' + topic.icon + '">' + TOPIC_ICONS[topic.icon] + "</span>" +
      "<div><h1>" + topic.name + "</h1><p>" + topic.description + "</p>" +
      '<span class="badge ' + levelClass(topic.difficulty) + '">' + topic.difficulty + "</span></div>" +
      '<div class="hero-buttons">' +
      lessonLinkHtml(topicId, "btn btn-listen") +
      '<a class="btn btn-primary" href="#/problem/' + firstUnsolved(topicId) + '">Practice This Topic</a>' +
      "</div>" +
      "</header>" +
      '<h2 class="list-title">Problems</h2><ol class="problem-list" role="list">' + rows + "</ol>" +
      "</div>",
      topic.name
    );
  }

  // ---- PROGRESS ----
  function renderProgress() {
    var topicRows = DATA.topics
      .map(function (t) {
        var list = problemsInTopic(t.id);
        var solved = list.filter(function (p) { return progress.solved[p.id]; }).length;
        var pct = Math.round((solved / list.length) * 100);
        return (
          '<li class="topic-progress">' +
          '<div class="tp-head"><a href="#/topic/' + t.id + '">' + t.name + "</a><span>" +
          (progress.lessons[t.id] ? '<span class="listened">🎧 ✓</span> ' : "") +
          solved + " / " + list.length + "</span></div>" +
          '<div class="bar" role="progressbar" aria-label="' + t.name + ' problems solved" aria-valuemin="0" aria-valuemax="' + list.length + '" aria-valuenow="' + solved + '"><span style="width:' + pct + '%"></span></div></li>'
        );
      })
      .join("");

    show(
      '<div class="container page">' +
      '<header class="page-head"><h1>Your Progress</h1><p>' +
      (remember ? "Your progress is being remembered on this device." : "This summary covers this visit only. It resets when you close the page.") +
      "</p></header>" +
      '<ul class="stat-grid" role="list">' +
      statTile("Problems attempted", count(progress.attempted), "attempted") +
      statTile("Correct answers", count(progress.solved), "solved") +
      statTile("Hints used", progress.hintsUsed, "hints") +
      statTile("Problems completed", count(progress.completed), "completed") +
      (LESSON_DATA && AudioLesson ? statTile("Audio lessons finished", count(progress.lessons), "lessons") : "") +
      "</ul>" +
      '<p class="fine-print">“Completed” means you solved the problem or studied its full solution.</p>' +
      '<section class="card section-card"><h2>By topic</h2><ul class="topic-progress-list" role="list">' + topicRows + "</ul></section>" +
      '<section class="card section-card settings">' +
      "<h2>Saving & privacy</h2>" +
      '<label class="switch"><input type="checkbox" id="remember-toggle"' + (remember ? " checked" : "") + ">" +
      "<span>Remember my progress on this device</span></label>" +
      '<p class="fine-print">Saved only in this browser (localStorage). Nothing is sent anywhere, and no personal information is collected. Don\'t turn this on if you share this device and want privacy.</p>' +
      '<button class="btn btn-danger-outline" id="reset-btn" type="button">Reset progress</button>' +
      '<p id="reset-msg" class="fine-print" role="status"></p>' +
      "</section></div>",
      "Your Progress"
    );

    // Toggle "remember" on/off.
    document.getElementById("remember-toggle").addEventListener("change", function (e) {
      remember = e.target.checked;
      if (remember) {
        var ok = storageSet(REMEMBER_KEY, "yes");
        saveProgress();
        document.getElementById("reset-msg").textContent = ok
          ? "Okay — your progress will be remembered on this device."
          : "This browser is blocking storage (private mode?), so progress can't be saved.";
      } else {
        storageRemove(REMEMBER_KEY);
        storageRemove(STORAGE_KEY);
        document.getElementById("reset-msg").textContent = "Saving is off, and the saved copy was deleted from this device.";
      }
    });

    // Reset needs two clicks, so it can't happen by accident.
    var armed = false;
    var resetBtn = document.getElementById("reset-btn");
    resetBtn.addEventListener("click", function () {
      if (!armed) {
        armed = true;
        resetBtn.textContent = "Tap again to confirm reset";
        return;
      }
      progress = emptyProgress();
      storageRemove(STORAGE_KEY);
      saveProgress();
      renderProgress();
      document.getElementById("reset-msg").textContent = "Progress reset. Fresh start!";
    });
  }

  function statTile(label, value, kind) {
    return '<li class="stat card stat-' + kind + '"><span class="stat-value">' + value + '</span><span class="stat-label">' + label + "</span></li>";
  }

  // ---- AUDIO LESSON ----
  // The player itself lives in audio-lesson.js; we hand it the helpers it needs.
  function renderLesson(topicId, timingMode) {
    AudioLesson.render(
      {
        show: show,
        getTopic: getTopic,
        avatarSvg: avatarSvg,
        escapeHtml: escapeHtml,
        firstUnsolved: firstUnsolved,
        prefersReducedMotion: prefersReducedMotion,
        audioCredit: LESSON_DATA.credit,
        markLessonFinished: function (id) {
          progress.lessons[id] = true;
          saveProgress();
        }
      },
      getLesson(topicId),
      { timing: timingMode }
    );
  }

  // ---- NOT FOUND ----
  function renderNotFound() {
    show(
      '<div class="container page"><div class="card empty-state">' +
      "<h1>Page not found</h1><p>That link doesn't match any topic or problem. It may have been typed incorrectly.</p>" +
      '<a class="btn btn-primary" href="#/topics">Go to Topics</a></div></div>',
      "Not found"
    );
  }

  /* =================================================================
     5. THE PROBLEM WORKSPACE (the tutoring flow)
     ================================================================= */

  // State for the problem on screen. It is rebuilt from scratch every
  // time a problem opens, so hints never carry over between problems.
  var ws = null;

  function renderProblem(problemId) {
    var p = getProblem(problemId);
    var topic = getTopic(p.topic);
    var list = problemsInTopic(p.topic);
    var index = list.indexOf(p);

    ws = {
      problem: p,
      hintsShown: 0,           // how many hints have been revealed
      stepsShown: 0,           // how many guided steps have been revealed
      guidedSteps: p.solutionSteps.slice(0, -1), // walkthrough stops before the final answer
      attempts: 0,             // wrong/close answers so far
      solved: false,
      solutionShown: false,
      confirmReveal: false,    // true after the first click on "Show Full Solution"
      wrongCount: 0
    };

    // Progress dots: one per problem in this topic.
    var dots = list
      .map(function (q, i) {
        var cls = "dot status-" + problemStatus(q.id) + (i === index ? " current" : "");
        return '<a class="' + cls + '" href="#/problem/' + q.id + '" aria-label="Problem ' + (i + 1) + ": " + escapeHtml(q.title) + " (" + STATUS_LABEL[problemStatus(q.id)] + ')"' + (i === index ? ' aria-current="step"' : "") + "></a>";
      })
      .join("");

    // The answer area depends on the problem type.
    var answerHtml;
    if (p.answerType === "choice") {
      answerHtml =
        '<fieldset class="choices"><legend>Choose your answer</legend>' +
        p.choices
          .map(function (c) {
            return '<label class="choice"><input type="radio" name="choice" value="' + c.id + '"><span>' + escapeHtml(c.text) + "</span></label>";
          })
          .join("") +
        "</fieldset>";
    } else {
      answerHtml =
        '<label for="answer-input" class="answer-label">Your answer</label>' +
        '<input id="answer-input" class="answer-input" type="text" inputmode="text" autocomplete="off" autocapitalize="off" spellcheck="false" ' +
        'placeholder="' + escapeHtml(p.inputHint || "") + '" aria-describedby="answer-help">' +
        '<div class="symbol-bar" role="group" aria-label="Insert a symbol">' +
        ["/", "−", "√", "π", "^", "(", ")"].map(function (s) {
          return '<button type="button" class="sym" data-sym="' + s + '" aria-label="Insert ' + s + '">' + s + "</button>";
        }).join("") +
        "</div>" +
        '<p id="answer-help" class="fine-print">Type fractions like <code>3/4</code>, decimals, <code>√</code> or <code>π</code>. ' +
        (p.answerType === "set" ? "Separate more than one answer with commas." : "One value only.") + "</p>";
    }

    show(
      '<div class="container page workspace">' +
      '<div class="ws-top">' +
      '<a class="back-link" href="#/topic/' + topic.id + '">← ' + topic.name + "</a>" +
      (getLesson(topic.id)
        ? '<a class="back-link subtle" href="#/lesson/' + topic.id + '"><span aria-hidden="true">🎧</span>&nbsp;Audio lesson</a>'
        : '<a class="back-link subtle" href="#/topics">All topics</a>') +
      "</div>" +
      '<div class="ws-progress"><span>Problem ' + (index + 1) + " of " + list.length + '</span><nav class="dots" aria-label="Problems in this topic">' + dots + "</nav></div>" +

      '<div class="ws-grid">' +
      '<div class="ws-main">' +
      '<article class="card problem-card">' +
      '<div class="problem-tags"><span class="badge ' + levelClass(p.difficulty) + '">' + p.difficulty + '</span><span class="topic-tag">' + topic.name + "</span></div>" +
      "<h1>" + p.title + "</h1>" +
      '<div class="question">' + p.question + "</div>" +
      "</article>" +

      '<form class="card answer-card" id="answer-form" novalidate>' +
      answerHtml +
      '<button class="btn btn-primary btn-block" type="submit" id="check-btn">Check My Answer</button>' +
      "</form>" +

      '<div class="actions">' +
      '<button class="btn btn-hint" type="button" id="hint-btn"></button>' +
      '<button class="btn btn-outline" type="button" id="solution-btn">Show Full Solution</button>' +
      '<a class="btn btn-outline" href="#/problem/' + p.practiceProblemId + '" id="another-btn">Try Another Problem</a>' +
      "</div>" +
      "</div>" + // .ws-main

      '<aside class="card tutor-panel" aria-labelledby="tutor-title">' +
      '<div class="tutor-head">' + avatarSvg(40) +
      '<div><h2 id="tutor-title">Menti</h2><p>Your math mentor · built-in tutoring rules</p></div></div>' +
      '<div class="hint-meter" id="hint-meter" aria-hidden="true"></div>' +
      '<ol class="feed" id="feed" aria-live="polite" aria-relevant="additions"></ol>' +
      "</aside>" +
      "</div>" + // .ws-grid

      '<section class="card solution" id="solution" hidden aria-labelledby="solution-title"></section>' +
      '<section class="next-card" id="next-card" hidden aria-label="What to do next"></section>' +
      "</div>",
      p.title
    );

    // ---- Wire up the controls ----
    document.getElementById("answer-form").addEventListener("submit", onCheck);
    document.getElementById("hint-btn").addEventListener("click", onHint);
    document.getElementById("solution-btn").addEventListener("click", onShowSolution);
    app.querySelectorAll(".sym").forEach(function (btn) {
      btn.addEventListener("click", function () { insertSymbol(btn.getAttribute("data-sym")); });
    });

    updateHintButton();

    // ---- Opening message: a Socratic question with quick replies ----
    addTutor("Hi! Let's work through this together. " + p.prompt, "info");
    addReflectionChoices();
  }

  // Insert a symbol from the symbol bar into the answer box at the cursor.
  function insertSymbol(sym) {
    var input = document.getElementById("answer-input");
    if (!input) return;
    var start = input.selectionStart == null ? input.value.length : input.selectionStart;
    var end = input.selectionEnd == null ? input.value.length : input.selectionEnd;
    input.value = input.value.slice(0, start) + sym + input.value.slice(end);
    input.focus();
    input.setSelectionRange(start + sym.length, start + sym.length);
  }

  // ---- The tutor conversation feed ----
  // `html` must be trusted text from problems.js or this file.
  // Student text is added with addStudent(), which escapes it.
  function addTutor(html, kind, label) {
    var feed = document.getElementById("feed");
    if (!feed) return;
    var li = document.createElement("li");
    li.className = "msg tutor msg-" + (kind || "info");
    li.innerHTML = (label ? '<span class="msg-label">' + label + "</span>" : "") + "<div>" + html + "</div>";
    feed.appendChild(li);
    scrollFeed(li);
    return li;
  }

  function addStudent(text) {
    var feed = document.getElementById("feed");
    if (!feed) return;
    var li = document.createElement("li");
    li.className = "msg student";
    li.textContent = text; // textContent = never interpreted as HTML
    feed.appendChild(li);
    scrollFeed(li);
  }

  // Keep the newest message visible: scroll inside the chat box, and
  // scroll the page only if the chat box itself is off-screen.
  function scrollFeed(li) {
    var feed = document.getElementById("feed");
    feed.scrollTop = feed.scrollHeight;
    var box = feed.getBoundingClientRect();
    if (box.bottom > window.innerHeight || box.top < 70) {
      li.scrollIntoView({ block: "nearest", behavior: prefersReducedMotion() ? "auto" : "smooth" });
    }
  }

  function prefersReducedMotion() {
    return window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }

  // Three quick replies to the opening question. These don't change the
  // math — they let the tutor respond to how the student is feeling.
  function addReflectionChoices() {
    var options = [
      { label: "I have an idea", reply: "Great — trust your thinking! Type your answer below and I'll check it." },
      {
        label: "I'm not sure where to start",
        reply:
          "That's completely okay. Tap <strong>Give Me a Hint</strong> and I'll give you a small nudge — not the whole answer." +
          (getLesson(ws.problem.topic)
            ? ' Or, if the whole topic feels new, listen to the short <a href="#/lesson/' + ws.problem.topic + '">🎧 audio lesson</a> first.'
            : "")
      },
      { label: "I already tried something", reply: "Nice — trying first is exactly what good problem-solvers do. Enter your answer and I'll tell you how it went." }
    ];
    var li = addTutor("", "chips");
    var wrap = li.querySelector("div");
    wrap.className = "chips";
    options.forEach(function (opt) {
      var b = document.createElement("button");
      b.type = "button";
      b.className = "chip";
      b.textContent = opt.label;
      b.addEventListener("click", function () {
        li.remove();                // the chips disappear once used
        addStudent(opt.label);
        addTutor(opt.reply, "info");
      });
      wrap.appendChild(b);
    });
  }

  // ---- Hint / Next Step button ----
  // Hints come first. When they run out, the same button walks through
  // the worked steps one by one — stopping before the final answer.
  function updateHintButton() {
    var btn = document.getElementById("hint-btn");
    var meter = document.getElementById("hint-meter");
    var p = ws.problem;
    var totalHints = p.hints.length;

    if (ws.hintsShown < totalHints) {
      btn.innerHTML = "💡 Give Me a Hint <small>(" + (totalHints - ws.hintsShown) + " left)</small>";
      btn.disabled = false;
    } else if (ws.stepsShown < ws.guidedSteps.length) {
      btn.innerHTML = "👣 Next Step <small>(" + (ws.stepsShown + 1) + " of " + ws.guidedSteps.length + ")</small>";
      btn.disabled = false;
    } else {
      btn.innerHTML = "✔ All steps shown";
      btn.disabled = true;
    }

    // Visual meter: one pip per hint.
    var pips = "";
    for (var i = 0; i < totalHints; i++) pips += '<span class="pip' + (i < ws.hintsShown ? " used" : "") + '"></span>';
    meter.innerHTML = "<span>Hints</span>" + pips;
  }

  function onHint() {
    var p = ws.problem;
    if (ws.hintsShown < p.hints.length) {
      ws.hintsShown++;
      progress.hintsUsed++;
      saveProgress();
      addTutor(p.hints[ws.hintsShown - 1], "hint", "Hint " + ws.hintsShown + " of " + p.hints.length);
      if (ws.hintsShown === p.hints.length && !ws.solved) {
        addTutor("That was my last hint. If you'd like, tap <strong>Next Step</strong> and we'll walk through the solution together, one step at a time.", "info");
      }
    } else if (ws.stepsShown < ws.guidedSteps.length) {
      ws.stepsShown++;
      addTutor(ws.guidedSteps[ws.stepsShown - 1], "step", "Step " + ws.stepsShown);
      if (ws.stepsShown === ws.guidedSteps.length && !ws.solved) {
        addTutor("You're one step from the end! Finish it yourself and type the final answer above. 💪", "info");
      }
    }
    updateHintButton();
  }

  // ---- Check My Answer ----
  var WRONG_OPENERS = ["Not quite yet — and that's okay.", "Good effort, but that's not it yet.", "Hmm, let's take another look."];

  function onCheck(event) {
    event.preventDefault(); // stop the form from reloading the page
    var p = ws.problem;

    // Read the student's answer.
    var input;
    var shown;
    if (p.answerType === "choice") {
      var picked = app.querySelector('input[name="choice"]:checked');
      input = picked ? picked.value : "";
      shown = picked ? p.choices.filter(function (c) { return c.id === input; })[0].text : "";
    } else {
      input = document.getElementById("answer-input").value;
      shown = input.trim();
    }

    var result = Checker.check(p, input);

    // Couldn't read it → explain, but don't count it as an attempt.
    if (result.status === "invalid") {
      addTutor(escapeHtml(result.message), "invalid");
      return;
    }

    addStudent("My answer: " + shown);
    progress.attempted[p.id] = true;

    if (result.status === "correct") {
      var firstTime = !ws.solved;
      ws.solved = true;
      progress.solved[p.id] = true;
      progress.completed[p.id] = true;
      saveProgress();
      var praise = "<strong>Correct! 🎉</strong> " + escapeHtml(p.answer) + " is right.";
      if (firstTime && ws.hintsShown === 0 && ws.wrongCount === 0) praise += " You solved it on your own — excellent work!";
      else if (firstTime && ws.wrongCount > 0) praise += " You kept going until you got it — that's how real learning happens.";
      addTutor(praise + " I've opened the full worked solution below so you can compare it with your thinking.", "correct");
      revealSolution();
      return;
    }

    // Wrong or close.
    ws.attempts++;
    saveProgress();

    if (result.status === "close") {
      addTutor(escapeHtml(result.message), "close");
      return;
    }

    ws.wrongCount++;
    var opener = WRONG_OPENERS[(ws.wrongCount - 1) % WRONG_OPENERS.length];
    var advice;
    if (result.message) {
      advice = escapeHtml(result.message); // targeted feedback for a known mistake
    } else if (ws.wrongCount === 1) {
      advice = "Recheck each step carefully — small sign or arithmetic slips are common.";
    } else if (ws.hintsShown < p.hints.length) {
      advice = "A hint might help you spot the issue. Tap <strong>Give Me a Hint</strong>.";
    } else {
      advice = "Keep at it! You can also use <strong>Next Step</strong>, or open the full solution and study it.";
    }
    if (ws.wrongCount >= 3 && !ws.solutionShown) {
      advice += " You're being persistent — that's what good mathematicians do. The full solution is available whenever you want it.";
    }
    addTutor("<strong>" + opener + "</strong> " + advice, "incorrect");
  }

  // ---- Show Full Solution ----
  function onShowSolution() {
    var btn = document.getElementById("solution-btn");
    // If the student hasn't tried anything yet, gently suggest a hint
    // first. A second tap shows the solution anyway — it's their choice.
    var triedNothing = ws.hintsShown === 0 && ws.attempts === 0 && !ws.solved;
    if (triedNothing && !ws.confirmReveal && !ws.solutionShown) {
      ws.confirmReveal = true;
      btn.textContent = "Yes, Show Solution";
      addTutor("Before I show everything — want to try one hint first? Struggling a little is what makes learning stick. If you'd still like the full solution, tap <strong>Yes, Show Solution</strong>.", "info");
      return;
    }
    revealSolution();
    if (!ws.solved) addTutor("Here's the full solution below. Study it, then try a similar problem on your own to lock it in.", "info");
  }

  // Build and show the structured worked solution.
  function revealSolution() {
    var p = ws.problem;
    var box = document.getElementById("solution");
    var firstReveal = !ws.solutionShown;
    ws.solutionShown = true;
    progress.completed[p.id] = true;
    saveProgress();

    var steps = p.solutionSteps
      .map(function (s, i) {
        var label = i === 0 ? "First step" : i === p.solutionSteps.length - 1 ? "Final step" : "Next step";
        return '<li><span class="step-label">' + label + "</span>" + s + "</li>";
      })
      .join("");

    box.innerHTML =
      '<h2 id="solution-title">Worked Solution</h2>' +
      '<dl class="sol-grid">' +
      "<div><dt>What is given?</dt><dd>" + p.given + "</dd></div>" +
      "<div><dt>What are we trying to find?</dt><dd>" + p.find + "</dd></div>" +
      '<div class="span-2"><dt>Which concept applies?</dt><dd>' + p.concept + "</dd></div>" +
      "</dl>" +
      '<h3>Step by step</h3><ol class="sol-steps">' + steps + "</ol>" +
      '<div class="final-answer"><span>Final answer</span><strong>' + escapeHtml(p.answer) + "</strong></div>" +
      '<p class="key-idea"><strong>Key idea:</strong> ' + p.finalExplanation + "</p>" +
      '<div class="callouts">' +
      '<div class="callout verify"><h4>✅ How can we verify it?</h4><p>' + p.verification + "</p></div>" +
      '<div class="callout mistake"><h4>⚠️ Common mistake to avoid</h4><p>' + p.commonMistake + "</p></div>" +
      "</div>";
    box.hidden = false;

    document.getElementById("solution-btn").textContent = "Solution shown below";
    document.getElementById("solution-btn").disabled = true;

    showNextCard();
    if (firstReveal) box.scrollIntoView({ block: "start", behavior: prefersReducedMotion() ? "auto" : "smooth" });
  }

  // After finishing: offer a similar problem, the next one, or topics.
  function showNextCard() {
    var p = ws.problem;
    var similar = getProblem(p.practiceProblemId);
    var list = problemsInTopic(p.topic);
    var next = list[(list.indexOf(p) + 1) % list.length];
    var card = document.getElementById("next-card");
    card.innerHTML =
      '<div class="card next-inner">' +
      "<div><p class=\"eyebrow dark\">Keep the momentum</p><h2>Try a similar problem</h2>" +
      "<p>Practising a close cousin of this problem is the fastest way to make the idea stick.</p></div>" +
      '<div class="next-actions">' +
      '<a class="btn btn-accent" href="#/problem/' + similar.id + '">' + similar.title + " →</a>" +
      (next.id !== similar.id ? '<a class="btn btn-outline" href="#/problem/' + next.id + '">Next in topic</a>' : "") +
      '<a class="btn btn-outline" href="#/topics">Back to Topics</a>' +
      "</div></div>";
    card.hidden = false;
  }

  /* =================================================================
     START THE APP
     ================================================================= */
  window.addEventListener("hashchange", route);

  // "Skip to main content" link for keyboard users. We handle it in
  // JavaScript because "#…" addresses are reserved for the router.
  var skip = document.querySelector(".skip-link");
  if (skip) {
    skip.addEventListener("click", function (e) {
      e.preventDefault();
      app.focus();
    });
  }

  updateHeaderChip();
  route();
})();
