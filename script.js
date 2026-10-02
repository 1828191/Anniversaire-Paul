// ============ CONFIG ============
const GUESTS = {
  "001": { name: "Jean Dupont", maxGuests: 2 },
  "002": { name: "Marie Martin", maxGuests: 1 },
  "003": { name: "Paul Thompson", maxGuests: 3 },
  "004": { name: "Sophie Blanc", maxGuests: 2 }
};

const TARGET_DATE = new Date("2027-05-15T18:30:00+02:00");
const STORAGE_KEY = "paul-anniversary-responses";

// ============ DOM ELEMENTS ============
const countdownEl = document.getElementById("countdown");
const guestNameEl = document.getElementById("guest-name");
const guestStatusEl = document.getElementById("guest-status");
const guestCountEl = document.getElementById("guest-count");
const maxGuestsTextEl = document.getElementById("max-guests-text");
const attendanceEl = document.getElementById("attendance");
const messageEl = document.getElementById("message");
const responseMessageEl = document.getElementById("response-message");
const form = document.getElementById("rsvp-form");
const toggleBtns = document.querySelectorAll(".toggle-btn");
const minusBtn = document.getElementById("minus-btn");
const plusBtn = document.getElementById("plus-btn");
const submitBtn = document.querySelector(".submit-btn");
const exportBtn = document.getElementById("export-btn");
const viewBtn = document.getElementById("view-btn");
const clearBtn = document.getElementById("clear-btn");
const adminSection = document.getElementById("admin-section");

// ============ COUNTDOWN ============
function updateCountdown() {
  const now = Date.now();
  const diff = TARGET_DATE.getTime() - now;

  if (diff <= 0) {
    countdownEl.textContent = "La fête a commencé ! 🎉";
    return;
  }

  const days = Math.floor(diff / 86400000);
  const hours = Math.floor((diff % 86400000) / 3600000);
  const minutes = Math.floor((diff % 3600000) / 60000);
  const seconds = Math.floor((diff % 60000) / 1000);

  countdownEl.textContent = `${days}j · ${hours}h · ${minutes}m · ${seconds}s`;
}

updateCountdown();
setInterval(updateCountdown, 1000);

// ============ GUEST RECOGNITION ============
function getGuestIdFromUrl() {
  const params = new URLSearchParams(window.location.search);
  return params.get("guest");
}

function initializeGuest() {
  const guestId = getGuestIdFromUrl();
  window.currentGuestId = guestId || "UNKNOWN";

  if (guestId && GUESTS[guestId]) {
    const guest = GUESTS[guestId];
    guestNameEl.textContent = guest.name;
    guestStatusEl.textContent = `Bienvenue ${guest.name} ! Nous avons bien reçu votre invitation.`;
    guestCountEl.max = guest.maxGuests;
    maxGuestsTextEl.textContent = `Max ${guest.maxGuests} ${guest.maxGuests > 1 ? "personnes" : "personne"}`;
  } else {
    guestNameEl.textContent = "Invité(e)";
    guestStatusEl.textContent = "Veuillez scanner votre QR code pour accéder à votre invitation.";
  }
}

// ============ TOGGLE BUTTONS ============
toggleBtns.forEach(btn => {
  btn.addEventListener("click", (e) => {
    e.preventDefault();
    toggleBtns.forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    attendanceEl.value = btn.dataset.answer;
  });
});

// ============ STEPPER ============
function updateStepperButtons() {
  const current = parseInt(guestCountEl.value);
  const max = parseInt(guestCountEl.max);
  minusBtn.disabled = current <= 1;
  plusBtn.disabled = current >= max;
}

minusBtn.addEventListener("click", (e) => {
  e.preventDefault();
  const current = parseInt(guestCountEl.value);
  if (current > 1) {
    guestCountEl.value = current - 1;
    updateStepperButtons();
  }
});

plusBtn.addEventListener("click", (e) => {
  e.preventDefault();
  const current = parseInt(guestCountEl.value);
  const max = parseInt(guestCountEl.max);
  if (current < max) {
    guestCountEl.value = current + 1;
    updateStepperButtons();
  }
});

guestCountEl.addEventListener("change", updateStepperButtons);

// ============ FORM SUBMISSION ============
form.addEventListener("submit", (e) => {
  e.preventDefault();

  const response = {
    id: window.currentGuestId,
    name: guestNameEl.textContent,
    attendance: attendanceEl.value === "present" ? "Oui" : "Non",
    guestCount: parseInt(guestCountEl.value),
    message: messageEl.value.trim() || "-",
    timestamp: new Date().toLocaleString("fr-FR", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit"
    })
  };

  saveResponse(response);

  const attendanceMsg = attendanceEl.value === "present"
    ? "Merci pour ta présence ! On se voit le 15 mai 🎉"
    : "Merci pour ta réponse, on comprend ! Peut-être une prochaine fois 😊";

  responseMessageEl.textContent = attendanceMsg;
  responseMessageEl.classList.add("success");

  form.querySelectorAll("input, textarea, button").forEach(el => {
    if (el !== submitBtn) el.disabled = true;
  });
  submitBtn.textContent = "✓ Réponse enregistrée";
  submitBtn.disabled = true;

  console.log("✅ Réponse enregistrée :", response);
});

// ============ STORAGE ============
function saveResponse(response) {
  let responses = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");

  const existingIndex = responses.findIndex(r => r.id === response.id);
  if (existingIndex >= 0) {
    responses[existingIndex] = response;
  } else {
    responses.push(response);
  }

  localStorage.setItem(STORAGE_KEY, JSON.stringify(responses));
}

function getResponses() {
  return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
}

// ============ EXPORT CSV ============
function exportToCSV() {
  const responses = getResponses();

  if (responses.length === 0) {
    alert("Aucune réponse enregistrée pour le moment.");
    return;
  }

  const headers = ["ID", "Nom", "Présence", "Nombre de personnes", "Message", "Date"];
  const rows = responses.map(r => [
    r.id,
    `"${r.name}"`,
    r.attendance,
    r.guestCount,
    `"${r.message.replace(/"/g, '""')}"`
  , r.timestamp
  ]);

  const csv = [
    headers.join(";"),
    ...rows.map(r => r.join(";"))
  ].join("\n");

  const BOM = "\uFEFF";
  const blob = new Blob([BOM + csv], { type: "text/csv;charset=utf-8;" });

  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);
  const date = new Date().toISOString().split("T")[0];

  link.setAttribute("href", url);
  link.setAttribute("download", `anniversaire-paul-${date}.csv`);
  link.style.visibility = "hidden";

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  console.log(`📥 CSV téléchargé avec ${responses.length} réponse(s)`);
}

// ============ DEBUG FUNCTIONS ============
function showResponses() {
  const responses = getResponses();
  console.log("📋 Réponses enregistrées :", responses);

  if (responses.length > 0) {
    const presents = responses.filter(r => r.attendance === "Oui").length;
    const absents = responses.filter(r => r.attendance === "Non").length;
    const totalPeople = responses.reduce((sum, r) => sum + r.guestCount, 0);

    console.log(`Présents: ${presents}`);
    console.log(`Absents: ${absents}`);
    console.log(`Total de personnes: ${totalPeople}`);
  }

  return responses;
}

function clearAllData() {
  if (confirm("⚠️ Êtes-vous sûr de vouloir effacer TOUTES les réponses ?")) {
    localStorage.removeItem(STORAGE_KEY);
    console.log("🗑️ Toutes les données ont été effacées.");
    location.reload();
  }
}

// ============ EVENT LISTENERS ============
exportBtn.addEventListener("click", exportToCSV);
viewBtn.addEventListener("click", showResponses);
clearBtn.addEventListener("click", clearAllData);

function checkAdminPanel() {
  const responses = getResponses();
  if (responses.length > 0) {
    adminSection.style.display = "block";
  }
}

// ============ INIT ============
document.addEventListener("DOMContentLoaded", () => {
  initializeGuest();
  updateStepperButtons();
  checkAdminPanel();

  window.showResponses = showResponses;
  window.exportToCSV = exportToCSV;
  window.clearAllData = clearAllData;
});