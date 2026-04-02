// ====== CONFIG ======
const ws = new WebSocket("ws://localhost:8000");
// Detect mode based on which HTML file is loaded
const isHost = window.location.pathname.includes("host.html");

let categories = [
  {
    name: "Feathered Friends",
    questions: [
      { q: "This large bird is the national symbol of the United States.", a: "What is the bald eagle?", value: 200 },
      { q: "This flightless bird is native to Australia.", a: "What is the emu?", value: 400 },
      { q: "This bird can mimic human speech.", a: "What is a parrot?", value: 600 },
      { q: "This nocturnal bird is known for its hooting call.", a: "What is an owl?", value: 800 },
      { q: "This fastest bird dives at over 200 mph.", a: "What is the peregrine falcon?", value: 1000 }
    ]
  },
  {
    name: "Muscle Matters",
    questions: [
      { q: "This is the strongest muscle in the body relative to its size.", a: "What is the masseter (jaw muscle)?", value: 200 },
      { q: "This muscle group straightens the knee.", a: "What are the quadriceps?", value: 400 },
      { q: "The Achilles tendon attaches this muscle to the heel.", a: "What is the calf?", value: 600 },
      { q: "This organ is technically the hardest working muscle.", a: "What is the heart?", value: 800 },
      { q: "The scientific term for the abs.", a: "What is the rectus abdominis?", value: 1000 }
    ]
  },
  {
    name: "Mind Games",
    questions: [
      { q: "This Austrian is considered the father of psychoanalysis.", a: "Who is Sigmund Freud?", value: 200 },
      { q: "This part of the brain is responsible for memory.", a: "What is the hippocampus?", value: 400 },
      { q: "BF Skinner is best known for this type of conditioning.", a: "What is operant conditioning?", value: 600 },
      { q: "This psychological effect makes people conform to group opinion.", a: "What is the Asch effect?", value: 800 },
      { q: "Maslow is known for this pyramid-shaped theory.", a: "What is the hierarchy of needs?", value: 1000 }
    ]
  },
  {
    name: "Slice of Life",
    questions: [
      { q: "This Italian city is credited with inventing pizza.", a: "What is Naples?", value: 200 },
      { q: "This is the most popular pizza topping in the US.", a: "What is pepperoni?", value: 400 },
      { q: "This style of pizza is known for its deep-dish crust.", a: "What is Chicago-style?", value: 600 },
      { q: "This Italian cheese is traditionally used on pizza.", a: "What is mozzarella?", value: 800 },
      { q: "This chain introduced the ‘30 minutes or less’ guarantee.", a: "What is Domino’s?", value: 1000 }
    ]
  },
  {
    name: "Twang Time",
    questions: [
      { q: "This singer is known as the 'King of Country'.", a: "Who is George Strait?", value: 200 },
      { q: "This Nashville street is famous for country music venues.", a: "What is Broadway?", value: 400 },
      { q: "This female singer was known for ‘Jolene’.", a: "Who is Dolly Parton?", value: 600 },
      { q: "This state is home to the Grand Ole Opry.", a: "What is Tennessee?", value: 800 },
      { q: "This country star had a hit with ‘Friends in Low Places’.", a: "Who is Garth Brooks?", value: 1000 }
    ]
  }
];

let players = [
  { name: "Steve-O", score: 0, img: "steveo.png" },
  { name: "Hunter-Chan", score: 0, img: "hunter.png" },
  { name: "Hans", score: 0, img: "hans.jpg" }
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
  category: "Final Category",
  question: "In 1912, this ship struck an iceberg on its maiden voyage.",
  answer: "What is the Titanic?"
};

// Runtime state for Final
let finalState = {
  active: false,        // are we in Final Jeopardy flow?
  wagers: {},           // { idx: number }
  responses: {},        // { idx: string }
  graded: {}            // { idx: true } after scoring
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

  if (msg.type === "openQuestion") {
    if (!isHost) {
      showQuestion(msg.question, msg.answer, msg.value, false);
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

};

function sendMessage(obj) {
  ws.send(JSON.stringify(obj));
}

// ====== BUILD BOARD ======
function buildBoard() {
  boardEl.innerHTML = "";

  // Add category headers
  categories.forEach(cat => {
    const catDiv = document.createElement("div");
    catDiv.className = "category";
    catDiv.innerText = cat.name;
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
          currentQuestion = { ...q, category: cIndex, index: i };

          if (dailyDouble && dailyDouble.catIndex === cIndex && dailyDouble.qIndex === i) {
            // Daily Double branch
            console.log("🔥 Daily Double triggered at", cIndex, i);
            sendMessage({ type: "dailyDouble" });
            showDailyDouble(q.q, q.a, q.value); 
          } else {
            // Normal question branch
            console.log("👉 Normal question triggered at", cIndex, i);
            sendMessage({
              type: "openQuestion",
              category: cIndex,
              index: i,
              question: q.q,
              answer: q.a,
              value: q.value
            });

            sendMessage({ type: "markCell", category: cIndex, index: i });
            markCellUsed(cIndex, i);

            showQuestion(q.q, q.a, q.value, true);
          }
        }
      });

      boardEl.appendChild(cell);
    });
  }
  if (isHost) {
  const finalBtn = document.createElement("button");
  finalBtn.id = "final-btn";
  finalBtn.innerText = "Start Final Jeopardy";
  finalBtn.style.margin = "16px auto";
  finalBtn.onclick = startFinalJeopardy;
  document.body.appendChild(finalBtn);
  }
}



// ===== CREATE DAILY DOUBLE =====
let dailyDouble = null;

function pickDailyDouble() {
  const catIndex = Math.floor(Math.random() * categories.length);
  const qIndex = Math.floor(Math.random() * categories[catIndex].questions.length);
  //dailyDouble = { catIndex, qIndex }; // Hidden for debug
  dailyDouble = { catIndex: 0, qIndex: 0 };
  console.log("🎲 Daily Double at", dailyDouble);
}

// ===== SHOW DAILY DOUBLE =====
function showDailyDouble(q, a, value) {
  popupEl.style.display = "flex";

  // Always show Daily Double banner first
  questionTextEl.innerText = "🎉 DAILY DOUBLE 🎉";
  answerTextEl.innerText = "";

  // Hide Done button until the actual question shows
  doneBtn.style.display = "none";

  // Remove any old extra UI
  const oldExtra = document.getElementById("dd-extra");
  if (oldExtra) oldExtra.remove();

  if (isHost) {
    // 🔹 Host sees wager + player select
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

        const maxWager = Math.max(1000, players[idx].score);
        document.getElementById("dd-max-wager").innerText = `Max wager: $${maxWager}`;
      };
      playerDiv.appendChild(btn);
    });

    // Lock In handler
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

      // ✅ Max wager is max($1000, player’s score)
      const maxWager = Math.max(1000, playerScore);

      const wager = parseInt(wagerInput.value, 10);

      if (isNaN(wager)) {
        alert("Please enter a wager.");
        return;
      }

      if (wager > maxWager) {
        alert(`Wager cannot exceed $${maxWager}. Please try again.`);
        wagerInput.value = ""; // clear invalid entry
        return;                // 🚨 stop, don't continue
      }

      if (wager < 0) {
        alert("Wager must be positive.");
        return;
      }

      // Store info
      currentQuestion.value = wager;
      currentQuestion.ddPlayer = playerIndex;

      // Remove DD setup UI
      extraDiv.remove();

      // Broadcast question with wager + selected player
      sendMessage({
        type: "openQuestion",
        category: currentQuestion.category,
        index: currentQuestion.index,
        question: currentQuestion.q,
        answer: currentQuestion.a,
        value: wager,
        playerIndex
      });

      // ✅ Mark as used
      sendMessage({ type: "markCell", category: currentQuestion.category, index: currentQuestion.index });
      markCellUsed(currentQuestion.category, currentQuestion.index);

      // Show Q on host
      showQuestion(currentQuestion.q, currentQuestion.a, wager, true);
    };

  } else {
    // 🔹 Players ONLY see the Daily Double flash (no UI)
    questionTextEl.innerText = "🎉 DAILY DOUBLE 🎉";
    answerTextEl.innerText = "";
  }
}



function closeQuestion() {
  popupEl.style.display = "none";
  currentQuestion = null;
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
  sendMessage({ type: "markCell", category: currentQuestion.category, index: currentQuestion.index });
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

  // No normal scoring UI during Final Jeopardy
  if (finalState.active) return;

  // ===== host scoring UI for the open question =====
  if (isHost && currentQuestion) {
    // ensure a persistent per-question graded map
    if (!currentQuestion.graded) currentQuestion.graded = {}; // { [idx]: "correct" | "wrong" }

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
          btnWrong.style.opacity  = "0.6";
          btnCorrect.style.cursor = "default";
          btnWrong.style.cursor   = "default";
        }

        btnCorrect.onclick = () => {
          if (currentQuestion.graded[idx]) return; // single mark guard
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
  }
}

// ===== SHOW QUESITON =====
function showQuestion(q, a, value, hostView) {
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
    renderScores(); // host sees scoring buttons
  } else {
    doneBtn.style.display = "none"; // players cannot close question
  }
}



function updateScore(playerIndex, delta) {
  players[playerIndex].score += delta;
  sendMessage({ type: "updateScores", players });
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
  finalState = { active: true, wagers: {}, responses: {}, graded: {} };

  // Broadcast start (category only)
  sendMessage({ type: "finalStart", category: finalJeopardy.category });

  // Show host wager collection UI immediately
  showFinalWagerHost(finalJeopardy.category);
}

/* ---------- WAGER STAGE ---------- */

// Host: enter wagers for each player (max = current score, min = 0)
function showFinalWagerHost(category) {
  popupEl.style.display = "flex";
  doneBtn.style.display = "none";
  questionTextEl.innerText = "🏁 FINAL JEOPARDY";
  answerTextEl.innerText = `Category: ${category}`;

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
          min-width: 180px;">
          
          <img src="${p.img}" width="60" style="border-radius:50%; border:2px solid #fff;">
          
          <div style="text-align:center;">
            <b>${p.name}</b><br>
            Current: $${p.score}
          </div>
          
          <input id="fj-wager-${idx}" 
                type="number" 
                min="0" 
                max="${Math.max(0, p.score)}" 
                placeholder="Wager (max $${Math.max(0, p.score)})" 
                style="width:100%; padding:6px; font-size:14px; text-align:center; border-radius:6px;">
        </div>
      `).join("")}
    </div>
    
    <div style="margin-top:20px; text-align:center;">
      <button id="fj-lock-wagers" style="
        font-size:18px; 
        padding:10px 20px; 
        background:#444; 
        color:white; 
        border-radius:10px;">
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
  questionTextEl.innerText = `🏁 FINAL JEOPARDY\nCategory: ${category}`;
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
  document.getElementById("final-wager-host")?.remove();
  document.getElementById("final-clue-host")?.remove();

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

  // Music
  const music = document.createElement("audio");
  music.id = "fj-music-host";
  music.src = "final-jeopardy.mp3";
  music.autoplay = true;
  let playCount = 1;
  music.onended = () => {
    if (playCount < 2) {
      playCount++;
      music.play();
    }
  };
  popupEl.appendChild(music);

  // Reveal button
  document.getElementById("fj-reveal-answer").onclick = () => {
    clearInterval(countdown);
    music.pause();
    music.currentTime = 0;

    sendMessage({ type: "finalReveal", answer: finalJeopardy.answer });
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
  music.id = "fj-music-player";
  music.src = "final-jeopardy.mp3";
  music.autoplay = true;
  let playCount = 1;
  music.onended = () => {
    if (playCount < 2) {
      playCount++;
      music.play();
    }
  };
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
      renderScores();

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
buildBoard();
renderScores();
pickDailyDouble();
