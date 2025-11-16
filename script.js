// Configuração do Supabase
const supabaseUrl = 'https://plqqwvtszyhzqmoeqljj.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBscXF3dnRzenloenFtb2VxbGpqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjMyNTYzNDcsImV4cCI6MjA3ODgzMjM0N30.P1PsVcaHPYJZvVQnUbWbLGtUAqiX618KlMTVi4lDlHM';

const supabase = window.supabase.createClient(supabaseUrl, supabaseKey);

const seatingContainer = document.getElementById("seating-container");
const totalSpan = document.getElementById("total");
const resetButton = document.getElementById("reset");
const addRowButton = document.getElementById("add-row");
const removeRowButton = document.getElementById("remove-row");
const statusMessage = document.getElementById("status-message");

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
let autoSaveTimeout = null;

// Estado global para manter as seleções
let selectedSeatsState = new Set();

// Função para gerar ID único do assento
function getSeatId(row, side, number) {
  return `${row}-${side}-${number}`;
}

// Letras das fileiras (A, B, C...)
function getRowLetter(index) {
  return String.fromCharCode(65 + index);
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
    const rowLetter = getRowLetter(rowIndex);
    
    // Assento esquerdo
    const seatLeft = document.createElement("div");
    seatLeft.classList.add("seat");
    const seatLeftId = getSeatId(rowLetter, 'left', i);
    
    // Verifica se este assento estava selecionado
    if (selectedSeatsState.has(seatLeftId)) {
      seatLeft.classList.add("selected");
      seatLeft.style.background = colorSelected;
    } else {
      seatLeft.style.background = colorFree;
    }
    
    seatLeft.textContent = i;
    seatLeft.dataset.row = rowLetter;
    seatLeft.dataset.side = 'left';
    seatLeft.dataset.number = i;
    seatLeft.dataset.id = seatLeftId;
    leftSide.appendChild(seatLeft);

    // Assento direito
    const seatRight = document.createElement("div");
    seatRight.classList.add("seat");
    const seatRightId = getSeatId(rowLetter, 'right', i + seatsPerSide);
    
    // Verifica se este assento estava selecionado
    if (selectedSeatsState.has(seatRightId)) {
      seatRight.classList.add("selected");
      seatRight.style.background = colorSelected;
    } else {
      seatRight.style.background = colorFree;
    }
    
    seatRight.textContent = i + seatsPerSide;
    seatRight.dataset.row = rowLetter;
    seatRight.dataset.side = 'right';
    seatRight.dataset.number = i + seatsPerSide;
    seatRight.dataset.id = seatRightId;
    rightSide.appendChild(seatRight);
  }

  // Corredor com classe CSS
  const corridor = document.createElement("div");
  corridor.classList.add("corridor");

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
  updateTotal(); // Atualiza o total após renderizar
}

function attachSeatEvents() {
  document.querySelectorAll(".seat").forEach(seat => {
    seat.addEventListener("click", () => {
      const seatId = seat.dataset.id;
      
      if (seat.classList.contains("selected")) {
        seat.classList.remove("selected");
        seat.style.background = colorFree;
        selectedSeatsState.delete(seatId);
      } else {
        seat.classList.add("selected");
        seat.style.background = colorSelected;
        selectedSeatsState.add(seatId);
      }
      
      updateTotal();
      autoSaveToDatabase(); // Salva automaticamente
    });
  });
}

function updateTotal() {
  totalSpan.textContent = selectedSeatsState.size;
}

// Função para salvar automaticamente no Supabase (com debounce)
async function autoSaveToDatabase() {
  // Limpa timeout anterior para evitar múltiplas chamadas rápidas
  if (autoSaveTimeout) {
    clearTimeout(autoSaveTimeout);
  }

  // Mostra status de salvando
  showStatus('Salvando...', '#339af0');

  // Configura novo timeout (debounce de 500ms)
  autoSaveTimeout = setTimeout(async () => {
    const allSeats = [];
    
    // Prepara dados de TODOS os assentos possíveis com base na configuração atual
    for (let rowIndex = 0; rowIndex < rowCount; rowIndex++) {
      const rowLetter = getRowLetter(rowIndex);
      
      for (let i = 1; i <= seatsPerSide; i++) {
        // Assento esquerdo
        const leftSeatId = getSeatId(rowLetter, 'left', i);
        allSeats.push({
          row: rowLetter,
          side: 'left',
          number: i,
          selected: selectedSeatsState.has(leftSeatId)
        });

        // Assento direito
        const rightSeatId = getSeatId(rowLetter, 'right', i + seatsPerSide);
        allSeats.push({
          row: rowLetter,
          side: 'right',
          number: i + seatsPerSide,
          selected: selectedSeatsState.has(rightSeatId)
        });
      }
    }

    const seatingData = {
      row_count: rowCount,
      seats_per_side: seatsPerSide,
      color_free: colorFree,
      color_selected: colorSelected,
      all_seats: allSeats,
      updated_at: new Date().toISOString()
    };

    try {
      const { data, error } = await supabase
        .from('seating_configurations')
        .upsert({
          id: 1,
          ...seatingData
        });

      if (error) {
        console.error('Erro ao salvar:', error);
        showStatus('Erro ao salvar: ' + error.message, '#ff6b6b');
      } else {
        console.log('Dados salvos automaticamente:', data);
        showStatus('Salvo automaticamente!', '#51cf66');
        
        // Remove a mensagem após 2 segundos
        setTimeout(() => {
          statusMessage.textContent = '';
        }, 2000);
      }
    } catch (error) {
      console.error('Erro:', error);
      showStatus('Erro de conexão', '#ff6b6b');
    }
  }, 500);
}

// Função para carregar do Supabase
async function loadFromDatabase() {
  showStatus('Carregando...', '#339af0');
  
  try {
    const { data, error } = await supabase
      .from('seating_configurations')
      .select('*')
      .eq('id', 1)
      .single();

    if (error) {
      console.error('Erro ao carregar:', error);
      showStatus('Erro ao carregar: ' + error.message, '#ff6b6b');
      return;
    }

    if (data) {
      // Limpa o estado atual
      selectedSeatsState.clear();

      // Atualizar configurações
      rowCount = data.row_count;
      seatsPerSide = data.seats_per_side;
      colorFree = data.color_free;
      colorSelected = data.color_selected;

      // Atualizar inputs
      numRowsInput.value = rowCount;
      seatsPerSideInput.value = seatsPerSide;
      colorFreeInput.value = colorFree;
      colorSelectedInput.value = colorSelected;

      // Restaurar seleções no estado global
      if (data.all_seats) {
        data.all_seats.forEach(seat => {
          const seatId = getSeatId(seat.row, seat.side, seat.number);
          if (seat.selected) {
            selectedSeatsState.add(seatId);
          }
        });
      }

      // Renderizar assentos (que agora vão usar o estado global)
      renderSeating();

      showStatus('Configuração carregada!', '#51cf66');
      
      // Remove a mensagem após 3 segundos
      setTimeout(() => {
        statusMessage.textContent = '';
      }, 3000);
    } else {
      // Nenhum dado salvo ainda, apenas renderiza com configurações padrão
      renderSeating();
    }
  } catch (error) {
    console.error('Erro:', error);
    showStatus('Erro ao conectar com o banco de dados', '#ff6b6b');
    // Renderiza mesmo com erro
    renderSeating();
  }
}

// Função para mostrar status
function showStatus(message, color) {
  statusMessage.textContent = message;
  statusMessage.style.color = color;
}

// Botões
resetButton.addEventListener("click", () => {
  selectedSeatsState.clear();
  renderSeating(); // Isso vai recriar todos os assentos sem seleções
  autoSaveToDatabase(); // Salva automaticamente após reset
});

addRowButton.addEventListener("click", () => { 
  rowCount++; 
  renderSeating(); // As seleções são mantidas pelo selectedSeatsState
  autoSaveToDatabase();
});

removeRowButton.addEventListener("click", () => { 
  if(rowCount > 1){ 
    rowCount--; 
    
    // Remove seleções de assentos que não existem mais
    const currentSeatIds = new Set();
    for (let rowIndex = 0; rowIndex < rowCount; rowIndex++) {
      const rowLetter = getRowLetter(rowIndex);
      for (let i = 1; i <= seatsPerSide; i++) {
        currentSeatIds.add(getSeatId(rowLetter, 'left', i));
        currentSeatIds.add(getSeatId(rowLetter, 'right', i + seatsPerSide));
      }
    }
    
    // Filtra apenas assentos que ainda existem
    selectedSeatsState = new Set(
      Array.from(selectedSeatsState).filter(seatId => currentSeatIds.has(seatId))
    );
    
    renderSeating();
    autoSaveToDatabase();
  }
});

settingsBtn.addEventListener("click", ()=> settingsModal.style.display="flex");
closeSettingsBtn.addEventListener("click", ()=> settingsModal.style.display="none");
saveSettingsBtn.addEventListener("click", ()=>{
  rowCount = parseInt(numRowsInput.value);
  seatsPerSide = parseInt(seatsPerSideInput.value);
  colorFree = colorFreeInput.value;
  colorSelected = colorSelectedInput.value;
  renderSeating();
  autoSaveToDatabase();
  settingsModal.style.display="none";
});

// Carrega automaticamente ao iniciar a página
document.addEventListener('DOMContentLoaded', function() {
  loadFromDatabase();
  
  // Configurar polling para atualizações automáticas a cada 3 segundos
  setInterval(loadFromDatabase, 3000);
});

// Inicializa
renderSeating();