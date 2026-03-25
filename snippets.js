//get all checkboxes/ radio inputs
var inputs = [...document.querySelectorAll(".cCheck")];
var inputs = [...document.querySelectorAll(".cRadio")];
//loop over checkboxes, clear them
inputs.forEach((item) => {
  item.checked = false;
});

//get piped elements datacodes
//dcv1 requires splitting data-code by ';'
//wrap the pipe in a <span id='QID'></span> set css on this id to display: none;
var pipedCodes = document
  .querySelector("#MYSPAN .cRef")
  .getAttribute("data-code")
  .split(";");

//dcv2
var pipedCodes = [
  ...document
    .querySelectorAll(".cRef")
    .map((item) => item.getAttribute("data-value")),
];

//loop over piped elements, set an input to true

[...document.querySelectorAll(".cRef")].forEach((element) => {
  if (1 == 1) {
    //input.checked = true;
  }
});

//loop over pipes and inputs to punch
//dvc1
function pageReady() {
  const codes = document
    .querySelector("#qmc .cRef")
    .getAttribute("data-code")
    .split(";")
    .map(Number);

  document.querySelectorAll(".cCheck").forEach((input) => {
    input.checked = codes.includes(+input.value);
  });

  setTimeout(() => $(".buttonNext").click(), 200);
}

//dvc2
function pageReady() {
  const codes = [...document.querySelectorAll(".cRef")].map(
    (el) => +el.getAttribute("data-code"),
  );

  document.querySelectorAll(".cCheck").forEach((input) => {
    input.checked = codes.includes(+input.value);
  });

  setTimeout(() => $(".main-next-button").click(), 200);
}

//make a column exclusive in a SC per row grid
//dcv1
function pageReady() {
  const exclusiveColumnIndex = 0; // 0-based (0=1st, 1=2nd, 2=3rd)

  const targetColRadios = [...document.querySelectorAll(".rsRow")]
    .map((row) => row.querySelectorAll(".cRadio")[exclusiveColumnIndex])
    .filter(Boolean); // removes undefined if some rows are shorter

  targetColRadios.forEach((radio) => {
    radio.addEventListener("change", function () {
      if (!this.checked) return;

      targetColRadios.forEach((r) => {
        if (r !== this) {
          r.checked = false;
        }
      });
    });
  });
}

//dcv2
function pageReady() {
  const exclusiveColumnIndex = 0; // 0-based (0=1st, 1=2nd, 2=3rd)

  const targetColRadios = [...document.querySelectorAll(".answer-row")]
    .map((row) => row.querySelectorAll(".cRadio")[exclusiveColumnIndex])
    .filter(Boolean); // removes undefined if some rows are shorter

  targetColRadios.forEach((radio) => {
    radio.addEventListener("change", function () {
      if (!this.checked) return;

      targetColRadios.forEach((r) => {
        if (r !== this) {
          r.checked = false;
        }
      });
    });
  });
}

//force all OE's in multiple OE to be answered
//dcv1
<span id="myerror">Please provide a response for each box</span>;

function validate() {
  var answered = 0;
  var errorText = document.querySelector("#myerror");
  var inputs = [...document.querySelectorAll(".cTextInput")];
  inputs.forEach((oe) => {
    if (oe.value.length > 0) {
      answered++;
    }
  });

  if (answered != inputs.length) {
    console.log("error");
    errorText.style.display = "block";
  } else {
    errorText.style.display = "none";
    return true;
  }
}

//dcv2
<span id="myerror">Please provide a response for each box</span>;

function validate() {
  var answered = 0;
  var errorText = document.querySelector("#myerror");
  var inputs = [...document.querySelectorAll(".open-end-input")];
  inputs.forEach((oe) => {
    if (oe.value.length > 0) {
      answered++;
    }
  });

  if (answered != inputs.length) {
    console.log("error");
    errorText.style.display = "block";
  } else {
    errorText.style.display = "none";
    return true;
  }
}

//show radio button/ checkbox precodes. Place this in template advanced settings
//will only work if &codes=1 is added to the test link
//cannot work on carousels as the statements do not contain any precode values in their DOM elements
//dvc1

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

let params = new URLSearchParams(document.location.search);
if (params.get("sms_qa") == 1) {
  document.addEventListener("DOMContentLoaded", waitAndApply);
}

//dcv2
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
  if (document.querySelector(".qa-code")) return;

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

  // --- Radio / Checkbox questions ---
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
      if (p) {
        p.prepend(span);
      } else {
        ansText.prepend(span);
      }
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
      if (p) {
        p.prepend(span);
      } else {
        ansText.prepend(span);
      }
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
      if (p) {
        p.prepend(span);
      } else {
        statText.prepend(span);
      }
    }
  });
}
