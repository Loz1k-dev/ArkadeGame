const TOTAL_CARDS = 48;
let currentSlot = null;

// Инициализация при запуске
window.onload = () => {
    const grid = document.getElementById('cardGrid');
    
    for (let i = 0; i < TOTAL_CARDS; i++) {
        const slot = document.createElement('div');
        slot.className = 'card-container';
        slot.innerHTML = `
            <div class="card-inner" id="card-${i}" onclick="handleCardClick(${i})">
                <div class="card-front empty-slot">+</div>
                <div class="card-back">
                    <p style="font-size: 10px;">SCAN QR</p>
                    <img src="https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=STALKER-CARD-${i}" width="80">
                </div>
            </div>
        `;
        grid.appendChild(slot);
        renderCardFromStorage(i);
    }
};

function handleCardClick(index) {
    const data = localStorage.getItem(`stalker_card_${index}`);
    if (!data) {
        currentSlot = index;
        document.getElementById('modal').style.display = 'flex';
    } else {
        document.getElementById(`card-${index}`).classList.toggle('is-flipped');
    }
}

function saveCard() {
    const name = document.getElementById('cardName').value;
    const rarity = document.getElementById('cardRarity').value;
    const file = document.getElementById('cardImage').files[0];

    if (!file || !name) return alert("Введите данные!");

    const reader = new FileReader();
    reader.onload = function(e) {
        const cardObj = { name, rarity, image: e.target.result };
        localStorage.setItem(`stalker_card_${currentSlot}`, JSON.stringify(cardObj));
        renderCardFromStorage(currentSlot);
        closeModal();
    };
    reader.readAsDataURL(file);
}

function renderCardFromStorage(index) {
    const data = localStorage.getItem(`stalker_card_${index}`);
    if (data) {
        const card = JSON.parse(data);
        const front = document.querySelector(`#card-${index} .card-front`);
        front.classList.remove('empty-slot');
        front.innerHTML = `
            <img src="${card.image}" class="card-img">
            <span style="font-size: 10px;">${card.name}</span>
            <span style="font-size: 8px; color: gold;">${card.rarity.toUpperCase()}</span>
        `;
    }
}

function closeModal() {
    document.getElementById('modal').style.display = 'none';
}
