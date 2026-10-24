/* =====================================================================
   audio-lesson.js  —  THE "CLASSROOM" AUDIO LESSON PLAYER
   ---------------------------------------------------------------------
   Plays a prerecorded MP3 lesson (see lessons.js) and keeps a chalkboard
   and a transcript in sync with what the narrator is saying.

   app.js calls  MathMentorAudioLesson.render(ctx, lesson, options)
   where `ctx` is a small set of helpers that app.js shares with us
   (show a screen, save progress, the avatar picture, …).

   No AI is involved: the audio is a normal recorded file, and the board
   simply switches section when the audio reaches each `starts` time.
   ===================================================================== */

(function () {
  "use strict";

  // Turn 83.4 seconds into "1:23".
  function formatTime(seconds) {
    if (!isFinite(seconds) || seconds < 0) seconds = 0;
    var m = Math.floor(seconds / 60);
    var s = Math.floor(seconds % 60);
    return m + ":" + (s < 10 ? "0" : "") + s;
  }

  // Which segment is playing at time t? (The last one whose start ≤ t.)
  function segmentAt(starts, t) {
    var index = 0;
    for (var i = 0; i < starts.length; i++) {
      if (t + 0.05 >= starts[i]) index = i; // +0.05 s so a jump lands inside the segment
    }
    return index;
  }

  // If `starts` is missing or the wrong length, spread segments evenly so
  // the lesson still works (the board just won't be perfectly in sync).
  function safeStarts(lesson) {
    var n = lesson.segments.length;
    if (Array.isArray(lesson.starts) && lesson.starts.length === n) return lesson.starts.slice();
    var out = [];
    for (var i = 0; i < n; i++) out.push((lesson.duration || 60) * (i / n));
    return out;
  }

  function render(ctx, lesson, options) {
    var topic = ctx.getTopic(lesson.topic);
    var starts = safeStarts(lesson);
    var segments = lesson.segments;
    var timingMode = !!(options && options.timing);
    var minutes = Math.max(1, Math.round((lesson.duration || 0) / 60));

    // ---- Transcript list: each section is a button that jumps there ----
    var transcriptHtml = segments
      .map(function (seg, i) {
        return (
          '<li><button type="button" class="tx-item" data-index="' + i + '">' +
          '<span class="tx-head"><span class="tx-num">' + (i + 1) + '</span><span class="tx-title">' + seg.title + "</span>" +
          '<span class="tx-time">' + formatTime(starts[i]) + "</span></span>" +
          '<span class="tx-text">' + ctx.escapeHtml(seg.script) + "</span>" +
          "</button></li>"
        );
      })
      .join("");

    // ---- Small marks on the seek bar showing where each section starts ----
    var ticksHtml = starts
      .map(function (s, i) {
        if (i === 0) return "";
        var pct = (s / (lesson.duration || 1)) * 100;
        return '<span class="tick" style="left:' + pct.toFixed(2) + '%"></span>';
      })
      .join("");

    ctx.show(
      '<div class="container page lesson-page">' +
      '<div class="ws-top">' +
      '<a class="back-link" href="#/topic/' + topic.id + '">← ' + topic.name + "</a>" +
      '<a class="back-link subtle" href="#/topics">All topics</a>' +
      "</div>" +

      '<header class="lesson-head">' +
      '<p class="eyebrow dark"><span aria-hidden="true">🎧</span> Audio lesson · prerecorded</p>' +
      "<h1>" + lesson.title + "</h1>" +
      '<p class="lesson-meta">' + topic.name + " · about " + minutes + " min · " + segments.length + " parts</p>" +
      "</header>" +

      '<div class="classroom">' +
      '<div class="class-main">' +

      // The chalkboard
      '<section class="board-frame" aria-labelledby="board-title">' +
      '<div class="board" id="board">' +
      '<div class="board-top"><span id="board-part">Part 1 of ' + segments.length + '</span><span class="chalk-mark" aria-hidden="true">✎</span></div>' +
      '<h2 id="board-title" class="board-title"></h2>' +
      '<ul id="board-lines" class="board-lines"></ul>' +
      "</div>" +
      '<div class="board-ledge" aria-hidden="true"><span class="chalk"></span><span class="chalk c2"></span><span class="eraser"></span></div>' +
      "</section>" +

      // The teacher + audio controls
      '<div class="card player" role="group" aria-label="Lesson audio player">' +
      '<div class="teacher-row" id="teacher-row">' + ctx.avatarSvg(44) +
      '<div class="teacher-text"><strong>Menti</strong><span id="teacher-status">Ready when you are — press Play.</span></div>' +
      '<span class="sound-bars" aria-hidden="true"><i></i><i></i><i></i><i></i></span>' +
      "</div>" +
      '<audio id="lesson-audio" preload="metadata" src="' + lesson.audio + '"></audio>' +
      '<div class="seek-wrap"><div class="ticks" aria-hidden="true">' + ticksHtml + "</div>" +
      '<input type="range" id="seek" class="seek" min="0" max="' + (lesson.duration || 0) + '" step="0.1" value="0" aria-label="Lesson position">' +
      "</div>" +
      '<div class="times"><span id="time-current">0:00</span><span id="time-total">' + formatTime(lesson.duration) + "</span></div>" +
      '<div class="controls">' +
      '<button type="button" class="ctrl" id="prev-part" aria-label="Previous part">⏮</button>' +
      '<button type="button" class="ctrl" id="back-10" aria-label="Back 10 seconds">↺<small>10</small></button>' +
      '<button type="button" class="ctrl play" id="play-btn" aria-label="Play lesson"><span id="play-icon" aria-hidden="true">▶</span></button>' +
      '<button type="button" class="ctrl" id="fwd-10" aria-label="Forward 10 seconds">↻<small>10</small></button>' +
      '<button type="button" class="ctrl" id="next-part" aria-label="Next part">⏭</button>' +
      "</div>" +
      '<div class="player-options">' +
      '<label for="speed">Speed</label>' +
      '<select id="speed"><option value="0.75">0.75×</option><option value="1" selected>1×</option><option value="1.25">1.25×</option><option value="1.5">1.5×</option></select>' +
      "</div>" +
      '<p class="audio-error" id="audio-error" role="alert" hidden></p>' +
      "</div>" +

      '<section class="card lesson-done" id="lesson-done" hidden aria-labelledby="done-title">' +
      '<h2 id="done-title">Lesson complete! 🎉</h2>' +
      "<p>Now try it yourself — the best way to remember a lesson is to use it right away.</p>" +
      '<div class="next-actions">' +
      '<a class="btn btn-accent" href="#/problem/' + ctx.firstUnsolved(topic.id) + '">Practice This Topic →</a>' +
      '<button type="button" class="btn btn-outline" id="replay-btn">Replay lesson</button>' +
      "</div></section>" +
      "</div>" + // .class-main

      // Transcript
      '<section class="card transcript" aria-labelledby="tx-title">' +
      '<h2 id="tx-title">Lesson transcript</h2>' +
      '<p class="fine-print">Read along, or tap a part to jump to it.</p>' +
      '<ol class="tx-list" id="transcript" role="list">' + transcriptHtml + "</ol>" +
      "</section>" +
      "</div>" + // .classroom

      (timingMode ? timingHelperHtml(segments, lesson) : "") +

      '<p class="fine-print credit"><strong>About this audio:</strong> this is a prerecorded lesson played from a file — not a live AI. ' +
      "Narrator: " + ctx.escapeHtml(lesson.narrator || "MathMentor") + ". " +
      (ctx.audioCredit ? ctx.escapeHtml(ctx.audioCredit) : "") +
      "</p>" +
      "</div>",
      lesson.title
    );

    // ---- Grab the elements we need ----
    var audio = document.getElementById("lesson-audio");
    var seek = document.getElementById("seek");
    var playBtn = document.getElementById("play-btn");
    var playIcon = document.getElementById("play-icon");
    var teacherRow = document.getElementById("teacher-row");
    var teacherStatus = document.getElementById("teacher-status");
    var txButtons = document.querySelectorAll(".tx-item");
    var current = -1;          // index of the segment on the board
    var dragging = false;      // true while the student drags the seek bar
    var audioBroken = false;   // true if the MP3 could not be loaded
    var finished = false;

    // ---- Draw one segment on the chalkboard ----
    function showSegment(index, scrollTranscript) {
      if (index === current) return;
      current = index;
      var seg = segments[index];
      document.getElementById("board-part").textContent = "Part " + (index + 1) + " of " + segments.length;
      document.getElementById("board-title").innerHTML = seg.title;
      document.getElementById("board-lines").innerHTML = seg.board
        .map(function (line, i) {
          // --i staggers the "writing" animation line by line
          return '<li style="--i:' + i + '">' + line + "</li>";
        })
        .join("");
      // Highlight the matching transcript part
      txButtons.forEach(function (b, i) {
        if (i === index) b.setAttribute("aria-current", "true");
        else b.removeAttribute("aria-current");
      });
      if (scrollTranscript) {
        var list = document.getElementById("transcript");
        var item = txButtons[index];
        // Scroll inside the transcript box only (not the whole page)
        list.scrollTop = item.parentNode.offsetTop - list.offsetTop - 8;
      }
    }

    // ---- Jump to a segment (works even when the audio is missing) ----
    function goToSegment(index) {
      index = Math.max(0, Math.min(segments.length - 1, index));
      if (!audioBroken) {
        audio.currentTime = starts[index];
        updateTime();
      }
      showSegment(index, true);
    }

    function updateTime() {
      var t = audio.currentTime || 0;
      if (!dragging) seek.value = t;
      document.getElementById("time-current").textContent = formatTime(t);
      seek.setAttribute("aria-valuetext", formatTime(t) + " of " + formatTime(Number(seek.max)));
      showSegment(segmentAt(starts, t), true);
      // While paused part-way through, say so (instead of "press Play" to start).
      if (audio.paused && t > 0 && !audio.ended && !audioBroken) teacherStatus.textContent = "Paused — press Play to continue.";
    }

    function setPlayingLook(playing) {
      playIcon.textContent = playing ? "❚❚" : "▶";
      playBtn.setAttribute("aria-label", playing ? "Pause lesson" : "Play lesson");
      teacherRow.classList.toggle("speaking", playing);
      teacherStatus.textContent = playing ? "Explaining…" : audio.currentTime > 0 ? "Paused — press Play to continue." : "Ready when you are — press Play.";
    }

    // ---- Audio events ----
    audio.addEventListener("loadedmetadata", function () {
      // Use the file's real length (in case lessons.js is slightly off)
      seek.max = audio.duration;
      document.getElementById("time-total").textContent = formatTime(audio.duration);
    });
    audio.addEventListener("timeupdate", function () {
      updateTime();
      if (!finished && audio.duration && audio.currentTime >= audio.duration * 0.95) {
        finished = true;
        ctx.markLessonFinished(lesson.topic);
      }
    });
    audio.addEventListener("play", function () { setPlayingLook(true); });
    audio.addEventListener("pause", function () { setPlayingLook(false); });
    audio.addEventListener("ended", function () {
      setPlayingLook(false);
      teacherStatus.textContent = "That's the end of the lesson!";
      finished = true;
      ctx.markLessonFinished(lesson.topic);
      var done = document.getElementById("lesson-done");
      done.hidden = false;
      done.scrollIntoView({ block: "nearest", behavior: ctx.prefersReducedMotion() ? "auto" : "smooth" });
    });
    // If the MP3 is missing or can't be played, explain and switch to "read along" mode.
    audio.addEventListener("error", function () {
      audioBroken = true;
      var box = document.getElementById("audio-error");
      box.hidden = false;
      box.textContent =
        "The audio file (" + lesson.audio + ") couldn't be loaded. You can still follow the lesson: " +
        "use ⏮ / ⏭ to move through the board, and read the transcript.";
      ["play-btn", "back-10", "fwd-10", "speed"].forEach(function (id) { document.getElementById(id).disabled = true; });
      seek.disabled = true;
      teacherStatus.textContent = "Audio unavailable — reading mode.";
    });

    // ---- Buttons ----
    playBtn.addEventListener("click", function () {
      if (audio.paused) {
        var attempt = audio.play();
        // Some browsers return a Promise that fails if playback is blocked.
        if (attempt && attempt.catch) attempt.catch(function () { teacherStatus.textContent = "Tap Play again to start the audio."; });
      } else {
        audio.pause();
      }
    });
    document.getElementById("back-10").addEventListener("click", function () { audio.currentTime = Math.max(0, audio.currentTime - 10); updateTime(); });
    document.getElementById("fwd-10").addEventListener("click", function () { audio.currentTime = Math.min(audio.duration || Infinity, audio.currentTime + 10); updateTime(); });
    document.getElementById("prev-part").addEventListener("click", function () {
      // Like a music player: if we're >3 s into a part, restart it; otherwise go back one.
      var t = audio.currentTime || 0;
      var target = current;
      if (audioBroken || t - starts[current] < 3) target = current - 1;
      goToSegment(target);
    });
    document.getElementById("next-part").addEventListener("click", function () { goToSegment(current + 1); });
    document.getElementById("speed").addEventListener("change", function (e) { audio.playbackRate = Number(e.target.value); });
    document.getElementById("replay-btn").addEventListener("click", function () {
      document.getElementById("lesson-done").hidden = true;
      goToSegment(0);
      audio.play();
    });

    // Seek bar: update the time shown while dragging, jump when released.
    seek.addEventListener("input", function () {
      dragging = true;
      document.getElementById("time-current").textContent = formatTime(Number(seek.value));
      showSegment(segmentAt(starts, Number(seek.value)), true);
    });
    seek.addEventListener("change", function () {
      dragging = false;
      audio.currentTime = Number(seek.value);
      updateTime();
    });

    txButtons.forEach(function (b) {
      b.addEventListener("click", function () { goToSegment(Number(b.getAttribute("data-index"))); });
    });

    // ---- Lock-screen / headphone controls on phones (where supported) ----
    if ("mediaSession" in navigator && window.MediaMetadata) {
      try {
        navigator.mediaSession.metadata = new window.MediaMetadata({ title: lesson.title, artist: "MathMentor", album: topic.name });
        navigator.mediaSession.setActionHandler("previoustrack", function () { goToSegment(current - 1); });
        navigator.mediaSession.setActionHandler("nexttrack", function () { goToSegment(current + 1); });
      } catch (e) { /* not supported — ignore */ }
    }

    showSegment(0, false);
    if (timingMode) setupTimingHelper(audio, segments, lesson);
  }

  /* =================================================================
     TIMING HELPER (for teachers recording their own voice)
     Open  #/lesson/<topic>/timing , play YOUR recording, and tap
     "Mark" each time a new part begins. Copy the result into lessons.js.
     ================================================================= */
  function timingHelperHtml(segments, lesson) {
    return (
      '<section class="card timing" aria-labelledby="timing-title">' +
      '<h2 id="timing-title">⏱ Timing Helper (for teachers)</h2>' +
      "<ol>" +
      "<li>Save your recording next to <code>index.html</code> with the same file name (e.g. <code>" + lesson.audio + "</code>).</li>" +
      "<li>Press <strong>Play</strong> above. Part 1 starts at 0:00.</li>" +
      "<li>Tap <strong>Mark</strong> the moment each new part begins (" + (segments.length - 1) + " taps).</li>" +
      "<li>Copy the two lines below into this lesson in <code>lessons.js</code>, replacing the old <code>duration</code> and <code>starts</code>.</li>" +
      "</ol>" +
      '<div class="timing-actions">' +
      '<button type="button" class="btn btn-hint" id="mark-btn">Mark start of part 2</button>' +
      '<button type="button" class="btn btn-outline" id="undo-mark">Undo</button>' +
      "</div>" +
      '<label for="timing-output" class="answer-label">Result</label>' +
      '<textarea id="timing-output" class="timing-output" rows="3" readonly></textarea>' +
      '<button type="button" class="btn btn-outline" id="copy-timing">Copy</button> <span id="copy-msg" role="status" class="fine-print"></span>' +
      "</section>"
    );
  }

  function setupTimingHelper(audio, segments, lesson) {
    var marks = [0]; // part 1 starts at the beginning
    var markBtn = document.getElementById("mark-btn");
    var out = document.getElementById("timing-output");

    function refresh() {
      var duration = isFinite(audio.duration) ? Math.round(audio.duration * 100) / 100 : lesson.duration;
      out.value = "duration: " + duration + ",\nstarts: [" + marks.join(", ") + "],";
      if (marks.length < segments.length) {
        markBtn.textContent = "Mark start of part " + (marks.length + 1);
        markBtn.disabled = false;
      } else {
        markBtn.textContent = "All parts marked ✓";
        markBtn.disabled = true;
      }
    }
    markBtn.addEventListener("click", function () {
      marks.push(Math.round(audio.currentTime * 100) / 100);
      refresh();
    });
    document.getElementById("undo-mark").addEventListener("click", function () {
      if (marks.length > 1) marks.pop();
      refresh();
    });
    document.getElementById("copy-timing").addEventListener("click", function () {
      out.select();
      var ok = false;
      try { ok = document.execCommand("copy"); } catch (e) { ok = false; }
      if (navigator.clipboard) navigator.clipboard.writeText(out.value).then(function () { ok = true; }, function () {});
      document.getElementById("copy-msg").textContent = "Copied (or select the text and copy it manually).";
    });
    audio.addEventListener("loadedmetadata", refresh);
    refresh();
  }

  // Share with app.js
  window.MathMentorAudioLesson = { render: render, formatTime: formatTime, segmentAt: segmentAt };
})();
