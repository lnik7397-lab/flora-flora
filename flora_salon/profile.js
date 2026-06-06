const supabase = window.supabase.createClient(
    "ТВОЙ_URL",
    "ТВОЙ_ANON_KEY"
);

async function checkUser() {

    const {
        data: { user }
    } = await supabase.auth.getUser();

    if (!user) {

        window.location.href = "login.html";
        return;
    }

    document.getElementById("userEmail").textContent =
        user.email;
}

checkUser();