document.addEventListener('DOMContentLoaded', async () => {
    console.log('🚀 Страница профиля загружена');
    
   
    if (!window.supabase) {
        console.error('❌ Supabase не загружен!');
        alert('Ошибка загрузки. Обновите страницу.');
        return;
    }

    
    const { data: { session }, error: sessionError } = await window.supabase.auth.getSession();
    
    if (sessionError || !session) {
        console.error('❌ Нет сессии');
        window.location.href = "login.html";
        return;
    }

    const user = session.user;
    console.log('✅ Пользователь:', user.email);

    
    const { data: profile, error: profileError } = await window.supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .maybeSingle();

    if (profileError) {
        console.error('Ошибка загрузки профиля:', profileError);
    }

    // Отображаем данные
    document.getElementById("userName").textContent = profile?.name || user.user_metadata?.name || "—";
    document.getElementById("userEmail").textContent = user.email || "—";
    document.getElementById("userPhone").textContent = profile?.phone || user.user_metadata?.phone || "—";

    
    const { data: appointment } = await window.supabase
        .from("appointments")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

    if (appointment) {
        document.getElementById("service").textContent = appointment.service || "—";
        document.getElementById("date").textContent = appointment.date || "—";
        document.getElementById("time").textContent = appointment.time || "—";
    } else {
        document.getElementById("service").textContent = "Нет записей";
        document.getElementById("date").textContent = "—";
        document.getElementById("time").textContent = "—";
    }

    
    const logoutBtn = document.getElementById("logoutBtn");
    if (logoutBtn) {
        logoutBtn.addEventListener("click", async () => {
            await window.supabase.auth.signOut();
            window.location.href = "login.html";
        });
    }

   
    const bookingAgainBtn = document.getElementById("bookingAgainBtn");
    
    
    console.log('🔍 Кнопка "bookingAgainBtn" найдена?', bookingAgainBtn ? 'ДА' : 'НЕТ');
    
    if (bookingAgainBtn) {
       
        bookingAgainBtn.onclick = function(e) {
            e.preventDefault();
            console.log('🔄 Нажата кнопка "Записаться снова"');
            
            
            window.supabase.auth.getSession()
                .then(({ data: { session } }) => {
                    console.log('📡 Сессия при клике:', session ? 'ЕСТЬ' : 'НЕТ');
                    
                    if (session) {
                        console.log('✅ Переходим на booking.html');
                        window.location.href = "booking.html";
                    } else {
                        console.log('❌ Сессии нет, идем на логин');
                        window.location.href = "login.html";
                    }
                })
                .catch(error => {
                    console.error('❌ Ошибка при проверке сессии:', error);
                    window.location.href = "login.html";
                });
        };
        
        console.log('✅ Обработчик для кнопки установлен');
    } else {
        console.error('❌ КНОПКА НЕ НАЙДЕНА! Проверьте id="bookingAgainBtn" в HTML');
    }
});