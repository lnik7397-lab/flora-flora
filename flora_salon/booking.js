console.log('📝 Загружен booking.js');

// ==========================================
// ЖДЕМ, ПОКА СТРАНИЦА ПОЛНОСТЬЮ ЗАГРУЗИТСЯ
// ==========================================
document.addEventListener('DOMContentLoaded', function() {
    console.log('📄 DOM загружен, создаем слоты времени...');
    
    // Проверяем Supabase
    if (!window.supabase) {
        console.error('❌ Supabase НЕ ДОСТУПЕН!');
        return;
    }
    
    // Проверяем, видна ли страница (если скрыта - значит сессии нет)
    if (document.body.style.display === 'none') {
        console.log('⏳ Страница скрыта, ждем проверки сессии...');
        // Проверяем сессию еще раз
        window.supabase.auth.getSession().then(({ data: { session } }) => {
            if (!session) {
                window.location.href = 'login.html';
                return;
            }
            document.body.style.display = 'block';
            createSlots();
        });
    } else {
        // Страница уже видна - создаем слоты
        createSlots();
    }
});

// ==========================================
// ФУНКЦИЯ СОЗДАНИЯ СЛОТОВ
// ==========================================
function createSlots() {
    const timeSlotsContainer = document.getElementById('timeSlots');
    console.log('🔍 Контейнер #timeSlots найден?', timeSlotsContainer ? 'ДА ✅' : 'НЕТ ❌');
    
    if (!timeSlotsContainer) {
        console.error('❌ Контейнер #timeSlots НЕ НАЙДЕН в HTML!');
        return;
    }
    
    // Очищаем контейнер
    timeSlotsContainer.innerHTML = '';
    
    // Список времени
    const times = [
        '09:00', '10:00', '11:00', '12:00', '13:00', 
        '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00'
    ];
    
    console.log('⏰ Создаем', times.length, 'слотов времени');
    
    // Создаем каждый слот
    times.forEach(time => {
        const slot = document.createElement('div');
        slot.className = 'time-slot';
        slot.textContent = time;
        slot.dataset.time = time;
        
        // Обработчик клика
        slot.addEventListener('click', function(e) {
            console.log('🖱️ КЛИК по времени:', time);
            
            // Снимаем выделение со всех слотов
            document.querySelectorAll('.time-slot').forEach(s => {
                s.classList.remove('selected');
                s.style.background = 'white';
                s.style.color = 'black';
            });
            
            // Выделяем текущий
            this.classList.add('selected');
            this.style.background = '#800020';
            this.style.color = 'white';
            
            // Сохраняем в скрытое поле
            const selectedTimeInput = document.getElementById('selectedTime');
            if (selectedTimeInput) {
                selectedTimeInput.value = time;
                console.log('✅ Время сохранено:', time);
            }
        });
        
        timeSlotsContainer.appendChild(slot);
    });
    
    console.log('✅ Все слоты времени созданы!');
    console.log('📊 Всего слотов:', timeSlotsContainer.children.length);
}

// ==========================================
// ОБРАБОТКА ФОРМЫ
// ==========================================
document.addEventListener('DOMContentLoaded', function() {
    const bookingForm = document.getElementById('bookingForm');
    if (bookingForm) {
        console.log('✅ Форма #bookingForm найдена');
        
        // Удаляем старые обработчики
        const newForm = bookingForm.cloneNode(true);
        bookingForm.parentNode.replaceChild(newForm, bookingForm);
        
        newForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            console.log('📝 === ОТПРАВКА ФОРМЫ ===');
            
            // Проверяем время
            const selectedTimeInput = document.getElementById('selectedTime');
            const time = selectedTimeInput ? selectedTimeInput.value : '';
            
            if (!time) {
                alert('⏰ Пожалуйста, выберите время!');
                console.warn('⚠️ Время не выбрано');
                return;
            }
            
            console.log('🕐 Выбранное время:', time);
            
            // Проверяем сессию
            const { data: { session } } = await window.supabase.auth.getSession();
            
            if (!session) {
                alert('⛔ Сессия истекла. Войдите заново.');
                window.location.href = 'login.html';
                return;
            }
            
            // Собираем данные
            const name = document.getElementById('name')?.value || '';
            const phone = document.getElementById('phone')?.value || '';
            const service = document.getElementById('service')?.value || '';
            const date = document.getElementById('date')?.value || '';
            
            if (!name || !phone || !service || !date) {
                alert('Пожалуйста, заполните все поля');
                return;
            }
            
            // Сохраняем в базу
            const { error } = await window.supabase
                .from('appointments')
                .insert([{
                    user_id: session.user.id,
                    name: name,
                    phone: phone,
                    service: service,
                    date: date,
                    time: time,
                    status: 'active'
                }]);
            
            if (error) {
                alert('❌ Ошибка: ' + error.message);
                console.error('Ошибка:', error);
            } else {
                alert('✅ Вы записаны!');
                window.location.href = 'profile.html';
            }
        });
        
        console.log('✅ Обработчик формы установлен');
    } else {
        console.error('❌ Форма #bookingForm не найдена!');
    }
});