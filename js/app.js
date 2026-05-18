/**
 * Smart Ingredient Scanner — Main Application
 *
 * Handles camera access, model loading/inference, and UI updates.
 * The Teachable Machine model URL can be set once trained;
 * until then the app runs in "demo mode" with camera only.
 */

// ── Configuration ──────────────────────────────────────────
const CONFIG = {
  // Replace this URL with your exported Teachable Machine model URL
  MODEL_URL: "https://teachablemachine.withgoogle.com/models/LFkqiUZjV/", // e.g. "https://teachablemachine.withgoogle.com/models/XXXXX/"
  INFERENCE_FPS: 5,
  CONFIDENCE_THRESHOLD: 0.75, // 75 %
  STABLE_DETECTION_MS: 1000, // 1 second before showing info
};

// ── State ──────────────────────────────────────────────────
let model = null;
let webcam = null;
let isRunning = false;
let loopId = null;

// Detection stability tracking
let lastDetected = null;
let detectedSince = 0;
let stableIngredient = null;

// ── DOM References ─────────────────────────────────────────
const videoEl = document.getElementById("cameraFeed");
const overlayEl = document.getElementById("detectionOverlay");
const labelEl = document.getElementById("detectedLabel");
const confEl = document.getElementById("detectedConfidence");
const statusEl = document.getElementById("statusText");
const startBtn = document.getElementById("btnStart");
const stopBtn = document.getElementById("btnStop");

// Info panel
const ingredientCard = document.getElementById("ingredientCard");
const ingredientName = document.getElementById("ingredientName");
const ingredientDesc = document.getElementById("ingredientDesc");
const recipeListEl = document.getElementById("recipeList");
const placeholderEl = document.getElementById("placeholderText");

// Confidence bars container
const confidenceBars = document.getElementById("confidenceBars");

// ── Camera ─────────────────────────────────────────────────
async function startCamera() {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: "environment", width: 640, height: 480 },
      audio: false,
    });
    videoEl.srcObject = stream;
    await videoEl.play();
    return true;
  } catch (err) {
    console.error("Camera access denied:", err);
    setStatus("Tidak dapat mengakses kamera. Pastikan izin kamera diberikan.");
    return false;
  }
}

function stopCamera() {
  if (videoEl.srcObject) {
    videoEl.srcObject.getTracks().forEach((t) => t.stop());
    videoEl.srcObject = null;
  }
}

// ── Model ──────────────────────────────────────────────────
async function loadModel() {
  if (!CONFIG.MODEL_URL) {
    console.warn("No model URL set — running in demo mode.");
    return false;
  }

  setStatus("Memuat model...");
  try {
    const modelURL = CONFIG.MODEL_URL + "model.json";
    const metadataURL = CONFIG.MODEL_URL + "metadata.json";
    model = await tmImage.load(modelURL, metadataURL);
    console.log("Model loaded. Classes:", model.getClassLabels());
    return true;
  } catch (err) {
    console.error("Failed to load model:", err);
    setStatus("Gagal memuat model. Periksa URL model.");
    return false;
  }
}

// ── Inference Loop ─────────────────────────────────────────
function startInference() {
  if (!model) return;
  const interval = 1000 / CONFIG.INFERENCE_FPS;

  async function loop() {
    if (!isRunning) return;

    const predictions = await model.predict(videoEl);

    // Sort by probability descending
    predictions.sort((a, b) => b.probability - a.probability);

    const top = predictions[0];
    const now = Date.now();

    // Update confidence bars
    renderConfidenceBars(predictions);

    if (top.probability >= CONFIG.CONFIDENCE_THRESHOLD) {
      // Show overlay
      overlayEl.style.display = "block";
      labelEl.textContent = top.className;
      confEl.textContent = `Confidence: ${(top.probability * 100).toFixed(1)}%`;

      // Stability tracking
      if (top.className === lastDetected) {
        if (now - detectedSince >= CONFIG.STABLE_DETECTION_MS && stableIngredient !== top.className) {
          stableIngredient = top.className;
          showIngredientInfo(top.className);
        }
      } else {
        lastDetected = top.className;
        detectedSince = now;
      }
    } else {
      // Below threshold
      overlayEl.style.display = "none";
      lastDetected = null;
      stableIngredient = null;
      setStatus("Arahkan bahan lebih dekat ke kamera...");
      clearIngredientInfo();
    }

    loopId = setTimeout(loop, interval);
  }

  loop();
}

// ── UI Updates ─────────────────────────────────────────────
function setStatus(msg) {
  statusEl.textContent = msg;
}

function renderConfidenceBars(predictions) {
  if (!predictions || predictions.length === 0) return;

  const topClass = predictions[0].className;

  confidenceBars.innerHTML = predictions
    .map((p) => {
      const pct = (p.probability * 100).toFixed(1);
      const isTop = p.className === topClass && p.probability >= CONFIG.CONFIDENCE_THRESHOLD;
      return `
        <div class="confidence-row">
          <span class="label">${p.className}</span>
          <div class="bar-bg">
            <div class="bar-fill ${isTop ? "top" : ""}" style="width: ${pct}%"></div>
          </div>
          <span class="value">${pct}%</span>
        </div>`;
    })
    .join("");
}

function buildEmptyConfidenceBars() {
  // Build from INGREDIENTS data or show empty state
  const names = Object.keys(INGREDIENTS);
  if (names.length === 0) return;

  confidenceBars.innerHTML = names
    .map(
      (name) => `
        <div class="confidence-row">
          <span class="label">${name}</span>
          <div class="bar-bg">
            <div class="bar-fill" style="width: 0%"></div>
          </div>
          <span class="value">0.0%</span>
        </div>`
    )
    .join("");
}

function showIngredientInfo(className) {
  const info = INGREDIENTS[className];
  if (!info) return;

  placeholderEl.style.display = "none";
  ingredientName.style.display = "block";
  ingredientDesc.style.display = "block";
  recipeListEl.style.display = "block";

  ingredientName.textContent = info.name;
  ingredientDesc.textContent = info.description;

  const ul = recipeListEl.querySelector("ul");
  ul.innerHTML = info.recipes.map((r) => `<li>${r}</li>`).join("");
}

function clearIngredientInfo() {
  placeholderEl.style.display = "block";
  ingredientName.style.display = "none";
  ingredientDesc.style.display = "none";
  recipeListEl.style.display = "none";
}

// ── Button Handlers ────────────────────────────────────────
startBtn.addEventListener("click", async () => {
  startBtn.disabled = true;

  const cameraOk = await startCamera();
  if (!cameraOk) {
    startBtn.disabled = false;
    return;
  }

  const modelLoaded = await loadModel();

  isRunning = true;
  stopBtn.disabled = false;

  if (modelLoaded) {
    setStatus("Deteksi aktif — arahkan bahan masakan ke kamera.");
    startInference();
  } else {
    setStatus("Kamera aktif — model belum dimuat. Atur MODEL_URL di app.js.");
  }
});

stopBtn.addEventListener("click", () => {
  isRunning = false;
  if (loopId) clearTimeout(loopId);
  stopCamera();

  overlayEl.style.display = "none";
  clearIngredientInfo();
  buildEmptyConfidenceBars();
  setStatus("Kamera dimatikan.");

  startBtn.disabled = false;
  stopBtn.disabled = true;
});

// ── Init ───────────────────────────────────────────────────
buildEmptyConfidenceBars();
setStatus("Klik 'Mulai Deteksi' untuk mengaktifkan kamera.");
