const STORAGE_KEY = "anniversaire-paul-rsvp";
const targetDate = new Date("2027-05-15T18:00:00+02:00");
const countdownElement = document.getElementById("countdown");
const responseMessage = document.getElementById("response-message");
const rsvpForm = document.getElementById("rsvp-form");
const guestNameInput = document.getElementById("guest-name");
const responsesList = document.getElementById("responses-list");
const presentCount = document.getElementById("present-count");
const absentCount = document.getElementById("absent-count");
const totalCount = document.getElementById("total-count");

function loadResponses() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : [];
  } catch (error) {
    console.warn("Impossible de lire les réponses enregistrées.", error);
    return [];
  }
}

function saveResponses(responses) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(responses));
}

function updateCountdown() {
  if (!countdownElement) return;

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
  countdownElement.textContent = `${days} j · ${hours} h · ${minutes} min · ${seconds} s`;
}

function renderResponses() {
  const responses = loadResponses();
  const present = responses.filter((entry) => entry.answer === "present").length;
  const absent = responses.filter((entry) => entry.answer === "absent").length;

  if (presentCount) presentCount.textContent = String(present);
  if (absentCount) absentCount.textContent = String(absent);
  if (totalCount) totalCount.textContent = String(responses.length);

  if (!responsesList) return;

  if (responses.length === 0) {
    responsesList.innerHTML = '<li class="empty-state">Aucune réponse pour le moment.</li>';
    return;
  }

  const sortedResponses = [...responses].reverse();
  responsesList.innerHTML = sortedResponses
    .map((entry) => {
      const statusText = entry.answer === "present" ? "Présent" : "Absent";
      const statusClass = entry.answer === "present" ? "present" : "absent";
      return `
        <li>
          <span class="response-name">${entry.name}</span>
          <span class="response-status ${statusClass}">${statusText}</span>
        </li>
      `;
    })
    .join("");
}

function saveResponse(answer) {
  const name = guestNameInput ? guestNameInput.value.trim() : "";
  const validName = name || "Invité(e)";
  const responses = loadResponses();

  responses.push({
    id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
    name: validName,
    answer,
    createdAt: new Date().toISOString()
  });

  saveResponses(responses);
  renderResponses();

  if (responseMessage) {
    responseMessage.textContent = answer === "present"
      ? `${validName}, merci ! Ta présence est bien enregistrée.`
      : `${validName}, merci pour ta réponse. On espère te revoir bientôt !`;
  }

  if (guestNameInput) guestNameInput.value = "";
  guestNameInput?.focus();
}

if (rsvpForm) {
  rsvpForm.addEventListener("submit", (event) => {
    event.preventDefault();

    const submitter = event.submitter;
    const answer = submitter ? submitter.dataset.answer : "present";

    if (!answer) return;
    saveResponse(answer);
  });
}

renderResponses();
updateCountdown();
setInterval(updateCountdown, 1000);
