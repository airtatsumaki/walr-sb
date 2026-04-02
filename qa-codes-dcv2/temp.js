//served via https://raw.githack.com/

let lastQuestionId = null;

//pageReady();

function pageReady() {
  let params = new URLSearchParams(document.location.search);

  if (params.get("qa") == 1) {
    applyQACodes();

    const observer = new MutationObserver(() => {
      applyQACodes();
    });

    observer.observe(document.body, { childList: true, subtree: true });
  }
}

function applyQACodes() {
  const currentQuestion = document.querySelector(".question-container");
  if (!currentQuestion) return;

  // --- ALWAYS reset + reapply dummy state ---
  document.querySelectorAll(".dummy-question").forEach((el) => {
    el.classList.remove("dummy-question");
  });

  // Only apply to CURRENT question
  if (currentQuestion.id && currentQuestion.id.startsWith("HID_")) {
    currentQuestion.parentElement?.classList.add("dummy-question");
  }

  const currentId = currentQuestion.id;

  // Prevent rerun on same question
  if (currentId === lastQuestionId) return;
  lastQuestionId = currentId;

  // --- साफ reset previous QA elements ---
  document.querySelectorAll(".qa-code").forEach((el) => el.remove());
  document.querySelectorAll(".answer-for-me").forEach((el) => el.remove());

  addAnswerForMeButton();

  // --- Flag hidden questions ---
  var dummy = [...document.querySelectorAll('.question-container[id^="HID_"]')];
  dummy.forEach((question) => {
    const parent = question.parentElement;
    if (parent) {
      parent.classList.add("dummy-question");
    }
  });

  var radios = [...document.querySelectorAll(".cRadio")];
  var checkboxes = [...document.querySelectorAll(".cCheck")];
  var gridColumnHeaders = [
    ...document.querySelectorAll("th.answer-text-cell[id^='answerCol-']"),
  ];
  var gridRowHeaders = [
    ...document.querySelectorAll("tr.answer-row[id^='answerRow-']"),
  ];

  // --- Question ID labels ---
  var questionText = [...document.querySelectorAll(".question-container[id]")];
  questionText.forEach((question) => {
    const value = question.getAttribute("id");
    const span = document.createElement("span");
    span.className = "qa-code";
    span.textContent = `[${value}]`;
    question.prepend(span);
  });

  // --- Radio / Checkbox answers ---
  var inputsToUse = [...checkboxes, ...radios];
  inputsToUse.forEach((input) => {
    const value = input.getAttribute("value");
    const ansText = input
      .closest(".answer-input-and-text-wrapper")
      ?.querySelector(".ansText-Regular");
    if (ansText) {
      const p = ansText.querySelector("p");
      const span = document.createElement("span");
      span.className = "qa-code";
      span.textContent = `[${value}]`;

      if (p) p.prepend(span);
      else ansText.prepend(span);
    }
  });

  // --- Grid column headers ---
  gridColumnHeaders.forEach((th) => {
    const value = th.id.split("-").pop();
    const ansText = th.querySelector(".answerText-Regular");

    if (ansText) {
      const p = ansText.querySelector("p");
      const span = document.createElement("span");
      span.className = "qa-code";
      span.textContent = `[${value}]`;

      if (p) p.prepend(span);
      else ansText.prepend(span);
    }
  });

  // --- Grid row headers ---
  gridRowHeaders.forEach((tr) => {
    const value = tr.id.split("-").pop();
    const statText = tr.querySelector(".statementText-Regular");

    if (statText) {
      const p = statText.querySelector("p");
      const span = document.createElement("span");
      span.className = "qa-code";
      span.textContent = `[${value}]`;

      if (p) p.prepend(span);
      else statText.prepend(span);
    }
  });

  // --- Carousel custom question ---
  const canvases = [...document.querySelectorAll(".custom-question-canvas")];

  canvases.forEach((canvas) => {
    const carouselObserver = new MutationObserver(() => {
      const buttons = [...canvas.querySelectorAll('[class*="answer-button-"]')];
      if (buttons.length === 0) return;

      // --- Answer option codes ---
      buttons.forEach((btn) => {
        const classList = [...btn.classList];
        const indexClass = classList.find((c) =>
          c.match(/^answer-button-\d+$/),
        );
        if (!indexClass) return;

        const index = parseInt(indexClass.split("-").pop(), 10) + 1;
        const ansText = btn.querySelector(".answerText-Regular");
        if (!ansText) return;
        if (ansText.querySelector(".qa-code")) return;

        const p = ansText.querySelector("p");
        const span = document.createElement("span");
        span.className = "qa-code";
        span.textContent = `[${index}]`;
        if (p) p.prepend(span);
        else ansText.prepend(span);
      });

      // --- Current statement code ---
      const answerBox = canvas.querySelector("#answer-box .answerText-Regular");
      if (answerBox && !answerBox.querySelector(".qa-code")) {
        const statementText = answerBox.querySelector("p")?.textContent?.trim();

        // match against base grid row headers to find the value
        const matchingRow = [
          ...document.querySelectorAll("tr.answer-row"),
        ].find((row) => {
          const rowText = row
            .querySelector(".statementText-Regular p")
            ?.textContent?.trim();
          return rowText && statementText && rowText.includes(statementText);
        });

        if (matchingRow) {
          const value = matchingRow.id.split("-").pop();
          const p = answerBox.querySelector("p");
          const span = document.createElement("span");
          span.className = "qa-code";
          span.textContent = `[${value}]`;
          if (p) p.prepend(span);
          else answerBox.prepend(span);
        }
      }
    });
    carouselObserver.observe(canvas, { childList: true, subtree: true });
  });

  // --- Numeric question rows ---
  const numericQuestion = [
    ...document.querySelectorAll(".numeric-input-question .answer-container"),
  ];

  numericQuestion.forEach((container) => {
    const value = parseInt(container.id.split("-").pop(), 10) + 1;
    const ansText = container.querySelector(".ansText-Regular");
    if (!ansText) return;
    if (ansText.querySelector(".qa-code")) return;

    const p = ansText.querySelector("p");
    const span = document.createElement("span");
    span.className = "qa-code";
    span.textContent = `[${value}]`;

    if (p) p.prepend(span);
    else ansText.prepend(span);
  });
}

function addAnswerForMeButton() {
  const nav = document.querySelector(".main-nav-buttons");
  if (!nav) return;

  const nextBtn = nav.querySelector(".main-next-button");
  if (!nextBtn) return;

  const btn = document.createElement("button");
  btn.type = "button";
  btn.className = "answer-for-me";
  btn.textContent = "Answer for me";

  btn.addEventListener("click", function (e) {
    e.preventDefault();
    e.stopPropagation();
    answerForMe();
    setTimeout(() => document.querySelector(".main-next-button")?.click(), 600);
  });

  nav.insertBefore(btn, nextBtn);

  // Attach keyboard listener once
  if (!window.qaKeyListenerAttached) {
    window.qaKeyListenerAttached = true;

    document.addEventListener("keydown", function (e) {
      const trigger = e.ctrlKey || e.metaKey;
      if (!trigger) return;

      if (e.key === "ArrowRight") {
        e.preventDefault();
        $(".answer-for-me").click();
      }

      if (e.key === "ArrowLeft") {
        e.preventDefault();
        $(".main-back-button").click();
      }
    });
  }
}

function answerForMe() {
  const isMulti = document.querySelector(".multi-question");
  const isSingle = document.querySelector(".single-question");
  const isSingleGrid = document.querySelector(".single-grid-question");
  const isNumeric = document.querySelector(".numeric-input-question");

  // --- Grid (single per row) ---
  if (isSingleGrid) {
    const rows = [...document.querySelectorAll(".answer-row")];
    rows.forEach((row) => {
      const radios = [...row.querySelectorAll(".cRadio")];
      if (radios.length > 0) {
        const pick = radios[Math.floor(Math.random() * radios.length)];
        pick.checked = true;
        pick.dispatchEvent(new Event("input", { bubbles: true }));
        pick.dispatchEvent(new Event("change", { bubbles: true }));
      }
    });

    // --- Multi ---
  } else if (isMulti) {
    const checkboxes = [
      ...document.querySelectorAll(".answers-wrapper .cCheck"),
    ];
    const radios = [...document.querySelectorAll(".answers-wrapper .cRadio")];

    const pickExclusive = radios.length > 0 && Math.random() < 0.2;

    if (pickExclusive) {
      const pick = radios[Math.floor(Math.random() * radios.length)];
      pick.checked = true;
      pick.dispatchEvent(new Event("input", { bubbles: true }));
      pick.dispatchEvent(new Event("change", { bubbles: true }));
    } else {
      const shuffled = checkboxes.sort(() => Math.random() - 0.5);
      const count = Math.floor(Math.random() * shuffled.length) + 1;

      shuffled.slice(0, count).forEach((cb) => {
        cb.checked = true;
        cb.dispatchEvent(new Event("input", { bubbles: true }));
        cb.dispatchEvent(new Event("change", { bubbles: true }));
      });
    }

    // --- Single ---
  } else if (isSingle) {
    const radios = [...document.querySelectorAll(".answers-wrapper .cRadio")];
    if (radios.length > 0) {
      const pick = radios[Math.floor(Math.random() * radios.length)];
      pick.checked = true;
      pick.dispatchEvent(new Event("input", { bubbles: true }));
      pick.dispatchEvent(new Event("change", { bubbles: true }));
    }

    // --- Numeric ---
  } else if (isNumeric) {
    [...document.querySelectorAll(".numeric-decimal-input")].forEach(
      (input) => {
        const value = Math.floor(Math.random() * 99) + 1;
        input.value = value;
        input.dispatchEvent(new Event("input", { bubbles: true }));
        input.dispatchEvent(new Event("change", { bubbles: true }));
      },
    );
    return;
    // --- Open end only ---
  } else {
    const openEnds = [...document.querySelectorAll("textarea.open-end-input")];

    openEnds.forEach((oe) => {
      const container = oe.closest(".answer-container");
      if (container) {
        const input = container.querySelector(".cCheck, .cRadio");
        if (input && !input.checked) {
          input.checked = true;
          input.dispatchEvent(new Event("input", { bubbles: true }));
          input.dispatchEvent(new Event("change", { bubbles: true }));
        }
      }
    });

    setTimeout(() => {
      document
        .querySelectorAll("textarea.open-end-input")
        .forEach((oe, index) => {
          oe.value = `This is random data ${index + 1}`;
          oe.dispatchEvent(new Event("input", { bubbles: true }));
          oe.dispatchEvent(new Event("change", { bubbles: true }));
        });
    }, 200);

    return;
  }

  // --- Fill OE for selected answers ---
  document.querySelectorAll("textarea.open-end-input").forEach((oe, index) => {
    const container = oe.closest(".answer-container");

    if (container) {
      const input = container.querySelector(".cCheck, .cRadio");

      if (input && input.checked) {
        oe.value = `This is random data ${index + 1}`;
      }
    } else {
      oe.value = `This is random data ${index + 1}`;
    }

    oe.dispatchEvent(new Event("input", { bubbles: true }));
    oe.dispatchEvent(new Event("change", { bubbles: true }));
  });
}

/****************SIDE BAR ANSWERS*****************/
// ===============================
// QA ANSWER HISTORY (FINAL)
// ===============================
(function () {
  const params = new URLSearchParams(document.location.search);
  if (params.get("qa") != 1) return;

  if (window.qaHistoryInitialized) return;
  window.qaHistoryInitialized = true;

  window.qaAnswerHistory = window.qaAnswerHistory || [];

  // ===============================
  // CAROUSEL CAPTURE (NEW)
  // ===============================
  function captureCarousel(question) {
    const canvas = question.querySelector(".custom-question-canvas");
    if (!canvas) return [];

    const answers = [];

    const statementEl = canvas.querySelector(
      "#answer-box .answerText-Regular p",
    );
    const selectedBtn = canvas.querySelector(".answer-button.button-selected");

    if (!statementEl || !selectedBtn) return [];

    const statementValue = statementEl
      .querySelector(".qa-code")
      ?.innerText.replace(/\[|\]/g, "");

    const statementText = statementEl.innerText.replace(/^\[.*?\]/, "").trim();

    const answerTextEl = selectedBtn.querySelector(".answerText-Regular p");

    const answerValue = answerTextEl
      ?.querySelector(".qa-code")
      ?.innerText.replace(/\[|\]/g, "");

    const answerText = answerTextEl?.innerText.replace(/^\[.*?\]/, "").trim();

    if (statementValue && answerValue) {
      answers.push(
        `[${statementValue}] ${statementText} = ${answerText} [${answerValue}]`,
      );
    }

    return answers;
  }

  // ===============================
  // CAPTURE ANSWERS
  // ===============================
  function captureCurrentAnswers() {
    const questions = [...document.querySelectorAll(".question-container[id]")];

    questions.forEach((question) => {
      const qid = question.getAttribute("id");
      const entry = { qid, answers: [] };

      // =========================
      // SC / MC
      // =========================
      const checked = [
        ...question.querySelectorAll(".cRadio:checked, .cCheck:checked"),
      ];

      if (checked.length) {
        const formatted = checked.map((input) => {
          const value = input.getAttribute("value");

          const label =
            input
              .closest(".answer-input-and-text-wrapper")
              ?.querySelector(".ansText-Regular p")
              ?.innerText.replace(/^\[.*?\]/, "")
              .trim() || "";

          return `[${value}] ${label}`;
        });

        entry.answers.push(formatted.join(", "));
      }

      // =========================
      // GRID (UPDATED)
      // =========================
      [...question.querySelectorAll(".answer-row")].forEach((row) => {
        const checked = row.querySelector(".cRadio:checked");
        if (!checked) return;

        const statementValue = row
          .querySelector(".qa-code")
          ?.innerText.replace(/\[|\]/g, "");

        const rowLabel = row
          .querySelector(".statementText-Regular p")
          ?.innerText.replace(/^\[.*?\]/, "")
          .trim();

        const colHeader = question
          .querySelector(
            `th.answer-text-cell[id$="-${checked.value}"] .answerText-Regular p`,
          )
          ?.innerText.replace(/^\[.*?\]/, "")
          .trim();

        entry.answers.push(
          `[${statementValue}] ${rowLabel} = ${colHeader} [${checked.value}]`,
        );
      });

      // =========================
      // NUMERIC (FIXED INDEX)
      // =========================
      [...question.querySelectorAll(".numeric-decimal-input")].forEach(
        (input, index) => {
          if (input.value === "") return;

          const valueKey = parseInt(input.name.split("-").pop(), 10);

          const label = question
            .querySelector(
              `#answerContainer-${input.name.split("-").slice(1).join("-")} .ansText-Regular p`,
            )
            ?.innerText.replace(/^\[.*?\]/, "")
            .trim();

          entry.answers.push(
            `[${valueKey}] ${label || `Row ${valueKey}`} = ${input.value}`,
          );
        },
      );

      // =========================
      // OPEN END
      // =========================
      [...question.querySelectorAll("textarea.open-end-input")].forEach(
        (oe) => {
          if (oe.value.trim() === "") return;

          const label = oe
            .closest(".answer-container")
            ?.querySelector(".ansText-Regular p")
            ?.innerText.replace(/^\[.*?\]/, "")
            .trim();

          entry.answers.push(`${label || "Response"}: "${oe.value.trim()}"`);
        },
      );

      // =========================
      // CAROUSEL (NEW FIX)
      // =========================
      const carouselAnswers = captureCarousel(question);

      carouselAnswers.forEach((a) => {
        if (!entry.answers.includes(a)) {
          entry.answers.push(a);
        }
      });

      if (entry.answers.length === 0) return;

      const existingIndex = window.qaAnswerHistory.findIndex(
        (e) => e.qid === qid,
      );

      if (existingIndex > -1) {
        window.qaAnswerHistory[existingIndex] = entry;
      } else {
        window.qaAnswerHistory.push(entry);
      }
    });

    renderSidebar();
  }

  // ===============================
  // SIDEBAR UI
  // ===============================
  function renderSidebar() {
    const list = document.getElementById("qa-history-list");
    if (!list) return;

    if (window.qaAnswerHistory.length === 0) {
      list.innerHTML =
        '<p style="color: var(--qa-muted); font-size: 16px;">No answers captured yet.</p>';
      return;
    }

    list.innerHTML = window.qaAnswerHistory
      .map(
        (entry) => `
      <div class="qa-history-entry">
        <div class="qa-history-qid">${entry.qid}</div>
        ${entry.answers
          .map((a) => `<div class="qa-history-answer">${a}</div>`)
          .join("")}
      </div>
    `,
      )
      .join("");
  }

  function buildHistorySidebar() {
    if (document.getElementById("qa-sidebar")) return;

    const toggleBtn = document.createElement("button");
    toggleBtn.id = "qa-toggle-btn";
    toggleBtn.innerHTML = `
  <svg viewBox="0 0 24 24" width="24" height="24" aria-hidden="true">
    <line x1="4" y1="6" x2="20" y2="6" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
    <line x1="4" y1="12" x2="20" y2="12" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
    <line x1="4" y1="18" x2="20" y2="18" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
  </svg>
`;
    const sidebar = document.createElement("div");
    sidebar.id = "qa-sidebar";
    sidebar.innerHTML = `<div id="qa-history-list"></div>`;

    toggleBtn.addEventListener("click", () => {
      captureCurrentAnswers();
      sidebar.classList.toggle("open");
    });

    document.body.appendChild(toggleBtn);
    document.body.appendChild(sidebar);
  }

  // ===============================
  // NEXT BUTTON HOOK
  // ===============================
  function initNextButtonWatcher() {
    const observer = new MutationObserver(() => {
      const nextBtn = document.querySelector(".main-next-button");

      if (!nextBtn || nextBtn.dataset.qaHooked) return;

      nextBtn.dataset.qaHooked = "true";

      nextBtn.addEventListener(
        "click",
        () => {
          captureCurrentAnswers();
        },
        true,
      );
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });
  }

  // ===============================
  // GLOBAL CLICK WATCHER (CRITICAL FIX)
  // ===============================
  function initClickWatcher() {
    document.addEventListener(
      "click",
      (e) => {
        if (
          e.target.closest(".answer-button") || // carousel
          e.target.matches(".cRadio, .cCheck, .numeric-decimal-input")
        ) {
          setTimeout(() => {
            captureCurrentAnswers();
          }, 0);
        }
      },
      true,
    );
  }

  // ===============================
  // INIT
  // ===============================
  function init() {
    buildHistorySidebar();
    initNextButtonWatcher();
    initClickWatcher(); // <-- THIS is the missing piece
    console.log("QA History Enabled");
  }

  init();
})();

// CSS

/* Side bare styles */
/* Toggle button */
/*
#qa-toggle-btn {
  position: fixed;
  top: 16px;
  left: 16px;
  z-index: 99999;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: #98DACB;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}
*/
/*
#qa-toggle-btn svg {
  width: 20px;
  height: 20px;
  color: #fff;
}
*/

/* Sidebar */
/*
#qa-sidebar {
  position: fixed;
  top: 0;
  left: -340px;
  width: 320px;
  height: 100vh;
  z-index: 99998;
  background: #1a1a2e;
  color: #e0e0e0;
  display: flex;
  flex-direction: column;
  transition: left 0.3s ease;
  font-family: monospace;
}

#qa-sidebar.open {
  left: 0;
}

#qa-history-list {
  padding: 60px 16px 16px;
  overflow-y: auto;
  flex: 1;
}

.qa-history-entry {
  margin-bottom: 16px;
}

.qa-history-qid {
  font-size: 18px;
  color: #7b8cde;
  margin-bottom: 4px;
}

.qa-history-answer {
  font-size: 16px;
  padding-left: 6px;
}

.dummy-question{
  box-shadow: 0 10px 16px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19);
}
*/

/*
  function captureCurrentAnswers() {
    const questions = [...document.querySelectorAll('.question-container[id]')];

    questions.forEach((question) => {
      const qid = question.getAttribute('id');
      const entry = { qid, answers: [] };

      // --- SC / MC ---
      const checked = [
        ...question.querySelectorAll('.cRadio:checked, .cCheck:checked'),
      ];

      checked.forEach((input) => {
        const value = input.getAttribute('value');
        const ansText = input
          .closest('.answer-input-and-text-wrapper')
          ?.querySelector('.ansText-Regular p');

        const label = ansText
          ? ansText.innerText.replace(/^\[.*?\]/, '').trim()
          : '';

        entry.answers.push(`${label} [${value}]`);
      });

      // --- Grid ---
      [...question.querySelectorAll('.answer-row')].forEach((row) => {
        const checked = row.querySelector('.cRadio:checked');
        if (!checked) return;

        const rowLabel = row
          .querySelector('.statementText-Regular p')
          ?.innerText.replace(/^\[.*?\]/, '')
          .trim();

        const colHeader = question
          .querySelector(`th.answer-text-cell[id$="-${checked.value}"] .answerText-Regular p`)
          ?.innerText.replace(/^\[.*?\]/, '')
          .trim();

        entry.answers.push(`${rowLabel} = ${colHeader} [${checked.value}]`);
      });

      // --- Numeric ---
      [...question.querySelectorAll('.numeric-decimal-input')].forEach(
        (input, index) => {
          if (input.value === '') return;

          const label = question
            .querySelector(
              `#answerContainer-${input.name.split('-').slice(1).join('-')} .ansText-Regular p`
            )
            ?.innerText.replace(/^\[.*?\]/, '')
            .trim();

          entry.answers.push(`${label || `Row ${index + 1}`} = ${input.value}`);
        }
      );

      // --- Open ends ---
      [...question.querySelectorAll('textarea.open-end-input')].forEach(
        (oe) => {
          if (oe.value.trim() === '') return;

          const container = oe.closest('.answer-container');
          const label = container
            ?.querySelector('.ansText-Regular p')
            ?.innerText.replace(/^\[.*?\]/, '')
            .trim();

          entry.answers.push(`${label || 'Response'}: "${oe.value.trim()}"`);
        }
      );

      if (entry.answers.length === 0) return;

      const existingIndex = window.qaAnswerHistory.findIndex(
        (e) => e.qid === qid
      );

      if (existingIndex > -1) {
        window.qaAnswerHistory[existingIndex] = entry;
      } else {
        window.qaAnswerHistory.push(entry);
      }
    });

    renderSidebar();
  }


  // ===============================
  // SIDEBAR UI
  // ===============================
  function renderSidebar() {
    const list = document.getElementById('qa-history-list');
    if (!list) return;

    if (window.qaAnswerHistory.length === 0) {
      list.innerHTML =
        '<p style="color: var(--qa-muted); font-size: 13px;">No answers captured yet.</p>';
      return;
    }

    list.innerHTML = window.qaAnswerHistory
      .map(
        (entry) => `
      <div class="qa-history-entry">
        <div class="qa-history-qid">${entry.qid}</div>
        ${entry.answers
          .map((a) => `<div class="qa-history-answer">${a}</div>`)
          .join('')}
      </div>
    `
      )
      .join('');
  }

  function buildHistorySidebar() {
    if (document.getElementById('qa-sidebar')) return;
    
    const toggleBtn = document.createElement('button');
    toggleBtn.id = 'qa-toggle-btn';
    toggleBtn.innerHTML = `
      <svg viewBox="0 0 24 24">
        <line x1="4" y1="6" x2="20" y2="6"/>
        <line x1="4" y1="12" x2="20" y2="12"/>
        <line x1="4" y1="18" x2="20" y2="18"/>
      </svg>`;

    const sidebar = document.createElement('div');
    sidebar.id = 'qa-sidebar';
    sidebar.innerHTML = `
      <div id="qa-history-list"></div>
    `;

    toggleBtn.addEventListener('click', () => {
      captureCurrentAnswers();
      sidebar.classList.toggle('open');
    });

    document.body.appendChild(toggleBtn);
    document.body.appendChild(sidebar);
  }

  // ===============================
  // NEXT BUTTON HOOK (FIXED)
  // ===============================
  function initNextButtonWatcher() {
    const observer = new MutationObserver(() => {
      const nextBtn = document.querySelector('.main-next-button');

      if (!nextBtn || nextBtn.dataset.qaHooked) return;

      nextBtn.dataset.qaHooked = "true";

      nextBtn.addEventListener(
        'click',
        () => {
          captureCurrentAnswers();
        },
        true // critical: before navigation
      );
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });
  }

  // ===============================
  // INIT
  // ===============================
  function init() {
    buildHistorySidebar();
    initNextButtonWatcher();
    console.log("QA History Enabled");
  }

  init();
})();

*/

/**************************OLD SCRIPT BELOW*************************************** */

/*
let lastQuestionId = null;

function pageReady() {
  let params = new URLSearchParams(document.location.search);

  if (params.get("qa") == 1) {
    applyQACodes();

    const observer = new MutationObserver(() => {
      applyQACodes();
    });

    observer.observe(document.body, { childList: true, subtree: true });
  }
}

function applyQACodes() {
  const currentQuestion = document.querySelector('.question-container');
  if (!currentQuestion) return;

  // --- ALWAYS reset + reapply dummy state ---
  document.querySelectorAll('.dummy-question').forEach(el => {
    el.classList.remove('dummy-question');
  });

  // Only apply to CURRENT question
  if (currentQuestion.id && currentQuestion.id.startsWith('HID_')) {
    currentQuestion.parentElement?.classList.add('dummy-question');
  }

  const currentId = currentQuestion.id;

  // Prevent rerun on same question
  if (currentId === lastQuestionId) return;
  lastQuestionId = currentId;

  // --- साफ reset previous QA elements ---
  document.querySelectorAll('.qa-code').forEach(el => el.remove());
  document.querySelectorAll('.answer-for-me').forEach(el => el.remove());

  addAnswerForMeButton();

  // --- Flag hidden questions ---
  var dummy = [...document.querySelectorAll('.question-container[id^="HID_"]')];
  dummy.forEach((question) => {
    const parent = question.parentElement;
    if (parent) {
      parent.classList.add('dummy-question');
    }
  });

  var radios = [...document.querySelectorAll(".cRadio")];
  var checkboxes = [...document.querySelectorAll(".cCheck")];
  var gridColumnHeaders = [...document.querySelectorAll("th.answer-text-cell[id^='answerCol-']")];
  var gridRowHeaders = [...document.querySelectorAll("tr.answer-row[id^='answerRow-']")];

  // --- Question ID labels ---
  var questionText = [...document.querySelectorAll('.question-container[id]')];
  questionText.forEach((question) => {
    const value = question.getAttribute('id');
    const span = document.createElement('span');
    span.className = 'qa-code';
    span.textContent = `[${value}]`;
    question.prepend(span);
  });

  // --- Radio / Checkbox answers ---
  var inputsToUse = [...checkboxes, ...radios];
  inputsToUse.forEach((input) => {
    const value = input.getAttribute('value');
    const ansText = input.closest('.answer-input-and-text-wrapper')?.querySelector('.ansText-Regular');
    if (ansText) {
      const p = ansText.querySelector('p');
      const span = document.createElement('span');
      span.className = 'qa-code';
      span.textContent = `[${value}]`;

      if (p) p.prepend(span);
      else ansText.prepend(span);
    }
  });

  // --- Grid column headers ---
  gridColumnHeaders.forEach((th) => {
    const value = th.id.split('-').pop();
    const ansText = th.querySelector('.answerText-Regular');

    if (ansText) {
      const p = ansText.querySelector('p');
      const span = document.createElement('span');
      span.className = 'qa-code';
      span.textContent = `[${value}]`;

      if (p) p.prepend(span);
      else ansText.prepend(span);
    }
  });

  // --- Grid row headers ---
  gridRowHeaders.forEach((tr) => {
    const value = tr.id.split('-').pop();
    const statText = tr.querySelector('.statementText-Regular');

    if (statText) {
      const p = statText.querySelector('p');
      const span = document.createElement('span');
      span.className = 'qa-code';
      span.textContent = `[${value}]`;

      if (p) p.prepend(span);
      else statText.prepend(span);
    }
  });
}

function addAnswerForMeButton() {
  const nav = document.querySelector('.main-nav-buttons');
  if (!nav) return;

  const nextBtn = nav.querySelector('.main-next-button');
  if (!nextBtn) return;

  const btn = document.createElement('button');
  btn.type = 'button';
  btn.className = 'answer-for-me';
  btn.textContent = 'Answer for me';

  btn.addEventListener('click', function (e) {
    e.preventDefault();
    e.stopPropagation();
    answerForMe();
    setTimeout(() => document.querySelector('.main-next-button')?.click(), 600);
  });

  nav.insertBefore(btn, nextBtn);

  // Attach keyboard listener once
  if (!window.qaKeyListenerAttached) {
    window.qaKeyListenerAttached = true;

    document.addEventListener('keydown', function (e) {
      const trigger = e.ctrlKey || e.metaKey;
      if (!trigger) return;

      if (e.key === 'ArrowRight') {
        e.preventDefault();
        $('.answer-for-me').click();
      }

      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        $('.main-back-button').click();
      }
    });
  }
}
*/
/*
function answerForMe() {
  const isMulti = document.querySelector('.multi-question');
  const isSingle = document.querySelector('.single-question');
  const isSingleGrid = document.querySelector('.single-grid-question');

  // --- Grid (single per row) ---
  if (isSingleGrid) {
    const rows = [...document.querySelectorAll('.answer-row')];
    rows.forEach(row => {
      const radios = [...row.querySelectorAll('.cRadio')];
      if (radios.length > 0) {
        const pick = radios[Math.floor(Math.random() * radios.length)];
        pick.checked = true;
        pick.dispatchEvent(new Event('input', { bubbles: true }));
        pick.dispatchEvent(new Event('change', { bubbles: true }));
      }
    });

  // --- Multi ---
  } else if (isMulti) {
    const checkboxes = [...document.querySelectorAll('.answers-wrapper .cCheck')];
    const radios = [...document.querySelectorAll('.answers-wrapper .cRadio')];

    const pickExclusive = radios.length > 0 && Math.random() < 0.2;

    if (pickExclusive) {
      const pick = radios[Math.floor(Math.random() * radios.length)];
      pick.checked = true;
      pick.dispatchEvent(new Event('input', { bubbles: true }));
      pick.dispatchEvent(new Event('change', { bubbles: true }));
    } else {
      const shuffled = checkboxes.sort(() => Math.random() - 0.5);
      const count = Math.floor(Math.random() * shuffled.length) + 1;

      shuffled.slice(0, count).forEach(cb => {
        cb.checked = true;
        cb.dispatchEvent(new Event('input', { bubbles: true }));
        cb.dispatchEvent(new Event('change', { bubbles: true }));
      });
    }

  // --- Single ---
  } else if (isSingle) {
    const radios = [...document.querySelectorAll('.answers-wrapper .cRadio')];
    if (radios.length > 0) {
      const pick = radios[Math.floor(Math.random() * radios.length)];
      pick.checked = true;
      pick.dispatchEvent(new Event('input', { bubbles: true }));
      pick.dispatchEvent(new Event('change', { bubbles: true }));
    }

  // --- Open End only ---
  } else {
    const openEnds = [...document.querySelectorAll('textarea.open-end-input')];

    openEnds.forEach((oe) => {
      const container = oe.closest('.answer-container');
      if (container) {
        const input = container.querySelector('.cCheck, .cRadio');
        if (input && !input.checked) {
          input.checked = true;
          input.dispatchEvent(new Event('input', { bubbles: true }));
          input.dispatchEvent(new Event('change', { bubbles: true }));
        }
      }
    });

    setTimeout(() => {
      document.querySelectorAll('textarea.open-end-input').forEach((oe, index) => {
        oe.value = `This is random data ${index + 1}`;
        oe.dispatchEvent(new Event('input', { bubbles: true }));
        oe.dispatchEvent(new Event('change', { bubbles: true }));
      });
    }, 200);

    return;
  }

  // --- Fill OE for selected answers ---
  document.querySelectorAll('textarea.open-end-input').forEach((oe, index) => {
    const container = oe.closest('.answer-container');

    if (container) {
      const input = container.querySelector('.cCheck, .cRadio');

      if (input && input.checked) {
        oe.value = `This is random data ${index + 1}`;
      }
    } else {
      oe.value = `This is random data ${index + 1}`;
    }

    oe.dispatchEvent(new Event('input', { bubbles: true }));
    oe.dispatchEvent(new Event('change', { bubbles: true }));
  });
}


/*
function pageReady() {
  let params = new URLSearchParams(document.location.search);
  if (params.get("qa") == 1) { 
    applyQACodes();

    const observer = new MutationObserver(() => {
      observer.disconnect();
      applyQACodes();
      observer.observe(document.body, { childList: true, subtree: true });
    });

    observer.observe(document.body, { childList: true, subtree: true });
  }
}

function applyQACodes() {
  addAnswerForMeButton();
  
  // --- Flag hidden questions ---
  var container = document.querySelector('.question-container').parentElement;
  container.classList.remove('dummy-question');
  var dummy = [...document.querySelectorAll('.question-container[id^="HID_"]')];
  if (dummy.length > 0) {
    dummy.forEach((question) => {
      console.log("Dummy found");
      const parent = question.parentElement;
      if (parent) {
        parent.classList.add('dummy-question');
      }
    });
  }

  if (document.querySelector('.qa-code')) return;

  var radios = [...document.querySelectorAll(".cRadio")];
  var checkboxes = [...document.querySelectorAll(".cCheck")];
  var gridColumnHeaders = [...document.querySelectorAll("th.answer-text-cell[id^='answerCol-']")];
  var gridRowHeaders = [...document.querySelectorAll("tr.answer-row[id^='answerRow-']")];

  // --- Question ID labels ---
  var questionText = [...document.querySelectorAll('.question-container[id]')];
  questionText.forEach((question) => {
    const value = question.getAttribute('id');
    const span = document.createElement('span');
    span.className = 'qa-code';
    span.textContent = `[${value}]`;
    question.prepend(span);
  });

  // --- Radio / Checkbox questions ---
  var inputsToUse = [...checkboxes, ...radios];
  inputsToUse.forEach((input) => {
    const value = input.getAttribute('value');
    const ansText = input.closest('.answer-input-and-text-wrapper')?.querySelector('.ansText-Regular');
    if (ansText) {
      const p = ansText.querySelector('p');
      const span = document.createElement('span');
      span.className = 'qa-code';
      span.textContent = `[${value}]`;
      if (p) {
        p.prepend(span);
      } else {
        ansText.prepend(span);
      }
    }
  });

  // --- Grid column headers ---
  gridColumnHeaders.forEach((th) => {
    const value = th.id.split('-').pop();
    const ansText = th.querySelector('.answerText-Regular');
    if (ansText) {
      const p = ansText.querySelector('p');
      const span = document.createElement('span');
      span.className = 'qa-code';
      span.textContent = `[${value}]`;
      if (p) {
        p.prepend(span);
      } else {
        ansText.prepend(span);
      }
    }
  });

  // --- Grid row headers ---
  gridRowHeaders.forEach((tr) => {
    const value = tr.id.split('-').pop();
    const statText = tr.querySelector('.statementText-Regular');
    if (statText) {
      const p = statText.querySelector('p');
      const span = document.createElement('span');
      span.className = 'qa-code';
      span.textContent = `[${value}]`;
      if (p) {
        p.prepend(span);
      } else {
        statText.prepend(span);
      }
    }
  });

  
}
//
function addAnswerForMeButton() {
  if (document.querySelector('.answer-for-me')) return;

  const nav = document.querySelector('.main-nav-buttons');
  if (!nav) return;

  const nextBtn = nav.querySelector('.main-next-button');
  if (!nextBtn) return;

  const btn = document.createElement('button');
  btn.type = 'button'; // prevent form submission
  btn.className = 'answer-for-me';
  btn.textContent = 'Answer for me';
  btn.addEventListener('click', function(e) {
    e.preventDefault();
    e.stopPropagation();
    answerForMe();
    setTimeout(() => $('.main-next-button').click(), 600);
  });

  nav.insertBefore(btn, nextBtn);

  document.addEventListener('keydown', function (e) {
    const trigger = e.ctrlKey || e.metaKey;
    if (!trigger) return;
    
    if (e.key === 'ArrowRight') {
      $('.answer-for-me').click();
    }
    
    if (e.key === 'ArrowLeft') {
      $('.main-back-button').click();
    }
  });
}

function answerForMe() {
  const isMulti = document.querySelector('.multi-question');
  const isSingle = document.querySelector('.single-question');
  const isSingleGrid = document.querySelector('.single-grid-question');

  // --- SC per row grid ---
  if (isSingleGrid) {
    const rows = [...document.querySelectorAll('.answer-row')];
    rows.forEach(row => {
      const radios = [...row.querySelectorAll('.cRadio')];
      if (radios.length > 0) {
        const pick = radios[Math.floor(Math.random() * radios.length)];
        pick.checked = true;
        pick.dispatchEvent(new Event('input', { bubbles: true }));
        pick.dispatchEvent(new Event('change', { bubbles: true }));
      }
    });

  // --- MC question ---
  } else if (isMulti) {
    const checkboxes = [...document.querySelectorAll('.answers-wrapper .cCheck')];
    const radios = [...document.querySelectorAll('.answers-wrapper .cRadio')];
    const pickExclusive = radios.length > 0 && Math.random() < 0.2;

    if (pickExclusive) {
      const pick = radios[Math.floor(Math.random() * radios.length)];
      pick.checked = true;
      pick.dispatchEvent(new Event('input', { bubbles: true }));
      pick.dispatchEvent(new Event('change', { bubbles: true }));
    } else {
      const shuffled = checkboxes.sort(() => Math.random() - 0.5);
      const count = Math.floor(Math.random() * shuffled.length) + 1;
      shuffled.slice(0, count).forEach(cb => {
        cb.checked = true;
        cb.dispatchEvent(new Event('input', { bubbles: true }));
        cb.dispatchEvent(new Event('change', { bubbles: true }));
      });
    }

  // --- SC question ---
  } else if (isSingle) {
    const radios = [...document.querySelectorAll('.answers-wrapper .cRadio')];
    if (radios.length > 0) {
      const pick = radios[Math.floor(Math.random() * radios.length)];
      pick.checked = true;
      pick.dispatchEvent(new Event('input', { bubbles: true }));
      pick.dispatchEvent(new Event('change', { bubbles: true }));
    }

  // --- Standalone OE (no radio/checkbox, just textarea/s) ---
} else {
  const openEnds = [...document.querySelectorAll('textarea.open-end-input')];
  
  // first pass — check all associated checkboxes
  openEnds.forEach((oe) => {
    const container = oe.closest('.answer-container');
    if (container) {
      const input = container.querySelector('.cCheck, .cRadio');
      if (input && !input.checked) {
        input.checked = true;
        input.dispatchEvent(new Event('input', { bubbles: true }));
        input.dispatchEvent(new Event('change', { bubbles: true }));
      }
    }
  });

  // second pass — fill textareas after a short delay
  setTimeout(() => {
    document.querySelectorAll('textarea.open-end-input').forEach((oe, index) => {
      oe.value = `This is random data ${index + 1}`;
      oe.dispatchEvent(new Event('input', { bubbles: true }));
      oe.dispatchEvent(new Event('change', { bubbles: true }));
    });
  }, 200);
  return;
}

  // --- Fill OE boxes only where parent answer is checked (other specify) ---
  document.querySelectorAll('textarea.open-end-input').forEach((oe, index) => {
    const container = oe.closest('.answer-container');
    if (container) {
      const input = container.querySelector('.cCheck, .cRadio');
      if (input && input.checked) {
        oe.value = `This is random data ${index + 1}`;
        oe.dispatchEvent(new Event('input', { bubbles: true }));
        oe.dispatchEvent(new Event('change', { bubbles: true }));
      }
    } else {
      oe.value = `This is random data ${index + 1}`;
      oe.dispatchEvent(new Event('input', { bubbles: true }));
      oe.dispatchEvent(new Event('change', { bubbles: true }));
    }
  });
}
*/
