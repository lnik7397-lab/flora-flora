
console.log('📝 Загружен booking.js');


let currentSession = null;


async function getSessionForce() {
    try {
        
        const { data: { session }, error } = await window.supabase.auth.getSession();
        
        if (error) {
            console.error('❌ Ошибка getSession():', error);
            return null;
        }
        
        if (session) {
            console.log('✅ Сессия получена через getSession()');
            return session;
        }
        
        
        console.log('⚠️ getSession() вернул null, пробуем getUser()...');
        const { data: { user }, error: userError } = await window.supabase.auth.getUser();
        
        if (userError) {
            console.error('❌ Ошибка getUser():', userError);
            return null;
        }
        
        if (user) {
            console.log('✅ Пользователь найден через getUser()');
           
            return { user: user };
        }
        
        console.log('❌ Пользователь не найден');
        return null;
        
    } catch (err) {
        console.error('❌ Критическая ошибка в getSessionForce():', err);
        return null;
    }
}


document.addEventListener('DOMContentLoaded', function() {
    console.log('📄 DOM загружен');
    
    
    if (!window.supabase) {
        console.error('❌ Supabase НЕ ДОСТУПЕН!');
        alert('Ошибка: Supabase не загружен. Обновите страницу.');
        return;
    }
    
    console.log('✅ Supabase доступен');
    
   
    const timeSlotsContainer = document.getElementById('timeSlots');
    if (timeSlotsContainer) {
        const times = ['09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00'];
        
        timeSlotsContainer.innerHTML = '';
        times.forEach(time => {
            const slot = document.createElement('div');
            slot.className = 'time-slot';
            slot.textContent = time;
            slot.dataset.time = time;
            
            slot.addEventListener('click', function() {
                document.querySelectorAll('.time-slot').forEach(s => s.classList.remove('selected'));
                this.classList.add('selected');
                document.getElementById('selectedTime').value = time;
                console.log('🕐 Выбрано время:', time);
            });
            
            timeSlotsContainer.appendChild(slot);
        });
        console.log('✅ Слоты времени созданы');
    } else {
        console.warn('⚠️ Контейнер #timeSlots не найден');
    }
    
   
    const bookingForm = document.getElementById('bookingForm');
    if (bookingForm) {
       
        const newForm = bookingForm.cloneNode(true);
        bookingForm.parentNode.replaceChild(newForm, bookingForm);
        
       
        newForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            console.log('📝 === ОТПРАВКА ФОРМЫ ===');
            
          
            console.log('🔍 Проверяем сессию перед отправкой...');
            
            
            let session = null;
            let attempts = 0;
            
            while (!session && attempts < 3) {
                attempts++;
                console.log(`🔄 Попытка ${attempts} получить сессию...`);
                
                try {
                    
                    const { data: { session: s }, error } = await window.supabase.auth.getSession();
                    
                    if (error) {
                        console.warn(`⚠️ Попытка ${attempts}: ошибка getSession()`, error);
                    } else if (s) {
                        session = s;
                        console.log(`✅ Попытка ${attempts}: сессия получена!`);
                        break;
                    }
                    
                 
                    if (!s) {
                        console.log(`🔄 Попытка ${attempts}: пробуем refreshSession()`);
                        const { data: { session: refreshed }, error: refreshError } = await window.supabase.auth.refreshSession();
                        
                        if (refreshError) {
                            console.warn(`⚠️ Попытка ${attempts}: ошибка refreshSession()`, refreshError);
                        } else if (refreshed) {
                            session = refreshed;
                            console.log(`✅ Попытка ${attempts}: сессия обновлена!`);
                            break;
                        }
                    }
                    
                    
                    if (!session && attempts < 3) {
                        console.log(`⏳ Ждем 500мс перед попыткой ${attempts + 1}...`);
                        await new Promise(resolve => setTimeout(resolve, 500));
                    }
                    
                } catch (err) {
                    console.error(`❌ Попытка ${attempts}: ошибка`, err);
                }
            }
            
            
            if (!session) {
                console.error('❌ Сессия не найдена после всех попыток!');
                alert('⛔ Сессия истекла. Пожалуйста, войдите заново.');
                window.location.href = 'login.html';
                return;
            }
            
            console.log('✅ Сессия есть! Пользователь:', session.user.email);
            console.log('🆔 ID пользователя:', session.user.id);
            
            
            const name = document.getElementById('name')?.value || '';
            const phone = document.getElementById('phone')?.value || '';
            const service = document.getElementById('service')?.value || '';
            const date = document.getElementById('date')?.value || '';
            const time = document.getElementById('selectedTime')?.value || '';
            
            console.log('📦 Данные формы:', { name, phone, service, date, time });
            
            
            if (!service) {
                alert('Пожалуйста, выберите услугу');
                return;
            }
            if (!date) {
                alert('Пожалуйста, выберите дату');
                return;
            }
            if (!time) {
                alert('Пожалуйста, выберите время');
                return;
            }
            
            
            console.log('💾 Сохраняем запись в базу...');
            
            try {
                const { data, error: insertError } = await window.supabase
                    .from('appointments')
                    .insert([{
                        user_id: session.user.id,
                        name: name || session.user.user_metadata?.name || 'Клиент',
                        phone: phone || session.user.user_metadata?.phone || '',
                        service: service,
                        date: date,
                        time: time,
                        status: 'active',
                        created_at: new Date().toISOString()
                    }]);
                
                if (insertError) {
                    console.error('❌ Ошибка записи:', insertError);
                    alert('❌ Не удалось записаться: ' + insertError.message);
                    return;
                }
                
                console.log('✅ Запись успешно создана!', data);
                alert('✅ Вы успешно записаны!');
                window.location.href = 'profile.html';
                
            } catch (err) {
                console.error('❌ Критическая ошибка при сохранении:', err);
                alert('❌ Произошла ошибка. Попробуйте еще раз.');
            }
        });
        
        console.log('✅ Обработчик формы установлен');
    } else {
        console.error('❌ Форма #bookingForm не найдена!');
    }
});