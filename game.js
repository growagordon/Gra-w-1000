// game.js — logika gry w 1000 z botami i wymianą kart, atutem, meldunkami itd.

const suits = ['♥️', '♦️', '♣️', '♠️'];
const ranks = ['9', '10', 'J', 'Q', 'K', 'A'];
const values = { '9': 0, '10': 10, 'J': 2, 'Q': 3, 'K': 4, 'A': 11 };

function shuffle(array) {
  return array.sort(() => Math.random() - 0.5);
}

function createDeck() {
  const deck = [];
  for (let s of suits) {
    for (let r of ranks) {
      deck.push({ suit: s, rank: r, value: values[r] });
    }
  }
  return shuffle(deck);
}

let deck = [], player = [], bot1 = [], bot2 = [], mus = [];
let botA, botB;
let atut = null;
let playerPoints = 0, botAPoints = 0, botBPoints = 0;
let meldunki = { player: 0, botA: 0, botB: 0 };

const botList = [
  {
    name: "Ryzykant Rysiek",
    bid: () => 110 + Math.floor(Math.random() * 15),
    playCard: (hand, leadSuit) => {
      let same = hand.filter(c => c.suit === leadSuit);
      return removeCard(hand, highestCard(same.length ? same : hand));
    }
  },
  {
    name: "Bezpieczny Bogdan",
    bid: () => 100 + Math.floor(Math.random() * 5),
    playCard: (hand, leadSuit) => {
      let same = hand.filter(c => c.suit === leadSuit);
      return removeCard(hand, lowestCard(same.length ? same : hand));
    }
  }
];

function highestCard(cards) {
  return cards.reduce((a, b) => a.value > b.value ? a : b);
}

function lowestCard(cards) {
  return cards.reduce((a, b) => a.value < b.value ? a : b);
}

function removeCard(hand, card) {
  const idx = hand.findIndex(c => c.suit === card.suit && c.rank === card.rank);
  return idx !== -1 ? hand.splice(idx, 1)[0] : null;
}

function startGame() {
  deck = createDeck();
  player = deck.splice(0, 7);
  bot1 = deck.splice(0, 7);
  bot2 = deck.splice(0, 7);
  mus = deck.splice(0, 3);

  const shuffled = shuffle([...botList]);
  botA = { ...shuffled[0] };
  botB = { ...shuffled[1] };

  botA.hand = [...bot1];
  botB.hand = [...bot2];

  document.getElementById('bots-info').innerHTML = `Boty: ${botA.name} vs ${botB.name}`;

  runBidding();
}

function runBidding() {
  const info = document.getElementById('info');
  const b1 = botA.bid();
  const b2 = botB.bid();
  const minBid = Math.max(b1, b2) + 5;

  let html = `Licytacja:<br>${botA.name}: ${b1}<br>${botB.name}: ${b2}<br><br>`;
  html += `Wybierz swoją licytację (min. ${minBid}):<br>`;

  for (let bid = minBid; bid <= 140; bid += 5) {
    html += `<button onclick="chooseBid(${bid}, ${b1}, ${b2})">${bid}</button>`;
  }
  html += `<br><button onclick="chooseBid(0, ${b1}, ${b2})">Pas</button>`;
  info.innerHTML = html;
}

function chooseBid(playerBid, b1, b2) {
  const info = document.getElementById('info');

  if (playerBid === 0) {
    info.innerHTML = `Pasujesz. Grają boty.<br><button onclick="startGame()">Zagraj ponownie</button>`;
    return;
  }

  const max = Math.max(playerBid, b1, b2);
  let winner;

  if (playerBid === max) {
    winner = 'player';
    player.push(...mus);
    chooseTrump();
  } else if (b1 === max) {
    winner = 'botA';
    bot1.push(...mus);
    info.innerHTML = `${botA.name} wygrał licytację.<br><button onclick="startGame()">Nowa gra</button>`;
  } else {
    winner = 'botB';
    bot2.push(...mus);
    info.innerHTML = `${botB.name} wygrał licytację.<br><button onclick="startGame()">Nowa gra</button>`;
  }
}

function chooseTrump() {
  const info = document.getElementById('info');
  let options = '';
  suits.forEach(suit => {
    options += `<button onclick="selectTrump('${suit}')">${suit}</button>`;
  });

  info.innerHTML = `Dobierasz mus: ${mus.map(c => c.rank + c.suit).join(', ')}<br>Wybierz kolor atutowy:<br>${options}`;
}

function selectTrump(suit) {
  atut = suit;
  showExchange();
}

function showExchange() {
  const handDiv = document.getElementById('player-hand');
  const info = document.getElementById('info');
  handDiv.innerHTML = '';
  info.innerHTML = 'Wybierz 3 karty do odrzucenia:';

  let selected = [];

  player.forEach((card, i) => {
    const btn = document.createElement('button');
    btn.className = 'card';
    btn.textContent = `${card.rank}${card.suit}`;
    btn.onclick = () => {
      if (selected.includes(i)) {
        selected = selected.filter(x => x !== i);
        btn.style.background = 'white';
      } else if (selected.length < 3) {
        selected.push(i);
        btn.style.background = '#aaf';
      }
      if (selected.length === 3) {
        selected.sort((a, b) => b - a).forEach(j => player.splice(j, 1));
        info.innerHTML = `Atut to: ${atut}.<br>Rozpoczynasz grę.`;
        startRound();
      }
    };
    handDiv.appendChild(btn);
  });
}

function startRound() {
  meldunki.player = countMeld(player);
  meldunki.botA = countMeld(bot1);
  meldunki.botB = countMeld(bot2);
  document.getElementById('info').innerHTML += `\nMeldunki: Ty ${meldunki.player}, ${botA.name} ${meldunki.botA}, ${botB.name} ${meldunki.botB}`;
  // Tutaj dodaj dalszą rozgrywkę
}

function countMeld(hand) {
  let meld = 0;
  suits.forEach(suit => {
    let k = hand.find(c => c.rank === 'K' && c.suit === suit);
    let q = hand.find(c => c.rank === 'Q' && c.suit === suit);
    if (k && q) meld += 20;
  });
  return meld;
}
