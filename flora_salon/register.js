// register.js
document.addEventListener('DOMContentLoaded', () => {
    
    if (!window.supabase) {
        console.error('Supabase не загружен!');
        alert('Ошибка загрузки. Обновите страницу.');
        return;
    }

    const form = document.getElementById("registerForm");
    if (!form) return;

    form.addEventListener("submit", async (e) => {
        e.preventDefault();

        const email = document.getElementById("email").value;
        const password1 = document.getElementById("password1").value;
        const password2 = document.getElementById("password2").value;
        const name = document.getElementById("name").value;
        const phone = document.getElementById("phone").value;

        // Валидация
        if (!email || !password1 || !name) {
            alert("Заполните все обязательные поля!");
            return;
        }

        if (password1 !== password2) {
            alert("Пароли не совпадают!");
            return;
        }

        if (password1.length < 6) {
            alert("Пароль должен быть минимум 6 символов");
            return;
        }

        console.log('Регистрация пользователя:', email);

        // Регистрация (профиль создастся АВТОМАТИЧЕСКИ через триггер)
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
            console.error('Ошибка регистрации:', error);
            if (error.message === "User already registered") {
                alert("Пользователь с таким email уже существует. Попробуйте войти.");
                window.location.href = "login.html";
            } else {
                alert("Ошибка: " + error.message);
            }
            return;
        }

        console.log('Регистрация успешна! Пользователь ID:', data.user?.id);
        alert("Регистрация успешна! Теперь войдите.");
        window.location.href = "login.html";
    });
});