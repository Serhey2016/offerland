console.log('form_filtation.js loaded');

function filterServicesByCategory(catId) {
    const serviceSelect = document.getElementById('service');
    if (!serviceSelect) {
        console.log('serviceSelect not found');
        return;
    }
    const allOptions = Array.from(serviceSelect.options);
    serviceSelect.innerHTML = '';
    serviceSelect.appendChild(allOptions[0]); // default option
    allOptions.slice(1).forEach(opt => {
        if (String(opt.getAttribute('data-category')) === String(catId)) {
            serviceSelect.appendChild(opt);
        }
    });
    console.log('Filtering for category:', catId);
}

function initCategoryServiceFiltering() {
    const categorySelect = document.getElementById('category');
    const serviceSelect = document.getElementById('service');
    if (!categorySelect || !serviceSelect) {
        console.log('categorySelect or serviceSelect not found');
        return;
    }
    const allOptions = Array.from(serviceSelect.options);

    // При загрузке или открытии формы — фильтруем по выбранной или первой категории
    let initialCat = categorySelect.value;
    if (!initialCat) {
        const firstOption = Array.from(categorySelect.options).find(opt => opt.value);
        if (firstOption) initialCat = firstOption.value;
    }
    if (initialCat) {
        categorySelect.value = initialCat;
        filterServicesByCategory(initialCat);
    } else {
        filterServicesByCategory('');
    }

    categorySelect.onchange = function() {
        filterServicesByCategory(this.value);
    };
    console.log('initCategoryServiceFiltering called');
}

document.addEventListener('DOMContentLoaded', function() {
    // Если форма сразу в DOM и не скрыта, инициализируем сразу
    if (document.querySelector('.modal-overlay') && document.querySelector('.modal-overlay').style.display !== 'none') {
        initCategoryServiceFiltering();
    }
    // Следим за появлением модального окна
    const modal = document.querySelector('.modal-overlay');
    if (!modal) return;
    const observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            if (mutation.attributeName === 'style') {
                if (modal.style.display !== 'none') {
                    initCategoryServiceFiltering();
                }
            }
        });
    });
    observer.observe(modal, { attributes: true });
}); 