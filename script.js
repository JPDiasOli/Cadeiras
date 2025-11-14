const seatingContainer = document.getElementById("seating-container");
const totalSpan = document.getElementById("total");
const resetButton = document.getElementById("reset");
const addRowButton = document.getElementById("add-row");
const removeRowButton = document.getElementById("remove-row");

const settingsBtn = document.getElementById("settings-btn");
const settingsModal = document.getElementById("settings-modal");
const closeSettingsBtn = document.getElementById("close-settings");
const saveSettingsBtn = document.getElementById("save-settings");

const numRowsInput = document.getElementById("num-rows");
const seatsPerSideInput = document.getElementById("seats-per-side");
const colorFreeInput = document.getElementById("color-free");
const colorSelectedInput = document.getElementById("color-selected");

let rowCount = parseInt(numRowsInput.value);
let seatsPerSide = parseInt(seatsPerSideInput.value);
let colorFree = colorFreeInput.value;
let colorSelected = colorSelectedInput.value;

// Letras das fileiras (A, B, C...)
function getRowLetter(index) {
  return String.fromCharCode(65 + index); // 65 = A
}

function createRow(rowIndex) {
  const wrapper = document.createElement("div");
  wrapper.classList.add("row-wrapper");

  const letterDiv = document.createElement("div");
  letterDiv.classList.add("row-letter");
  letterDiv.textContent = getRowLetter(rowIndex);

  const row = document.createElement("div");
  row.classList.add("row");

  const leftSide = document.createElement("div");
  leftSide.classList.add("side");
  const rightSide = document.createElement("div");
  rightSide.classList.add("side");

  for (let i = 1; i <= seatsPerSide; i++) {
    const seatLeft = document.createElement("div");
    seatLeft.classList.add("seat");
    seatLeft.style.background = colorFree;
    seatLeft.textContent = i;
    leftSide.appendChild(seatLeft);

    const seatRight = document.createElement("div");
    seatRight.classList.add("seat");
    seatRight.style.background = colorFree;
    seatRight.textContent = i + seatsPerSide;
    rightSide.appendChild(seatRight);
  }

  const corridor = document.createElement("div");
  corridor.style.width = "15px";

  row.appendChild(leftSide);
  row.appendChild(corridor);
  row.appendChild(rightSide);

  wrapper.appendChild(letterDiv);
  wrapper.appendChild(row);
  seatingContainer.appendChild(wrapper);
}

function renderSeating() {
  seatingContainer.innerHTML = "";
  for (let i = 0; i < rowCount; i++) createRow(i);
  attachSeatEvents();
}

function attachSeatEvents() {
  document.querySelectorAll(".seat").forEach(seat => {
    seat.addEventListener("click", () => {
      seat.classList.toggle("selected");
      seat.style.background = seat.classList.contains("selected") ? colorSelected : colorFree;
      updateTotal();
    });
  });
}

function updateTotal() {
  const selectedSeats = document.querySelectorAll(".seat.selected");
  totalSpan.textContent = selectedSeats.length;
}

// Botões
resetButton.addEventListener("click", () => {
  document.querySelectorAll(".seat.selected").forEach(seat => {
    seat.classList.remove("selected");
    seat.style.background = colorFree;
  });
  updateTotal();
});

addRowButton.addEventListener("click", () => { rowCount++; renderSeating(); });
removeRowButton.addEventListener("click", () => { if(rowCount>1){ rowCount--; renderSeating(); }});

settingsBtn.addEventListener("click", ()=> settingsModal.style.display="flex");
closeSettingsBtn.addEventListener("click", ()=> settingsModal.style.display="none");
saveSettingsBtn.addEventListener("click", ()=>{
  rowCount = parseInt(numRowsInput.value);
  seatsPerSide = parseInt(seatsPerSideInput.value);
  colorFree = colorFreeInput.value;
  colorSelected = colorSelectedInput.value;
  renderSeating();
  settingsModal.style.display="none";
});

// Inicializa
renderSeating();
