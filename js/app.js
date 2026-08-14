/* ==============================================================
   NOOR-UL-QURAN — app.js
   Talks to the free AlQuran Cloud API (api.alquran.cloud) for
   Surah / Juz (Para) text, translation and recitation audio,
   and the AlAdhan API (api.aladhan.com) for the 99 Names of Allah.
   Bookmarks, last-read position, theme and Tasbih counts are
   stored locally on the visitor's own device (localStorage) —
   nothing is sent to a server.
   ============================================================== */
(function () {
  "use strict";

  const API = "https://api.alquran.cloud/v1";
  const NAMES_API = "https://api.aladhan.com/v1/asmaAlHusna";
  const EDITIONS = "quran-uthmani,en.sahih,ar.alafasy"; // arabic, translation, audio

  // The 30 Para (Juz) names, by the opening word(s) of each part —
  // the traditional way Para are referred to in the Muslim world.
  const PARA_NAMES = [
    { ar: "\u0627\u0644\u0645", translit: "Alif Laam Meem" },
    { ar: "\u0633\u064a\u0642\u0648\u0644 \u0627\u0644\u0633\u0641\u0647\u0627\u0621", translit: "Sayaqool" },
    { ar: "\u062a\u0644\u0643 \u0627\u0644\u0631\u0633\u0644", translit: "Tilkar Rusul" },
    { ar: "\u0644\u0646 \u062a\u0646\u0627\u0644\u0648\u0627", translit: "Lan Tanaaloo" },
    { ar: "\u0648\u0627\u0644\u0645\u062d\u0635\u0646\u0627\u062a", translit: "Wal Muhsanat" },
    { ar: "\u0644\u0627 \u064a\u062d\u0628 \u0627\u0644\u0644\u0647", translit: "La Yuhibbullah" },
    { ar: "\u0648\u0625\u0630\u0627 \u0633\u0645\u0639\u0648\u0627", translit: "Wa Idha Sami'u" },
    { ar: "\u0648\u0644\u0648 \u0623\u0646\u0646\u0627", translit: "Wa Lau Annana" },
    { ar: "\u0642\u0627\u0644 \u0627\u0644\u0645\u0644\u0623", translit: "Qalal Mala" },
    { ar: "\u0648\u0627\u0639\u0644\u0645\u0648\u0627", translit: "Wa A'lamu" },
    { ar: "\u064a\u0639\u062a\u0630\u0631\u0648\u0646", translit: "Ya'tadhiruna" },
    { ar: "\u0648\u0645\u0627 \u0645\u0646 \u062f\u0627\u0628\u0629", translit: "Wa Ma Min Dabbah" },
    { ar: "\u0648\u0645\u0627 \u0623\u0628\u0631\u0626", translit: "Wa Ma Ubarri'u" },
    { ar: "\u0631\u0628\u0645\u0627", translit: "Rubama" },
    { ar: "\u0633\u0628\u062d\u0627\u0646 \u0627\u0644\u0630\u064a", translit: "Subhanalladhi" },
    { ar: "\u0642\u0627\u0644 \u0623\u0644\u0645", translit: "Qal Alam" },
    { ar: "\u0627\u0642\u062a\u0631\u0628 \u0644\u0644\u0646\u0627\u0633", translit: "Iqtaraba" },
    { ar: "\u0642\u062f \u0623\u0641\u0644\u062d", translit: "Qad Aflaha" },
    { ar: "\u0648\u0642\u0627\u0644 \u0627\u0644\u0630\u064a\u0646", translit: "Wa Qalalladhina" },
    { ar: "\u0623\u0645\u0646 \u062e\u0644\u0642", translit: "Amman Khalaqa" },
    { ar: "\u0627\u062a\u0644 \u0645\u0627 \u0623\u0648\u062d\u064a", translit: "Utlu Ma Oohiya" },
    { ar: "\u0648\u0645\u0646 \u064a\u0642\u0646\u062a", translit: "Wa Man Yaqnut" },
    { ar: "\u0648\u0645\u0627\u0644\u064a", translit: "Wa Mali" },
    { ar: "\u0641\u0645\u0646 \u0623\u0638\u0644\u0645", translit: "Faman Adhlam" },
    { ar: "\u0625\u0644\u064a\u0647 \u064a\u0631\u062f", translit: "Ilayhi Yuraddu" },
    { ar: "\u062d\u0645", translit: "Ha Meem" },
    { ar: "\u0642\u0627\u0644 \u0641\u0645\u0627 \u062e\u0637\u0628\u0643\u0645", translit: "Qala Fama Khatbukum" },
    { ar: "\u0642\u062f \u0633\u0645\u0639 \u0627\u0644\u0644\u0647", translit: "Qad Sami Allah" },
    { ar: "\u062a\u0628\u0627\u0631\u0643 \u0627\u0644\u0630\u064a", translit: "Tabarakalladhi" },
    { ar: "\u0639\u0645", translit: "Amma" },
  ];

  const el = (sel, ctx) => (ctx || document).querySelector(sel);
  const els = (sel, ctx) => Array.from((ctx || document).querySelectorAll(sel));

  const audioPlayer = el("#audioPlayer");
  let currentPlayBtn = null;

  // simple in-memory caches so re-visiting a Surah/Para doesn't refetch
  const cache = { surahList: null, surah: {}, juz: {}, names: null };

  // Home is always public. Everything else — actual Qur'an/dua content —
  // requires signing up or logging in first.
  const PROTECTED_VIEWS = ["surahs", "paras", "reader", "durood", "kursi", "quls", "names", "tasbih", "saved"];
  let pendingView = null; // where to go once the visitor logs in

  /* ---------------------------------------------------------
     Local storage helpers
  --------------------------------------------------------- */
  const store = {
    get(key, fallback) {
      try {
        const raw = localStorage.getItem(key);
        return raw ? JSON.parse(raw) : fallback;
      } catch (e) {
        return fallback;
      }
    },
    set(key, value) {
      try {
        localStorage.setItem(key, JSON.stringify(value));
      } catch (e) {
        /* storage unavailable — fail silently, app still works */
      }
    },
  };

  /* ---------------------------------------------------------
     Toast
  --------------------------------------------------------- */
  let toastTimer = null;
  function showToast(msg, duration) {
    const t = el("#toast");
    t.textContent = msg;
    t.classList.add("is-visible");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => t.classList.remove("is-visible"), duration || 2200);
  }

  /* ---------------------------------------------------------
     Theme (light / dark)
  --------------------------------------------------------- */
  function applyTheme(mode) {
    document.documentElement.setAttribute("data-theme", mode);
    store.set("noor-theme", mode);
  }
  (function initTheme() {
    const saved = store.get("noor-theme", null);
    applyTheme(saved === "dark" ? "dark" : "light");
  })();
  el("#themeToggle").addEventListener("click", () => {
    const current = document.documentElement.getAttribute("data-theme");
    applyTheme(current === "dark" ? "light" : "dark");
  });

  /* ---------------------------------------------------------
     Navigation
  --------------------------------------------------------- */
  function showView(name) {
    if (PROTECTED_VIEWS.includes(name) && !getSession()) {
      openAuthGate(name);
      return;
    }
    closeAuthGate();

    els(".view").forEach((v) => (v.hidden = v.dataset.view !== name));
    els(".nav-link").forEach((b) =>
      b.classList.toggle("is-active", b.dataset.nav === name)
    );
    el("#mobileNav").classList.remove("is-open");
    el("#menuToggle").setAttribute("aria-expanded", "false");
    window.scrollTo({ top: 0, behavior: "smooth" });

    if (name === "surahs" && !cache.surahList) loadSurahList();
    if (name === "paras") renderParaGrid();
    if (name === "kursi") loadKursi();
    if (name === "quls") loadQuls();
    if (name === "names") loadNames();
    if (name === "tasbih") initTasbih();
    if (name === "saved") renderSaved();
  }

  document.addEventListener("click", (e) => {
    const navBtn = e.target.closest("[data-nav]");
    if (navBtn) {
      e.preventDefault();
      showView(navBtn.dataset.nav);
    }
  });

  el("#menuToggle").addEventListener("click", () => {
    const nav = el("#mobileNav");
    const open = nav.classList.toggle("is-open");
    el("#menuToggle").setAttribute("aria-expanded", String(open));
  });

  el("#readerBack").addEventListener("click", () => history.back());

  window.addEventListener("hashchange", routeFromHash);
  function routeFromHash() {
    const h = location.hash.replace("#", "");
    if (!h) return showView("home");
    if (h.startsWith("surah/")) return openSurah(Number(h.split("/")[1]));
    if (h.startsWith("para/")) return openPara(Number(h.split("/")[1]));
    if (["home", "surahs", "paras", "durood", "kursi", "quls", "names", "tasbih", "saved"].includes(h))
      return showView(h);
    showView("home");
  }

  /* ---------------------------------------------------------
     Bookmarks (Saved Verses)
  --------------------------------------------------------- */
  function bookmarkId(b) {
    return `${b.refType}-${b.refNum}-${b.num}`;
  }
  function getBookmarks() {
    return store.get("noor-bookmarks", []);
  }
  function isBookmarked(b) {
    const list = getBookmarks();
    return list.some((x) => bookmarkId(x) === bookmarkId(b));
  }
  function toggleBookmark(b, btn) {
    let list = getBookmarks();
    const id = bookmarkId(b);
    if (list.some((x) => bookmarkId(x) === id)) {
      list = list.filter((x) => bookmarkId(x) !== id);
      btn.classList.remove("is-saved");
      showToast("Removed from Saved Verses");
    } else {
      list.push(b);
      btn.classList.add("is-saved");
      showToast("Saved for later");
    }
    store.set("noor-bookmarks", list);
  }
  function renderSaved() {
    const wrap = el("#savedList");
    const list = getBookmarks();
    if (!list.length) {
      wrap.innerHTML = `<p class="loader">No saved verses yet &mdash; tap the bookmark icon on any verse while reading to add it here.</p>`;
      return;
    }
    wrap.innerHTML = list
      .slice()
      .reverse()
      .map((b) => verseCard(b, { savedView: true }))
      .join("");
    wireVerseButtons(wrap);
  }

  /* ---------------------------------------------------------
     Audio playback (single shared <audio> element)
  --------------------------------------------------------- */
  function wireAudioButtons(container) {
    els(".play-btn", container).forEach((btn) => {
      btn.addEventListener("click", () => {
        const url = btn.dataset.audio;
        if (!url) return;

        if (currentPlayBtn === btn && !audioPlayer.paused) {
          audioPlayer.pause();
          btn.classList.remove("is-playing");
          currentPlayBtn = null;
          return;
        }
        if (currentPlayBtn) currentPlayBtn.classList.remove("is-playing");

        audioPlayer.src = url;
        audioPlayer.play().catch(() => {});
        btn.classList.add("is-playing");
        currentPlayBtn = btn;
      });
    });
  }
  audioPlayer.addEventListener("ended", () => {
    if (currentPlayBtn) currentPlayBtn.classList.remove("is-playing");
    currentPlayBtn = null;
  });

  function wireBookmarkButtons(container) {
    els(".bookmark-btn", container).forEach((btn) => {
      const data = JSON.parse(btn.dataset.verse);
      if (isBookmarked(data)) btn.classList.add("is-saved");
      btn.addEventListener("click", () => {
        toggleBookmark(data, btn);
        if (el("#view-saved") && !el("#view-saved").hidden) renderSaved();
      });
    });
  }
  function wireVerseButtons(container) {
    wireAudioButtons(container);
    wireBookmarkButtons(container);
  }

  /* ---------------------------------------------------------
     Helpers
  --------------------------------------------------------- */
  function playIcon() {
    return '<svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>';
  }
  function bookmarkIcon() {
    return '<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M6 3h12v18l-6-4.5L6 21V3Z"/></svg>';
  }

  /* ---------------------------------------------------------
     Shared Arabic text-to-speech helper.
     There's no verified, individually-addressable free audio
     API for the 99 Names or for Durood (unlike the Qur'an, which
     has the AlQuran Cloud recitation edition) — so this reads
     the text aloud using the device's own speech engine.

     Two real-world quirks this works around:
     1. Voices load asynchronously and inconsistently across
        browsers, so this waits for the voice list and retries once.
     2. Chrome has a long-standing bug where a SINGLE long utterance
        (Durood Paak is ~280 characters — much longer than any one
        Name of Allah) silently stalls after several seconds instead
        of finishing. Splitting long text into sentence-sized chunks
        and speaking them as a queued chain avoids that stall.
  --------------------------------------------------------- */
  let cachedVoices = [];
  function loadVoices() {
    if (!("speechSynthesis" in window)) return;
    cachedVoices = speechSynthesis.getVoices();
    speechSynthesis.onvoiceschanged = () => {
      cachedVoices = speechSynthesis.getVoices();
    };
  }
  loadVoices();

  let keepAliveTimer = null;
  function startKeepAlive() {
    stopKeepAlive();
    // Chrome silently stops speaking after ~15s unless nudged.
    keepAliveTimer = setInterval(() => {
      if (speechSynthesis.speaking) {
        speechSynthesis.pause();
        speechSynthesis.resume();
      }
    }, 12000);
  }
  function stopKeepAlive() {
    if (keepAliveTimer) clearInterval(keepAliveTimer);
    keepAliveTimer = null;
  }

  function speakArabic(text, btn) {
    if (!("speechSynthesis" in window)) {
      showToast("This device/browser doesn't support spoken recitation.", 4200);
      return;
    }
    // Toggle off if this exact button is already speaking.
    if (btn.classList.contains("is-playing")) {
      speechSynthesis.cancel();
      stopKeepAlive();
      btn.classList.remove("is-playing");
      return;
    }
    els(".play-btn.is-playing").forEach((b) => b.classList.remove("is-playing"));
    speechSynthesis.cancel();
    stopKeepAlive();

    // Break long text into sentence-sized chunks (on Arabic/Latin
    // full stops) so no single utterance is long enough to trigger
    // the Chrome stall bug.
    const chunks = String(text)
      .split(/(?<=[.\u06D4])\s+/)
      .map((s) => s.trim())
      .filter(Boolean);
    if (!chunks.length) chunks.push(text);

    const attempt = (voices) => {
      const arabicVoice = voices.find((v) => v.lang && v.lang.toLowerCase().startsWith("ar"));
      let started = false;
      let index = 0;

      const speakNext = () => {
        if (index >= chunks.length) {
          btn.classList.remove("is-playing");
          stopKeepAlive();
          return;
        }
        try {
          const utter = new SpeechSynthesisUtterance(chunks[index]);
          if (arabicVoice) utter.voice = arabicVoice;
          utter.lang = "ar-SA";
          utter.rate = 0.8;
          utter.volume = 1;
          utter.onstart = () => {
            started = true;
            btn.classList.add("is-playing");
            startKeepAlive();
          };
          utter.onend = () => {
            index += 1;
            speakNext();
          };
          utter.onerror = () => {
            btn.classList.remove("is-playing");
            stopKeepAlive();
            showToast("This device couldn't play the recitation. Try a different browser.", 4200);
          };
          speechSynthesis.speak(utter);
        } catch (e) {
          btn.classList.remove("is-playing");
          stopKeepAlive();
          showToast("This device couldn't play the recitation. Try a different browser.", 4200);
        }
      };

      speakNext();

      // Give the engine a generous window to actually start before
      // deciding it silently failed (slow devices can take a moment).
      setTimeout(() => {
        if (!started && !speechSynthesis.speaking) {
          btn.classList.remove("is-playing");
          if (!arabicVoice) {
            showToast("No Arabic voice found on this device — install one in your system's language/speech settings for recitation.", 4800);
          } else {
            showToast("This device couldn't play the recitation. Try a different browser.", 4200);
          }
        }
      }, 1200);
    };

    const voicesNow = cachedVoices.length ? cachedVoices : speechSynthesis.getVoices();
    if (voicesNow.length) {
      attempt(voicesNow);
    } else {
      // Voices not loaded yet — wait briefly for the voiceschanged event.
      setTimeout(() => attempt(cachedVoices.length ? cachedVoices : speechSynthesis.getVoices()), 200);
    }
  }

  function verseCard(v, opts) {
    opts = opts || {};
    const { num, arabic, translation, audio, refType, refNum, refLabel } = v;
    const data = { num, arabic, translation, audio, refType, refNum, refLabel };
    return `
      <article class="verse-card">
        <div class="verse-top">
          <span class="verse-num">${refLabel ? refLabel : num}</span>
          <div class="verse-actions">
            ${audio ? `<button class="play-btn" data-audio="${audio}" aria-label="Play recitation">${playIcon()}</button>` : ""}
            <button class="bookmark-btn" data-verse='${JSON.stringify(data).replace(/'/g, "&#39;")}' aria-label="Bookmark this verse">${bookmarkIcon()}</button>
          </div>
        </div>
        <p class="verse-arabic" lang="ar" dir="rtl">${arabic}</p>
        <p class="verse-translation">${translation}</p>
        ${opts.savedView ? `<p class="verse-note">${refLabel}</p>` : ""}
      </article>`;
  }

  function surahMetaLine(s) {
    return `${s.revelationType} &middot; ${s.numberOfAyahs} verses`;
  }

  /* ---------------------------------------------------------
     Surah list
  --------------------------------------------------------- */
  async function loadSurahList() {
    const grid = el("#surahGrid");
    try {
      const res = await fetch(`${API}/surah`);
      const json = await res.json();
      cache.surahList = json.data;
      renderSurahGrid(cache.surahList);
    } catch (err) {
      grid.innerHTML = `<p class="loader">Couldn't reach the Qur'an library. Please check your connection and try again.</p>`;
    }
  }

  function renderSurahGrid(list) {
    const grid = el("#surahGrid");
    if (!list.length) {
      grid.innerHTML = `<p class="loader">No Surah matches that search.</p>`;
      return;
    }
    grid.innerHTML = list
      .map(
        (s) => `
      <a class="surah-card" href="#surah/${s.number}">
        <span class="surah-badge">${s.number}</span>
        <span class="surah-info">
          <span class="surah-en">${s.englishName}</span>
          <span class="surah-meta">${s.englishNameTranslation} &middot; ${surahMetaLine(s)}</span>
        </span>
        <span class="surah-ar" lang="ar" dir="rtl">${s.name}</span>
      </a>`
      )
      .join("");
  }

  el("#surahSearch").addEventListener("input", (e) => {
    if (!cache.surahList) return;
    const q = e.target.value.trim().toLowerCase();
    const filtered = cache.surahList.filter(
      (s) =>
        s.englishName.toLowerCase().includes(q) ||
        s.englishNameTranslation.toLowerCase().includes(q) ||
        String(s.number).includes(q)
    );
    renderSurahGrid(filtered);
  });

  /* ---------------------------------------------------------
     Para (Juz) list — static 1..30
  --------------------------------------------------------- */
  function renderParaGrid() {
    const grid = el("#paraGrid");
    if (grid.dataset.rendered) return;
    grid.innerHTML = Array.from({ length: 30 }, (_, i) => i + 1)
      .map((n) => {
        const name = PARA_NAMES[n - 1];
        return `
      <a class="para-card" href="#para/${n}">
        <span class="para-num">${n}</span>
        <span class="para-name-ar" lang="ar" dir="rtl">${name.ar}</span>
        <span class="para-label">${name.translit}</span>
      </a>`;
      })
      .join("");
    grid.dataset.rendered = "true";
  }

  /* ---------------------------------------------------------
     Reader — Surah
  --------------------------------------------------------- */
  async function openSurah(number) {
    if (!number || number < 1 || number > 114) return showView("surahs");
    if (!getSession()) return openAuthGate(`surah/${number}`);
    location.hash = `surah/${number}`;
    showView("reader");
    const listEl = el("#ayatList");
    listEl.innerHTML = `<div class="loader">Opening the page&hellip;</div>`;

    try {
      let data = cache.surah[number];
      if (!data) {
        const res = await fetch(`${API}/surah/${number}/editions/${EDITIONS}`);
        if (!res.ok) throw new Error("surah fetch failed");
        const json = await res.json();
        data = json.data; // [arabicEdition, translationEdition, audioEdition]
        cache.surah[number] = data;
      }
      const [ar, en, audio] = data;

      el("#readerEyebrow").textContent = `Surah ${ar.number} \u00B7 ${surahMetaLine(ar)}`;
      el("#readerTitle").innerHTML = `${ar.englishName} <span lang="ar" dir="rtl" style="font-family:var(--font-arabic); color:var(--gold); margin-inline-start:10px;">${ar.name}</span>`;
      el("#readerMeta").textContent = ar.englishNameTranslation;

      const bismillah =
        ar.number !== 9 && ar.number !== 1
          ? `<p class="verse-arabic" lang="ar" dir="rtl" style="text-align:center; color:var(--emerald); margin-bottom:26px;">\u0628\u0650\u0633\u0652\u0645\u0650 \u0627\u0644\u0644\u0651\u0647\u0650 \u0627\u0644\u0631\u0651\u064e\u062d\u0652\u0645\u064e\u0670\u0646\u0650 \u0627\u0644\u0631\u0651\u064e\u062d\u0650\u064a\u0645\u0650</p>`
          : "";

      listEl.innerHTML =
        bismillah +
        ar.ayahs
          .map((a, i) =>
            verseCard({
              num: a.numberInSurah,
              arabic: a.text,
              translation: en.ayahs[i].text,
              audio: audio.ayahs[i].audio,
              refType: "surah",
              refNum: number,
              refLabel: `${ar.englishName} ${ar.number}:${a.numberInSurah}`,
            })
          )
          .join("");
      wireVerseButtons(listEl);
    } catch (err) {
      listEl.innerHTML = `<p class="loader">Couldn't load this Surah right now. Please try again in a moment.</p>`;
    }
  }

  /* ---------------------------------------------------------
     Reader — Para (Juz)
  --------------------------------------------------------- */
  async function openPara(number) {
    if (!number || number < 1 || number > 30) return showView("paras");
    if (!getSession()) return openAuthGate(`para/${number}`);
    location.hash = `para/${number}`;
    showView("reader");
    const listEl = el("#ayatList");
    listEl.innerHTML = `<div class="loader">Opening the page&hellip;</div>`;

    const name = PARA_NAMES[number - 1];
    el("#readerEyebrow").textContent = `Para ${number} of 30`;
    el("#readerTitle").innerHTML = `Para ${number} <span lang="ar" dir="rtl" style="font-family:var(--font-arabic); color:var(--gold); margin-inline-start:10px;">${name.ar}</span>`;
    el("#readerMeta").textContent = name.translit;

    try {
      let data = cache.juz[number];
      if (!data) {
        // Fetched as three separate single-edition calls (proven, documented
        // endpoint shape) rather than one combined /editions/ call, so a
        // hiccup on one edition doesn't take the whole Para down.
        const [arRes, enRes, audRes] = await Promise.all([
          fetch(`${API}/juz/${number}/quran-uthmani`),
          fetch(`${API}/juz/${number}/en.sahih`),
          fetch(`${API}/juz/${number}/ar.alafasy`),
        ]);
        if (!arRes.ok || !enRes.ok || !audRes.ok) throw new Error("juz fetch failed");
        const [arJson, enJson, audJson] = await Promise.all([
          arRes.json(),
          enRes.json(),
          audRes.json(),
        ]);
        data = [arJson.data, enJson.data, audJson.data];
        cache.juz[number] = data;
      }
      const [ar, en, audio] = data;

      el("#readerMeta").textContent = `${name.translit} \u00B7 ${ar.ayahs.length} verses`;
      let lastSurah = null;
      listEl.innerHTML = ar.ayahs
        .map((a, i) => {
          let heading = "";
          if (a.surah.number !== lastSurah) {
            lastSurah = a.surah.number;
            heading = `
              <div class="qul-heading" style="margin-top:30px;">
                <p class="surah-en">${a.surah.englishName} <span lang="ar" dir="rtl" style="font-family:var(--font-arabic); color:var(--gold);">${a.surah.name}</span></p>
              </div>`;
          }
          return (
            heading +
            verseCard({
              num: a.numberInSurah,
              arabic: a.text,
              translation: en.ayahs[i].text,
              audio: audio.ayahs[i].audio,
              refType: "para",
              refNum: number,
              refLabel: `${a.surah.englishName} ${a.surah.number}:${a.numberInSurah}`,
            })
          );
        })
        .join("");
      wireVerseButtons(listEl);
    } catch (err) {
      listEl.innerHTML = `<p class="loader">Couldn't load Para ${number} right now. Please check your connection and try again.</p>`;
    }
  }

  /* ---------------------------------------------------------
     Ayat-ul-Kursi (2:255)
  --------------------------------------------------------- */
  async function loadKursi() {
    const card = el("#kursiCard");
    if (card.dataset.loaded) return;
    try {
      const res = await fetch(`${API}/ayah/2:255/editions/${EDITIONS}`);
      if (!res.ok) throw new Error("ayah fetch failed");
      const json = await res.json();
      const [ar, en, audio] = json.data;
      const data = { num: "2:255", arabic: ar.text, translation: en.text, audio: audio.audio, refType: "kursi", refNum: 1, refLabel: "Ayat-ul-Kursi \u2014 2:255" };
      card.innerHTML = `
        <div class="verse-top">
          <span class="verse-num">2:255</span>
          <div class="verse-actions">
            <button class="play-btn" data-audio="${audio.audio}" aria-label="Play recitation">${playIcon()}</button>
            <button class="bookmark-btn" data-verse='${JSON.stringify(data).replace(/'/g, "&#39;")}' aria-label="Bookmark this verse">${bookmarkIcon()}</button>
          </div>
        </div>
        <p class="verse-arabic" lang="ar" dir="rtl">${ar.text}</p>
        <p class="verse-translation">${en.text}</p>
        <p class="verse-note">Whoever recites this verse in the morning will be protected until evening, and whoever recites it in the evening will be protected until morning &mdash; as narrated in the hadith literature.</p>
      `;
      wireVerseButtons(card);
      card.dataset.loaded = "true";
    } catch (err) {
      card.innerHTML = `<p class="loader">Couldn't load this verse right now. Please try again in a moment.</p>`;
    }
  }

  /* ---------------------------------------------------------
     Four Quls — 109, 112, 113, 114
  --------------------------------------------------------- */
  async function loadQuls() {
    const wrap = el("#qulsList");
    if (wrap.dataset.loaded) return;
    const numbers = [109, 112, 113, 114];
    try {
      const results = await Promise.all(
        numbers.map((n) =>
          fetch(`${API}/surah/${n}/editions/${EDITIONS}`).then((r) => {
            if (!r.ok) throw new Error("surah fetch failed");
            return r.json();
          })
        )
      );
      wrap.innerHTML = results
        .map(({ data }) => {
          const [ar, en, audio] = data;
          return `
          <div class="qul-block">
            <div class="qul-heading">
              <p class="surah-en">${ar.englishName} <span lang="ar" dir="rtl" style="font-family:var(--font-arabic); color:var(--gold);">${ar.name}</span></p>
              <p class="surah-meta">${ar.englishNameTranslation} &middot; ${surahMetaLine(ar)}</p>
            </div>
            ${ar.ayahs
              .map((a, i) =>
                verseCard({
                  num: a.numberInSurah,
                  arabic: a.text,
                  translation: en.ayahs[i].text,
                  audio: audio.ayahs[i].audio,
                  refType: "surah",
                  refNum: ar.number,
                  refLabel: `${ar.englishName} ${ar.number}:${a.numberInSurah}`,
                })
              )
              .join("")}
          </div>`;
        })
        .join("");
      wireVerseButtons(wrap);
      wrap.dataset.loaded = "true";
    } catch (err) {
      wrap.innerHTML = `<p class="loader">Couldn't load these Surahs right now. Please try again in a moment.</p>`;
    }
  }

  /* ---------------------------------------------------------
     99 Names of Allah
  --------------------------------------------------------- */
  async function loadNames() {
    const grid = el("#namesGrid");
    if (cache.names) return renderNames(cache.names);
    try {
      const res = await fetch(NAMES_API);
      const json = await res.json();
      cache.names = json.data;
      renderNames(cache.names);
    } catch (err) {
      grid.innerHTML = `<p class="loader">Couldn't load the Names right now. Please try again in a moment.</p>`;
    }
  }
  function renderNames(list) {
    const grid = el("#namesGrid");
    grid.innerHTML = list
      .map(
        (n) => `
      <div class="name-card">
        <span class="name-index">${n.number}</span>
        <p class="name-ar" lang="ar" dir="rtl">${n.name}</p>
        <p class="name-translit">${n.transliteration}</p>
        <p class="name-meaning">${n.en && n.en.meaning ? n.en.meaning : ""}</p>
      </div>`
      )
      .join("");
  }

  /* ---------------------------------------------------------
     Tasbih Counter
  --------------------------------------------------------- */
  const TARGETS = [33, 99, 1000];
  function getTasbihState() {
    return store.get("noor-tasbih", { dhikr: "SubhanAllah", ar: "\u0633\u064f\u0628\u0652\u062d\u0627\u0646\u064e \u0627\u0644\u0644\u0651\u0647\u0650", count: 0, target: 33 });
  }
  function saveTasbihState(s) {
    store.set("noor-tasbih", s);
  }
  function initTasbih() {
    const dial = el("#tasbihDial");
    if (dial.dataset.wired) {
      renderTasbih();
      return;
    }
    dial.addEventListener("click", () => {
      const s = getTasbihState();
      s.count += 1;
      if (navigator.vibrate) navigator.vibrate(12);
      if (s.count >= s.target) {
        showToast(`${s.target} reached \u2014 MashaAllah!`);
        s.count = 0;
      }
      saveTasbihState(s);
      renderTasbih();
    });
    el("#tasbihReset").addEventListener("click", () => {
      const s = getTasbihState();
      s.count = 0;
      saveTasbihState(s);
      renderTasbih();
    });
    el("#tasbihCycle").addEventListener("click", () => {
      const s = getTasbihState();
      const idx = TARGETS.indexOf(s.target);
      s.target = TARGETS[(idx + 1) % TARGETS.length];
      s.count = 0;
      saveTasbihState(s);
      renderTasbih();
    });
    els(".dhikr-chip").forEach((chip) => {
      chip.addEventListener("click", () => {
        const s = getTasbihState();
        s.dhikr = chip.dataset.dhikr;
        s.ar = chip.dataset.ar;
        s.count = 0;
        saveTasbihState(s);
        renderTasbih();
      });
    });
    dial.dataset.wired = "true";
    renderTasbih();
  }
  function renderTasbih() {
    const s = getTasbihState();
    el("#tasbihCount").textContent = s.count;
    el("#tasbihTarget").textContent = `of ${s.target}`;
    el("#tasbihAr").textContent = s.ar;
    els(".dhikr-chip").forEach((c) =>
      c.classList.toggle("is-active", c.dataset.dhikr === s.dhikr)
    );
  }

  /* ---------------------------------------------------------
     Sign up / Log in gate
     ---------------------------------------------------------
     Runs entirely client-side (this is a static site with no
     server). That means:
       - "Accounts" are stored in this browser's localStorage
         only — they do not exist on any shared server, so a
         signup made on one device/browser won't log a visitor
         in on a different one.
       - To notify the site owner by real email for every
         visitor on every device, this is wired to send a POST
         request to a free form-relay service (Formspree). You
         must create a free endpoint at https://formspree.io and
         paste it into OWNER_NOTIFY_ENDPOINT below — until then,
         signups still unlock the site, but no email is sent.
  --------------------------------------------------------- */
  const OWNER_EMAIL = "saqibabro595@gmail.com";
  const OWNER_NOTIFY_ENDPOINT = ""; // e.g. "https://formspree.io/f/xxxxxxx"

  function getAccounts() {
    return store.get("noor-accounts", []);
  }
  function saveAccounts(list) {
    store.set("noor-accounts", list);
  }
  function getSession() {
    return store.get("noor-session", null);
  }
  function setSession(user) {
    store.set("noor-session", user);
  }

  async function notifyOwner(user, action) {
    if (!OWNER_NOTIFY_ENDPOINT) return; // not configured yet
    try {
      await fetch(OWNER_NOTIFY_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({
          _subject: `Noor-ul-Quran: ${action} \u2014 ${user.name}`,
          name: user.name,
          email: user.email,
          action: action,
          site: "Noor-ul-Quran",
          notifyEmail: OWNER_EMAIL,
          // Number of accounts created on THIS visitor's device/browser —
          // not a site-wide total (a static site has no shared database).
          // For the real running total across every visitor, check the
          // submissions count in your Formspree dashboard, since every
          // sign-up posts there.
          accountsOnThisDevice: getAccounts().length,
          when: new Date().toISOString(),
        }),
      });
    } catch (e) {
      /* best-effort only — never block the visitor on this */
    }
  }

  function showAuthError(id, msg) {
    el(id).textContent = msg;
  }

  function openAuthGate(target) {
    pendingView = target || null;
    el("#authGate").classList.add("is-open");
  }
  function closeAuthGate() {
    el("#authGate").classList.remove("is-open");
  }

  function goToPendingView() {
    const pv = pendingView;
    pendingView = null;
    if (!pv) return;
    if (pv.startsWith("surah/")) return openSurah(Number(pv.split("/")[1]));
    if (pv.startsWith("para/")) return openPara(Number(pv.split("/")[1]));
    showView(pv);
  }

  function setLoggedInUI(user) {
    const pill = el("#accountPill");
    pill.hidden = false;
    pill.textContent = user.name;
    el("#logoutBtn").hidden = false;
  }

  function unlockSite(user) {
    setSession(user);
    setLoggedInUI(user);
    closeAuthGate();
    goToPendingView();
  }

  function initAuth() {
    const session = getSession();
    if (session) setLoggedInUI(session);

    els(".auth-tab").forEach((tab) => {
      tab.addEventListener("click", () => {
        els(".auth-tab").forEach((t) => t.classList.remove("is-active"));
        tab.classList.add("is-active");
        const isLogin = tab.dataset.authTab === "login";
        el("#loginForm").hidden = !isLogin;
        el("#signupForm").hidden = isLogin;
      });
    });

    els(".auth-eye").forEach((eyeBtn) => {
      eyeBtn.addEventListener("click", () => {
        const input = el(`#${eyeBtn.dataset.toggleFor}`);
        const showing = input.type === "text";
        input.type = showing ? "password" : "text";
        eyeBtn.classList.toggle("is-visible", !showing);
        eyeBtn.setAttribute("aria-label", showing ? "Show password" : "Hide password");
      });
    });

    el("#signupForm").addEventListener("submit", (e) => {
      e.preventDefault();
      showAuthError("#signupError", "");
      const name = el("#signupName").value.trim();
      const email = el("#signupEmail").value.trim().toLowerCase();
      const password = el("#signupPassword").value;
      if (!name || !email || password.length < 6) {
        showAuthError("#signupError", "Please fill every field (password: 6+ characters).");
        return;
      }
      const accounts = getAccounts();
      if (accounts.some((a) => a.email === email)) {
        showAuthError("#signupError", "That email already has an account here — try Log In instead.");
        return;
      }
      const user = { name, email, password };
      accounts.push(user);
      saveAccounts(accounts);
      notifyOwner(user, "New sign-up");
      unlockSite({ name, email });
    });

    el("#loginForm").addEventListener("submit", (e) => {
      e.preventDefault();
      showAuthError("#loginError", "");
      const email = el("#loginEmail").value.trim().toLowerCase();
      const password = el("#loginPassword").value;
      const accounts = getAccounts();
      const match = accounts.find((a) => a.email === email && a.password === password);
      if (!match) {
        showAuthError("#loginError", "No matching account on this device. New here? Use Sign Up.");
        return;
      }
      notifyOwner(match, "Log in");
      unlockSite({ name: match.name, email: match.email });
    });

    el("#authBack").addEventListener("click", () => {
      pendingView = null;
      closeAuthGate();
      showView("home");
    });

    el("#logoutBtn").addEventListener("click", () => {
      store.set("noor-session", null);
      el("#accountPill").hidden = true;
      el("#logoutBtn").hidden = true;
      // Reset the gate to the Log In tab for next time, but don't force
      // it open now — the Home page stays free to browse after logout too.
      els(".auth-tab").forEach((t) => t.classList.remove("is-active"));
      el('.auth-tab[data-auth-tab="login"]').classList.add("is-active");
      el("#signupForm").hidden = true;
      el("#loginForm").hidden = false;
      showView("home");
    });
  }
  initAuth();

  /* ---------------------------------------------------------
     Durood Paak recitation.
     Uses a real recorded audio file (not text-to-speech) —
     the same reliable <audio> playback path as the Surah, Para,
     Ayat-ul-Kursi, and 4 Quls recitations.
  --------------------------------------------------------- */
  wireVerseButtons(el("#view-durood"));

  // If a recitation file genuinely fails to load (blocked network,
  // dead link, offline, etc.) tell the visitor clearly instead of
  // leaving the play button stuck with nothing happening.
  audioPlayer.addEventListener("error", () => {
    if (currentPlayBtn) currentPlayBtn.classList.remove("is-playing");
    showToast("Couldn't load this recitation — check your internet connection.", 4200);
  });

  /* ---------------------------------------------------------
     Boot
  --------------------------------------------------------- */
  routeFromHash();
})();
