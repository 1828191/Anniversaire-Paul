const supabase = window.supabase.createClient(
  "https://kyapjrisjzvvyycewgwm.supabase.co",
  "sb_publishable_k0yK0lrsPE31hMcgQC8yoQ_u8zpMwxN"
);
const params=new URLSearchParams(window.location.search);
const guestCode=params.get("guest");
async function loadGuest(){
 const {data,error}=await supabase.from("guests").select("*").eq("guest_code",guestCode).single();
 if(error){document.getElementById("guestName").innerText="Invité non trouvé";return;}
 document.getElementById("guestName").innerText=`${data.first_name} ${data.last_name}`;
}
async function reply(attending){
 const guestsCount=parseInt(document.getElementById("guestsCount").value)||1;
 const comment=document.getElementById("comment").value;
 const {error}=await supabase.from("guests").update({attending,guests_count:guestsCount,comment,responded_at:new Date().toISOString()}).eq("guest_code",guestCode);
 document.getElementById("result").innerText=error?"Erreur":"Réponse enregistrée";
}
loadGuest();