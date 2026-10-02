const targetDate = new Date("2027-05-15T18:00:00+02:00");
const countdownElement = document.getElementById("countdown");
const responseMessage = document.getElementById("response-message");

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
  countdownElement.textContent = `${days} j · ${hours} h · ${minutes} min · ${seconds} s`;
}

document.querySelectorAll(".answer").forEach((button) => {
  button.addEventListener("click", () => {
    responseMessage.textContent = button.dataset.answer === "present"
      ? "Super, merci ! Ta présence est notée pour ce test."
      : "Merci pour ta réponse. Nous espérons te revoir bientôt !";
  });
});

updateCountdown();
setInterval(updateCountdown, 1000);
