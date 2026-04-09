(() => {
  "use strict";

  const PRIORITIES = [
    "Maximum leg room & driver comfort",
    "Staying under $30,000",
    "Truck bed or hauling capability",
    "Highway driving assist (adaptive cruise)",
    "Easy to get in and out of",
    "Minimal annoying tech (no start-stop, etc.)",
    "Long road trip comfort (Grand Canyon solo trip!)",
    "Brand reliability & low maintenance"
  ];

  // Build all unique pairs (28 total for 8 items)
  function buildPairs(items) {
    const pairs = [];
    for (let i = 0; i < items.length; i++) {
      for (let j = i + 1; j < items.length; j++) {
        pairs.push([i, j]);
      }
    }
    // Shuffle so the order feels varied
    for (let k = pairs.length - 1; k > 0; k--) {
      const r = Math.floor(Math.random() * (k + 1));
      [pairs[k], pairs[r]] = [pairs[r], pairs[k]];
    }
    return pairs;
  }

  // State
  let userName = "";
  let pairs = [];
  let currentPair = 0;
  let wins = [];

  // DOM refs
  const screenWelcome = document.getElementById("screen-welcome");
  const screenCompare = document.getElementById("screen-compare");
  const screenResults = document.getElementById("screen-results");

  const nameSelect = document.getElementById("name-select");
  const startBtn = document.getElementById("start-btn");

  const progressLabel = document.getElementById("progress-label");
  const progressFill = document.getElementById("progress-fill");
  const btnA = document.getElementById("choice-a");
  const btnB = document.getElementById("choice-b");

  const resultsName = document.getElementById("results-name");
  const resultsList = document.getElementById("results-list");
  const sendBtn = document.getElementById("send-btn");
  const sentMsg = document.getElementById("sent-msg");

  // Screens
  function showScreen(screen) {
    [screenWelcome, screenCompare, screenResults].forEach(s => s.classList.remove("active"));
    screen.classList.add("active");
  }

  // Start
  nameSelect.addEventListener("change", () => {
    startBtn.disabled = !nameSelect.value;
  });

  startBtn.addEventListener("click", () => {
    userName = nameSelect.value;
    if (!userName) return;
    wins = new Array(PRIORITIES.length).fill(0);
    pairs = buildPairs(PRIORITIES);
    currentPair = 0;
    showScreen(screenCompare);
    renderPair();
  });

  // Render current pair
  function renderPair() {
    const [a, b] = pairs[currentPair];
    // Randomize left/right position each time
    if (Math.random() > 0.5) {
      btnA.textContent = PRIORITIES[a];
      btnA.dataset.idx = a;
      btnB.textContent = PRIORITIES[b];
      btnB.dataset.idx = b;
    } else {
      btnA.textContent = PRIORITIES[b];
      btnA.dataset.idx = b;
      btnB.textContent = PRIORITIES[a];
      btnB.dataset.idx = a;
    }
    const done = currentPair;
    const total = pairs.length;
    progressLabel.textContent = `${done + 1} of ${total}`;
    progressFill.style.width = `${(done / total) * 100}%`;
  }

  // Choice handler
  function choose(idx) {
    wins[idx]++;
    currentPair++;
    if (currentPair >= pairs.length) {
      progressFill.style.width = "100%";
      showResults();
    } else {
      renderPair();
    }
  }

  btnA.addEventListener("click", () => choose(Number(btnA.dataset.idx)));
  btnB.addEventListener("click", () => choose(Number(btnB.dataset.idx)));

  // Results
  function showResults() {
    resultsName.textContent = userName;

    // Sort by wins descending, stable by original index
    const ranked = PRIORITIES.map((label, i) => ({ label, wins: wins[i], i }))
      .sort((a, b) => b.wins - a.wins || a.i - b.i);

    resultsList.innerHTML = "";
    ranked.forEach((item, rank) => {
      const li = document.createElement("li");

      const numSpan = document.createElement("span");
      numSpan.className = "rank-num " + (rank === 0 ? "rank-1" : rank === 1 ? "rank-2" : rank === 2 ? "rank-3" : "rank-other");
      numSpan.textContent = rank + 1;

      const labelSpan = document.createElement("span");
      labelSpan.className = "rank-label";
      labelSpan.textContent = item.label;

      const scoreSpan = document.createElement("span");
      scoreSpan.className = "rank-score";
      scoreSpan.textContent = `${item.wins} / 7`;

      li.append(numSpan, labelSpan, scoreSpan);
      resultsList.appendChild(li);
    });

    showScreen(screenResults);
  }

  // Send results via FormSubmit
  sendBtn.addEventListener("click", () => {
    const ranked = PRIORITIES.map((label, i) => ({ label, wins: wins[i], i }))
      .sort((a, b) => b.wins - a.wins || a.i - b.i);

    const body = ranked.map((item, rank) =>
      `${rank + 1}. ${item.label} (${item.wins}/7 wins)`
    ).join("\n");

    const formData = new FormData();
    formData.append("name", userName);
    formData.append("_subject", `Vehicle Priority Results: ${userName} Mathes`);
    formData.append("message", `Vehicle priority ranking for ${userName} Mathes:\n\n${body}`);
    formData.append("_captcha", "false");
    formData.append("_template", "table");

    sendBtn.disabled = true;
    sendBtn.textContent = "Sending...";

    fetch("https://formsubmit.co/ajax/wake@greaterthanfinancial.com", {
      method: "POST",
      body: formData
    })
    .then(r => r.json())
    .then(data => {
      if (data.success === "true" || data.success === true) {
        sentMsg.textContent = "Results sent to Wakefield! You're all set.";
      } else {
        sentMsg.textContent = "Sent! Wakefield will receive your results shortly.";
      }
      sentMsg.style.display = "block";
      sendBtn.style.display = "none";
    })
    .catch(() => {
      sentMsg.textContent = "There was a problem sending. Please screenshot your results and text them to Wakefield.";
      sentMsg.style.display = "block";
      sendBtn.disabled = false;
      sendBtn.textContent = "Send my results to Wakefield";
    });
  });
})();
