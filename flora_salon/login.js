// login.js - ИСПРАВЛЕНО (НЕТ объявления переменной)

document.getElementById("loginForm").addEventListener("submit", async (e) => {
    e.preventDefault();

    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    const { error } = await window.supabase.auth.signInWithPassword({
        email: email,
        password: password
    });

    if (error) {
        alert("Ошибка: " + error.message);
    } else {
        window.location.href = "profile.html";
    }
});