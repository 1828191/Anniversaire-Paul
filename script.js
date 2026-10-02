// Base de données invités
const guests = {
  "001": {
    name: "Jean Dupont",
    maxGuests: 2
  },
  "002": {
    name: "Marie Martin",
    maxGuests: 1
  },
  "003": {
    name: "Paul Thompson",
    maxGuests: 3
  },
  "004": {
    name: "Sophie Blanc",
    maxGuests: 2
  }
};

// Countdown timer
const targetDate = new Date("2027-05-15T18:00:00+02:00");
const countdownElement = document.getElementById("countdown");

function updateCountdown() {
  const difference = targetDate.getTime() - Date.now();
  if (difference <= 0) {
    countdownElement.textContent = "La fête a commencé !";
    return;
  }
  const day = 86400000, hour = 3600000, minute = 60000;
  const days = Math.floor(difference / day);
  const hours = Math.floor((difference % day) / hour);
  const minutes = Math.floor((difference % hour) / minute);
  const seconds = Math.floor((difference % minute) / 1000);
  countdownElement.textContent = `${days}j · ${hours}h · ${minutes}min · ${seconds}s`;
}

updateCountdown();
setInterval(updateCountdown, 1000);

// Reconnaissance invité via URL
function getGuestIdFromUrl() {
  const params = new URLSearchParams(window.location.search);
  return params.get("guest");
}

function initializeGuest() {
  const guestId = getGuestIdFromUrl();
  const guestNameEl = document.getElementById("guest-name");
  const guestStatusEl = document.getElementById("guest-status");
  const guestCountField = document.getElementById("guest-count");

  if (guestId && guests[guestId]) {
    const guest = guests[guestId];
    guestNameEl.textContent = guest.name;
    guestStatusEl.textContent = `Bienvenue ${guest.name} ! Nous avons reconnu votre invitation.`;
    guestCountField.max = guest.maxGuests;
    
    // Stockage de l'ID pour le formulaire
    window.currentGuestId = guestId;
  } else {
    guestNameEl.textContent = "Invité(e)";
    guestStatusEl.textContent = "Merci de scanner votre QR code pour accéder à votre invitation.";
  }
}

// Gestion du formulaire RSVP
const rsvpForm = document.getElementById("rsvp-form");
const answerButtons = document.querySelectorAll(".answer-button");
const responseMessage = document.getElementById("response-message");

// Toggle réponse Oui/Non
answerButtons.forEach(button => {
  button.addEventListener("click", () => {
    answerButtons.forEach(b => b.classList.remove("active"));
    button.classList.add("active");
    document.getElementById("attendance").value = button.dataset.answer;
  });
});

// Soumission du formulaire
rsvpForm.addEventListener("submit", (e) => {
  e.preventDefault();

  const guestId = window.currentGuestId || "UNKNOWN";
  const guestName = document.getElementById("guest-name").textContent;
  const attendance = document.getElementById("attendance").value;
  const guestCount = document.getElementById("guest-count").value;
  const message = document.getElementById("message").value;
  const timestamp = new Date().toLocaleString("fr-FR");

  // Créer l'objet réponse
  const response = {
    id: guestId,
    name: guestName,
    attendance: attendance === "present" ? "Oui" : "Non",
    guestCount: guestCount,
    message: message || "-",
    timestamp: timestamp
  };

  // Sauvegarder en localStorage
  saveResponseToStorage(response);

  // Afficher confirmation
  const attendanceText = attendance === "present" ? "Merci pour ta présence !" : "Merci de ta réponse !";
  responseMessage.textContent = `${attendanceText} Tes réponses sont enregistrées.`;
  responseMessage.classList.add("success");

  // Désactiver le formulaire
  rsvpForm.querySelectorAll("input, textarea, button").forEach(el => {
    if (el !== responseMessage) el.disabled = true;
  });

  console.log("Réponse enregistrée :", response);
});

// Sauvegarde en localStorage
function saveResponseToStorage(response) {
  let responses = JSON.parse(localStorage.getItem("paul-anniversary-responses") || "[]");
  
  // Vérifier si c'est une mise à jour
  const existingIndex = responses.findIndex(r => r.id === response.id);
  if (existingIndex >= 0) {
    responses[existingIndex] = response;
  } else {
    responses.push(response);
  }
  
  localStorage.setItem("paul-anniversary-responses", JSON.stringify(responses));
}

// Export en CSV
function exportToCSV() {
  const responses = JSON.parse(localStorage.getItem("paul-anniversary-responses") || "[]");
  
  if (responses.length === 0) {
    alert("Aucune réponse enregistrée pour le moment.");
    return;
  }

  const headers = ["ID", "Nom", "Présence", "Nombre de personnes", "Message", "Date/Heure"];
  const rows = responses.map(r => [
    r.id,
    r.name,
    r.attendance,
    r.guestCount,
    `"${r.message.replace(/"/g, '""')}"`, // Échapper les guillemets
    r.timestamp
  ]);

  const csv = [
    headers.join(";"),
    ...rows.map(r => r.join(";"))
  ].join("\n");

  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);
  
  link.setAttribute("href", url);
  link.setAttribute("download", `anniversaire-paul-responses-${new Date().toISOString().split('T')[0]}.csv`);
  link.style.visibility = "hidden";
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

// Debug: afficher les réponses en console
function showResponses() {
  const responses = JSON.parse(localStorage.getItem("paul-anniversary-responses") || "[]");
  console.log("Réponses enregistrées :", responses);
  return responses;
}

// Initialiser au chargement
document.addEventListener("DOMContentLoaded", initializeGuest);

// Export global pour debug en console
window.exportToCSV = exportToCSV;
window.showResponses = showResponses;
