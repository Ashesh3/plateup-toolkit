const WS_URL = 'ws://localhost:12392';

const no_conn_modal = new mdb.Modal(document.getElementById('exampleModalCenteredScrollable'));
const gameStateTable = document.getElementById('gameStateTable');
let appliancesSelect, cardsSelect;
no_conn_modal.show();

let ws;
const gameState = {
    "SET_UI_VISIBILITY": 1
};
const gameData = {};

function requestInitialData() {
    ws.send("WEB_JOIN");
    ws.send(JSON.stringify({
        Type: "REQUEST_DATA",
        Value: 0
    }));
}

function populateSelect(rawId, items, getInstance) {
    const raw = document.getElementById(rawId);
    if (raw.options.length !== 0) return getInstance();
    for (const item of items) {
        const option = document.createElement('option');
        option.value = item.ID;
        option.setAttribute('data-mdb-secondary-text', item.ID);
        option.innerText = item.Name;
        raw.appendChild(option);
    }
    return new mdb.Select(raw, {
        clearButton: true,
        filter: true,
        selectAll: false
    });
}

function handleMessage(event) {
    const data = JSON.parse(event.data);
    if (data.Type === "GAME_DATA") {
        gameData['Appliances'] = data.Appliances;
        appliancesSelect = populateSelect('appliances-select', data.Appliances, () => appliancesSelect);
        gameData['Cards'] = data.Cards;
        cardsSelect = populateSelect('cards-select', data.Cards, () => cardsSelect);
        return;
    }
    if (data.Type === "VISIT" || data.Type === "LEVEL") return;
    if (!Object.prototype.hasOwnProperty.call(gameState, data.Type)) {
        const gameSelect = document.getElementById('game-select');
        const option = document.createElement('option');
        option.value = data.Type;
        option.innerText = data.Type;
        gameSelect.appendChild(option);
    }
    gameState[data.Type] = data.Value;
}

function connect() {
    ws = new WebSocket(WS_URL);
    ws.addEventListener('open', () => {
        no_conn_modal.hide();
        console.log('Connected successfully');
        requestInitialData();
    });
    ws.addEventListener('message', handleMessage);
    ws.addEventListener('error', (e) => console.error('error:', e));
    ws.addEventListener('close', (e) => console.warn('close:', e));
}

connect();

function send(data) {
    if (ws.readyState !== WebSocket.OPEN) {
        console.error("Not connected to server");
        return;
    }
    ws.send(JSON.stringify(data));
}

document.getElementById('select-appliances-button').addEventListener('click', () => {
    if (!appliancesSelect) return;
    for (const option of appliancesSelect.value) {
        send({ Type: "ADD_BLUEPRINT", Value: option, IsIntegration: false });
    }
    appliancesSelect.setValue();
});

document.getElementById('set-game-button').addEventListener('click', () => {
    send({
        Type: document.getElementById('game-select').value,
        Value: document.getElementById('game-input').value,
        IsIntegration: false
    });
});

document.getElementById('set-cards-button').addEventListener('click', () => {
    if (!cardsSelect) return;
    for (const option of cardsSelect.value) {
        send({ Type: "CREATE_CARD", Value: option, IsIntegration: false });
    }
    cardsSelect.setValue();
});

setInterval(() => {
    if (!ws || ws.readyState === WebSocket.CLOSED) {
        no_conn_modal.show();
        connect();
    } else if (ws.readyState === WebSocket.OPEN) {
        no_conn_modal.hide();
    }
}, 1000);

setInterval(() => {
    const tbody = document.createElement('tbody');
    for (const key in gameState) {
        const tr = document.createElement('tr');
        const td1 = document.createElement('td');
        const td2 = document.createElement('td');
        td1.innerText = key;
        td2.innerText = gameState[key];
        tr.appendChild(td1);
        tr.appendChild(td2);
        tbody.appendChild(tr);
    }
    const existing = gameStateTable.querySelector('tbody');
    if (existing) {
        gameStateTable.replaceChild(tbody, existing);
    } else {
        gameStateTable.appendChild(tbody);
    }
}, 1000);
