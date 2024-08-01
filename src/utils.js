export function displayDialogue(text, header, onDisplayEnd) {
  const dialogueUI = document.getElementById("textbox-container");
  const dialogueH1 = document.getElementById("name");
  const dialogue = document.getElementById("dialogue");

  dialogueUI.style.display = "block";

  let index = 0;
  let currentHeader = "";
  let currentText = "";
  const intervalRef = setInterval(() => {
    if (index < header.length) {
      currentHeader += header[index];
      dialogueH1.innerText = currentHeader;
      index++;
      console.log("Header: " + currentHeader);
    } else if (index - header.length < text.length) {
      currentText += text[index - header.length];
      dialogue.innerText = currentText;
      index++;
      console.log("Text: " + currentText);
    } else {
      clearInterval(intervalRef);
      console.log("Interval cleared.");
    }
  }, 5);

  const closeBtn = document.getElementById("close");

  function onCloseBtnClick() {
    onDisplayEnd();
    dialogueUI.style.display = "none";
    dialogueH1.innerHTML = "";
    dialogue.innerHTML = "";
    clearInterval(intervalRef);
    closeBtn.removeEventListener("click", onCloseBtnClick);
  }

  closeBtn.addEventListener("click", onCloseBtnClick);
}

export function setCamScale(k) {
  const resizeFactor = k.width() / k.height();
  if (resizeFactor < 1) {
    k.camScale(k.vec2(1));
    return;
  }

  k.camScale(k.vec2(1.5));
}
