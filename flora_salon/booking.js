console.log('📝 Загружен booking.js');

let currentUser = null;

document.addEventListener('DOMContentLoaded', async () => {
    console.log('📄 DOM загружен');
    
    // Проверяем Supabase
    if (!window.supabase) {
        console.error('❌ Supabase не загружен!');
        alert('Ошибка загрузки. Обновите страницу.');
        return;
    }

    console.log('✅ Supabase готов');

    // ==========================================
    // 1. ПРОВЕРКА АВТОРИЗАЦИИ
    // ==========================================
    async function checkAuthAndLoadUser() {
        try {
            const { data: { user }, error } = await window.supabase.auth.getUser();
            
            if (error || !user) {
                console.log('❌ Пользователь не авторизован');
                window.location.href = "login.html";
                return null;
            }
            
            currentUser = user;
            console.log('✅ Пользователь авторизован:', user.email);
            
            // Загружаем профиль
            try {
                const { data: profile, error: profileError } = await window.supabase
                    .from("profiles")
                    .select("name, phone")
                    .eq("id", user.id)
                    .maybeSingle();
                
                if (profileError) {
                    console.error('Ошибка загрузки профиля:', profileError);
                }
                
                if (document.getElementById("name")) {
                    document.getElementById("name").value = profile?.name || user.user_metadata?.name || "";
                    console.log('Заполнено имя:', document.getElementById("name").value);
                }
                
                if (document.getElementById("phone")) {
                    document.getElementById("phone").value = profile?.phone || user.user_metadata?.phone || "";
                    console.log('Заполнен телефон:', document.getElementById("phone").value);
                }
            } catch (err) {
                console.error('Ошибка загрузки профиля:', err);
            }
            
            return user;
        } catch (err) {
            console.error('❌ Ошибка:', err);
            window.location.href = "login.html";
            return null;
        }
    }

    // ==========================================
    // 2. ЗАГРУЗКА СЛОТОВ (только одна функция!)
    // ==========================================
    async function loadAvailableSlots() {
        const date = document.getElementById("date").value;
        if (!date) {
            console.log('⏳ Дата не выбрана');
            return;
        }

        console.log('📅 Загружаем слоты для даты:', date);

        try {
            // Получаем занятые слоты
            const { data: appointments, error } = await window.supabase
                .from("appointments")
                .select("time")
                .eq("date", date);

            if (error) {
                console.error('❌ Ошибка загрузки слотов:', error);
                return;
            }

            const bookedTimes = (appointments || []).map(a => a.time);
            console.log('📊 Занятые слоты:', bookedTimes);
            
            // Все слоты (только по часам, чтобы было красиво)
            const allSlots = [];
            for (let hour = 9; hour <= 20; hour++) {
                allSlots.push(`${hour.toString().padStart(2, '0')}:00`);
            }

            const container = document.getElementById("timeSlots");
            if (!container) {
                console.error('❌ Контейнер #timeSlots не найден');
                return;
            }
            
            container.innerHTML = "";
            
            allSlots.forEach(slot => {
                const isBooked = bookedTimes.includes(slot);
                const btn = document.createElement("div"); // меняем button на div
                btn.textContent = slot;
                btn.className = "time-slot";
                btn.dataset.time = slot;
                
                if (isBooked) {
                    btn.classList.add("booked");
                    btn.style.cursor = 'not-allowed';
                } else {
                    // ==========================================
                    // ОБРАБОТЧИК КЛИКА (НАДЕЖНЫЙ)
                    // ==========================================
                    btn.onclick = function(e) {
                        e.preventDefault();
                        console.log('🖱️ КЛИК! Время:', slot);
                        
                        // Снимаем выделение со всех слотов
                        document.querySelectorAll(".time-slot").forEach(b => {
                            b.classList.remove("selected");
                        });
                        
                        // Выделяем текущий
                        this.classList.add("selected");
                        
                        // Сохраняем в скрытое поле
                        document.getElementById("selectedTime").value = slot;
                        console.log('✅ Время сохранено:', slot);
                    };
                }
                container.appendChild(btn);
            });
            
            console.log('✅ Создано слотов:', container.children.length);
        } catch (err) {
            console.error('❌ Ошибка:', err);
        }
    }

    // ==========================================
    // 3. ОБРАБОТКА ФОРМЫ
    // ==========================================
    const bookingForm = document.getElementById("bookingForm");
    if (bookingForm) {
        bookingForm.addEventListener("submit", async (e) => {
            e.preventDefault();
            console.log('📝 === ОТПРАВКА ФОРМЫ ===');
            
            if (!currentUser) {
                console.log('❌ Нет пользователя');
                window.location.href = "login.html";
                return;
            }
            
            const name = document.getElementById("name").value.trim();
            const phone = document.getElementById("phone").value.trim();
            const service = document.getElementById("service").value;
            const date = document.getElementById("date").value;
            const time = document.getElementById("selectedTime").value;
            
            console.log('📦 Данные:', { name, phone, service, date, time });
            
            if (!service) {
                alert("Выберите услугу!");
                return;
            }
            
            if (!date) {
                alert("Выберите дату!");
                return;
            }
            
            if (!time) {
                alert(" Выберите время!");
                return;
            }
            
            try {
                const { data, error } = await window.supabase
                    .from("appointments")
                    .insert({
                        user_id: currentUser.id,
                        name: name,
                        phone: phone,
                        service: service,
                        date: date,
                        time: time,
                        status: "Активна"
                    })
                    .select();
                
                if (error) {
                    console.error('❌ Ошибка Supabase:', error);
                    alert("❌ Ошибка: " + error.message);
                } else {
                    console.log('✅ Успешно записано!', data);
                    alert("✅ Вы успешно записались!");
                    
                    // Очищаем форму
                    document.getElementById("selectedTime").value = "";
                    document.querySelectorAll(".time-slot").forEach(b => b.classList.remove("selected"));
                    
                    // Перезагружаем слоты
                    await loadAvailableSlots();
                }
            } catch (err) {
                console.error('❌ Ошибка:', err);
                alert("❌ Ошибка: " + err.message);
            }
        });
        console.log('✅ Обработчик формы установлен');
    }

    // ==========================================
    // 4. ОБРАБОТЧИК СМЕНЫ ДАТЫ
    // ==========================================
    const dateInput = document.getElementById("date");
    if (dateInput) {
        dateInput.addEventListener("change", loadAvailableSlots);
        console.log('✅ Обработчик даты установлен');
    }

    // Устанавливаем минимальную дату
    const today = new Date().toISOString().split("T")[0];
    if (dateInput) {
        dateInput.min = today;
        console.log('📅 Минимальная дата:', today);
    }

    // ==========================================
    // 5. ЗАПУСКАЕМ ВСЁ
    // ==========================================
    await checkAuthAndLoadUser();
    // ==========================================
    
// АВТОМАТИЧЕСКАЯ ЗАГРУЗКА СЛОТОВ
// ==========================================

// Устанавливаем сегодняшнюю дату по умолчанию
if (dateInput) {
    dateInput.value = today;
    console.log('📅 Установлена дата по умолчанию:', today);
}

// Загружаем слоты для сегодняшней даты
if (dateInput && dateInput.value) {
    await loadAvailableSlots();
}
    
    // Если дата уже выбрана, загружаем слоты
    if (dateInput && dateInput.value) {
        await loadAvailableSlots();
    }
    
    console.log('✅ Все скрипты загружены');
});



// ==========================================
// УБИРАЕМ ВТОРУЮ ФУНКЦИЮ loadTimeSlots()
// и её вызов в конце файла
// ==========================================
// ❌ УДАЛИТЕ ЭТО:
// const timeSlotsContainer = document.getElementById("timeSlots");
// const times = [...];
// function loadTimeSlots() {...}
// loadTimeSlots();