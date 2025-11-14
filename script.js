const seatingContainer = document.getElementById("seating-container");
const totalSpan = document.getElementById("total");
const resetButton = document.getElementById("reset");
const addRowButton = document.getElementById("add-row");
const removeRowButton = document.getElementById("remove-row");

let rowCount = 7;  // AGORA COMEÇA COM 7 FILEIRAS
const seatsPerSide = 6;

function createRow() {
  const wrapper = document.createElement("div");
  wrapper.classList.add("row-wrapper");

  // REMOVIDO: NENHUM NOME DE FILEIRA

  const row = document.createElement("div");
  row.classList.add("row");

  const leftSide = document.createElement("div");
  leftSide.classList.add("side");

  const rightSide = document.createElement("div");
  rightSide.classList.add("side");

  for (let i = 1; i <= seatsPerSide; i++) {
    const seatLeft = document.createElement("div");
    seatLeft.classList.add("seat");
    leftSide.appendChild(seatLeft);

    const seatRight = document.createElement("div");
    seatRight.classList.add("seat");
    rightSide.appendChild(seatRight);
  }

  const corridor = document.createElement("div");
  corridor.style.width = "15px"; // corredor central menor

  row.appendChild(leftSide);
  row.appendChild(corridor);
  row.appendChild(rightSide);

  wrapper.appendChild(row);
  seatingContainer.appendChild(wrapper);
}


// Criar as 7 fileiras iniciais
for (let i = 0; i < rowCount; i++) {
  createRow();
}

function updateTotal() {
  const selectedSeats = document.querySelectorAll(".seat.selected");
  totalSpan.textContent = selectedSeats.length;
}

seatingContainer.addEventListener("click", e => {
  if (e.target.classList.contains("seat")) {
    e.target.classList.toggle("selected");
    updateTotal();
  }
});

resetButton.addEventListener("click", () => {
  document.querySelectorAll(".seat.selected").forEach(seat =>
    seat.classList.remove("selected")
  );
  updateTotal();
});

addRowButton.addEventListener("click", () => {
  rowCount++;
  createRow();
});

removeRowButton.addEventListener("click", () => {
  const allRows = document.querySelectorAll(".row-wrapper");
  if (allRows.length > 0) {
    allRows[allRows.length - 1].remove();
    rowCount--;
    updateTotal();
  }
});
