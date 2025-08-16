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
    
    // Обработчик для кнопки sub2 (открытие модального окна выбора типа)
    const sub2Btn = menu.querySelector('.sub.sub2');
    if (sub2Btn) {
        sub2Btn.addEventListener('click', function (e) {
            e.stopPropagation();
            console.log('Sub2 button clicked!');
            
            // Показываем модальное окно выбора типа
            const typeSelectionModal = document.getElementById('type-selection-modal');
            if (typeSelectionModal) {
                typeSelectionModal.style.display = 'flex';
                console.log('Type selection modal shown');
                
                // Добавляем обработчики для модального окна
                setupTypeSelectionModal(typeSelectionModal);
            } else {
                console.error('Type selection modal not found!');
            }
        });
    }
    
    // Функция настройки модального окна выбора типа
    function setupTypeSelectionModal(modal) {
        // Обработчики для выбора типа
        modal.querySelectorAll('.type-option').forEach(option => {
            option.addEventListener('click', function() {
                const type = this.dataset.type;
                console.log('Type option clicked:', type);
                
                // Скрываем модальное окно выбора типа
                modal.style.display = 'none';
                
                // Показываем выбранную форму
                showFormByType(type);
            });
        });
        
        // Кнопка закрытия
        const closeBtn = modal.querySelector('.modal_close_btn');
        if (closeBtn) {
            closeBtn.addEventListener('click', function() {
                console.log('Close button clicked');
                modal.style.display = 'none';
            });
        }
        
        // Закрытие по клику вне модального окна
        modal.addEventListener('click', function(e) {
            if (e.target === modal) {
                console.log('Clicked outside modal, closing');
                modal.style.display = 'none';
            }
        });
    }
    
    // Функция показа формы по типу
    function showFormByType(type) {
        console.log('=== SHOW FORM BY TYPE START ===');
        console.log('Type:', type);
        
        // Скрываем модальное окно выбора типа
        const typeSelectionModal = document.getElementById('type-selection-modal');
        if (typeSelectionModal) {
            typeSelectionModal.style.display = 'none';
        }

        // Скрываем все формы
        hideAllForms();
        
        // Показываем выбранную форму
        const formId = getFormIdByType(type);
        if (formId) {
            const form = document.getElementById(formId);
            if (form) {
                console.log('Showing form:', formId);
                form.style.display = 'flex';
            } else {
                console.error('Form not found:', formId);
            }
        } else {
            console.error('Form ID not found for type:', type);
        }
        
        console.log('=== SHOW FORM BY TYPE COMPLETED ===');
    }
    
    // Функция скрытия всех форм
    function hideAllForms() {
        const forms = [
            'advertising-form',
            'job-search-form',
            'time-slot-form',
            'my-list-form',
            'tender-form',
            'project-form'
        ];
        
        forms.forEach(formId => {
            const form = document.getElementById(formId);
            if (form) {
                form.style.display = 'none';
            }
        });
    }
    
    // Функция получения ID формы по типу
    function getFormIdByType(type) {
        const formTypeMap = {
            'advertising': 'advertising-form',
            'job-search': 'job-search-form',
            'time-slot': 'time-slot-form',
            'my-list': 'my-list-form',
            'tender': 'tender-form',
            'project': 'project-form'
        };
        
        return formTypeMap[type] || null;
    }
    
    document.body.addEventListener('click', function () {
        menu.classList.remove('fab-open');
    });
});
