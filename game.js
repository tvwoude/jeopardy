// ====== CONFIG ======
const ws = new WebSocket("ws://localhost:8000");
let round = 1; // 1 = Jeopardy, 2 = Double Jeopardy, 3 = Final
let gameState = "waiting";
// Detect mode based on which HTML file is loaded
const isHost = window.location.pathname.includes("host.html");
// ====== JEOPARDY CATEGORIES ======
const jeopardyCategories = [
  {
    category: "Secret Societies",
    questions: [
      { q: "This secretive group is famous for its alleged influence in banking and politics.", a: "What is the Illuminati?", value: 200 },
      { q: "This fraternal organization has rituals, symbols, and lodges worldwide.", a: "What is the Freemasons?", value: 400 },
      { q: "This mysterious society at Yale is known for its owl emblem and famous alumni.", a: "What is Skull and Bones?", value: 600 },
      { q: "This group of European scholars and thinkers in the 18th century promoted Enlightenment ideals.", a: "What is the Bavarian Illuminati?", value: 800 },
      { q: "This fictional society in Dan Brown's books manipulates history and art.", a: "What is the Priory of Sion?", value: 1000 }
    ]
  },
  {
    category: "Mythology",
    questions: [
      { q: "This king of the Greek gods wields a thunderbolt.", a: "Who is Zeus?", value: 200 },
      { q: "In Norse mythology, this tree connects the nine worlds.", a: "What is Yggdrasil?", value: 400 },
      { q: "This Egyptian god has a jackal head and is associated with mummification.", a: "Who is Anubis?", value: 600 },
      { q: "This hero completed 12 labors in Greek mythology.", a: "Who is Hercules?", value: 800 },
      { q: "These two Roman gods are twins raised by a she-wolf.", a: "Who are Romulus and Remus?", value: 1000 }
    ]
  },
  {
    category: "Fancy Cheeses",
    questions: [
      { q: "This French blue cheese is known for its creamy, strong flavor.", a: "What is Roquefort?", value: 200 },
      { q: "This Italian cheese is traditionally made from buffalo milk.", a: "What is Mozzarella di Bufala?", value: 400 },
      { q: "This hard, aged Italian cheese is commonly grated over pasta.", a: "What is Parmigiano-Reggiano?", value: 600 },
      { q: "This Swiss cheese is famous for its holes.", a: "What is Emmental?", value: 800 },
      { q: "This French cheese is soft, bloomy-rinded, and often served with fruit.", a: "What is Brie?", value: 1000 }
    ]
  },
  {
    category: "Books",
    questions: [
      { q: "This author created the wizarding world of Harry Potter.", a: "Who is J.K. Rowling?", value: 200 },
      { q: "This dystopian novel by George Orwell features Big Brother.", a: "What is 1984?", value: 400 },
      { q: "This novel tells the story of Ishmael and the white whale.", a: "What is Moby-Dick?", value: 600 },
      { q: "This author of 'Pride and Prejudice' was an English novelist of the early 19th century.", a: "Who is Jane Austen?", value: 800 },
      { q: "This book series features Percy Jackson, a demigod son of Poseidon.", a: "What is Percy Jackson & the Olympians?", value: 1000 }
    ]
  },
  {
    category: "Space",
    questions: [
      { q: "This planet is known as the Red Planet.", a: "What is Mars?", value: 200 },
      { q: "The closest star to Earth after the Sun.", a: "What is Proxima Centauri?", value: 400 },
      { q: "This NASA mission first landed humans on the Moon in 1969.", a: "What is Apollo 11?", value: 600 },
      { q: "This gas makes up about 78% of Earth's atmosphere.", a: "What is nitrogen?", value: 800 },
      { q: "This is the largest planet in our solar system.", a: "What is Jupiter?", value: 1000 }
    ]
  }
];

// ====== DOUBLE JEOPARDY CATEGORIES ======
const doubleJeopardyCategories = [
  {
    category: "New Zealand",
    questions: [
      { q: "This indigenous people are native to New Zealand.", a: "Who are the Māori?", value: 400 },
      { q: "New Zealand's famous long, thin flowering plant also known as the silver fern.", a: "What is the ponga?", value: 800 },
      { q: "This New Zealand city is known as the 'City of Sails'.", a: "What is Auckland?", value: 1200 },
      { q: "The Lord of the Rings movies were filmed in this country.", a: "What is New Zealand?", value: 1600 },
      { q: "New Zealand's national rugby team is called this.", a: "What is the All Blacks?", value: 2000 }
    ]
  },
  {
    category: "Nature (No Hunting)",
    questions: [
      { q: "This large mammal is known for its trunk.", a: "What is an elephant?", value: 400 },
      { q: "This is the process by which plants make their food using sunlight.", a: "What is photosynthesis?", value: 800 },
      { q: "This bird is famous for mimicking human speech.", a: "What is a parrot?", value: 1200 },
      { q: "This biome is characterized by very low temperatures and ice-covered landscapes.", a: "What is the tundra?", value: 1600 },
      { q: "This insect produces honey.", a: "What is a bee?", value: 2000 }
    ]
  },
  {
    category: "School Safety",
    questions: [
      { q: "This type of program is designed to prepare students for emergencies at school.", a: "What is a lockdown drill?", value: 400 },
      { q: "This law in the US regulates gun possession in schools.", a: "What is the Gun-Free School Zones Act?", value: 800 },
      { q: "Schools often employ this type of security personnel to prevent violence.", a: "What is a school resource officer?", value: 1200 },
      { q: "This practice involves identifying and helping students who may be a threat.", a: "What is threat assessment?", value: 1600 },
      { q: "This type of technology allows schools to monitor entrances and exits.", a: "What is surveillance cameras?", value: 2000 }
    ]
  },
  {
    category: "Fancy Cars",
    questions: [
      { q: "This Italian brand is famous for the prancing horse logo.", a: "What is Ferrari?", value: 400 },
      { q: "This British car company makes the luxury Phantom.", a: "What is Rolls-Royce?", value: 800 },
      { q: "This German company makes the 911 sports car.", a: "What is Porsche?", value: 1200 },
      { q: "This American car brand is known for the Mustang.", a: "What is Ford?", value: 1600 },
      { q: "This Italian brand makes the luxury supercar Aventador.", a: "What is Lamborghini?", value: 2000 }
    ]
  },
  {
    category: "Olympic Trivia",
    questions: [
      { q: "These games are held every four years.", a: "What are the Olympic Games?", value: 400 },
      { q: "The Olympics were revived in this country in 1896.", a: "What is Greece?", value: 800 },
      { q: "This medal is awarded for first place.", a: "What is gold?", value: 1200 },
      { q: "The Summer Olympics feature this race where runners cover 42.195 km.", a: "What is the marathon?", value: 1600 },
      { q: "The Olympic symbol has this many interlocking rings.", a: "What is five?", value: 2000 }
    ]
  }
];



let players = [
  {
    name: "Dixie Normous",
    score: 0,
    img: "DixieNormous.jpg"
  },
  {
    name: "OTPHJ",
    score: 0,
    img: "OTPHJ.jpg"
  },
  {
    name: "Flamboyant Fentonians",
    score: 0,
    img: "FlamboyantFentonians.jpeg"
  },
  {
    name: "Butters",
    score: 0,
    img: "butters.jpg"
  }
];
// ====== DOM ELEMENTS ======
const boardEl = document.getElementById("board");
const popupEl = document.getElementById("question-popup");
const questionTextEl = document.getElementById("question-text");
const answerTextEl = document.getElementById("answer-text");
const scoreEl = document.getElementById("scores");
const doneBtn = document.getElementById("done-btn");
let currentQuestion = null;
// ===== FINAL JEOPARDY DATA =====
const finalJeopardy = {
  category: "Young Timothy Trivia",
  q: "This was Tim's childhood pet",
  a: "What is a Beta Fish?"
};
// Runtime state for Final
let finalState = {
  active: false,
  // are we in Final Jeopardy flow?
  wagers: {},
  // { idx: number }
  responses: {},
  // { idx: string }
  graded: {} // { idx: true } after scoring
};
// ====== WEBSOCKET HANDLING ======
ws.onopen = () => {
  console.log("Connected to server ✅");
};
ws.onmessage = (event) => {
  const msg = JSON.parse(event.data);
  if (msg.type === "dailyDouble") {
    if (!isHost) {
      showDailyDouble(); // 👈 Make sure this function exists for players too
    }
  }
  if (msg.type === "startGame") {
    if (!isHost) {
      startGameForPlayers();
    }
  }
  if (msg.type === "openQuestion") {
    if (!isHost) {
      // Check if this is a Daily Double question (has playerIndex)
      if (msg.playerIndex !== undefined) {
        showDailyDoubleQuestion(msg.question, msg.answer, msg.value, msg.playerIndex);
      } else {
        // Regular question
        showQuestion(msg.question, msg.answer, msg.value, false);
      }
    }
  }
  if (msg.type === "updateScores") {
    players = msg.players;
    renderScores();
  }
  if (msg.type === "markCell") {
    markCellUsed(msg.category, msg.index);
  }
  if (msg.type === "closeQuestion") {
    closeQuestion();
  }
  // --- Final Jeopardy starts: everyone sees category, host collects wagers
  if (msg.type === "finalStart") {
    finalState.active = true;
    if (isHost) {
      showFinalWagerHost(msg.category);
    } else {
      showFinalWagerPlayer(msg.category);
    }
  }
  // --- Host has locked in wagers & reveals the clue (everyone sees clue)
  if (msg.type === "finalClue") {
    if (isHost) {
      showFinalClueHost(msg.category, msg.question);
    } else {
      showFinalCluePlayer(msg.category, msg.question);
    }
  }
  // --- Host reveals answer & scoring UI (players just see correct answer)
  if (msg.type === "finalReveal") {
    if (isHost) {
      showFinalScoringHost(msg.answer);
    } else {
      showFinalRevealPlayer(msg.answer);
    }
  }
  if (msg.type === "gameOver") {
    showEndGameScreen(msg.players);
  }
  if (msg.type === "startDouble") {
    if (!isHost) {
      round = 2;
      categories = msg.categories;
      buildBoard();
      renderScores();
    }
  }
};
function sendMessage(obj) {
  ws.send(JSON.stringify(obj));
}
// ===== START GAME ======
let jeopardyStartMusic = null;

// ===== START GAME ======
// ===== START GAME ======
function showStartScreen() {
  // Hide the board initially
  boardEl.style.display = "none";
  // Remove any existing start screen
  const existingStart = document.getElementById("start-screen");
  if (existingStart) existingStart.remove();
  const startScreen = document.createElement("div");
  startScreen.id = "start-screen";
  startScreen.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(135deg, #001f3f, #000080);
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    z-index: 1000;
  `;
  // Main JEOPARDY title
  const title = document.createElement("div");
  title.style.cssText = `
    font-size: 120px;
    font-weight: bold;
    color: #FFD700;
    text-shadow: 4px 4px 8px rgba(0,0,0,0.8);
    margin-bottom: 60px;
    font-family: Arial, sans-serif;
    letter-spacing: 8px;
    text-align: center;
  `;
  title.innerText = "JEOPARDY!";
  startScreen.appendChild(title);
  // Bottom section - different for host vs players
  const bottomSection = document.createElement("div");
  bottomSection.style.cssText = `
    position: absolute;
    bottom: 80px;
    left: 50%;
    transform: translateX(-50%);
    text-align: center;
  `;
  if (isHost) {
    // Container for both buttons to format them nicely
    const buttonContainer = document.createElement("div");
    buttonContainer.style.cssText = `
      display: flex;
      gap: 20px;
      justify-content: center;
      align-items: center;
    `;

    // Host gets a Start Music button
    const musicButton = document.createElement("button");
    musicButton.innerText = "Start Music";
    musicButton.className = "control-button";
    musicButton.onclick = () => {
      if (!jeopardyStartMusic) {
        jeopardyStartMusic = new Audio("jeopardy-start.mp3");
        jeopardyStartMusic.loop = true;
        jeopardyStartMusic.play().catch(e => console.error("Audio playback failed:", e));
        musicButton.disabled = true;
        musicButton.style.opacity = 0.6;
        musicButton.style.cursor = 'default';
      }
    };
    buttonContainer.appendChild(musicButton);

    // Host gets a Start Game button
    const startButton = document.createElement("button");
    startButton.innerText = "Start Game";
    startButton.className = "control-button";
    startButton.onclick = () => {
      gameState = "playing";
      // Tell all players to start
      sendMessage({
        type: "startGame"
      });
      // Start the host's game
      startGameForHost();
    };
    buttonContainer.appendChild(startButton);
    bottomSection.appendChild(buttonContainer);
  } else {
    // Players get a waiting message
    const waitingMsg = document.createElement("div");
    waitingMsg.style.cssText = `
      font-size: 20px;
      color: #FFD700;
      font-weight: bold;
      text-shadow: 2px 2px 4px rgba(0,0,0,0.8);
    `;
    waitingMsg.innerText = "Waiting for host to start the game...";
    bottomSection.appendChild(waitingMsg);
    // Add a subtle pulsing animation
    let opacity = 1;
    let direction = -1;
    setInterval(() => {
      opacity += direction * 0.02;
      if (opacity <= 0.5 || opacity >= 1) direction *= -1;
      waitingMsg.style.opacity = opacity;
    }, 50);
  }
  startScreen.appendChild(bottomSection);
  document.body.appendChild(startScreen);
}

function startGameForHost() {
  // Stop the music when the game starts
  if (jeopardyStartMusic) {
    jeopardyStartMusic.pause();
    jeopardyStartMusic = null; // Clear the variable
  }

  // Remove start screen
  const startScreen = document.getElementById("start-screen");
  if (startScreen) startScreen.remove();
  // Show the board
  boardEl.style.display = "grid";
  // Initialize the game as normal
  gameState = "playing";
  categories = jeopardyCategories;
  pickDailyDoubles(1);
  buildBoard();
  renderScores();
}

function startGameForPlayers() {
  // Remove start screen
  const startScreen = document.getElementById("start-screen");
  if (startScreen) startScreen.remove();
  // Show the board
  boardEl.style.display = "grid";
  // Initialize the game as normal
  gameState = "playing";
  categories = jeopardyCategories;
  buildBoard();
  renderScores();
}
// ====== BUILD BOARD ======
function buildBoard() {
  boardEl.innerHTML = "";
  // Remove any previous round controls created last time
  const oldControls = document.getElementById("round-controls");
  if (oldControls) oldControls.remove();
  // Add category headers
  categories.forEach(cat => {
    const catDiv = document.createElement("div");
    catDiv.className = "category";
    catDiv.innerText = cat.category;
    boardEl.appendChild(catDiv);
  });
  // Add question cells
  for (let i = 0; i < 5; i++) {
    categories.forEach((cat, cIndex) => {
      const q = cat.questions[i];
      const cell = document.createElement("div");
      cell.className = "cell";
      cell.innerText = `$${q.value}`;
      cell.addEventListener("click", () => {
        if (isHost && !cell.classList.contains("used")) {
          currentQuestion = {
            ...q,
            category: cIndex,
            index: i
          };
          currentQuestion.graded = {};
          const isDD = dailyDoubles.some(
            dd => dd.catIndex === cIndex && dd.qIndex === i
          );
          if (isDD) {
            sendMessage({
              type: "dailyDouble"
            });
            showDailyDouble(q.q, q.a, q.value); // pass details as needed
          } else {
            // Normal question
            sendMessage({
              type: "openQuestion",
              category: cIndex,
              index: i,
              question: q.q,
              answer: q.a,
              value: q.value
            });
            sendMessage({
              type: "markCell",
              category: cIndex,
              index: i
            });
            markCellUsed(cIndex, i);
            showQuestion(q.q, q.a, q.value, true);
          }
        }
      });
      boardEl.appendChild(cell);
    });
  }
  // --- HOST ROUND CONTROL BUTTONS ---
  if (isHost) {
    const controls = document.createElement("div");
    controls.id = "round-controls"; // <-- Give controls a stable ID
    controls.style.textAlign = "center";
    controls.style.marginTop = "20px";
    if (round === 1) {
      const dblBtn = document.createElement("button");
      dblBtn.innerText = "➡ Skip to Double Jeopardy";
      dblBtn.onclick = () => {
        round = 2;
        categories = doubleJeopardyCategories;
        buildBoard();
        pickDailyDoubles(2);
        renderScores();
        // 🔹 Tell players to update their boards
        sendMessage({
          type: "startDouble",
          categories: doubleJeopardyCategories
        });
      };
      controls.appendChild(dblBtn);
    }
    const finalBtn = document.createElement("button");
    finalBtn.innerText = "➡ Skip to Final Jeopardy";
    finalBtn.style.marginLeft = "10px";
    finalBtn.onclick = startFinalJeopardy;
    controls.appendChild(finalBtn);
    document.body.appendChild(controls);
  }
}
// ===== CREATE DAILY DOUBLE =====
let dailyDoubles = [];
function pickDailyDoubles(count) {
  const picks = new Set();
  const maxCats = categories.length;
  const maxQs = categories[0].questions.length;
  while (picks.size < count) {
    const catIdx = Math.floor(Math.random() * maxCats);
    const qIdx = Math.floor(Math.random() * maxQs);
    picks.add(`${catIdx}-${qIdx}`);
  }
  dailyDoubles = Array.from(picks).map(str => {
    const [catIdx, qIdx] = str.split("-").map(Number);
    return {
      catIndex: catIdx,
      qIndex: qIdx
    };
  });
  console.log("Daily Doubles:", dailyDoubles);
}
function showDailyDoubleQuestion(q, a, value, selectedPlayerIndex) {
  popupEl.style.display = "flex";

  // Show the question
  questionTextEl.innerText = q;
  answerTextEl.innerText = "";
  // Players don't see the answer

  // ✅ This line correctly removes any old Daily Double UI
  document.getElementById("dd-player-info") ?.remove();

  // Show which player is playing and for how much
  const playerInfo = document.createElement("div");
  playerInfo.id = "dd-player-info";
  playerInfo.style.cssText = `
    background: rgba(255, 215, 0, 0.2);
    border: 2px solid gold;
    border-radius: 10px;
    padding: 15px;
    margin: 15px 0;
    text-align: center;
  `;
  const selectedPlayer = players[selectedPlayerIndex];
  playerInfo.innerHTML = `
    <div style="color: gold; font-size: 18px; font-weight: bold; margin-bottom: 10px;">
      🎯 DAILY DOUBLE 🎯
    </div>
    <div style="display: flex; align-items: center; justify-content: center; gap: 15px;">
      <img src="${selectedPlayer.img}" width="50" style="border-radius: 50%; border: 2px solid gold;">
      <div>
        <div style="font-size: 16px; color: white;"><b>${selectedPlayer.name}</b> is playing</div>
        <div style="font-size: 18px; color: yellow; font-weight: bold;">for $${value}</div>
      </div>
    </div>
  `;
  // Insert after the question text
  popupEl.insertBefore(playerInfo, answerTextEl.nextSibling);
  // Players can't close the question
  doneBtn.style.display = "none";
}

function showDailyDouble(q, a, value) {
  popupEl.style.display = "flex";

  // Reset any tinted player rows from a previous question
  document.querySelectorAll(".fj-player-row").forEach(row => {
    row.style.background = "rgba(0,0,50,0.7)";
  });
  // Always show Daily Double banner first
  questionTextEl.innerText = "🎉 DAILY DOUBLE 🎉";
  doneBtn.style.display = "none";
  // Remove any old extra UI
  document.getElementById("dd-extra") ?.remove();
  document.getElementById("dd-waiting") ?.remove();
  // ✅ Preserve base question details
  const baseQuestion = {
    q,
    a,
    value,
    category: currentQuestion?.category,
    index: currentQuestion?.index
  };
  // Prevent players from being scored during wager screen
  currentQuestion = null;
  if (isHost) {
    // Clear answer text for host during setup
    answerTextEl.innerText = "";
    const extraDiv = document.createElement("div");
    extraDiv.id = "dd-extra";
    extraDiv.innerHTML = `
      <p>Select a player:</p>
      <div id="dd-player-select"></div>
      <input id="dd-wager" type="number" placeholder="Enter wager" style="margin-top:10px;">
      <p id="dd-max-wager" style="font-size:14px; color:yellow;"></p>
      <button id="dd-lock">Lock In</button>
    `;
    popupEl.appendChild(extraDiv);
    // Build player selection buttons
    const playerDiv = extraDiv.querySelector("#dd-player-select");
    players.forEach((p, idx) => {
      const btn = document.createElement("button");
      btn.innerText = p.name;
      btn.className = "player-choice";
      btn.dataset.index = idx;
      btn.onclick = () => {
        document.querySelectorAll(".player-choice").forEach(b => b.classList.remove("selected"));
        btn.classList.add("selected");
        const playerScore = players[idx].score;
        const maxWager = round === 1 ? Math.max(1000, playerScore) : Math.max(2000, playerScore);
        document.getElementById("dd-max-wager").innerText = `Max wager: $${maxWager}`;
      };
      playerDiv.appendChild(btn);
    });
    // Lock In handler
    document.getElementById("dd-lock").onclick = () => {
      const selectedPlayer = document.querySelector(".player-choice.selected");
      const wagerInput = document.getElementById("dd-wager");
      if (!selectedPlayer) {
        alert("Please select a player.");
        return;
      }
      const playerIndex = parseInt(selectedPlayer.dataset.index, 10);
      const playerScore = players[playerIndex].score;
      const maxWager = round === 1 ? Math.max(1000, playerScore) : Math.max(2000, playerScore);
      const wager = parseInt(wagerInput.value, 10);
      if (isNaN(wager)) {
        alert("Please enter a wager.");
        return;
      }
      if (wager > maxWager) {
        alert(`Wager cannot exceed $${maxWager}. Please try again.`);
        wagerInput.value = "";
        return;
      }
      if (wager < 0) {
        alert("Wager must be positive.");
        return;
      }
      // ✅ Store DD info using preserved baseQuestion
      currentQuestion = {
        ...baseQuestion,
        value: wager,
        ddPlayer: playerIndex,
        graded: {}
      };
      extraDiv.remove();
      // Broadcast question with wager + selected player
      sendMessage({
        type: "openQuestion",
        category: baseQuestion.category,
        index: baseQuestion.index,
        question: q,
        answer: a,
        value: wager,
        playerIndex
      });
      // Mark as used
      sendMessage({
        type: "markCell",
        category: baseQuestion.category,
        index: baseQuestion.index
      });
      markCellUsed(baseQuestion.category, baseQuestion.index);
      // Show Q on host
      showQuestion(q, a, wager, true);
    };
  } else {
    // 🔹 FIXED: Players see waiting message in a dedicated container

    // Play daily double sound
    const dailyDoubleSound = new Audio("jeopardy-daily-double.mp3");
    dailyDoubleSound.play();
    
    // ✅ NEW: Remove the player-info element before adding the waiting div
    document.getElementById("dd-player-info") ?.remove();

    const waitingDiv = document.createElement("div");
    waitingDiv.id = "dd-waiting";
    waitingDiv.style.cssText = `
      background: rgba(255, 215, 0, 0.1);
      border: 2px solid gold;
      border-radius: 10px;
      padding: 20px;
      margin: 20px 0;
      text-align: center;
      color: yellow;
      font-size: 18px;
    `;
    waitingDiv.innerHTML = `
      <div style="margin-bottom: 10px;">⏳</div>
      <div>Host is selecting a player and setting the wager...</div>
    `;
    // Don't use answerTextEl - use a dedicated container instead
    answerTextEl.innerText = "";
    popupEl.appendChild(waitingDiv);
  }
}
function closeQuestion() {
  popupEl.style.display = "none";
  currentQuestion = null;

  // Stop the timer and hide its container when the popup is closed
  clearInterval(timesUpTimer);
  const timerContainer = document.getElementById("timer-container");
  if (timerContainer) {
    timerContainer.style.display = "none";
  }

  // ✅ NEW: Cleanup Daily Double elements
  document.getElementById("dd-player-info")?.remove();
  document.getElementById("dd-waiting")?.remove();
  document.getElementById("dd-extra")?.remove();
}
// ===== HANDLE DAILY DOUBLE =====
function handleDailyDoubleWager(playerIndex, wager) {
  currentQuestion.value = wager; // update value with wager
  // now send the actual question to players
  sendMessage({
    type: "openQuestion",
    category: currentQuestion.category,
    index: currentQuestion.index,
    question: currentQuestion.q,
    answer: currentQuestion.a,
    value: currentQuestion.value
  });
  // host sees the question + answer immediately
  showQuestion(currentQuestion.q, currentQuestion.a, currentQuestion.value, true);
}
// ===== RESOLVE DAILY DOUBLE =====
function resolveDailyDouble() {
  if (!currentQuestion) return;
  // Send to players
  sendMessage({
    type: "openQuestion",
    category: currentQuestion.category,
    index: currentQuestion.index,
    question: currentQuestion.q,
    answer: currentQuestion.a,
    value: currentQuestion.value
  });
  // Mark cell used
  sendMessage({
    type: "markCell",
    category: currentQuestion.category,
    index: currentQuestion.index
  });
  markCellUsed(currentQuestion.category, currentQuestion.index);
  // Show on host
  showQuestion(currentQuestion.q, currentQuestion.a, currentQuestion.value, true);
}
// ====== SCORING ======
function renderScores() {
  // ===== bottom bar scores =====
  scoreEl.innerHTML = "";
  players.forEach(p => {
    const div = document.createElement("div");
    div.className = "score-box";
    div.innerHTML = `
      <img src="${p.img}" width="50" style="border-radius:50%; border:2px solid #fff; margin-bottom:6px;"><br>
      <b>${p.name}</b><br>
      <span style="color:yellow; font-size:18px; font-weight:bold;">$${p.score}</span>
    `;
    scoreEl.appendChild(div);
  });
  // ✅ FIXED: Only skip regular question scoring UI during Final Jeopardy
  // Final Jeopardy has its own scoring UI in showFinalScoringHost()
  if (finalState.active) return;
  // ===== host scoring UI for regular questions only =====
  if (isHost && currentQuestion) {
    // ensure a persistent per-question graded map
    if (!currentQuestion.graded) currentQuestion.graded = {};
    // { [idx]: "correct" | "wrong" }
    // ensure the popup-scores container exists
    let popupScores = document.getElementById("popup-scores");
    if (!popupScores) {
      popupScores = document.createElement("div");
      popupScores.id = "popup-scores";
      popupEl.appendChild(popupScores);
    }
    popupScores.innerHTML = "";
    players.forEach((p, idx) => {
      const state = currentQuestion.graded[idx]; // undefined | 'correct' | 'wrong'
      const card = document.createElement("div");
      card.className = "score-box";
      card.style.cssText = `
        text-align:center;
        padding:12px;
        border:2px solid #fff;
        border-radius:12px;
        background:${state === "correct" ? "rgba(0,100,0,0.7)" : state === "wrong" ? "rgba(100,0,0,0.7)" : "rgba(0,0,50,0.7)"};
        min-width:160px;
        display:flex;
        flex-direction:column;
        align-items:center;
        justify-content:flex-start;
      `;
      card.innerHTML = `
        <img src="${p.img}" width="50" style="border-radius:50%; border:2px solid #fff; margin-bottom:6px;">
        <b>${p.name}</b>
        <span style="color:yellow; font-size:18px; font-weight:bold; margin-top:4px;">$${p.score}</span>
        <div class="btn-row" style="display:flex; gap:10px; margin-top:10px;">
          <button class="mark-correct" title="Correct" style="background:green; color:white; font-size:16px; padding:6px 12px; border-radius:8px; cursor:pointer;">✔</button>
          <button class="mark-wrong" title="Wrong" style="background:red; color:white; font-size:16px; padding:6px 12px; border-radius:8px; cursor:pointer;">✖</button>
        </div>
      `;
      // Daily Double: only the chosen player is scorable
      if (currentQuestion.ddPlayer !== undefined && currentQuestion.ddPlayer !== idx) {
        const btnRow = card.querySelector(".btn-row");
        if (btnRow) btnRow.style.display = "none";
      } else {
        const btnCorrect = card.querySelector(".mark-correct");
        const btnWrong = card.querySelector(".mark-wrong");
        // disable if already graded
        if (state) {
          btnCorrect.disabled = true;
          btnWrong.disabled = true;
          btnCorrect.style.opacity = "0.6";
          btnWrong.style.opacity = "0.6";
          btnCorrect.style.cursor = "default";
          btnWrong.style.cursor = "default";
        }
        btnCorrect.onclick = () => {
          if (currentQuestion.graded[idx]) return; // single mark guard
          
          // Play correct answer sound
          const rightAnswerSound = new Audio("right-answer.mp3");
          rightAnswerSound.play();

          currentQuestion.graded[idx] = "correct";
          updateScore(idx, currentQuestion.value);
          renderScores(); // re-render to lock buttons & keep highlight
        };
        btnWrong.onclick = () => {
          if (currentQuestion.graded[idx]) return; // single mark guard
          currentQuestion.graded[idx] = "wrong";
          updateScore(idx, -currentQuestion.value);
          renderScores();
        };
      }
      popupScores.appendChild(card);
    });

    // Handle the "Done" button click event for the host
    doneBtn.onclick = () => {
      closeQuestion();
      sendMessage({
        type: "closeQuestion"
      });
    };
  }
}

// ===== SHOW QUESITON =====
let timesUpTimer; 

function showQuestion(q, a, value, hostView) {
  // Clear any existing timer to prevent multiple timers from running
  clearInterval(timesUpTimer);

  console.log("📢 showQuestion called", q, a, value, hostView);
  if (!popupEl) {
    console.error("❌ popupEl not found in DOM!");
    return;
  }
  popupEl.style.display = "flex";
  questionTextEl.innerText = q || "⚠ No question text";
  answerTextEl.innerText = hostView ? a : ""; // Only host sees answer

  // Show Done button only on host
  if (isHost) {
    doneBtn.style.display = "inline-block";
    renderScores();
    
    // Check if this is a regular question (not a daily double)
    if (!currentQuestion || currentQuestion.ddPlayer === undefined) {
        
      // Create a dedicated container for the button and timer to ensure consistent formatting
      let timerContainer = document.getElementById("timer-container");
      if (!timerContainer) {
        timerContainer = document.createElement("div");
        timerContainer.id = "timer-container";
        popupEl.appendChild(timerContainer);
      }
      timerContainer.innerHTML = `
        <button id="times-up-btn">Time's Up!</button>
        <div id="times-up-timer">10</div>
      `;
      timerContainer.style.display = "flex";

      const timesUpBtn = document.getElementById("times-up-btn");
      const timerEl = document.getElementById("times-up-timer");
      
      // Re-enable the button for the new question
      timesUpBtn.disabled = false;
      
      // "Time's Up" button click handler. ONLY this button plays the sound.
      timesUpBtn.onclick = () => {
        const timesUpSound = new Audio("times-up.mp3");
        timesUpSound.play();
        clearInterval(timesUpTimer);
        // The button is no longer disabled after being pressed
      };

      // Start a new 10-second timer
      let timeLeft = 10;
      timesUpTimer = setInterval(() => {
        timeLeft--;
        timerEl.innerText = timeLeft;
        if (timeLeft <= 0) {
          clearInterval(timesUpTimer);
          timerEl.innerText = "Time's up!";
        }
      }, 1000); // Update every 1 second
    }
  } else {
    doneBtn.style.display = "none"; // players cannot close question
  }
}

function updateScore(playerIndex, delta) {
  players[playerIndex].score += delta;
  sendMessage({
    type: "updateScores",
    players
  });
  renderScores();
}

// ====== MARK USED ======
function markCellUsed(category, index) {
  const cellIndex = (index * categories.length) + category + categories.length;
  const cell = boardEl.children[cellIndex];
  if (cell) {
    cell.classList.add("used");
    cell.innerText = "";
  }
}
// ===== FINAL JEOPARDY =====
// ==========================
function startFinalJeopardy() {
  // Enter Final mode, reset state
  finalState = {
    active: true,
    wagers: {},
    responses: {},
    graded: {}
  };
  // Broadcast start (category only)
  sendMessage({
    type: "finalStart",
    category: finalJeopardy.category
  });
  // Show host wager collection UI immediately
  showFinalWagerHost(finalJeopardy.category);
}
/* ---------- WAGER STAGE ---------- */
// Host: enter wagers for each player (max = current score, min = 0)
function showFinalWagerHost(category) {
  popupEl.style.display = "flex";
  doneBtn.style.display = "none";
  questionTextEl.innerText = "🏁 FINAL JEOPARDY 🏁";
  answerTextEl.innerText = `\nCategory: ${category}`;
  // 🔹 Remove leftover scoring UI
  const oldScores = document.getElementById("popup-scores");
  if (oldScores) oldScores.remove();
  // Remove any residual DD/extra blocks
  const oldExtra = document.getElementById("dd-extra");
  if (oldExtra) oldExtra.remove();
  // Build per-player wager inputs
  const ui = document.createElement("div");
  ui.id = "final-wager-host";
  ui.innerHTML = `
    <div style="margin-top:12px; display:flex; gap:16px; justify-content:center;">
      ${players.map((p, idx) => `
        <div class="score-box" style="
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 8px;
          padding: 12px;
          border: 2px solid #fff;
          border-radius: 12px;
          background: rgba(0,0,50,0.85);
          min-width: 180px;
        ">
          <img src="${p.img}" width="60" style="border-radius:50%; border:2px solid #fff;">
          <div style="text-align:center;">
            <b>${p.name}</b><br>
            Current: $${p.score}
          </div>
          <input
            id="fj-wager-${idx}"
            type="number"
            min="0"
            max="${Math.max(0, p.score)}"
            placeholder="Wager (max $${Math.max(0, p.score)})"
            style="width:100%; padding:6px; font-size:14px; text-align:center; border-radius:6px;"
          >
        </div>
      `).join("")}
    </div>
    <div style="margin-top:20px; text-align:center;">
      <button id="fj-lock-wagers" style="
        font-size:18px;
        padding:10px 20px;
        background:#444;
        color:white;
        border-radius:10px;
      ">
        Lock Wagers & Reveal Clue
      </button>
    </div>
  `;
  popupEl.appendChild(ui);
  // ✅ Wire up the Lock Wagers button
  document.getElementById("fj-lock-wagers").onclick = () => {
    let ok = true;
    players.forEach((p, idx) => {
      const inp = document.getElementById(`fj-wager-${idx}`);
      const max = Math.max(0, p.score);
      const val = parseInt(inp.value, 10);
      if (isNaN(val) || val < 0 || val > max) {
        ok = false;
        inp.value = "";
        inp.focus();
      } else {
        finalState.wagers[idx] = val;
      }
    });
    if (!ok) {
      alert("Check wagers (must be between 0 and each player's current score).");
      return;
    }
    // ✅ Reveal clue to players
    sendMessage({
      type: "finalClue",
      category: finalJeopardy.category,
      question: finalJeopardy.question
    });
    // ✅ Host jumps straight to scoring UI
    showFinalClueHost(finalJeopardy.category, finalJeopardy.question);
  };
}
// Players: see category + "waiting..." during wager collection
function showFinalWagerPlayer(category) {
  popupEl.style.display = "flex";
  doneBtn.style.display = "none";
  // ✅ Show category in the headline
  questionTextEl.innerText = `🏁 FINAL JEOPARDY 🏁\n\nCategory: ${category}`;
  answerTextEl.innerText = "Waiting for host to lock in wagers...";
  // 🔹 Remove any existing score footer to prevent duplicates
  let oldFooter = document.getElementById("final-score-footer");
  if (oldFooter) oldFooter.remove();
  // 🔹 Build score footer
  const footer = document.createElement("div");
  footer.id = "final-score-footer";
  footer.style.cssText = `
    position: absolute;
    bottom: 10px;
    left: 0;
    right: 0;
    display: flex;
    justify-content: center;
    gap: 20px;
  `;
  players.forEach(p => {
    const maxWager = Math.max(0, p.score); // In Final Jeopardy, max wager = current score
    const box = document.createElement("div");
    box.className = "score-box";
    box.style.cssText = `
      text-align: center;
      padding: 6px 12px;
      border: 2px solid #fff;
      border-radius: 10px;
      background: rgba(0,0,50,0.85);
      min-width: 120px;
    `;
    box.innerHTML = `
      <img src="${p.img}" width="40" style="border-radius:50%; border:1px solid #fff;"><br>
      <b>${p.name}</b><br>
      $${p.score}<br>
      <span style="font-size:12px; color:yellow;">Max wager: $${maxWager}</span>
    `;
    footer.appendChild(box);
  });
  popupEl.appendChild(footer);
}
/* ---------- CLUE STAGE ---------- */
// ===== FINAL JEOPARDY CLUE STAGE =====
// ===== HOST FINAL CLUE =====
function showFinalClueHost(category, question) {
  popupEl.style.display = "flex";
  doneBtn.style.display = "none";
  // Show clue in big question box
  questionTextEl.innerText = question || "⚠️ No question loaded.";
  answerTextEl.innerText = "";
  // Clean old UI
  document.getElementById("final-wager-host") ?.remove();
  document.getElementById("final-clue-host") ?.remove();
  const ui = document.createElement("div");
  ui.id = "final-clue-host";
  ui.innerHTML = `
    <div id="fj-timer-host" style="font-size:20px; font-weight:bold; margin:10px; color:yellow; text-align:center;">
      ⏳ 60
    </div>
    <div style="margin-top:20px; text-align:center;">
      <button id="fj-reveal-answer" class="primary-btn">Go to final scoring</button>
    </div>
  `;
  popupEl.appendChild(ui);
  // Timer
  let timeLeft = 60;
  const timerEl = document.getElementById("fj-timer-host");
  const countdown = setInterval(() => {
    timeLeft--;
    if (timeLeft >= 0 && timerEl) timerEl.innerText = `⏳ ${timeLeft}`;
    if (timeLeft <= 0) clearInterval(countdown);
  }, 1000);
  // Reveal button
  document.getElementById("fj-reveal-answer").onclick = () => {
    clearInterval(countdown);
    sendMessage({
      type: "finalReveal",
      answer: finalJeopardy.answer
    });
    showFinalScoringHost();
  };
}
// ===== PLAYERS: see clue + timer =====
// ===== PLAYER FINAL CLUE =====
function showFinalCluePlayer(category, question) {
  popupEl.style.display = "flex";
  doneBtn.style.display = "none";
  questionTextEl.innerText = question || "⚠️ No question received.";
  answerTextEl.innerText = "Write down your answer!";
  // Timer
  const timerEl = document.createElement("div");
  timerEl.id = "fj-timer-player";
  timerEl.style.cssText = "font-size:20px; font-weight:bold; margin:10px; color:yellow; text-align:center;";
  timerEl.innerText = "⏳ 60";
  popupEl.appendChild(timerEl);
  let timeLeft = 60;
  const countdown = setInterval(() => {
    timeLeft--;
    if (timeLeft >= 0 && document.getElementById("fj-timer-player")) {
      timerEl.innerText = `⏳ ${timeLeft}`;
    }
    if (timeLeft <= 0) clearInterval(countdown);
  }, 1000);
  // Music
  const music = document.createElement("audio");
  music.id = "fj-music-host";
  music.src = "final-jeopardy-extended.mp3";
  music.autoplay = true;
  popupEl.appendChild(music);
  // 🔹 Stop timer & music when reveal happens
  window.addEventListener("message", (e) => {
    if (e.data?.type === "finalReveal") {
      clearInterval(countdown);
      music.pause();
      music.currentTime = 0;
    }
  });
}

/* ---------- REVEAL + SCORING STAGE ---------- */

// Host: show correct answer + per-player adjudication buttons
// ===== HOST: Final Jeopardy Scoring =====
function showFinalScoringHost() {
  popupEl.style.display = "flex";
  doneBtn.style.display = "none";

  // Show the correct Final Jeopardy answer (same style as normal questions)
  questionTextEl.innerText = "🏁 Final Jeopardy Scoring";
  answerTextEl.innerText = "Correct Answer: " + finalJeopardy.answer;

  // ✅ Remove old UI
  document.getElementById("popup-scores")?.remove();
  document.getElementById("final-wager-host")?.remove();
  document.getElementById("final-clue-host")?.remove();
  document.getElementById("final-score-host")?.remove();

  const ui = document.createElement("div");
  ui.id = "final-score-host";
  ui.style.marginTop = "20px";
  ui.style.display = "flex";
  ui.style.justifyContent = "center";
  ui.style.gap = "16px";
  ui.style.flexWrap = "wrap"; // handles smaller screens

  ui.innerHTML = `
    ${players.map((p, idx) => `
      <div class="score-box fj-player-row" data-idx="${idx}" style="
        display: flex;
        flex-direction: column;
        align-items: center;
        padding: 12px;
        border: 2px solid #fff;
        border-radius: 12px;
        background: rgba(0,0,50,0.7);
        width: 200px;
      ">
        <img src="${p.img}" width="60" style="border-radius:50%; border:2px solid #fff; margin-bottom:8px;">
        <div style="font-size:16px; text-align:center; margin-bottom:8px;">
          <b>${p.name}</b><br>
          Score: <span style="color:yellow;">$${p.score}</span><br>
          Wager: <span style="color:yellow;">$${finalState.wagers[idx] ?? 0}</span>
        </div>
        <div style="display:flex; gap:10px;">
          <button class="fj-correct" data-idx="${idx}" 
            style="background:green; color:white; font-size:16px; padding:6px 14px; border-radius:8px; cursor:pointer;">
            ✔ Correct
          </button>
          <button class="fj-wrong" data-idx="${idx}" 
            style="background:red; color:white; font-size:16px; padding:6px 14px; border-radius:8px; cursor:pointer;">
            ✖ Wrong
          </button>
        </div>
      </div>
    `).join("")}
  `;

  // Add End Game button
  const endBtn = document.createElement("button");
  endBtn.id = "fj-end";
  endBtn.disabled = true;
  endBtn.innerText = "🏆 End Game";
  endBtn.style.cssText = `
    margin-top:20px;
    font-size:20px;
    padding:10px 20px;
    background:#444;
    color:white;
    border-radius:10px;
    cursor:pointer;
    opacity:0.6;
  `;

  const container = document.createElement("div");
  container.style.display = "flex";
  container.style.flexDirection = "column";
  container.style.alignItems = "center";
  container.appendChild(ui);
  container.appendChild(endBtn);
  popupEl.appendChild(container);

  // ✅ Wire up scoring buttons
  const checkEndGameReady = () => {
    const allGraded = players.every((_, i) => finalState.graded[i]);
    if (allGraded) {
      endBtn.disabled = false;
      endBtn.style.opacity = "1";
    }
  };

  ui.querySelectorAll(".fj-correct").forEach(btn => {
  btn.onclick = () => {
    const idx = parseInt(btn.dataset.idx, 10);
    if (finalState.graded[idx]) return;

    const delta = finalState.wagers[idx] ?? 0;
    finalState.graded[idx] = true;
    updateScore(idx, delta);
    renderScores(); // ✅ This will update the bottom score bar

    const row = btn.closest(".fj-player-row");
    row.style.background = "rgba(0,100,0,0.7)";
    btn.disabled = true;
    btn.nextElementSibling.disabled = true;

    checkEndGameReady();
  };
});

  ui.querySelectorAll(".fj-wrong").forEach(btn => {
    btn.onclick = () => {
      const idx = parseInt(btn.dataset.idx, 10);
      if (finalState.graded[idx]) return;

      const delta = -(finalState.wagers[idx] ?? 0);
      finalState.graded[idx] = true;
      updateScore(idx, delta);
      renderScores();

      const row = btn.closest(".fj-player-row");
      row.style.background = "rgba(100,0,0,0.7)";
      btn.disabled = true;
      btn.previousElementSibling.disabled = true;

      checkEndGameReady();
    };
  });

  endBtn.onclick = () => {
    finalState.active = false;

    // 👇 broadcast to all players
    sendMessage({
      type: "gameOver",
      players: players.map(p => ({
        name: p.name,
        img: p.img,
        score: p.score
      }))
    });

    // Host also shows endgame
    showEndGameScreen(players);
  };
}

// ===== PLAYERS: No answer, just wait =====
function showFinalRevealPlayer() {
  popupEl.style.display = "flex";
  doneBtn.style.display = "none";

  // Clean up timer & music
  const timerEl = document.getElementById("fj-timer-player");
  if (timerEl) timerEl.remove();

  const music = document.getElementById("fj-music-player");
  if (music) {
    music.pause();
    music.currentTime = 0;
    music.remove();
  }

  questionTextEl.innerText = "Lock in your answers!";
  answerTextEl.innerText = "Final scoring in progress...";
}

// ===== END GAME =====
function showEndGameScreen(finalPlayers) {
  popupEl.style.display = "flex";
  doneBtn.style.display = "none";

  // ✅ Clear out old UI
  popupEl.innerHTML = `
    <h2 id="question-text"></h2>
    <p id="answer-text"></p>
    <button id="done-btn" style="display:none;">Done</button>
  `;
  const questionTextEl = document.getElementById("question-text");
  const answerTextEl = document.getElementById("answer-text");

  questionTextEl.innerText = "🏆 FINAL RESULTS 🏆";
  answerTextEl.innerText = "";

  // sort by score
  const sorted = [...finalPlayers].sort((a, b) => b.score - a.score);

  const colors = ["gold", "silver", "peru", "gray"]; // bronze ~ peru
  const ui = document.createElement("div");
  ui.style.display = "flex";
  ui.style.justifyContent = "center";
  ui.style.gap = "20px";
  ui.style.marginTop = "20px";
  ui.style.flexWrap = "wrap";

  ui.innerHTML = sorted.map((p, i) => `
    <div style="
      display:flex;
      flex-direction:column;
      align-items:center;
      background:${colors[i] || "dimgray"};
      padding:20px;
      border-radius:12px;
      min-width:150px;
    ">
      <img src="${p.img}" width="80" style="border-radius:50%; border:3px solid #fff; margin-bottom:10px;">
      <b>${p.name}</b>
      <div style="font-size:24px; margin:5px 0;">$${p.score}</div>
      <div style="font-size:18px;">${i+1}${["st","nd","rd"][i] || "th"}</div>
    </div>
  `).join("");

  popupEl.appendChild(ui);
}


// ====== EVENTS ======
doneBtn.addEventListener("click", () => {
  if (finalState.active) return; // ignore during Final Jeopardy
  closeQuestion();
  renderScores();
  if (isHost) sendMessage({ type: "closeQuestion" });
});

// ====== INIT ======
gameState = "waiting";
showStartScreen();

// Initialize data but don't build board yet
categories = jeopardyCategories;
if (isHost) {
  pickDailyDoubles(1);
}

// Only render scores (will be hidden behind start screen initially)
renderScores();
