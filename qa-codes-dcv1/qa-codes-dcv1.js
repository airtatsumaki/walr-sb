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

  // --- Radio / Checkbox answer codes (exclude grid inputs) ---
  document.querySelectorAll(".cRadio, .cCheck").forEach((input) => {
    if (input.closest(".cCell.textcenter")) return; // skip grid inputs
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

  // --- Exclusive option labels (dcv1 MC questions) ---
  document.querySelectorAll(".cTable").forEach((table) => {
    const radios = table.querySelectorAll('input[type="radio"].cRadio');
    const checkboxes = table.querySelectorAll('input[type="checkbox"].cCheck');
    if (checkboxes.length > 0 && radios.length > 0) {
      radios.forEach((radio) => {
        if (radio.closest(".cCell.textcenter")) return; // skip grid inputs
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
      const colValue = index + 1; // headers are 0-based, values are 1-based
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
}

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

document.addEventListener("DOMContentLoaded", () => {
  let params = new URLSearchParams(document.location.search);
  if (params.get("sms_qa") == 1) {
    waitAndApply();
  }
});
