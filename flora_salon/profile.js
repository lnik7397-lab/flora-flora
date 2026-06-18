document.addEventListener('DOMContentLoaded', async () => {
    
    
    if (!window.supabase) {
        console.error('Supabase не загружен!');
        alert('Ошибка загрузки. Обновите страницу.');
        return;
    }

    
    const { data: { session }, error: sessionError } = await window.supabase.auth.getSession();
    
    if (sessionError || !session) {
        console.error('Нет сессии');
        window.location.href = "login.html";
        return;
    }

    const user = session.user; 
    console.log('✅ Загружаем профиль для:', user.email);

    
    const { data: profile, error: profileError } = await window.supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .maybeSingle();

    if (profileError) {
        console.error('Ошибка загрузки профиля:', profileError);
    }

    
    if (document.getElementById("userName")) {
        document.getElementById("userName").textContent = profile?.name || user.user_metadata?.name || "—";
    }
    
    if (document.getElementById("userEmail")) {
        document.getElementById("userEmail").textContent = user.email || "—";
    }
    
    if (document.getElementById("userPhone")) {
        document.getElementById("userPhone").textContent = profile?.phone || user.user_metadata?.phone || "—";
    }

   
    const { data: appointment } = await window.supabase
        .from("appointments")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

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

    
    const logoutBtn = document.getElementById("logoutBtn");
    if (logoutBtn) {
        logoutBtn.addEventListener("click", async () => {
            await window.supabase.auth.signOut();
            window.location.href = "login.html";
        });
    }

    
    const bookingAgainBtn = document.getElementById("bookingAgainBtn");
    if (bookingAgainBtn) {
        bookingAgainBtn.addEventListener("click", () => {
           
            window.supabase.auth.getSession().then(({ data: { session } }) => {
                if (session) {
                    
                    console.log('✅ Переход на запись с сессией');
                    window.location.href = "booking.html";
                } else {
                   
                    console.log('❌ Нет сессии, идем на логин');
                    window.location.href = "login.html";
                }
            }).catch(() => {
                window.location.href = "login.html";
            });
        });
    }
});