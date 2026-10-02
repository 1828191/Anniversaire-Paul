// ============ CONFIG ============
const TARGET_DATE = new Date("2027-05-15T18:30:00+02:00");
let currentGuest = null;

// ============ DOM ============
const countdownEl = document.getElementById("countdown");
const guestNameEl = document.getElementById("guest-name");
const guestStatusEl = document.getElementById("guest-status");
const loadingStateEl = document.getElementById("loading-state");
const unknownStateEl = document.getElementById("unknown-state");
const form = document.getElementById("rsvp-form");
const attendanceEl = document.getElementById("attendance");
const attendanceDetailsEl = document.getElementById("attendance-details");
const guestCountEl = document.getElementById("guest-count");
const maxGuestsTextEl = document.getElementById("max-guests-text");
const messageEl = document.getElementById("message");
const responseMessageEl = document.getElementById("response-message");
const minusBtn = document.getElementById("minus-btn");
const plusBtn = document.getElementById("plus-btn");
const submitBtn = document.getElementById("submit-btn");
const toggleBtns = document.querySelectorAll(".toggle-btn");

// ============ COUNTDOWN ============
function updateCountdown() {
  const diff = TARGET_DATE.getTime() - Date.now();
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

// Accepte ?token=A001X9 et, provisoirement, l'ancien format ?guest=A001X9.
function getTokenFromUrl() {
  const params = new URLSearchParams(window.location.search);
  return (params.get("token") || params.get("guest") || "").trim();
}

function showInvalidInvitation(message) {
  loadingStateEl.hidden = true;
  form.hidden = true;
  unknownStateEl.hidden = false;
  guestNameEl.textContent = "Invité(e)";
  guestStatusEl.textContent = message;
}

async function loadGuest() {
  const token = getTokenFromUrl();
  if (!token) {
    showInvalidInvitation("Scanne ton QR code ou ouvre ton lien personnel pour accéder au questionnaire.");
    return;
  }

  try {
    const { data, error } = await supabaseClient
      .from("guests")
      .select("id, token, name, max_guests")
      .eq("token", token)
      .maybeSingle();

    if (error) throw error;
    if (!data) {
      showInvalidInvitation("Aucun invité trouvé pour ce token.");
      return;
    }

    currentGuest = data;
    guestNameEl.textContent = data.name;
    guestStatusEl.textContent = "Ton invitation a bien été reconnue.";
    guestCountEl.max = Math.max(1, Number(data.max_guests) || 1);
    guestCountEl.value = 1;
    maxGuestsTextEl.textContent = `Maximum : ${guestCountEl.max} ${guestCountEl.max > 1 ? "personnes" : "personne"}`;
    updateStepperButtons();

    // Recharge une réponse existante pour permettre sa modification.
    const { data: existing, error: existingError } = await supabaseClient
      .from("responses")
      .select("attendance, guest_count, message")
      .eq("guest_id", data.id)
      .maybeSingle();

    if (existingError) throw existingError;
    if (existing) fillExistingResponse(existing);

    loadingStateEl.hidden = true;
    unknownStateEl.hidden = true;
    form.hidden = false;
  } catch (error) {
    console.error("Erreur Supabase :", error);
    showInvalidInvitation("La connexion à la liste des invités a échoué. Vérifie les politiques RLS avec le fichier setup.sql.");
  }
}

function fillExistingResponse(response) {
  const answer = response.attendance ? "present" : "absent";
  selectAttendance(answer);
  guestCountEl.value = response.attendance ? Math.min(Number(response.guest_count) || 1, Number(guestCountEl.max)) : 1;
  messageEl.value = response.message || "";
  updateStepperButtons();
  responseMessageEl.textContent = "Une réponse existe déjà. Tu peux la modifier puis confirmer.";
}

function selectAttendance(answer) {
  attendanceEl.value = answer;
  toggleBtns.forEach((button) => {
    const active = button.dataset.answer === answer;
    button.classList.toggle("active", active);
    button.setAttribute("aria-pressed", String(active));
  });
  attendanceDetailsEl.hidden = answer !== "present";
  if (answer !== "present") guestCountEl.value = 1;
  responseMessageEl.textContent = "";
  responseMessageEl.className = "response-message";
  updateStepperButtons();
}

toggleBtns.forEach((button) => {
  button.addEventListener("click", () => selectAttendance(button.dataset.answer));
});

function updateStepperButtons() {
  const current = Number(guestCountEl.value) || 1;
  const max = Number(guestCountEl.max) || 1;
  minusBtn.disabled = current <= 1;
  plusBtn.disabled = current >= max;
}

minusBtn.addEventListener("click", () => {
  const current = Number(guestCountEl.value) || 1;
  if (current > 1) guestCountEl.value = current - 1;
  updateStepperButtons();
});

plusBtn.addEventListener("click", () => {
  const current = Number(guestCountEl.value) || 1;
  const max = Number(guestCountEl.max) || 1;
  if (current < max) guestCountEl.value = current + 1;
  updateStepperButtons();
});

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  if (!currentGuest) return;
  if (!attendanceEl.value) {
    responseMessageEl.textContent = "Choisis Oui ou Non avant de confirmer.";
    responseMessageEl.className = "response-message error";
    return;
  }

  const isPresent = attendanceEl.value === "present";
  const guestCount = isPresent ? Number(guestCountEl.value) : 1;
  if (guestCount < 1 || guestCount > Number(currentGuest.max_guests)) {
    responseMessageEl.textContent = "Le nombre de personnes n’est pas valide.";
    responseMessageEl.className = "response-message error";
    return;
  }

  submitBtn.disabled = true;
  submitBtn.textContent = "Enregistrement…";
  responseMessageEl.textContent = "";

  const payload = {
    guest_id: currentGuest.id,
    attendance: isPresent,
    guest_count: guestCount,
    message: messageEl.value.trim() || null,
    responded_at: new Date().toISOString()
  };

  const { error } = await supabaseClient
    .from("responses")
    .upsert(payload, { onConflict: "guest_id" });

  if (error) {
    console.error("Enregistrement impossible :", error);
    responseMessageEl.textContent = "La réponse n’a pas été enregistrée. Vérifie la configuration Supabase.";
    responseMessageEl.className = "response-message error";
    submitBtn.disabled = false;
    submitBtn.textContent = "Confirmer ma réponse";
    return;
  }

  responseMessageEl.textContent = isPresent
    ? "Réponse enregistrée. Merci, on a hâte de te voir ! 🎉"
    : "Réponse enregistrée. Merci de nous avoir prévenus.";
  responseMessageEl.className = "response-message success";
  submitBtn.disabled = false;
  submitBtn.textContent = "Mettre à jour ma réponse";
});

updateCountdown();
setInterval(updateCountdown, 1000);
loadGuest();
