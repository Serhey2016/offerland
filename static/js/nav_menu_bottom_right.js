const categories = [
    {
        name: 'My list',
        subcategories: ['Task list (All)', 'Contracts', 'Tasks' ]
    },


    {
        name: 'Business Support',
        subcategories: ['All', 'Contracts', 'Tasks', 'Tenders']
    },
    {
        name: 'Personal Support',
        subcategories: ['All', 'Contracts', 'Tasks']
    } //,
    // {
    //     name: 'Personal Support1',
    //     subcategories: ['All', 'Contracts', 'Tasks']
    // }
];

let currentCategoryIndex = 0;

document.addEventListener('DOMContentLoaded', () => {
    // Навигационные стрелки
    const upArrow = document.querySelector('.nav-arrow-up');
    const downArrow = document.querySelector('.nav-arrow-down');
    const leftArrow = document.querySelector('.nav-arrow-left');
    const rightArrow = document.querySelector('.nav-arrow-right');

    // DOM-элементы для названия категории и подкатегории
    const categoryNameElement = document.querySelector('.nav_menu_category_name');
    const subCategoryNameElement = document.querySelector('.nav_menu_sub_category_name_1');
    const subCategoryDotsContainer = document.querySelector('.nav_menu_sub_category_name_2');

    // Точки для категорий (вертикальные)
    const dots = Array.from(document.querySelector('.nav_menu_cat_change').children);
    let activeIndex = dots.findIndex(dot => dot.classList.contains('active'));
    if (activeIndex === -1) activeIndex = 0;

    // Точки для подкатегорий (горизонтальные)
    let subCategoryDots = Array.from(subCategoryDotsContainer.children);
    let activeSubCategoryIndex = subCategoryDots.findIndex(dot => dot.classList.contains('active'));
    if (activeSubCategoryIndex === -1) activeSubCategoryIndex = 0;
    let currentSubCategoryIndex = 0;

    // Функция для обновления точек категорий
    function updateCategoryDots() {
        const requiredDots = categories.length;
        dots.forEach((dot, index) => {
            if (index < requiredDots) {
                dot.style.display = 'block';
            } else {
                dot.style.display = 'none';
            }
            dot.classList.remove('active');
        });
        if (requiredDots > 0) {
            dots[0].classList.add('active');
            activeIndex = 0;
        }
    }

    function setActiveDot(newIndex) {
        dots[activeIndex].classList.remove('active');
        dots[newIndex].classList.add('active');
        activeIndex = newIndex;
    }

    function setActiveSubCategoryDot(newIndex) {
        subCategoryDots[activeSubCategoryIndex].classList.remove('active');
        subCategoryDots[newIndex].classList.add('active');
        activeSubCategoryIndex = newIndex;
    }

    function updateSubCategoryDots(categoryIndex) {
        const requiredDots = categories[categoryIndex].subcategories.length;
        subCategoryDots.forEach((dot, index) => {
            if (index < requiredDots) {
                dot.style.display = 'block';
            } else {
                dot.style.display = 'none';
            }
            dot.classList.remove('active');
        });
        if (requiredDots > 0) {
            subCategoryDots[0].classList.add('active');
            activeSubCategoryIndex = 0;
        }
    }

    function updateCategoryName(index) {
        categoryNameElement.textContent = categories[index].name;
        currentSubCategoryIndex = 0;
        updateSubCategoryName(index, currentSubCategoryIndex);
        updateSubCategoryDots(index);
    }

    function updateSubCategoryName(categoryIndex, subIndex) {
        subCategoryNameElement.textContent = categories[categoryIndex].subcategories[subIndex];
    }

    upArrow.addEventListener('click', () => {
        const newIndex = activeIndex === 0 ? dots.length - 1 : activeIndex - 1;
        setActiveDot(newIndex);
        currentCategoryIndex = newIndex;
        updateCategoryName(currentCategoryIndex);
    });

    downArrow.addEventListener('click', () => {
        const newIndex = activeIndex === dots.length - 1 ? 0 : activeIndex + 1;
        setActiveDot(newIndex);
        currentCategoryIndex = newIndex;
        updateCategoryName(currentCategoryIndex);
    });

    leftArrow.addEventListener('click', () => {
        const subcategories = categories[currentCategoryIndex].subcategories;
        currentSubCategoryIndex = currentSubCategoryIndex === 0 ?
            subcategories.length - 1 : currentSubCategoryIndex - 1;
        setActiveSubCategoryDot(currentSubCategoryIndex);
        updateSubCategoryName(currentCategoryIndex, currentSubCategoryIndex);
    });

    rightArrow.addEventListener('click', () => {
        const subcategories = categories[currentCategoryIndex].subcategories;
        currentSubCategoryIndex = currentSubCategoryIndex === subcategories.length - 1 ?
            0 : currentSubCategoryIndex + 1;
        setActiveSubCategoryDot(currentSubCategoryIndex);
        updateSubCategoryName(currentCategoryIndex, currentSubCategoryIndex);
    });

    // Добавляем поддержку свайпов для мобильных устройств
    const menuContainer = document.querySelector('.nav_menu');
    let touchStartX = 0;
    let touchStartY = 0;

    menuContainer.addEventListener('touchstart', function (e) {
        if (e.touches.length === 1) {
            touchStartX = e.touches[0].clientX;
            touchStartY = e.touches[0].clientY;
        }
    });

    menuContainer.addEventListener('touchend', function (e) {
        if (e.changedTouches.length === 1) {
            const touchEndX = e.changedTouches[0].clientX;
            const touchEndY = e.changedTouches[0].clientY;

            const dx = touchEndX - touchStartX;
            const dy = touchEndY - touchStartY;

            if (Math.abs(dx) > Math.abs(dy)) {
                // Горизонтальный свайп
                if (dx > 30) {
                    // Свайп вправо
                    rightArrow.click();
                } else if (dx < -30) {
                    // Свайп влево
                    leftArrow.click();
                }
            } else {
                // Вертикальный свайп
                if (dy > 30) {
                    // Свайп вниз
                    downArrow.click();
                } else if (dy < -30) {
                    // Свайп вверх
                    upArrow.click();
                }
            }
        }
    });

    // Инициализация
    updateCategoryDots();
    updateCategoryName(currentCategoryIndex);
});
