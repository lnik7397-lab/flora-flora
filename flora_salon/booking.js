console.log('📝 Загружен booking.js');

// ==========================================
// ЖДЕМ ЗАГРУЗКИ СТРАНИЦЫ
// ==========================================
document.addEventListener('DOMContentLoaded', function() {
    console.log('📄 DOM загружен, создаем слоты времени...');
    
    // Проверяем Supabase
    if (!window.supabase) {
        console.error('❌ Supabase НЕ ДОСТУПЕН!');
        return;
    }
    
    // Проверяем, видна ли страница
    if (document.body.style.display === 'none') {
        console.log('⏳ Страница скрыта, ждем...');
        return;
    }
    
    // СОЗДАЕМ СЛОТЫ
    createTimeSlots();
    
    // НАСТРАИВАЕМ ФОРМУ
    setupForm();
});

// ==========================================
// ФУНКЦИЯ СОЗДАНИЯ СЛОТОВ
// ==========================================
function createTimeSlots() {
    const container = document.getElementById('timeSlots');
    console.log('🔍 Контейнер #timeSlots найден?', container ? 'ДА ✅' : 'НЕТ ❌');
    
    if (!container) {
        console.error('❌ Контейнер #timeSlots НЕ НАЙДЕН!');
        return;
    }
    
    // Очищаем контейнер (на случай, если там что-то есть)
    container.innerHTML = '';
    
    const times = ['09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00'];
    
    console.log('⏰ Создаем', times.length, 'слотов времени');
    
    times.forEach(time => {
        const slot = document.createElement('div');
        slot.className = 'time-slot';
        slot.textContent = time;
        slot.dataset.time = time;
        
        // НАВЕШИВАЕМ ОБРАБОТЧИК КЛИКА
        slot.addEventListener('click', function(e) {
            console.log('🖱️ КЛИК по времени:', time);
            
            // Снимаем выделение со всех слотов
            document.querySelectorAll('.time-slot').forEach(s => {
                s.classList.remove('selected');
            });
            
            // Выделяем текущий
            this.classList.add('selected');
            
            // Сохраняем в скрытое поле
            const hiddenInput = document.getElementById('selectedTime');
            if (hiddenInput) {
                hiddenInput.value = time;
                console.log('✅ Время сохранено:', time);
            }
        });
        
        container.appendChild(slot);
    });
    
    console.log('✅ Все слоты времени созданы!');
    console.log('📊 Всего слотов:', container.children.length);
}

// ==========================================
// ФУНКЦИЯ НАСТРОЙКИ ФОРМЫ
// ==========================================
function setupForm() {
    const form = document.getElementById('bookingForm');
    
    if (!form) {
        console.error('❌ Форма #bookingForm не найдена!');
        return;
    }
    
    console.log('✅ Форма #bookingForm найдена');
    
    // Удаляем старые обработчики
    const newForm = form.cloneNode(true);
    form.parentNode.replaceChild(newForm, form);
    
    newForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        console.log('📝 === ОТПРАВКА ФОРМЫ ===');
        
        // Проверяем время
        const time = document.getElementById('selectedTime')?.value || '';
        
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
        
        console.log('📦 Данные:', { name, phone, service, date, time });
        
        // Сохраняем в базу
        const { data, error } = await window.supabase
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
            console.error('❌ Ошибка записи:', error);
        } else {
            console.log('✅ Запись создана!', data);
            alert('✅ Вы записаны!');
            window.location.href = 'profile.html';
        }
    });
    
    console.log('✅ Обработчик формы установлен');
}