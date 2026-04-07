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
        const back = document.querySelector("#btnPrevious2");
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
      <span>Super Awesome Sidebar</span>
    </div>
    <div id="qa-history-list"><p style="color: #888; font-size: 13px;">No answers captured yet.</p></div>
  `;
  document.body.appendChild(sidebar);

  const helpIcon = document.createElement("span");
  helpIcon.id = "qac-help-icon";
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
    "QA Sidebar Help:\n- Use codes\n- Test flows",
  );
  document.querySelector("#qa-sidebar-header").appendChild(helpIcon);

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
