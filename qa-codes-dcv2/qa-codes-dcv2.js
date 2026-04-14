//served via https://www.jsdelivr.com

let lastQuestionId = null;

pageReady();

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
  if (
    currentQuestion.id &&
    currentQuestion.id.toLowerCase().startsWith("hid_")
  ) {
    currentQuestion.parentElement?.classList.add("dummy-question");
  }

  const currentId = currentQuestion.id;

  // Prevent rerun on same question
  if (currentId === lastQuestionId) return;
  lastQuestionId = currentId;

  // --- reset previous QA elements ---
  document.querySelectorAll(".qa-code").forEach((el) => el.remove());
  document.querySelectorAll(".answer-for-me").forEach((el) => el.remove());

  addAnswerForMeButton();

  // --- Flag hidden questions ---
  var dummy = [
    ...document.querySelectorAll('.question-container[id^="HID_" i]'),
  ];
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

          const valueKey = parseInt(input.name.split("-").pop(), 10) + 1;

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
    sidebar.innerHTML = `
    <div id="qa-sidebar-header">
      <span>Super Awesome Sidebar</span>
    </div>
    <div id="qa-history-list"><p style="color: #888; font-size: 13px;">No answers captured yet.</p></div>
    `;

    toggleBtn.addEventListener("click", () => {
      captureCurrentAnswers();
      sidebar.classList.toggle("open");
    });

    document.body.appendChild(toggleBtn);
    document.body.appendChild(sidebar);

    const helpIcon = document.createElement("span");
    helpIcon.id = "qa-help-icon";
    helpIcon.innerHTML = `
    <svg viewBox="0 0 24 24">
      <g id="SVGRepo_bgCarrier" stroke-width="0"></g>
      <g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g>
      <g id="SVGRepo_iconCarrier">
        <path d="M23 12C23 18.0751 18.0751 23 12 23C5.92487 23 1 18.0751 1 12C1 5.92487 5.92487 1 12 1C18.0751 1 23 5.92487 23 12ZM3.00683 12C3.00683 16.9668 7.03321 20.9932 12 20.9932C16.9668 20.9932 20.9932 16.9668 20.9932 12C20.9932 7.03321 16.9668 3.00683 12 3.00683C7.03321 3.00683 3.00683 7.03321 3.00683 12Z"></path>
        <path d="M13.5 18C13.5 18.8284 12.8284 19.5 12 19.5C11.1716 19.5 10.5 18.8284 10.5 18C10.5 17.1716 11.1716 16.5 12 16.5C12.8284 16.5 13.5 17.1716 13.5 18Z"></path>
        <path d="M11 12V14C11 14 11 15 12 15C13 15 13 14 13 14V12C13 12 13.4792 11.8629 13.6629 11.7883C13.6629 11.7883 13.9969 11.6691 14.2307 11.4896C14.4646 11.3102 14.6761 11.097 14.8654 10.8503C15.0658 10.6035 15.2217 10.3175 15.333 9.99221C15.4443 9.66693 15.5 9.4038 15.5 9C15.5 8.32701 15.3497 7.63675 15.0491 7.132C14.7596 6.61604 14.3476 6.21786 13.8132 5.93745C13.2788 5.64582 12.6553 5.5 11.9427 5.5C11.4974 5.5 11.1021 5.55608 10.757 5.66825C10.4118 5.7692 10.1057 5.9094 9.83844 6.08887C9.58236 6.25712 9.36525 6.4478 9.18711 6.66091C9.02011 6.86281 8.8865 7.0591 8.78629 7.24978C8.68609 7.44046 8.61929 7.6087 8.58589 7.75452C8.51908 7.96763 8.49125 8.14149 8.50238 8.27609C8.52465 8.41069 8.59145 8.52285 8.70279 8.61258C8.81413 8.70231 8.9867 8.79765 9.22051 8.8986C9.46546 8.97712 9.65473 9.00516 9.78834 8.98273C9.93308 8.96029 10.05 8.89299 10.1391 8.78083C10.1391 8.78083 10.6138 8.10569 10.7474 7.97109C10.8922 7.82528 11.0703 7.71312 11.2819 7.6346C11.4934 7.54487 11.7328 7.5 12 7.5C12.579 7.5 13.0076 7.64021 13.286 7.92062C13.5754 8.18982 13.6629 8.41629 13.6629 8.93225C13.6629 9.27996 13.6017 9.56038 13.4792 9.77349C13.3567 9.9866 13.1953 10.1605 12.9949 10.2951C12.9949 10.2951 12.7227 10.3991 12.5 10.5C12.2885 10.5897 11.9001 10.7381 11.6997 10.8503C11.5104 10.9512 11.4043 11.0573 11.2819 11.2144C11.1594 11.3714 11 11.7308 11 12Z"></path>
      </g>
    </svg>`;
    helpIcon.setAttribute(
      "data-tooltip",
      `Features list:\n
      - Answer history\n
      - Dummy backgrounds (prefix dummy QID's with 'HID_')\n
      - Answer for me button (answer question and auto next)\n
      - CTRL/ COMMAND + right arrow (answer question and auto next)\n
      - CTRL/ COMMAND + left arrow (go back to previous question)`,
    );
    document.querySelector("#qa-sidebar-header").appendChild(helpIcon);
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
