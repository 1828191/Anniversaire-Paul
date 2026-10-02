// Config
const GUESTS = {
  "001": { name: "Jean Dupont", maxGuests: 2 },
  "002": { name: "Marie Martin", maxGuests: 1 },
  "003": { name: "Paul Thompson", maxGuests: 3 },
  "004": { name: "Sophie Blanc", maxGuests: 2 }
};

const TARGET_DATE = new Date("2027-05-15T18:30:00+02:00");
const STORAGE_KEY = "paul-responses";

// DOM
const countdownEl = document.getElementById("countdown");
const guestNameEl = document.getElementById("guest-name");
const guestStatusEl = document.getElementById("guest-status");
const attendanceEl = document.getElementById("attendance");
const guestCountEl = document.getElementById("guest-count");
const maxTextEl = document.getElementById("max-text");
const messageEl = document.getElementById("message");
const responseMsgEl = document.getElementById("response-msg");
const formEl = document.getElementById("rsvp-form");
const choiceBtns = document.querySelectorAll(".btn-choice");
const minusBtn = document.getElementById("btn-minus");
const plusBtn = document.getElementById("btn-plus");
const submitBtn = document.querySelector(".btn-submit");

let currentGuestId = "UNKNOWN";
let maxGuests = 2;

// Countdown
function updateCountdown() {
  const diff = TARGET_DATE - Date.now();
  if (diff <= 0) {
    countdownEl.textContent = "La fête a commencé ! 🎉";
    return;
  }
  const d = Math.floor(diff / 86400000);
  const h = Math.floor((diff % 86400000) / 3600000);
  const m = Math.floor((diff % 3600000) / 60000);
  const s = Math.floor((diff % 60000) / 1000);
  countdownEl.textContent = `${d}j · ${h}h · ${m}m · ${s}s`;
}
updateCountdown();
setInterval(updateCountdown, 1000);

// Get guest from URL
function initGuest() {
  const params = new URLSearchParams(window.location.search);
  const id = params.get("guest");
  currentGuestId = id || "UNKNOWN";
  
  if (id && GUESTS[id]) {
    const guest = GUESTS[id];
    guestNameEl.textContent = guest.name;
    guestStatusEl.textContent = `Bienvenue ${guest.name} ! Vous êtes reconnu(e).`;
    maxGuests = guest.maxGuests;
    guestCountEl.max = maxGuests;
    maxTextEl.textContent = `Max ${maxGuests} ${maxGuests > 1 ? "personnes" : "personne"}`;
  }
}

// Choice buttons
choiceBtns.forEach(btn => {
  btn.addEventListener("click", (e) => {
    e.preventDefault();
    choiceBtns.forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    attendanceEl.value = btn.dataset.value;
    console.log("Choice:", btn.dataset.value);
  });
});

// Counter
minusBtn.addEventListener("click", (e) => {
  e.preventDefault();
  const val = parseInt(guestCountEl.value);
  if (val > 1) {
    guestCountEl.value = val - 1;
    console.log("Count:", guestCountEl.value);
  }
});

plusBtn.addEventListener("click", (e) => {
  e.preventDefault();
  const val = parseInt(guestCountEl.value);
  if (val < maxGuests) {
    guestCountEl.value = val + 1;
    console.log("Count:", guestCountEl.value);
  }
});

// Form submit
formEl.addEventListener("submit", (e) => {
  e.preventDefault();
  
  const data = {
    id: currentGuestId,
    name: guestNameEl.textContent,
    presence: attendanceEl.value === "present" ? "Oui" : "Non",
    guests: parseInt(guestCountEl.value),
    message: messageEl.value || "-",
    date: new Date().toLocaleString("fr-FR")
  };
  
  // Save
  let all = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
  const idx = all.findIndex(r => r.id === data.id);
  if (idx >= 0) all[idx] = data;
  else all.push(data);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
  
  // Show msg
  responseMsgEl.textContent = attendanceEl.value === "present" 
    ? "✓ Merci pour ta présence !" 
    : "✓ Merci pour ta réponse !";
  responseMsgEl.classList.add("show");
  
  // Disable
  formEl.querySelectorAll("button:not(.btn-submit), textarea").forEach(el => el.disabled = true);
  submitBtn.disabled = true;
  submitBtn.textContent = "✓ Enregistré";
  
  console.log("Saved:", data);
});

// Init
document.addEventListener("DOMContentLoaded", initGuest);

// Global
window.getResponses = () => JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
window.downloadCSV = () => {
  const data = window.getResponses();
  if (!data.length) { alert("Pas de réponses"); return; }
  const csv = "ID;Nom;Présence;Personnes;Message;Date\n" + 
    data.map(r => `${r.id};${r.name};${r.presence};${r.guests};"${r.message}";${r.date}`).join("\n");
  const blob = new Blob(["\ufeff" + csv], {type: "text/csv"});
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `paul-responses-${new Date().toISOString().split("T")[0]}.csv`;
  a.click();
};
