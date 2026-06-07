// login.js
document.addEventListener('DOMContentLoaded', () => {
    
    if (!window.supabase) {
        console.error('Supabase не загружен!');
        alert('Ошибка загрузки. Обновите страницу.');
        return;
    }

    const form = document.getElementById("loginForm");
    if (!form) return;

    form.addEventListener("submit", async (e) => {
        e.preventDefault();

        const email = document.getElementById("email").value;
        const password = document.getElementById("password").value;

        if (!email || !password) {
            alert("Введите email и пароль");
            return;
        }

        console.log('Попытка входа:', email);

        const { data, error } = await window.supabase.auth.signInWithPassword({
            email: email,
            password: password
        });

        if (error) {
            console.error('Ошибка входа:', error);
            if (error.message === "Invalid login credentials") {
                alert("Неверный email или пароль. Если у вас нет аккаунта, зарегистрируйтесь.");
            } else {
                alert("Ошибка: " + error.message);
            }
            return;
        }

        console.log('Вход успешен! Пользователь:', data.user?.email);
        alert("Вход выполнен успешно!");
        window.location.href = "profile.html";
    });
});