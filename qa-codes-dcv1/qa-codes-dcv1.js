// ===============================
// QA CODES — DCV1
// ===============================

window.qaAnswerHistory = window.qaAnswerHistory || [];

// ===============================
// APPLY QA CODES
// ===============================
function applyQACodes() {
  if (document.querySelector(".qa-code")) return;

  // --- Question ID labels ---
  document.querySelectorAll(".cTABLEContainQues[id]").forEach((table) => {
    const value = table.getAttribute("id");
    const questionText = table.querySelector(".cQuestionText");
    if (questionText) {
      const span = document.createElement("span");
      span.className = "qa-code";
      span.textContent = `[${value}]`;
      questionText.prepend(span);
    }
  });

  // --- Flag hidden (HID_) questions ---
  document.querySelectorAll(".cTABLEContainQues[id]").forEach((table) => {
    const id = table.getAttribute("id") || "";
    if (id.toLowerCase().startsWith("hid_")) {
      table.classList.add("dummy-question");
    }
  });

  // --- Radio / Checkbox answer codes (exclude grid inputs) ---
  document.querySelectorAll(".cRadio, .cCheck").forEach((input) => {
    if (input.closest(".cCell.textcenter")) return;
    const value = input.getAttribute("value");
    const row = input.closest("tr");
    if (row) {
      const rowText = row.querySelector(".cRowText p");
      if (rowText) {
        const span = document.createElement("span");
        span.className = "qa-code";
        span.textContent = `[${value}]`;
        rowText.prepend(span);
      }
    }
  });

  // --- Exclusive option labels (MC questions with exclusive radio) ---
  document.querySelectorAll(".cTable").forEach((table) => {
    const radios = table.querySelectorAll('input[type="radio"].cRadio');
    const checkboxes = table.querySelectorAll('input[type="checkbox"].cCheck');
    if (checkboxes.length > 0 && radios.length > 0) {
      radios.forEach((radio) => {
        if (radio.closest(".cCell.textcenter")) return;
        const rowText = radio.closest("tr")?.querySelector(".cRowText p");
        if (rowText) {
          const span = document.createElement("span");
          span.className = "qa-code";
          span.textContent = "[EX]";
          const existingCode = rowText.querySelector(".qa-code");
          if (existingCode) {
            existingCode.insertAdjacentElement("afterend", span);
          } else {
            rowText.prepend(span);
          }
        }
      });
    }
  });

  // --- Grid column headers ---
  document.querySelectorAll(".cTable").forEach((table) => {
    const headerCells = [...table.querySelectorAll('th.cCellHeader[id^="h_"]')];
    headerCells.forEach((th, index) => {
      const colValue = index + 1;
      const p = th.querySelector("p");
      if (p) {
        const span = document.createElement("span");
        span.className = "qa-code";
        span.textContent = `[${colValue}]`;
        p.prepend(span);
      }
    });
  });

  // --- Grid row headers ---
  document.querySelectorAll('th.cCellRowText[id^="r_"]').forEach((th) => {
    const value = th.getAttribute("id").split("_").pop();
    const p = th.querySelector(".cRowText p");
    if (p) {
      const span = document.createElement("span");
      span.className = "qa-code";
      span.textContent = `[${value}]`;
      p.prepend(span);
    }
  });

  addAnswerForMeButton();
}

// ===============================
// WAIT AND APPLY
// ===============================
function waitAndApply() {
  if (!document.querySelector(".cTABLEContainQues")) {
    setTimeout(waitAndApply, 100);
    return;
  }

  applyQACodes();

  const observer = new MutationObserver(() => {
    observer.disconnect();
    applyQACodes();
    observer.observe(document.body, { childList: true, subtree: true });
  });

  observer.observe(document.body, { childList: true, subtree: true });
}

// ===============================
// ANSWER FOR ME BUTTON
// ===============================
function addAnswerForMeButton() {
  if (document.querySelector(".answer-for-me")) return;

  const nextBtn =
    document.querySelector(".buttonNext") ||
    document.querySelector('[name="next"]');
  if (!nextBtn) return;

  const btn = document.createElement("button");
  btn.type = "button";
  btn.className = "answer-for-me";
  btn.textContent = "Answer for me";

  btn.addEventListener("click", function (e) {
    e.preventDefault();
    e.stopPropagation();
    answerForMe();
    setTimeout(() => {
      const next =
        document.querySelector(".buttonNext") ||
        document.querySelector('[name="next"]');
      if (next) next.click();
    }, 600);
  });

  nextBtn.parentElement.insertBefore(btn, nextBtn);

  // Keyboard shortcut — attach once
  if (!window.qaKeyListenerAttached) {
    window.qaKeyListenerAttached = true;

    document.addEventListener("keydown", function (e) {
      const trigger = e.ctrlKey || e.metaKey;
      if (!trigger) return;

      if (e.key === "ArrowRight") {
        e.preventDefault();
        document.querySelector(".answer-for-me")?.click();
      }

      if (e.key === "ArrowLeft") {
        e.preventDefault();
        const back =
          document.querySelector(".buttonBack") ||
          document.querySelector('[name="back"]');
        if (back) back.click();
      }
    });
  }
}

// ===============================
// ANSWER FOR ME LOGIC
// ===============================
function answerForMe() {
  // --- Guard: skip if already answered ---
  const alreadyAnswered =
    document.querySelector(".cRadio:checked") ||
    document.querySelector(".cCheck:checked");

  if (alreadyAnswered) return;

  const isGrid = !!document.querySelector(".cCell.textcenter .cRadio");

  const isMC = [...document.querySelectorAll(".cTable")].some((table) => {
    return (
      table.querySelector('input[type="checkbox"].cCheck') &&
      table.querySelector('input[type="radio"].cRadio')
    );
  });

  // --- Grid (SC per row) ---
  if (isGrid) {
    [...document.querySelectorAll("tr.rsRow, tr.rsRowAlt")].forEach((row) => {
      const radios = [...row.querySelectorAll(".cCell.textcenter .cRadio")];
      if (radios.length > 0) {
        const pick = radios[Math.floor(Math.random() * radios.length)];
        pick.checked = true;
        pick.dispatchEvent(new Event("input", { bubbles: true }));
        pick.dispatchEvent(new Event("change", { bubbles: true }));
      }
    });
    return;
  }

  // --- MC (checkboxes + optional exclusive radio) ---
  if (isMC) {
    const checkboxes = [
      ...document.querySelectorAll('input[type="checkbox"].cCheck'),
    ];
    const exclusiveRadios = [
      ...document.querySelectorAll('input[type="radio"].cRadio'),
    ].filter((r) => !r.closest(".cCell.textcenter"));

    const pickExclusive = exclusiveRadios.length > 0 && Math.random() < 0.2;

    if (pickExclusive) {
      const pick =
        exclusiveRadios[Math.floor(Math.random() * exclusiveRadios.length)];
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
    return;
  }

  // --- SC (radios only, not grid) ---
  const radios = [...document.querySelectorAll(".cRadio")].filter(
    (r) => !r.closest(".cCell.textcenter"),
  );
  if (radios.length > 0) {
    const pick = radios[Math.floor(Math.random() * radios.length)];
    pick.checked = true;
    pick.dispatchEvent(new Event("input", { bubbles: true }));
    pick.dispatchEvent(new Event("change", { bubbles: true }));
    return;
  }

  // --- Open ended (cTextInput) ---
  const openEnds = [...document.querySelectorAll(".cTextInput")];
  if (openEnds.length > 0) {
    openEnds.forEach((oe, index) => {
      oe.value = `This is random data ${index + 1}`;
      oe.dispatchEvent(new Event("input", { bubbles: true }));
      oe.dispatchEvent(new Event("change", { bubbles: true }));
    });
  }
}

// ===============================
// CAPTURE CAROUSEL ANSWER (DCV1)
// ===============================
function captureCarouselAnswer(clickedBtn) {
  // Read statement text immediately at click time — before any animation
  const statementText = document
    .querySelector(".rsScrollGridContent .cRowText p")
    ?.innerText.replace(/^\[.*?\]/, "")
    .trim();

  const colIndex = parseInt(clickedBtn.getAttribute("alt"), 10);
  const colValue = colIndex + 1;

  const colHeader = [...document.querySelectorAll('th.cCellHeader[id^="h_"]')][
    colIndex
  ]
    ?.querySelector("p")
    ?.innerText.replace(/^\[.*?\]/, "")
    .trim();

  const matchingRow = [
    ...document.querySelectorAll('th.cCellRowText[id^="r_"]'),
  ].find((th) => {
    const rowText = th
      .querySelector(".cRowText p")
      ?.innerText.replace(/^\[.*?\]/, "")
      .trim();
    return rowText && statementText && rowText.includes(statementText);
  });

  const rowValue = matchingRow?.getAttribute("id").split("_").pop();

  if (!rowValue || !colHeader || !statementText) return;

  const qid = document
    .querySelector(".cTABLEContainQues[id]")
    ?.getAttribute("id");

  if (!qid) return;

  const answerText = `[${rowValue}] ${statementText} = ${colHeader} [${colValue}]`;

  const existingIndex = window.qaAnswerHistory.findIndex((e) => e.qid === qid);

  if (existingIndex > -1) {
    const rowAnswerIndex = window.qaAnswerHistory[
      existingIndex
    ].answers.findIndex((a) => a.startsWith(`[${rowValue}]`));

    if (rowAnswerIndex > -1) {
      window.qaAnswerHistory[existingIndex].answers[rowAnswerIndex] =
        answerText;
    } else {
      window.qaAnswerHistory[existingIndex].answers.push(answerText);
    }
  } else {
    window.qaAnswerHistory.push({ qid, answers: [answerText] });
  }

  renderSidebar();
}

// ===============================
// CAPTURE ANSWERS
// ===============================
function captureCurrentAnswers() {
  [...document.querySelectorAll(".cTABLEContainQues[id]")].forEach((table) => {
    const qid = table.getAttribute("id");
    const entry = { qid, answers: [] };

    // --- SC / MC answers ---
    const checked = [
      ...table.querySelectorAll(".cRadio:checked, .cCheck:checked"),
    ].filter((r) => !r.closest(".cCell.textcenter"));

    if (checked.length) {
      const formatted = checked.map((input) => {
        const value = input.getAttribute("value");
        const label =
          input
            .closest("tr")
            ?.querySelector(".cRowText p")
            ?.innerText.replace(/^\[.*?\]/, "")
            .trim() || "";
        return `[${value}] ${label}`;
      });
      entry.answers.push(formatted.join(", "));
    }

    // --- Grid answers ---
    [...table.querySelectorAll("tr.rsRow, tr.rsRowAlt")].forEach((row) => {
      const checked = row.querySelector(".cCell.textcenter .cRadio:checked");
      if (!checked) return;

      const rowLabel = row
        .querySelector(".cCellRowText .cRowText p")
        ?.innerText.replace(/^\[.*?\]/, "")
        .trim();

      const colValue = checked.value;

      const allRadiosInRow = [
        ...row.querySelectorAll(".cCell.textcenter .cRadio"),
      ];
      const colIndex = allRadiosInRow.indexOf(checked);
      const colHeader = [...table.querySelectorAll('th.cCellHeader[id^="h_"]')][
        colIndex
      ]
        ?.querySelector("p")
        ?.innerText.replace(/^\[.*?\]/, "")
        .trim();

      entry.answers.push(`[${rowLabel}] = ${colHeader} [${colValue}]`);
    });

    // --- Open ended (cTextInput) ---
    [...table.querySelectorAll(".cTextInput")].forEach((oe, index) => {
      if (oe.value.trim() === "") return;
      entry.answers.push(`Response ${index + 1}: "${oe.value.trim()}"`);
    });

    // --- Don't overwrite carousel answers already captured per-click ---
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
      '<p style="color: #888; font-size: 13px;">No answers captured yet.</p>';
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

  // Sidebar appended first so toggle tab sibling selector works in CSS
  const sidebar = document.createElement("div");
  sidebar.id = "qa-sidebar";
  sidebar.innerHTML = `
    <div id="qa-sidebar-header">
      <span>Answer History</span>
    </div>
    <div id="qa-history-list"><p style="color: #888; font-size: 13px;">No answers captured yet.</p></div>
  `;
  document.body.appendChild(sidebar);

  // Toggle tab appended after sidebar
  const toggleBtn = document.createElement("button");
  toggleBtn.id = "qa-toggle-btn";
  toggleBtn.title = "Answer History";
  toggleBtn.innerHTML = `
    <svg viewBox="0 0 24 24" width="24" height="24" aria-hidden="true">
      <line x1="4" y1="6" x2="20" y2="6" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
      <line x1="4" y1="12" x2="20" y2="12" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
      <line x1="4" y1="18" x2="20" y2="18" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
    </svg>
  `;
  document.body.appendChild(toggleBtn);

  toggleBtn.addEventListener("click", () => {
    captureCurrentAnswers();
    sidebar.classList.toggle("open");
  });
}

// ===============================
// NEXT BUTTON WATCHER
// ===============================
function initNextButtonWatcher() {
  const observer = new MutationObserver(() => {
    const nextBtn =
      document.querySelector(".buttonNext") ||
      document.querySelector('[name="next"]');

    if (!nextBtn || nextBtn.dataset.qaHooked) return;
    nextBtn.dataset.qaHooked = "true";

    nextBtn.addEventListener("click", () => captureCurrentAnswers(), true);
  });

  observer.observe(document.body, { childList: true, subtree: true });
}

// ===============================
// CLICK WATCHER
// ===============================
function initClickWatcher() {
  document.addEventListener(
    "click",
    (e) => {
      // standard inputs — capture after click settles
      if (e.target.matches(".cRadio, .cCheck, .cTextInput")) {
        setTimeout(() => captureCurrentAnswers(), 0);
      }

      // dcv1 carousel button — capture immediately at click time
      const carouselBtn = e.target.closest(".rsBtn");
      if (carouselBtn) {
        captureCarouselAnswer(carouselBtn);
      }
    },
    true,
  );
}

// ===============================
// INIT
// ===============================
function init() {
  let params = new URLSearchParams(document.location.search);
  if (params.get("sms_qa") == 1) {
    waitAndApply();
    buildHistorySidebar();
    initNextButtonWatcher();
    initClickWatcher();
  }
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}
