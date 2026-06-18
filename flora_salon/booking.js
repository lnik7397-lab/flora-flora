
let currentUser = null;

document.addEventListener('DOMContentLoaded', async () => {
    
    if (!window.supabase) {
        console.error('Supabase не загружен!');
        alert('Ошибка загрузки. Обновите страницу.');
        return;
    }

    console.log('Supabase готов');

   
    async function checkAuthAndLoadUser() {
        try {
            const { data: { user }, error } = await window.supabase.auth.getUser();
            
            if (error || !user) {
                window.location.href = "login.html";
                return null;
            }
            
            currentUser = user;
            console.log('Пользователь авторизован:', user.email);
            
           
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
                    .select();  
                
                if (error) {
                    console.error('Ошибка Supabase:', error);
                    alert("Ошибка: " + error.message);
                } else {
                    console.log('Успешно записано:', data);
                    alert("✅ Вы успешно записались!");
                    bookingForm.reset();
                    document.getElementById("selectedTime").value = "";
                    
                    
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

    
    const dateInput = document.getElementById("date");
    if (dateInput) {
        dateInput.addEventListener("change", loadAvailableSlots);
    }

    const today = new Date().toISOString().split("T")[0];
    if (dateInput) {
        dateInput.min = today;
    }

   
    await checkAuthAndLoadUser();
});

const timeSlotsContainer =
document.getElementById("timeSlots");

const times = [
    "09:00",
    "10:00",
    "11:00",
    "12:00",
    "13:00",
    "14:00",
    "15:00",
    "16:00",
    "17:00",
    "18:00"
];

function loadTimeSlots() {

    timeSlotsContainer.innerHTML = "";

    times.forEach(time => {

        const slot =
        document.createElement("div");

        slot.classList.add("time-slot");

        slot.textContent = time;

        slot.addEventListener("click", () => {

            document
            .querySelectorAll(".time-slot")
            .forEach(item => {
                item.classList.remove("selected");
            });

            slot.classList.add("selected");

            document
            .getElementById("selectedTime")
            .value = time;

        });

        timeSlotsContainer.appendChild(slot);

    });

}

loadTimeSlots();