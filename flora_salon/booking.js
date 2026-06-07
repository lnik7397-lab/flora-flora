// booking.js
let currentUser = null;

document.addEventListener('DOMContentLoaded', async () => {
    
    if (!window.supabase) {
        console.error('Supabase не загружен!');
        alert('Ошибка загрузки. Обновите страницу.');
        return;
    }

    console.log('Supabase готов');

    // Проверка авторизации и загрузка данных пользователя
    async function checkAuthAndLoadUser() {
        try {
            const { data: { user }, error } = await window.supabase.auth.getUser();
            
            if (error || !user) {
                window.location.href = "login.html";
                return null;
            }
            
            currentUser = user;
            console.log('Пользователь авторизован:', user.email);
            
            // Загружаем профиль пользователя - ИСПРАВЛЕНО
            try {
                const { data: profile, error: profileError } = await window.supabase
                    .from("profiles")
                    .select("name, phone")
                    .eq("id", user.id)
                    .maybeSingle();  // вместо .single()
                
                if (profileError) {
                    console.error('Ошибка загрузки профиля:', profileError);
                }
                
                // Автоматически заполняем поля имя и телефон
                if (document.getElementById("name")) {
                    const userName = profile?.name || user.user_metadata?.name || "";
                    document.getElementById("name").value = userName;
                    console.log('Заполнено имя:', userName);
                }
                
                if (document.getElementById("phone")) {
                    const userPhone = profile?.phone || user.user_metadata?.phone || "";
                    document.getElementById("phone").value = userPhone;
                    console.log('Заполнен телефон:', userPhone);
                }
            } catch (err) {
                console.error('Ошибка загрузки профиля:', err);
                // Всё равно продолжаем, даже если профиль не загрузился
                if (document.getElementById("name")) {
                    document.getElementById("name").value = user.user_metadata?.name || "";
                }
                if (document.getElementById("phone")) {
                    document.getElementById("phone").value = user.user_metadata?.phone || "";
                }
            }
            
            return user;
        } catch (err) {
            console.error('Ошибка:', err);
            window.location.href = "login.html";
            return null;
        }
    }

    // Загрузка доступных слотов
    async function loadAvailableSlots() {
        const date = document.getElementById("date").value;
        if (!date) return;

        try {
            const { data: appointments, error } = await window.supabase
                .from("appointments")
                .select("time")
                .eq("date", date);

            if (error) {
                console.error('Ошибка загрузки слотов:', error);
                return;
            }

            const bookedTimes = (appointments || []).map(a => a.time);
            
            const allSlots = [];
            for (let hour = 9; hour <= 20; hour++) {
                allSlots.push(`${hour.toString().padStart(2, '0')}:00`);
                if (hour !== 20) allSlots.push(`${hour.toString().padStart(2, '0')}:30`);
            }

            const container = document.getElementById("timeSlots");
            if (!container) return;
            
            container.innerHTML = "";
            
            allSlots.forEach(slot => {
                const isBooked = bookedTimes.includes(slot);
                const btn = document.createElement("button");
                btn.textContent = slot;
                btn.className = "time-slot";
                if (isBooked) {
                    btn.classList.add("booked");
                    btn.disabled = true;
                } else {
                    btn.onclick = () => {
                        document.querySelectorAll(".time-slot").forEach(b => b.classList.remove("selected"));
                        btn.classList.add("selected");
                        document.getElementById("selectedTime").value = slot;
                    };
                }
                container.appendChild(btn);
            });
        } catch (err) {
            console.error('Ошибка:', err);
        }
    }

    // Отправка записи
    const bookingForm = document.getElementById("bookingForm");
    if (bookingForm) {
        bookingForm.addEventListener("submit", async (e) => {
            e.preventDefault();
            
            if (!currentUser) {
                window.location.href = "login.html";
                return;
            }
            
            const name = document.getElementById("name").value;
            const phone = document.getElementById("phone").value;
            const service = document.getElementById("service").value;
            const date = document.getElementById("date").value;
            const time = document.getElementById("selectedTime").value;
            
            if (!service) {
                alert("Выберите услугу!");
                return;
            }
            
            if (!date) {
                alert("Выберите дату!");
                return;
            }
            
            if (!time) {
                alert("Выберите время!");
                return;
            }
            
            console.log('Отправка записи:', { user_id: currentUser.id, service, date, time });
            
            try {
                const { data, error } = await window.supabase
                    .from("appointments")
                    .insert({
                        user_id: currentUser.id,
                        service: service,
                        date: date,
                        time: time,
                        status: "Активна"
                    })
                    .select();  // добавлено .select() для получения ответа
                
                if (error) {
                    console.error('Ошибка Supabase:', error);
                    alert("Ошибка: " + error.message);
                } else {
                    console.log('Успешно записано:', data);
                    alert("✅ Вы успешно записались!");
                    bookingForm.reset();
                    document.getElementById("selectedTime").value = "";
                    
                    // Снова заполняем имя и телефон
                    if (currentUser) {
                        try {
                            const { data: profile } = await window.supabase
                                .from("profiles")
                                .select("name, phone")
                                .eq("id", currentUser.id)
                                .maybeSingle();
                            if (document.getElementById("name")) {
                                document.getElementById("name").value = profile?.name || currentUser.user_metadata?.name || "";
                            }
                            if (document.getElementById("phone")) {
                                document.getElementById("phone").value = profile?.phone || currentUser.user_metadata?.phone || "";
                            }
                        } catch (err) {
                            console.error('Ошибка загрузки профиля:', err);
                        }
                    }
                    loadAvailableSlots();
                }
            } catch (err) {
                console.error('Ошибка:', err);
                alert("Ошибка: " + err.message);
            }
        });
    }

    // Назначение обработчиков
    const dateInput = document.getElementById("date");
    if (dateInput) {
        dateInput.addEventListener("change", loadAvailableSlots);
    }

    const today = new Date().toISOString().split("T")[0];
    if (dateInput) {
        dateInput.min = today;
    }

    // Загружаем пользователя и заполняем поля
    await checkAuthAndLoadUser();
});