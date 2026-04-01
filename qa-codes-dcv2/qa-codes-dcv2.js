//served via https://raw.githack.com/

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

    // --- Open End only ---
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
