// profile.js
document.addEventListener('DOMContentLoaded', async () => {
    
    if (!window.supabase) {
        console.error('Supabase не загружен!');
        alert('Ошибка загрузки. Обновите страницу.');
        return;
    }

    async function loadProfile() {
        // Получаем текущего пользователя
        const { data: { user }, error } = await window.supabase.auth.getUser();
        
        if (error || !user) {
            console.error('Пользователь не авторизован');
            window.location.href = "login.html";
            return;
        }

        console.log('Загружаем профиль для:', user.email);

        // Загружаем профиль из таблицы profiles
        let profile = null;
        try {
            const { data, error: profileError } = await window.supabase
                .from("profiles")
                .select("*")
                .eq("id", user.id)
                .single();
            
            if (profileError) {
                console.error('Ошибка загрузки профиля:', profileError);
            } else {
                profile = data;
            }
        } catch (err) {
            console.error('Ошибка:', err);
        }

        // Заполняем данные на странице
        if (document.getElementById("userName")) {
            const name = profile?.name || user.user_metadata?.name || user.email?.split('@')[0] || "—";
            document.getElementById("userName").textContent = name;
        }
        
        if (document.getElementById("userEmail")) {
            document.getElementById("userEmail").textContent = user.email || "—";
        }
        
        if (document.getElementById("userPhone")) {
            const phone = profile?.phone || user.user_metadata?.phone || "—";
            document.getElementById("userPhone").textContent = phone;
        }

        // Загружаем последнюю запись
        try {
            const { data: appointment, error: appointmentError } = await window.supabase
                .from("appointments")
                .select("*")
                .eq("user_id", user.id)
                .order("created_at", { ascending: false })
                .limit(1)
                .single();

            if (appointmentError && appointmentError.code !== 'PGRST116') {
                console.error('Ошибка загрузки записи:', appointmentError);
            }

            if (appointment) {
                if (document.getElementById("service")) 
                    document.getElementById("service").textContent = appointment.service;
                if (document.getElementById("date")) 
                    document.getElementById("date").textContent = appointment.date;
                if (document.getElementById("time")) 
                    document.getElementById("time").textContent = appointment.time;
            } else {
                if (document.getElementById("service")) 
                    document.getElementById("service").textContent = "Нет записей";
                if (document.getElementById("date")) 
                    document.getElementById("date").textContent = "—";
                if (document.getElementById("time")) 
                    document.getElementById("time").textContent = "—";
            }
        } catch (err) {
            console.error('Ошибка:', err);
        }
    }

    // Кнопка выхода
    const logoutBtn = document.getElementById("logoutBtn");
    if (logoutBtn) {
        logoutBtn.addEventListener("click", async () => {
            await window.supabase.auth.signOut();
            window.location.href = "login.html";
        });
    }

    // Кнопка "Записаться снова"
    const bookingAgainBtn = document.getElementById("bookingAgainBtn");
    if (bookingAgainBtn) {
        bookingAgainBtn.addEventListener("click", () => {
            window.location.href = "booking.html";
        });
    }

    // Загружаем профиль
    await loadProfile();
});