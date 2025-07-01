// FAB меню для .fixed_circle_menu

document.addEventListener('DOMContentLoaded', function () {
    const menu = document.querySelector('.fixed_circle_menu');
    if (!menu) return;
    let hideTimeout = null;

    function showMenu() {
        menu.classList.add('fab-open');
        if (hideTimeout) clearTimeout(hideTimeout);
    }
    function hideMenu() {
        hideTimeout = setTimeout(() => {
            menu.classList.remove('fab-open');
        }, 400); // задержка скрытия
    }

    menu.addEventListener('mouseenter', showMenu);
    menu.addEventListener('mouseleave', hideMenu);

    // Для тач-устройств: по клику открывать/закрывать
    const mainBtn = menu.querySelector('.main');
    if (mainBtn) {
        mainBtn.addEventListener('click', function (e) {
            e.stopPropagation();
            if (menu.classList.contains('fab-open')) {
                menu.classList.remove('fab-open');
            } else {
                menu.classList.add('fab-open');
            }
        });
    }
    document.body.addEventListener('click', function () {
        menu.classList.remove('fab-open');
    });
});
