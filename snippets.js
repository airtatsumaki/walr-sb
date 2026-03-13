//get all checkboxes
var checkboxes = Array.from(document.querySelectorAll(".cCheck"));
//loop over checkboxes, clear them
checkboxes.forEach((input) => {
  input.checked = false;
});

//get piped elements
var piped = Array.from(document.querySelectorAll(".cRef"));

//loop over piped elements, set an input to true
Array.from(document.querySelectorAll(".cRef")).forEach((element) => {
  if (1 == 1) {
    //input.checked = true;
  }
});

//loop over pipes and inputs to punch
function pageReady() {
  var checkboxes = Array.from(document.querySelectorAll(".cCheck"));
  Array.from(document.querySelectorAll(".cRef")).forEach((element) => {
    checkboxes.forEach((input) => {
      if (
        parseInt(element.getAttribute("data-code")) ==
        parseInt(input.getAttribute("value"))
      ) {
        input.checked = true;
      }
    });
  });
  setTimeout(function () {
    $(".main-next-button").click();
  }, 200);
}

//css for OE left align:
/*
ul.numeric-input-question-answers-container li.answer-container{
    flex-direction: row-reverse;
}
*/
