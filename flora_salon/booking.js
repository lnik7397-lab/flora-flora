
console.log('📝 Загружен booking.js');


document.addEventListener('DOMContentLoaded', function() {
    console.log('📄 DOM загружен, создаем слоты времени...');
    
    
    if (!window.supabase) {
        console.error('❌ Supabase НЕ ДОСТУПЕН!');
        return;
    }
    
    
    const timeSlotsContainer = document.getElementById('timeSlots');
    console.log('🔍 Контейнер #timeSlots найден?', timeSlotsContainer ? 'ДА ✅' : 'НЕТ ❌');
    
    if (timeSlotsContainer) {
        
        timeSlotsContainer.innerHTML = '';
        
        
        const times = [
            '09:00', '10:00', '11:00', '12:00', '13:00', 
            '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00'
        ];
        
        console.log('⏰ Создаем', times.length, 'слотов времени');
        
        
        times.forEach(time => {
            const slot = document.createElement('div');
            slot.className = 'time-slot';
            slot.textContent = time;
            slot.dataset.time = time;
            slot.style.cssText = `
                padding: 12px;
                margin: 5px;
                border: 1px solid #ddd;
                border-radius: 8px;
                cursor: pointer;
                background: white;
                transition: 0.3s;
                text-align: center;
                user-select: none;
            `;
            
            
            slot.addEventListener('click', function(e) {
                console.log('🖱️ КЛИК по времени:', time);
                
               
                document.querySelectorAll('.time-slot').forEach(s => {
                    s.classList.remove('selected');
                    s.style.background = 'white';
                    s.style.color = 'black';
                });
                
                
                this.classList.add('selected');
                this.style.background = '#800020';
                this.style.color = 'white';
                
                
                const selectedTimeInput = document.getElementById('selectedTime');
                if (selectedTimeInput) {
                    selectedTimeInput.value = time;
                    console.log('✅ Время сохранено:', time);
                } else {
                    console.error('❌ Поле #selectedTime не найдено!');
                }
            });
            
            
            timeSlotsContainer.appendChild(slot);
        });
        
        console.log('✅ Все слоты времени созданы!');
        console.log('📊 Всего слотов:', timeSlotsContainer.children.length);
        
    } else {
        console.error('❌ Контейнер #timeSlots НЕ НАЙДЕН в HTML!');
        console.log('💡 Проверьте, что в HTML есть <div id="timeSlots"></div>');
    }
    
    
    const bookingForm = document.getElementById('bookingForm');
    if (bookingForm) {
        console.log('✅ Форма #bookingForm найдена');
        
        
        const newForm = bookingForm.cloneNode(true);
        bookingForm.parentNode.replaceChild(newForm, bookingForm);
        
        newForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            console.log('📝 === ОТПРАВКА ФОРМЫ ===');
            
           
            const selectedTimeInput = document.getElementById('selectedTime');
            const time = selectedTimeInput ? selectedTimeInput.value : '';
            
           
            if (!time) {
                alert('⏰ Пожалуйста, выберите время!');
                console.warn('⚠️ Время не выбрано');
                return;
            }
            
            console.log('🕐 Выбранное время:', time);
            
            
            const { data: { session } } = await window.supabase.auth.getSession();
            
            if (!session) {
                alert('⛔ Сессия истекла. Войдите заново.');
                window.location.href = 'login.html';
                return;
            }
            
            
            const name = document.getElementById('name')?.value || '';
            const phone = document.getElementById('phone')?.value || '';
            const service = document.getElementById('service')?.value || '';
            const date = document.getElementById('date')?.value || '';
            
            if (!service || !date) {
                alert('Пожалуйста, заполните все поля');
                return;
            }
            
            
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
                alert('Ошибка: ' + error.message);
            } else {
                alert('✅ Вы записаны!');
                window.location.href = 'profile.html';
            }
        });
        
        console.log('✅ Обработчик формы установлен');
    } else {
        console.error('❌ Форма #bookingForm не найдена!');
    }
    
    
    const hiddenField = document.getElementById('selectedTime');
    if (hiddenField) {
        console.log('✅ Поле #selectedTime существует');
    } else {
        console.error('❌ Поле #selectedTime ОТСУТСТВУЕТ в HTML!');
        console.log('💡 Добавьте: <input type="hidden" id="selectedTime">');
    }
});