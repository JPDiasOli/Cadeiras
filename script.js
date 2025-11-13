const seatingContainer = document.getElementById("seating-container");
const totalSpan = document.getElementById("total");
const resetButton = document.getElementById("reset");
const addRowButton = document.getElementById("add-row");

let rows = 10;
const seatsPerSide = 6;

function createRow() {
  const row = document.createElement("div");
  row.classList.add("row");

  const leftSide = document.createElement("div");
  leftSide.classList.add("side");

  const rightSide = document.createElement("div");
  rightSide.classList.add("side");

  for (let i = 0; i < seatsPerSide; i++) {
    const seatLeft = document.createElement("div");
    seatLeft.classList.add("seat");
    leftSide.appendChild(seatLeft);

    const seatRight = document.createElement("div");
    seatRight.classList.add("seat");
    rightSide.appendChild(seatRight);
  }

  row.appendChild(leftSide);

  // Corredor central (invisível, apenas espaçamento)
  const corridor = document.createElement("div");
  corridor.style.width = "40px";
  row.appendChild(corridor);

  row.appendChild(rightSide);
  seatingContainer.appendChild(row);
}

// Cria as 10 fileiras iniciais
for (let i = 0; i < rows; i++) {
  createRow();
}

function updateTotal() {
  const selectedSeats = document.querySelectorAll(".seat.selected");
  totalSpan.textContent = selectedSeats.length;
}

seatingContainer.addEventListener("click", (e) => {
  if (e.target.classList.contains("seat")) {
    e.target.classList.toggle("selected");
    updateTotal();
  }
});

resetButton.addEventListener("click", () => {
  document.querySelectorAll(".seat.selected").forEach(seat => seat.classList.remove("selected"));
  updateTotal();
});

addRowButton.addEventListener("click", () => {
  createRow();
});
