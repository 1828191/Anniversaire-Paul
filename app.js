const client = window.supabase.createClient(
    "https://kyapjrisjzvvyycewgwm.supabase.co",
    "sb_publishable_k0yK0lrsPE31hMcgQC8yoQ_u8zpMwxN"
);

const params = new URLSearchParams(window.location.search);
const guestCode = params.get("guest");

async function loadGuest() {

    if (!guestCode) {

        document.getElementById("guestName").innerText =
            "Lien invalide";

        return;
    }

    const { data, error } = await client
        .from("guests")
        .select("*")
        .eq("guest_code", guestCode)
        .single();

    if (error || !data) {

        console.error(error);

        document.getElementById("guestName").innerText =
            "Invité introuvable";

        return;
    }

    document.getElementById("guestName").innerText =
        `Bonjour ${data.first_name} ${data.last_name}`;

    if (data.guests_count) {
        document.getElementById("guestsCount").value =
            data.guests_count;
    }

    if (data.comment) {
        document.getElementById("comment").value =
            data.comment;
    }
}

async function reply(attending) {

    const guestsCount =
        parseInt(
            document.getElementById("guestsCount").value
        ) || 1;

    const comment =
        document.getElementById("comment").value;

    const { error } = await client
        .from("guests")
        .update({
            attending: attending,
            guests_count: guestsCount,
            comment: comment,
            responded_at: new Date().toISOString()
        })
        .eq("guest_code", guestCode);

    if (error) {

        console.error(error);

        document.getElementById("message").innerHTML =
            "❌ Erreur d'enregistrement";

        return;
    }

    document.getElementById("message").innerHTML =
        "✅ Merci, votre réponse a été enregistrée.";
}

loadGuest();
