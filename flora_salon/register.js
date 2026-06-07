// register.js
document.addEventListener('DOMContentLoaded', () => {
    
    if (!window.supabase) {
        console.error('Supabase не загружен!');
        alert('Ошибка загрузки. Обновите страницу.');
        return;
    }

    document.getElementById("registerForm").addEventListener("submit", async (e) => {
        e.preventDefault();

        const email = document.getElementById("email").value;
        const password1 = document.getElementById("password1").value;
        const password2 = document.getElementById("password2").value;
        const name = document.getElementById("name").value;
        const phone = document.getElementById("phone").value;

        if (password1 !== password2) {
            alert("Пароли не совпадают!");
            return;
        }

        if (password1.length < 6) {
            alert("Пароль должен быть минимум 6 символов");
            return;
        }

        const { data, error } = await window.supabase.auth.signUp({
            email: email,
            password: password1,
            options: {
                data: {
                    name: name,
                    phone: phone
                }
            }
        });

        if (error) {
            alert("Ошибка: " + error.message);
            return;
        }

        alert("Регистрация успешна! Теперь войдите.");
        window.location.href = "login.html";
    });
});