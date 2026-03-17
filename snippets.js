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
    (el) => +el.dataset.code,
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
