document.addEventListener("DOMContentLoaded", function() {

    // форма
    const form = document.querySelector("form");
    if (form) {
        form.addEventListener("submit", function(e) {
            e.preventDefault();
            alert("Заявка отправлена!");
        });
    }

    // слайдер
    const track = document.querySelector('.team-track');
    const next = document.querySelector('.next');
    const prev = document.querySelector('.prev');

    if (!track || !next || !prev) {
        console.log("Слайдер не найден");
        return;
    }

    let position = 0;
    const step = 300;

    next.addEventListener('click', () => {
        position -= step;
        track.style.transform = `translateX(${position}px)`;
    });

    prev.addEventListener('click', () => {
        position += step;
        track.style.transform = `translateX(${position}px)`;
    });

});

document.querySelector(".booking-form").addEventListener("submit", function(e) {
    e.preventDefault();
    document.getElementById("success-message").textContent = "Вы успешно записались!";
});