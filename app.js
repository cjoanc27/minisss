(function () {
  "use strict";

  const CONDITION = "pilot_first";
  const DEFAULT_ROWS = 5;
  const DEFAULT_COLS = 6;
  const DEFAULT_CELL_SIZE = 72;
  const MAX_STEPS = 50;
  const MOVE_DELAY_MS = 140;

  const DIRECTIONS = {
    right: { row: 0, col: 1, symbol: "\u2192" },
    left: { row: 0, col: -1, symbol: "\u2190" },
    up: { row: -1, col: 0, symbol: "\u2191" },
    down: { row: 1, col: 0, symbol: "\u2193" }
  };
  const REQUIRED_MOVE_FROM_SIDE = { left: "right", right: "left", up: "down", down: "up" };
  const REVIEW_STEPS = [
    "Ran the panel-cutting pilot and discovered the scrap problem",
    "Reported the problem to the production team",
    "Received the team's Scrap Bin update",
    "Added the Scrap Bin and ran the same pilot again",
    "Verified that the corrected pilot worked",
    "Scaled the proven panel-cutting process"
  ];
  const REVIEW_CARD_ORDER = [3, 6, 1, 5, 2, 4];

  const STAGES = [
    {
      id: "stage1",
      badge: "Stage 1",
      title: "Mechanics tutorial",
      instructions: `
        <p>A small factory is moving packaged raw material from a <strong>STORAGE SOURCE</strong> to the <strong>SHIPPING HUB</strong>.</p>
        <p>Build a conveyor route from Storage to Shipping. If the product does not arrive, revise the route and try again.</p>
      `,
      rows: 5,
      cols: 6,
      sources: [{ row: 3, col: 1, output: "right" }],
      cutters: [],
      processors: [],
      hubs: [{ row: 1, col: 6 }],
      targetOutput: 1,
      requireProcessed: false,
      successMessage: "SUCCESS - Material delivered to the Shipping Hub."
    },
    {
      id: "stage2",
      badge: "Stage 2",
      title: "Precision panel-cutting pilot",
      instructions: `
        <p>Your team is preparing a new panel-cutting process. Before the factory is expanded, you have been asked to build and test <strong>one complete pilot line</strong>.</p>
        <p><strong>Required main flow:</strong> RAW SHEET SOURCE \u2192 PANEL CUTTER \u2192 SHIPPING HUB</p>
      `,
      rows: 5,
      cols: 7,
      cellSize: 68,
      sources: [{ row: 3, col: 1, output: "right", pilot: true }],
      cutters: [{ row: 3, col: 3, output: "right", wasteOutput: "down", hiddenWaste: true }],
      processors: [],
      hubs: [{ row: 3, col: 6 }],
      targetOutput: 1,
      requireProcessed: true,
      hiddenWaste: true,
      startsWithWasteTool: false,
      reportAfterFailure: true
    },
    {
      id: "stage3",
      badge: "Stage 3",
      title: "Team update: verify the corrected pilot",
      instructions: `
        <p><strong>Production team update:</strong> Thanks for reporting the pilot result. We reviewed the issue and updated the process design.</p>
        <p>Every Panel Cutter needs a <strong>Scrap Bin</strong> connected to its secondary outlet so trimming waste can be removed continuously.</p>
        <p>Please add the Scrap Bin to the pilot line and test the corrected process before we build the rest of the factory.</p>
      `,
      rows: 5,
      cols: 7,
      cellSize: 68,
      sources: [{ row: 3, col: 1, output: "right", pilot: true }],
      cutters: [{ row: 3, col: 3, output: "right", wasteOutput: "down" }],
      processors: [],
      hubs: [{ row: 3, col: 6 }],
      targetOutput: 1,
      requireProcessed: true,
      startsWithWasteTool: true,
      loadStage2Pilot: true,
      counterfactualAfterSuccess: true,
      successMessage: "PILOT SUCCESS - The panel-cutting process now runs continuously."
    },
    {
      id: "practiceAScale",
      badge: "Stage 4A",
      title: "Scale the approved panel-cutting process",
      instructions: `
        <p>Demand now requires <strong>3 finished panels</strong> per production cycle.</p>
        <p>Your tested pilot line is approved. Add two more panel-cutting lines using the verified design.</p>
      `,
      rows: 7,
      cols: 7,
      cellSize: 64,
      sources: [
        { row: 2, col: 1, output: "right" },
        { row: 4, col: 1, output: "right", pilot: true },
        { row: 6, col: 1, output: "right" }
      ],
      cutters: [
        { row: 2, col: 3, output: "right", wasteOutput: "down" },
        { row: 4, col: 3, output: "right", wasteOutput: "down", pilot: true },
        { row: 6, col: 3, output: "right", wasteOutput: "down" }
      ],
      processors: [],
      hubs: [{ row: 2, col: 6 }, { row: 4, col: 6 }, { row: 6, col: 6 }],
      initialBelts: { "4,2": "right", "4,4": "right", "4,5": "right" },
      initialWasteBins: [{ row: 5, col: 3 }],
      targetOutput: 3,
      requireProcessed: true,
      startsWithWasteTool: true,
      payoffSummary: "panel",
      successMessage: "PRODUCTION TARGET REACHED - 3 of 3 panel-cutting lines are working."
    },
    {
      id: "practiceAReview",
      badge: "Stage 4A",
      title: "Practice A: Review what happened",
      instructions: `
        <p>You have now scaled the approved panel-cutting process.</p>
        <p>Click the cards in the order the learning events happened.</p>
      `,
      review: true,
      rows: 1,
      cols: 1,
      sources: [],
      cutters: [],
      processors: [],
      hubs: [],
      targetOutput: 0,
      successMessage: "REVIEW COMPLETE - The pilot created information the team did not have before the process was run."
    },
    {
      id: "practiceB",
      badge: "Stage 4B",
      title: "Practice B: Carton-labeling pilot",
      instructions: `
        <p>A different product will eventually require <strong>3 labelled carton lines</strong>.</p>
        <p>First establish one complete pilot process and test whether it works from start to finish.</p>
        <p><strong>Main flow:</strong> CARTON SOURCE \u2192 BARCODE LABELER \u2192 SHIPPING HUB</p>
      `,
      rows: 7,
      cols: 7,
      cellSize: 64,
      sources: [
        { row: 2, col: 1, output: "right" },
        { row: 4, col: 1, output: "right", pilot: true },
        { row: 6, col: 1, output: "right" }
      ],
      cutters: [],
      processors: [
        { row: 2, col: 4, output: "right", inputFrom: "up", hiddenInput: true },
        { row: 4, col: 4, output: "right", inputFrom: "up", hiddenInput: true, pilot: true },
        { row: 6, col: 4, output: "right", inputFrom: "up", hiddenInput: true }
      ],
      hubs: [{ row: 2, col: 7 }, { row: 4, col: 7 }, { row: 6, col: 7 }],
      targetOutput: 3,
      requireProcessed: true,
      startsWithWasteTool: false,
      pilotGate: true,
      processorIssue: true,
      payoffSummary: "carton",
      successMessage: "PRODUCTION TARGET REACHED - 3 of 3 carton-labeling lines are working."
    },
    {
      id: "practiceC",
      badge: "Stage 4C",
      title: "Practice C: New pouch production process",
      instructions: `
        <p>A new protective pouch needs to be sealed and packed for shipment.</p>
        <p><strong>Final target:</strong> 3 working production lines.</p>
        <p><strong>Visible process requirement:</strong> FILLED POUCH SOURCE \u2192 HEAT SEALER \u2192 PACKING HUB</p>
        <p>Use the approach you think is most effective.</p>
      `,
      rows: 7,
      cols: 8,
      cellSize: 64,
      sources: [
        { row: 2, col: 1, output: "right" },
        { row: 4, col: 1, output: "right", pilot: true },
        { row: 6, col: 1, output: "right" }
      ],
      cutters: [],
      processors: [
        { row: 2, col: 3, output: "right", hotOutput: true },
        { row: 4, col: 3, output: "right", hotOutput: true, pilot: true },
        { row: 6, col: 3, output: "right", hotOutput: true }
      ],
      hubs: [{ row: 2, col: 8 }, { row: 4, col: 8 }, { row: 6, col: 8 }],
      targetOutput: 3,
      requireProcessed: true,
      requireCooled: true,
      startsWithCoolingTool: false,
      hotProduct: true,
      noExplicitPilotReminder: true,
      coolingPilotAfterReveal: true,
      payoffSummary: "pouch",
      successMessage: "PRODUCTION TARGET REACHED - 3 of 3 pouch lines are working."
    }
  ];

  const board = document.getElementById("board");
  const introScreen = document.getElementById("introScreen");
  const gameScreen = document.getElementById("gameScreen");
  const completeScreen = document.getElementById("completeScreen");
  const startButton = document.getElementById("startButton");
  const stageBadge = document.getElementById("stageBadge");
  const stageStatus = document.getElementById("stageStatus");
  const stageTitle = document.getElementById("stageTitle");
  const stageInstructions = document.getElementById("stageInstructions");
  const feedback = document.getElementById("feedback");
  const lessonPanel = document.getElementById("lessonPanel");
  const pilotRunButton = document.getElementById("pilotRunButton");
  const runButton = document.getElementById("runButton");
  const resetButton = document.getElementById("resetButton");
  const reportButton = document.getElementById("reportButton");
  const continueButton = document.getElementById("continueButton");
  const wasteTool = document.getElementById("wasteTool");
  const coolingTool = document.getElementById("coolingTool");
  const toolGroup = document.querySelector(".tool-group");
  const actionGroup = document.querySelector(".action-group");
  const toolButtons = Array.from(document.querySelectorAll(".tool-button"));

  let selectedTool = "right";
  let currentStageIndex = 0;
  let currentStage = STAGES[0];
  let grid = createGrid(currentStage);
  let wasteBins = createWasteBins(currentStage);
  let coolingStations = createCoolingStations(currentStage);
  let activeProducts = [];
  let isRunning = false;
  let phaseStarted = false;
  let phaseCompleted = false;
  let wasteToolUnlocked = false;
  let coolingToolUnlocked = false;
  let stageIssueRevealed = false;
  let stage2PilotSnapshot = null;
  let reviewSelection = [];
  const sessionStart = Date.now();
  const eventLog = [];
  const metrics = STAGES.reduce((acc, stage) => {
    acc[stage.id] = {
      startedAt: null,
      completedAt: null,
      attempts: 0,
      pilotAttempts: 0,
      fullAttempts: 0,
      firstRunAt: null,
      firstRunLineCount: null,
      beltsBeforeFirstRun: 0,
      linesBuiltBeforePilotSuccess: null,
      pilotFailureDetected: false,
      failureType: null,
      failureAt: null,
      timeFailureToReportMs: null,
      timeFailureToFixMs: null,
      reportIssueClicked: false,
      stage3WasteBinAdded: false,
      stage3PilotRerunSuccess: false,
      reviewAttempts: 0,
      sequenceCorrect: false,
      timeToCorrectReviewMs: null,
      rerouteEdits: 0,
      coolingStationEdits: 0,
      reworkLines: null,
      coolingFixSuccess: false,
      reworkActions: 0,
      bestOutput: 0,
      completed: false
    };
    return acc;
  }, {});

  function elapsed() {
    return Date.now() - sessionStart;
  }

  function rows(stage) {
    return stage.rows || DEFAULT_ROWS;
  }

  function cols(stage) {
    return stage.cols || DEFAULT_COLS;
  }

  function cellSize(stage) {
    return stage.cellSize || DEFAULT_CELL_SIZE;
  }

  function createGrid(stage) {
    const nextGrid = Array.from({ length: rows(stage) }, () => Array.from({ length: cols(stage) }, () => null));
    Object.entries(stage.initialBelts || {}).forEach(([key, direction]) => {
      const [row, col] = key.split(",").map(Number);
      nextGrid[row - 1][col - 1] = { direction };
    });
    return nextGrid;
  }

  function createWasteBins(stage) {
    return (stage.initialWasteBins || []).map((bin) => ({ ...bin }));
  }

  function createCoolingStations(stage) {
    return (stage.initialCoolingStations || []).map((station) => ({ ...station }));
  }

  function cloneGrid(sourceGrid) {
    return sourceGrid.map((row) => row.map((cell) => cell ? { ...cell } : null));
  }

  function logEvent(type, payload = {}, stage = currentStage) {
    eventLog.push({
      timestamp: new Date().toISOString(),
      elapsed_ms: elapsed(),
      condition: CONDITION,
      stage: stage ? stage.id : null,
      stage_label: stage ? stage.badge : null,
      type,
      ...payload
    });
  }

  function inBounds(row, col) {
    return row >= 1 && row <= rows(currentStage) && col >= 1 && col <= cols(currentStage);
  }

  function moveFrom(cell, direction) {
    return { row: cell.row + DIRECTIONS[direction].row, col: cell.col + DIRECTIONS[direction].col };
  }

  function findSource(row, col) {
    return currentStage.sources.find((item) => item.row === row && item.col === col);
  }

  function findCutter(row, col) {
    return currentStage.cutters.find((item) => item.row === row && item.col === col);
  }

  function findProcessor(row, col) {
    return currentStage.processors.find((item) => item.row === row && item.col === col);
  }

  function findHub(row, col) {
    return currentStage.hubs.find((item) => item.row === row && item.col === col);
  }

  function findWasteBin(row, col) {
    return wasteBins.find((item) => item.row === row && item.col === col);
  }

  function findCoolingStation(row, col) {
    return coolingStations.find((item) => item.row === row && item.col === col);
  }

  function getBelt(row, col) {
    return grid[row - 1][col - 1];
  }

  function setBelt(row, col, belt) {
    grid[row - 1][col - 1] = belt;
  }

  function clearProducts() {
    activeProducts = [];
  }

  function setFeedback(message, state) {
    feedback.textContent = message;
    feedback.className = `feedback ${state}`;
  }

  function renderBoard() {
    if (currentStage.review) {
      renderReviewBoard();
      return;
    }
    board.innerHTML = "";
    board.classList.remove("review-board");
    const size = cellSize(currentStage);
    board.style.gridTemplateColumns = `repeat(${cols(currentStage)}, ${size}px)`;
    board.style.gridTemplateRows = `repeat(${rows(currentStage)}, ${size}px)`;

    for (let row = 1; row <= rows(currentStage); row += 1) {
      for (let col = 1; col <= cols(currentStage); col += 1) {
        const cell = document.createElement("button");
        const source = findSource(row, col);
        const cutter = findCutter(row, col);
        const processor = findProcessor(row, col);
        const hub = findHub(row, col);
        const wasteBin = findWasteBin(row, col);
        const coolingStation = findCoolingStation(row, col);
        const belt = getBelt(row, col);
        const fixed = source || cutter || processor || hub;

        cell.type = "button";
        cell.className = "cell";
        cell.style.width = `${size}px`;
        cell.style.height = `${size}px`;
        cell.dataset.row = String(row);
        cell.dataset.col = String(col);

        if (source) {
          cell.classList.add("source", "locked");
          if (source.pilot) cell.classList.add("pilot");
          cell.innerHTML = source.pilot
            ? `<span class="tile-icon">\u25cf</span><span class="tile-label">PILOT<br>${sourceLabel()}</span>`
            : `<span class="tile-icon">\u25cf</span><span class="tile-label">${sourceLabel()}</span>`;
        } else if (cutter) {
          cell.classList.add("cutter", "locked");
          if (cutter.pilot) cell.classList.add("pilot");
          const outlet = cutter.hiddenWaste && !stageIssueRevealed ? "" : "<br>SCRAP\u2193";
          cell.innerHTML = `<span class="tile-icon">\u25c7</span><span class="tile-label">PANEL<br>CUTTER${outlet}</span>`;
        } else if (processor) {
          cell.classList.add("cutter", "locked");
          if (processor.pilot) cell.classList.add("pilot");
          const input = processor.inputFrom && (!processor.hiddenInput || stageIssueRevealed) ? `<br>IN ${processor.inputFrom.toUpperCase()}` : "";
          cell.innerHTML = `<span class="tile-icon">\u25c6</span><span class="tile-label">${processorLabel()}${input}</span>`;
        } else if (hub) {
          cell.classList.add("hub", "locked");
          cell.innerHTML = `<span class="tile-icon">\u25a3</span><span class="tile-label">${hubLabel()}</span>`;
        } else if (wasteBin) {
          cell.classList.add("waste");
          cell.innerHTML = '<span class="tile-icon">\u25a0</span><span class="tile-label">SCRAP<br>BIN</span>';
        } else if (coolingStation) {
          cell.classList.add("cooling");
          cell.innerHTML = '<span class="tile-icon">\u2744</span><span class="tile-label">COOLING<br>TUNNEL</span>';
        } else if (belt) {
          cell.classList.add("belt");
          cell.textContent = DIRECTIONS[belt.direction].symbol;
        }

        if (fixed) cell.classList.add("locked");
        cell.setAttribute("aria-label", cellLabel(row, col, source, cutter, processor, hub, wasteBin, coolingStation, belt));
        cell.addEventListener("click", () => handleCellClick(row, col));
        board.appendChild(cell);
      }
    }

    activeProducts.forEach((product) => placeProduct(product));
  }

  function sourceLabel() {
    if (currentStage.id === "practiceB") return "CARTON<br>SOURCE";
    if (currentStage.id === "practiceC") return "POUCH<br>SOURCE";
    if (currentStage.id === "stage1") return "STORAGE<br>SOURCE";
    return "RAW SHEET<br>SOURCE";
  }

  function processorLabel() {
    if (currentStage.id === "practiceB") return "BARCODE<br>LABELER";
    if (currentStage.id === "practiceC") return "HEAT<br>SEALER";
    return "PROCESSOR";
  }

  function hubLabel() {
    if (currentStage.id === "practiceC") return "PACKING<br>HUB";
    return "SHIPPING<br>HUB";
  }

  function renderReviewBoard() {
    board.innerHTML = "";
    board.classList.add("review-board");
    board.style.gridTemplateColumns = "";
    board.style.gridTemplateRows = "";

    const selected = document.createElement("section");
    selected.className = "review-section";
    selected.innerHTML = `<h2>Your sequence</h2><div class="review-card-list">${
      reviewSelection.length
        ? reviewSelection.map((stepIndex, orderIndex) => `<button type="button" class="review-card selected-card" disabled>${orderIndex + 1}. ${REVIEW_STEPS[stepIndex]}</button>`).join("")
        : "<p>Select the event that happened first.</p>"
    }</div>`;

    const available = document.createElement("section");
    available.className = "review-section";
    available.innerHTML = '<h2>Available events</h2>';
    const cardList = document.createElement("div");
    cardList.className = "review-card-list";
    REVIEW_CARD_ORDER.map((order) => order - 1)
      .filter((stepIndex) => !reviewSelection.includes(stepIndex))
      .forEach((stepIndex) => {
        const card = document.createElement("button");
        card.type = "button";
        card.className = "review-card";
        card.textContent = REVIEW_STEPS[stepIndex];
        card.addEventListener("click", () => selectReviewCard(stepIndex));
        cardList.appendChild(card);
      });
    available.appendChild(cardList);

    board.appendChild(selected);
    board.appendChild(available);
  }

  function selectReviewCard(stepIndex) {
    if (!currentStage.review || reviewSelection.includes(stepIndex)) return;
    reviewSelection.push(stepIndex);
    logEvent("review_card_selected", { selected_step: stepIndex + 1, selection_position: reviewSelection.length });
    if (reviewSelection.length === REVIEW_STEPS.length) {
      const metric = metrics[currentStage.id];
      metric.reviewAttempts += 1;
      const correct = reviewSelection.every((value, index) => value === index);
      logEvent("review_sequence_submitted", { review_attempts: metric.reviewAttempts, sequence_correct: correct });
      if (correct) {
        metric.sequenceCorrect = true;
        metric.timeToCorrectReviewMs = elapsed() - metric.startedAt;
        logEvent("practiceA_sequence_correct", { review_attempts: metric.reviewAttempts, time_to_correct_review_ms: metric.timeToCorrectReviewMs });
        completeCurrentStage(0);
      } else {
        setFeedback("That order is not correct. Try the sequence again.", "failure");
        reviewSelection = [];
        renderReviewBoard();
      }
      return;
    }
    setFeedback(`Selected ${reviewSelection.length} of ${REVIEW_STEPS.length}.`, "neutral");
    renderReviewBoard();
  }

  function cellLabel(row, col, source, cutter, processor, hub, wasteBin, coolingStation, belt) {
    if (source) return `Row ${row}, column ${col}, ${source.pilot ? "Pilot Source" : "Source"}`;
    if (cutter) return `Row ${row}, column ${col}, Cutter`;
    if (processor) return `Row ${row}, column ${col}, Processor`;
    if (hub) return `Row ${row}, column ${col}, Hub`;
    if (wasteBin) return `Row ${row}, column ${col}, Waste Bin`;
    if (coolingStation) return `Row ${row}, column ${col}, Cooling Station`;
    if (belt) return `Row ${row}, column ${col}, belt ${belt.direction}`;
    return `Row ${row}, column ${col}, empty`;
  }

  function handleCellClick(row, col) {
    if (currentStage.review) return;
    if (isRunning || findSource(row, col) || findCutter(row, col) || findProcessor(row, col) || findHub(row, col)) return;
    if (currentStage.id === "stage2" && stageIssueRevealed) return;

    const oldBelt = getBelt(row, col);
    const oldWasteBin = findWasteBin(row, col);
    const oldCoolingStation = findCoolingStation(row, col);

    if (selectedTool === "erase") {
      if (oldBelt) {
        setBelt(row, col, null);
        recordAction("belt_erased", { row, column: col, old_direction: oldBelt.direction });
      }
      if (oldWasteBin) {
        wasteBins = wasteBins.filter((bin) => !(bin.row === row && bin.col === col));
        recordAction("waste_bin_erased", { row, column: col });
      }
      if (oldCoolingStation) {
        coolingStations = coolingStations.filter((station) => !(station.row === row && station.col === col));
        recordAction("cooling_station_erased", { row, column: col });
      }
    } else if (selectedTool === "waste") {
      if (!oldWasteBin) {
        setBelt(row, col, null);
        coolingStations = coolingStations.filter((station) => !(station.row === row && station.col === col));
        wasteBins.push({ row, col });
        recordAction("waste_bin_placed", { row, column: col });
        if (currentStage.id === "stage3") metrics.stage3.stage3WasteBinAdded = true;
      }
    } else if (selectedTool === "cooling") {
      if (!oldCoolingStation) {
        setBelt(row, col, null);
        wasteBins = wasteBins.filter((bin) => !(bin.row === row && bin.col === col));
        coolingStations.push({ row, col, output: "right" });
        recordAction("cooling_station_placed", { row, column: col });
        if (currentStage.hotProduct) metrics[currentStage.id].coolingStationEdits += 1;
      }
    } else {
      if (oldWasteBin) wasteBins = wasteBins.filter((bin) => !(bin.row === row && bin.col === col));
      if (oldCoolingStation) coolingStations = coolingStations.filter((station) => !(station.row === row && station.col === col));
      setBelt(row, col, { direction: selectedTool });
      if (oldBelt) {
        recordAction("belt_replaced", { row, column: col, old_direction: oldBelt.direction, new_direction: selectedTool });
      } else {
        recordAction("belt_placed", { row, column: col, direction: selectedTool });
      }
    }

    clearProducts();
    renderBoard();
    setFeedback(defaultFeedback(), "neutral");
  }

  function recordAction(type, payload) {
    const metric = metrics[currentStage.id];
    if (metric.failureAt && !metric.completed) metric.reworkActions += 1;
    logEvent(type, payload);
  }

  function selectTool(tool) {
    if (tool === "waste" && !wasteToolUnlocked) return;
    if (tool === "cooling" && !coolingToolUnlocked) return;
    selectedTool = tool;
    toolButtons.forEach((button) => {
      const selected = button.dataset.tool === tool;
      button.classList.toggle("selected", selected);
      button.setAttribute("aria-pressed", selected ? "true" : "false");
    });
    logEvent("tool_selected", { selected_tool: tool });
  }

  function updateTools() {
    wasteTool.textContent = "Scrap Bin";
    coolingTool.textContent = "Cooling Tunnel";
    wasteTool.classList.toggle("hidden", !wasteToolUnlocked);
    coolingTool.classList.toggle("hidden", !coolingToolUnlocked);
    if (!wasteToolUnlocked && selectedTool === "waste") selectedTool = "right";
    if (!coolingToolUnlocked && selectedTool === "cooling") selectedTool = "right";
    toolGroup.classList.toggle("hidden", Boolean(currentStage.review));
  }

  function updateRunButton() {
    const metric = metrics[currentStage.id];
    pilotRunButton.classList.add("hidden");
    pilotRunButton.disabled = false;
    runButton.classList.remove("hidden");
    runButton.disabled = false;

    if (currentStage.review) {
      pilotRunButton.classList.add("hidden");
      runButton.textContent = "RUN";
      runButton.classList.add("hidden");
    } else if (currentStage.id === "stage2" || currentStage.id === "stage3") {
      runButton.textContent = "RUN PILOT";
    } else if (currentStage.pilotGate && !metric.pilotSucceeded) {
      runButton.textContent = "RUN PILOT";
    } else if (currentStage.hotProduct) {
      if (!stageIssueRevealed) {
        pilotRunButton.classList.remove("hidden");
        runButton.textContent = "RUN ENTIRE PROCESS";
      } else if (!metric.pilotSucceeded) {
        pilotRunButton.classList.remove("hidden");
        runButton.textContent = "RUN ENTIRE PROCESS";
        runButton.disabled = true;
      } else {
        runButton.textContent = "RUN ENTIRE PROCESS";
      }
    } else if (currentStage.targetOutput > 1) {
      runButton.textContent = "RUN ENTIRE PROCESS";
    } else if (currentStage.id === "stage1") {
      runButton.textContent = "RUN ROUTE";
    } else {
      runButton.textContent = "RUN";
    }
  }

  function defaultFeedback() {
    if (currentStage.review) return "Select the learning events in the order they happened.";
    if (currentStage.reportAfterFailure && stageIssueRevealed) return "Report the issue before making further changes.";
    if (currentStage.pilotGate && !metrics[currentStage.id].pilotSucceeded) return "Build and test one pilot line before scaling.";
    if (currentStage.hotProduct && stageIssueRevealed && !metrics[currentStage.id].pilotSucceeded) return "Add the Cooling Tunnel to one line, then run that pilot before running the full process.";
    if (currentStage.noExplicitPilotReminder) return `Final target: ${currentStage.targetOutput} working lines.`;
    if (currentStage.targetOutput > 1) return `Build toward ${currentStage.targetOutput} working production lines.`;
    return "Build the route, then RUN the line.";
  }

  function placeProduct(product) {
    const cell = board.querySelector(`[data-row="${product.row}"][data-col="${product.col}"]`);
    if (!cell) return;
    const token = document.createElement("div");
    token.className = `product${product.processed ? " processed" : ""}${product.hot ? " hot-token" : ""}${product.waste ? " waste-token" : ""}${product.stopped ? " stopped" : ""}`;
    token.dataset.productId = product.id;
    token.setAttribute("aria-hidden", "true");
    cell.appendChild(token);
  }

  function setProductPosition(productId, cell, processed, stopped, waste = false, hot = false) {
    activeProducts = activeProducts.filter((product) => product.id !== productId);
    if (inBounds(cell.row, cell.col)) {
      activeProducts.push({ id: productId, row: cell.row, col: cell.col, processed, stopped, waste, hot });
    }
  }

  function stopProduct(productId) {
    activeProducts = activeProducts.map((product) => product.id === productId ? { ...product, stopped: true } : product);
    renderBoard();
  }

  function removeProduct(productId) {
    activeProducts = activeProducts.filter((product) => product.id !== productId);
    renderBoard();
  }

  function sourcesForRun() {
    const mode = runMode();
    if (mode === "pilot") {
      const pilotSources = currentStage.sources.filter((source) => source.pilot);
      return pilotSources.length ? pilotSources : currentStage.sources;
    }
    if (currentStage.pilotGate && !metrics[currentStage.id].pilotSucceeded) {
      return currentStage.sources.filter((source) => source.pilot);
    }
    if (currentStage.hotProduct && stageIssueRevealed && !metrics[currentStage.id].pilotSucceeded) {
      return currentStage.sources.filter((source) => source.pilot);
    }
    if (currentStage.hotProduct && !stageIssueRevealed) {
      const builtSources = currentStage.sources.filter((source) => evaluateStaticPath(source, { ignoreHiddenRequirements: true }).success);
      return builtSources.length ? builtSources : currentStage.sources;
    }
    return currentStage.sources;
  }

  function runMode() {
    if (runModeOverride) return runModeOverride;
    if (currentStage.pilotGate && !metrics[currentStage.id].pilotSucceeded) return "pilot";
    if (currentStage.hotProduct && stageIssueRevealed && !metrics[currentStage.id].pilotSucceeded) return "pilot";
    if (currentStage.id === "stage2" || currentStage.id === "stage3") return "pilot";
    return "full";
  }

  let runModeOverride = null;

  async function runProduction(forcedMode = null) {
    if (isRunning || (currentStage.reportAfterFailure && stageIssueRevealed)) return;

    isRunning = true;
    runModeOverride = forcedMode;
    updateRunButton();
    pilotRunButton.disabled = true;
    runButton.disabled = true;
    resetButton.disabled = true;
    continueButton.classList.add("hidden");
    clearProducts();
    setFeedback("Production line running...", "neutral");

    const metric = metrics[currentStage.id];
    metric.attempts += 1;
    const mode = runMode();
    if (mode === "pilot") metric.pilotAttempts += 1;
    if (mode === "full") metric.fullAttempts += 1;

    if (metric.firstRunAt === null) {
      metric.firstRunAt = elapsed();
      metric.firstRunLineCount = countBuiltMainLines();
      metric.beltsBeforeFirstRun = countBeltsAndBins();
      logEvent("first_run_line_count", { value: metric.firstRunLineCount });
      logEvent("number_of_belts_bins_before_first_run", { value: metric.beltsBeforeFirstRun });
    }

    logEvent("run_started", { attempt_number: metric.attempts, run_mode: mode });
    const results = await moveProductsTogether(sourcesForRun(), mode);
    const outputCount = results.filter((result) => result.success).length;
    metric.bestOutput = Math.max(metric.bestOutput, outputCount);
    logEvent("capacity_output", { attempt_number: metric.attempts, run_mode: mode, output_count: outputCount, target_output: mode === "pilot" ? 1 : currentStage.targetOutput });

    if (mode === "pilot") {
      handlePilotResult(results, outputCount);
    } else if (outputCount >= currentStage.targetOutput) {
      completeCurrentStage(outputCount);
    } else {
      handleFailure(results.find((result) => !result.success), outputCount);
    }

    isRunning = false;
    runModeOverride = null;
    resetButton.disabled = false;
    updateRunButton();
  }

  async function moveProductsTogether(sources, mode) {
    const products = sources.map((source) => {
      const sourceIndex = currentStage.sources.indexOf(source) + 1;
      return {
        id: `product-${sourceIndex}`,
        sourceIndex,
        current: { row: source.row, col: source.col },
        next: moveFrom(source, source.output),
        direction: source.output,
        processed: false,
        hot: false,
        cooled: false,
        steps: 0,
        path: [{ row: source.row, col: source.col, type: "source", processed: false, hot: false, cooled: false }],
        visited: new Set([`${source.row},${source.col},raw`]),
        done: false,
        success: false,
        reason: null
      };
    });

    while (products.some((product) => !product.done)) {
      products.filter((product) => !product.done).forEach((product) => {
        product.steps += 1;
        setProductPosition(product.id, product.next, product.processed, false, false, product.hot);
      });
      renderBoard();
      await wait(MOVE_DELAY_MS);
      products.filter((product) => !product.done).forEach((product) => evaluateStep(product, mode));
      renderBoard();
    }

    return products.map((product) => ({
      success: product.success,
      reason: product.reason,
      processed: product.processed,
      hot: product.hot,
      cooled: product.cooled,
      path: product.path,
      steps: product.steps
    }));
  }

  function evaluateStep(product, mode) {
    const next = product.next;
    if (!inBounds(next.row, next.col)) {
      removeProduct(product.id);
      failProduct(product, "out_of_bounds", mode);
      return;
    }

    product.path.push({ row: next.row, col: next.col, processed: product.processed, hot: product.hot, cooled: product.cooled });
    logEvent("product_step", { run_mode: mode, source_index: product.sourceIndex, row: next.row, column: next.col, processed: product.processed, hot: product.hot, cooled: product.cooled });

    const hub = findHub(next.row, next.col);
    if (hub) {
      if (currentStage.requireCooled && !product.cooled) {
        revealCoolingIssue();
        failProduct(product, "hot_product_rejected", mode);
        return;
      }
      if (currentStage.requireProcessed && !product.processed) {
        failProduct(product, "unprocessed_delivery", mode);
        return;
      }
      product.done = true;
      product.success = true;
      logEvent("run_succeeded", { run_mode: mode, source_index: product.sourceIndex, steps: product.steps, path: product.path });
      return;
    }

    const cutter = findCutter(next.row, next.col);
    if (cutter) {
      const wasteCell = moveFrom(next, cutter.wasteOutput);
      if (!findWasteBin(wasteCell.row, wasteCell.col)) {
        if (currentStage.hiddenWaste) revealWasteIssue();
        failProduct(product, "cutter_waste_blocked", mode);
        return;
      }
      setProductPosition(`waste-${product.sourceIndex}`, wasteCell, false, false, true);
      product.processed = true;
      logEvent("waste_stream_handled", { run_mode: mode, source_index: product.sourceIndex, row: wasteCell.row, column: wasteCell.col });
      logEvent("cutter_passed", { run_mode: mode, source_index: product.sourceIndex, row: next.row, column: next.col });
      product.current = next;
      product.direction = cutter.output;
      product.next = moveFrom(next, cutter.output);
    } else {
      const processor = findProcessor(next.row, next.col);
      if (processor) {
        const requiredMove = REQUIRED_MOVE_FROM_SIDE[processor.inputFrom];
        if (processor.inputFrom && product.direction !== requiredMove) {
          revealProcessorIssue();
          failProduct(product, "processor_input_mismatch", mode);
          return;
        }
        product.processed = true;
        product.hot = Boolean(currentStage.hotProduct || processor.hotOutput);
        product.cooled = false;
        logEvent("processor_passed", { run_mode: mode, source_index: product.sourceIndex, row: next.row, column: next.col });
        product.current = next;
        product.direction = processor.output;
        product.next = moveFrom(next, processor.output);
      } else {
        const coolingStation = findCoolingStation(next.row, next.col);
        if (coolingStation) {
          if (!product.hot) {
            failProduct(product, "cooling_station_input_mismatch", mode);
            return;
          }
          product.hot = false;
          product.cooled = true;
          product.processed = true;
          logEvent("cooling_station_passed", { run_mode: mode, source_index: product.sourceIndex, row: next.row, column: next.col });
          product.current = next;
          product.direction = coolingStation.output || "right";
          product.next = moveFrom(next, product.direction);
        }
        if (!coolingStation) {
          const belt = getBelt(next.row, next.col);
          if (!belt) {
            failProduct(product, "empty_cell", mode);
            return;
          }
          product.current = next;
          product.direction = belt.direction;
          product.next = moveFrom(next, belt.direction);
        }
      }
    }

    const state = product.cooled ? "cooled" : product.hot ? "hot" : product.processed ? "processed" : "raw";
    const visitKey = `${product.current.row},${product.current.col},${state}`;
    if (product.visited.has(visitKey)) {
      failProduct(product, "loop", mode);
      return;
    }
    product.visited.add(visitKey);
    if (product.steps >= MAX_STEPS) failProduct(product, "max_steps", mode);
  }

  function failProduct(product, reason, mode) {
    product.done = true;
    product.success = false;
    product.reason = reason;
    const metric = metrics[currentStage.id];
    if (!metric.failureAt) metric.failureAt = elapsed();
    if (!metric.failureType || ["cutter_waste_blocked", "processor_input_mismatch", "hot_product_rejected"].includes(reason)) metric.failureType = reason;
    if (currentStage.reportAfterFailure && reason === "cutter_waste_blocked") {
      metric.pilotFailureDetected = true;
      stage2PilotSnapshot = { grid: cloneGrid(grid) };
      logEvent("stage2_pilot_failed", { failure_type: reason });
      logEvent("pilot_failure_detected", { reason });
    }
    if (currentStage.processorIssue && reason === "processor_input_mismatch") {
      metric.pilotFailureDetected = true;
      logEvent("pilot_failure_detected", { reason });
    }
    if (currentStage.hotProduct && reason === "hot_product_rejected") {
      metric.pilotFailureDetected = true;
      if (metric.reworkLines === null) metric.reworkLines = metric.firstRunLineCount || countBuiltMainLines();
      logEvent("hot_product_rejected", { rework_lines: metric.reworkLines });
      logEvent("pilot_failure_detected", { reason });
    }
    stopProduct(product.id);
    logEvent("run_failed", { run_mode: mode, source_index: product.sourceIndex, reason, steps: product.steps, path: product.path });
  }

  function revealWasteIssue() {
    stageIssueRevealed = true;
    lessonPanel.classList.remove("hidden");
    lessonPanel.textContent = "You discovered a process issue during the pilot test. Report the scrap-handling issue to the production team before making further changes.";
    reportButton.classList.remove("hidden");
    runButton.disabled = true;
    renderBoard();
  }

  function revealProcessorIssue() {
    stageIssueRevealed = true;
    lessonPanel.classList.remove("hidden");
    lessonPanel.textContent = "The Barcode Labeler only accepts cartons through its top infeed sensor. Reroute the pilot so the carton enters from above and exits to the right.";
    renderBoard();
  }

  function revealCoolingIssue() {
    const metric = metrics[currentStage.id];
    stageIssueRevealed = true;
    coolingToolUnlocked = true;
    if (metric.reworkLines === null) metric.reworkLines = metric.firstRunLineCount || countBuiltMainLines();
    const lineWord = metric.reworkLines === 1 ? "line" : "lines";
    lessonPanel.classList.remove("hidden");
    lessonPanel.textContent = `PACKING REJECTED. Lines requiring correction: ${metric.reworkLines}. The sealed pouch is still too hot and soft for packing. Add a Cooling Tunnel to one ${lineWord === "line" ? "line" : "pilot line"} and run that pilot before running the full process.`;
    updateTools();
    renderBoard();
  }

  function handlePilotResult(results, outputCount) {
    const metric = metrics[currentStage.id];
    if (outputCount >= 1 && !results.some((result) => !result.success)) {
      metric.pilotSucceeded = true;
      metric.linesBuiltBeforePilotSuccess = countCompleteLines();
      if (metric.failureAt && metric.timeFailureToFixMs === null) metric.timeFailureToFixMs = elapsed() - metric.failureAt;
      logEvent("pilot_succeeded", { lines_built_before_pilot_success: metric.linesBuiltBeforePilotSuccess });
      if (currentStage.targetOutput === 1) {
        if (currentStage.id === "stage3") metric.stage3PilotRerunSuccess = true;
        completeCurrentStage(outputCount);
      } else {
        setFeedback("Pilot works. Now scale the corrected design to meet the full target.", "success");
      }
      return;
    }
    handleFailure(results.find((result) => !result.success), outputCount);
  }

  function handleFailure(result, outputCount) {
    const reason = result ? result.reason : "partial_output";
    if (reason === "cutter_waste_blocked") {
      setFeedback("PILOT TEST STOPPED - The Panel Cutter cannot continue because the scrap outlet has nowhere to send the scrap strip.", "failure");
    } else if (reason === "processor_input_mismatch") {
      setFeedback("PILOT TEST STOPPED - The Barcode Labeler did not accept the carton from that side.", "failure");
    } else if (reason === "hot_product_rejected") {
      const reworkLines = metrics[currentStage.id].reworkLines || 1;
      setFeedback(`PACKING REJECTED - ${reworkLines} ${reworkLines === 1 ? "line needs" : "lines need"} a Cooling Tunnel before Packing.`, "failure");
    } else if (currentStage.targetOutput > 1) {
      setFeedback(`Current output: ${outputCount} of ${currentStage.targetOutput}. Revise the setup and try again.`, "failure");
    } else {
      setFeedback("Not delivered yet. Revise the route and try again.", "failure");
    }
    logEvent("run_attempt_result", { result: "failure", reason, output_count: outputCount });
  }

  function completeCurrentStage(outputCount) {
    const metric = metrics[currentStage.id];
    metric.completed = true;
    metric.completedAt = elapsed();
    if (currentStage.id === "stage3" && outputCount >= 1) metric.stage3PilotRerunSuccess = true;
    if (currentStage.id === "practiceB" && outputCount >= currentStage.targetOutput) metric.rerouteEdits = metric.reworkActions;
    if (currentStage.id === "practiceC" && outputCount >= currentStage.targetOutput) metric.coolingFixSuccess = true;
    if (outputCount > 0 && metric.failureAt && metric.timeFailureToFixMs === null) metric.timeFailureToFixMs = elapsed() - metric.failureAt;
    logEvent("run_attempt_result", { result: "success", output_count: outputCount });
    logEvent("level_completed", completionPayload(metric, outputCount));
    logEvent(`${currentStage.id}_completed`, completionPayload(metric, outputCount));
    setFeedback(currentStage.successMessage, "success");
    stageStatus.textContent = "Completed";
    stageStatus.classList.add("completed");
    if (currentStage.counterfactualAfterSuccess) {
      lessonPanel.classList.remove("hidden");
      lessonPanel.textContent = "Why the team is waiting before scale: the pilot revealed a hidden scrap-handling requirement on the first production line. The corrected line now needs to be verified before the design is copied across the factory.";
    }
    if (currentStage.payoffSummary) {
      lessonPanel.classList.remove("hidden");
      lessonPanel.textContent = payoffSummaryText(currentStage.payoffSummary);
    }
    continueButton.textContent = currentStageIndex < STAGES.length - 1 ? "Continue" : "Complete Phase 1";
    continueButton.classList.remove("hidden");
  }

  function payoffSummaryText(kind) {
    if (kind === "panel") {
      return "PRODUCTION SUMMARY - PANEL CUTTING: Target reached, 3 of 3 lines working. Hidden requirement discovered after 1 pilot line. Actual lines requiring correction: 1. If the untested design had already been scaled, 3 lines would have required correction. REWORK AVOIDED: 2 line corrections.";
    }
    if (kind === "carton") {
      return "PRODUCTION SUMMARY - CARTON LABELING: Target reached, 3 of 3 labeling lines working. Top-entry requirement discovered after 1 pilot line. Actual lines requiring rerouting: 1. If the original route had already been copied to 3 lines, 3 lines would have required rerouting. REWORK AVOIDED: 2 line reroutes.";
    }
    if (kind === "pouch") {
      const reworkLines = metrics.practiceC.reworkLines || metrics.practiceC.firstRunLineCount || 1;
      if (reworkLines <= 1) {
        return "FINAL PRODUCTION SUMMARY - POUCH PACKAGING: Target reached, 3 of 3 pouch lines working. Cooling requirement discovered after 1 pilot line. Actual lines requiring modification: 1. If the untested sealing process had already been scaled, 3 lines would have required modification. REWORK AVOIDED: 2 line modifications.";
      }
      return "FINAL PRODUCTION SUMMARY - POUCH PACKAGING: Target reached, 3 of 3 pouch lines working. Cooling requirement discovered after 3 lines had already been built. Actual lines requiring modification: 3. If the process had been tested on 1 pilot before scale, only 1 line would have required modification. ADDITIONAL REWORK INCURRED: 2 line modifications.";
    }
    return "";
  }

  function completionPayload(metric, outputCount) {
    return {
      output_count: outputCount,
      run_attempts: metric.attempts,
      first_run_line_count: metric.firstRunLineCount,
      lines_built_before_pilot_success: metric.linesBuiltBeforePilotSuccess,
      pilot_failure_detected: metric.pilotFailureDetected,
      failure_type: metric.failureType,
      time_failure_to_report_ms: metric.timeFailureToReportMs,
      time_failure_to_fix_ms: metric.timeFailureToFixMs,
      rework_actions: metric.reworkActions,
      report_issue_clicked: metric.reportIssueClicked,
      stage3_waste_bin_added: metric.stage3WasteBinAdded,
      stage3_pilot_rerun_success: metric.stage3PilotRerunSuccess,
      review_attempts: metric.reviewAttempts,
      sequence_correct: metric.sequenceCorrect,
      time_to_correct_review_ms: metric.timeToCorrectReviewMs,
      reroute_edits: metric.rerouteEdits,
      cooling_station_edits: metric.coolingStationEdits,
      duplicated_rework_lines: metric.reworkLines,
      cooling_fix_success: metric.coolingFixSuccess,
      final_layout: serializeLayout(),
      time_to_completion_ms: metric.completedAt - metric.startedAt
    };
  }

  function reportIssue() {
    if (!currentStage.reportAfterFailure || !stageIssueRevealed) return;
    const metric = metrics[currentStage.id];
    metric.reportIssueClicked = true;
    metric.timeFailureToReportMs = elapsed() - metric.failureAt;
    logEvent("report_issue_clicked", { time_failure_to_report_ms: metric.timeFailureToReportMs, discovered_error_type: metric.failureType });
    completeCurrentStage(0);
    setTimeout(() => loadStage(currentStageIndex + 1), 700);
  }

  function countCompleteLines() {
    return currentStage.sources.filter((source) => evaluateStaticPath(source).success).length;
  }

  function countBuiltMainLines() {
    return currentStage.sources.filter((source) => evaluateStaticPath(source, { ignoreHiddenRequirements: true }).success).length;
  }

  function countBeltsAndBins() {
    return grid.flat().filter(Boolean).length + wasteBins.length + coolingStations.length;
  }

  function evaluateStaticPath(source, options = {}) {
    let current = { row: source.row, col: source.col };
    let direction = source.output;
    let next = moveFrom(current, direction);
    let processed = false;
    let hot = false;
    let cooled = false;
    const visited = new Set([`${current.row},${current.col},raw`]);
    for (let steps = 1; steps <= MAX_STEPS; steps += 1) {
      if (!inBounds(next.row, next.col)) return { success: false, reason: "out_of_bounds" };
      if (findHub(next.row, next.col)) {
        if (currentStage.requireCooled && !options.ignoreHiddenRequirements && !cooled) return { success: false, reason: "hot_product_rejected" };
        return { success: !currentStage.requireProcessed || processed, reason: processed ? null : "unprocessed_delivery" };
      }
      const cutter = findCutter(next.row, next.col);
      if (cutter) {
        const wasteCell = moveFrom(next, cutter.wasteOutput);
        if (!options.ignoreHiddenRequirements && !findWasteBin(wasteCell.row, wasteCell.col)) return { success: false, reason: "cutter_waste_blocked" };
        processed = true;
        hot = false;
        cooled = false;
        current = next;
        direction = cutter.output;
        next = moveFrom(next, cutter.output);
      } else {
        const processor = findProcessor(next.row, next.col);
        if (processor) {
          if (!options.ignoreHiddenRequirements && processor.inputFrom && direction !== REQUIRED_MOVE_FROM_SIDE[processor.inputFrom]) return { success: false, reason: "processor_input_mismatch" };
          processed = true;
          hot = Boolean(currentStage.hotProduct || processor.hotOutput);
          cooled = false;
          current = next;
          direction = processor.output;
          next = moveFrom(next, processor.output);
        } else {
          const coolingStation = findCoolingStation(next.row, next.col);
          if (coolingStation) {
            if (!hot) return { success: false, reason: "cooling_station_input_mismatch" };
            hot = false;
            cooled = true;
            processed = true;
            current = next;
            direction = coolingStation.output || "right";
            next = moveFrom(next, direction);
          } else {
            const belt = getBelt(next.row, next.col);
            if (!belt) return { success: false, reason: "empty_cell" };
            current = next;
            direction = belt.direction;
            next = moveFrom(next, belt.direction);
          }
        }
      }
      const state = cooled ? "cooled" : hot ? "hot" : processed ? "processed" : "raw";
      const visitKey = `${current.row},${current.col},${state}`;
      if (visited.has(visitKey)) return { success: false, reason: "loop" };
      visited.add(visitKey);
    }
    return { success: false, reason: "max_steps" };
  }

  function serializeLayout() {
    const belts = [];
    for (let row = 1; row <= rows(currentStage); row += 1) {
      for (let col = 1; col <= cols(currentStage); col += 1) {
        const belt = getBelt(row, col);
        if (belt) belts.push({ row, column: col, direction: belt.direction });
      }
    }
    return {
      belts,
      waste_bins: wasteBins.map((bin) => ({ row: bin.row, column: bin.col })),
      cooling_stations: coolingStations.map((station) => ({ row: station.row, column: station.col }))
    };
  }

  function resetCurrentStage() {
    if (isRunning) return;
    setupStageState(currentStage);
    renderBoard();
    setFeedback(defaultFeedback(), "neutral");
    logEvent("reset_clicked");
  }

  function setupStageState(stage) {
    grid = createGrid(stage);
    if (stage.loadStage2Pilot && stage2PilotSnapshot) grid = cloneGrid(stage2PilotSnapshot.grid);
    wasteBins = createWasteBins(stage);
    coolingStations = createCoolingStations(stage);
    activeProducts = [];
    reviewSelection = [];
    stageIssueRevealed = false;
    wasteToolUnlocked = Boolean(stage.startsWithWasteTool);
    coolingToolUnlocked = Boolean(stage.startsWithCoolingTool);
    reportButton.classList.add("hidden");
    continueButton.classList.add("hidden");
    runButton.classList.toggle("hidden", Boolean(stage.review));
    resetButton.classList.remove("hidden");
    resetButton.textContent = stage.review ? "RESET REVIEW" : "RESET";
    lessonPanel.classList.add("hidden");
    runButton.disabled = false;
    updateTools();
    updateRunButton();
    stageStatus.textContent = "In progress";
    stageStatus.classList.remove("completed");
  }

  function loadStage(index) {
    currentStageIndex = index;
    currentStage = STAGES[index];
    setupStageState(currentStage);
    const metric = metrics[currentStage.id];
    metric.startedAt = elapsed();
    stageBadge.textContent = `${currentStage.badge} of ${STAGES.length}`;
    stageTitle.textContent = currentStage.title;
    stageInstructions.innerHTML = currentStage.instructions;
    renderBoard();
    setFeedback(defaultFeedback(), "neutral");
    selectTool(selectedTool === "waste" && !wasteToolUnlocked ? "right" : selectedTool);
    logEvent("level_started");
    logEvent(`${currentStage.id}_started`);
  }

  function startPhase() {
    if (!phaseStarted) {
      phaseStarted = true;
      logEvent("phase1_started", {}, null);
    }
    introScreen.classList.add("hidden");
    completeScreen.classList.add("hidden");
    gameScreen.classList.remove("hidden");
    loadStage(0);
  }

  function continueAfterSuccess() {
    if (!metrics[currentStage.id].completed) return;
    if (currentStageIndex < STAGES.length - 1) {
      loadStage(currentStageIndex + 1);
      return;
    }
    phaseCompleted = true;
    gameScreen.classList.add("hidden");
    completeScreen.classList.remove("hidden");
    logEvent("phase1_completed", { total_phase1_time_ms: elapsed() }, null);
  }

  function getSummary() {
    const summary = { condition: CONDITION, phase1_completed: phaseCompleted, total_phase1_time_ms: elapsed() };
    STAGES.forEach((stage) => {
      const metric = metrics[stage.id];
      summary[`${stage.id}_attempts`] = metric.attempts;
      summary[`${stage.id}_first_run_line_count`] = metric.firstRunLineCount;
      summary[`${stage.id}_pilot_failed`] = metric.pilotFailureDetected;
      summary[`${stage.id}_failure_type`] = metric.failureType;
      summary[`${stage.id}_time_failure_to_report_ms`] = metric.timeFailureToReportMs;
      summary[`${stage.id}_time_failure_to_fix_ms`] = metric.timeFailureToFixMs;
      summary[`${stage.id}_report_issue_clicked`] = metric.reportIssueClicked;
      summary[`${stage.id}_lines_built_before_pilot_success`] = metric.linesBuiltBeforePilotSuccess;
      summary[`${stage.id}_rework_actions`] = metric.reworkActions;
      summary[`${stage.id}_best_output`] = metric.bestOutput;
      summary[`${stage.id}_time_ms`] = metric.completedAt && metric.startedAt !== null ? metric.completedAt - metric.startedAt : null;
    });
    summary.stage2_pilot_failed = metrics.stage2.pilotFailureDetected;
    summary.stage2_failure_type = metrics.stage2.failureType;
    summary.report_issue_clicked = metrics.stage2.reportIssueClicked;
    summary.stage3_waste_bin_added = metrics.stage3.stage3WasteBinAdded;
    summary.stage3_pilot_rerun_success = metrics.stage3.stage3PilotRerunSuccess;
    summary.stage2_panel_cutter_failure = metrics.stage2.pilotFailureDetected;
    summary.stage2_report_issue_clicked = metrics.stage2.reportIssueClicked;
    summary.stage3_scrap_bin_added = metrics.stage3.stage3WasteBinAdded;
    summary.stage3_panel_pilot_success = metrics.stage3.stage3PilotRerunSuccess;
    summary.practiceA_review_attempts = metrics.practiceAReview.reviewAttempts;
    summary.practiceA_sequence_correct = metrics.practiceAReview.sequenceCorrect;
    summary.practiceA_time_to_correct_review_ms = metrics.practiceAReview.timeToCorrectReviewMs;
    summary.practiceA_scale_success = metrics.practiceAScale.bestOutput === 3;
    summary.practiceA_rework_avoided = summary.practiceA_scale_success ? 2 : null;
    summary.stage4_scale_success = summary.practiceA_scale_success;
    summary.practiceB_pilot_first = metrics.practiceB.firstRunLineCount <= 1;
    summary.practiceB_labeler_orientation_failure = metrics.practiceB.pilotFailureDetected;
    summary.practiceB_reroute_success = metrics.practiceB.pilotFailureDetected && metrics.practiceB.bestOutput === 3;
    summary.practiceB_reroute_edits = metrics.practiceB.reworkActions;
    summary.practiceB_rework_avoided = summary.practiceB_reroute_success ? 2 : null;
    summary.practiceC_spontaneous_pilot_first = metrics.practiceC.firstRunLineCount === 1;
    summary.practiceC_lines_before_first_run = metrics.practiceC.firstRunLineCount;
    summary.practiceC_hot_pouch_rejections = metrics.practiceC.reworkLines;
    summary.practiceC_rework_lines = metrics.practiceC.reworkLines;
    summary.practiceC_rework_lines_required = metrics.practiceC.reworkLines;
    summary.practiceC_pilot_after_cooling_success = metrics.practiceC.pilotSucceeded;
    summary.practiceC_cooling_station_edits = metrics.practiceC.coolingStationEdits;
    summary.practiceC_cooling_tunnels_added = metrics.practiceC.coolingStationEdits;
    summary.practiceC_cooling_fix_success = metrics.practiceC.coolingFixSuccess;
    summary.practiceC_final_success = metrics.practiceC.coolingFixSuccess;
    summary.practiceC_reward_type = metrics.practiceC.coolingFixSuccess ? (metrics.practiceC.reworkLines <= 1 ? "avoided_rework" : "additional_rework") : null;
    summary.practiceC_rework_delta = metrics.practiceC.coolingFixSuccess ? Math.abs((metrics.practiceC.reworkLines || 1) - 1) : null;
    return summary;
  }

  function wait(ms) {
    return new Promise((resolve) => window.setTimeout(resolve, ms));
  }

  startButton.addEventListener("click", startPhase);
  pilotRunButton.addEventListener("click", () => runProduction("pilot"));
  runButton.addEventListener("click", () => runProduction(currentStage.hotProduct ? "full" : null));
  resetButton.addEventListener("click", resetCurrentStage);
  reportButton.addEventListener("click", reportIssue);
  continueButton.addEventListener("click", continueAfterSuccess);
  toolButtons.forEach((button) => button.addEventListener("click", () => selectTool(button.dataset.tool)));

  window.getFactoryGameLog = function () {
    return eventLog.map((event) => ({ ...event }));
  };
  window.getFactoryGameSummary = function () {
    return { ...getSummary() };
  };
}());
