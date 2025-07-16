console.log('form_filtation.js loaded');

let serviceOptionsBackup = null;

function filterServicesByCategory(catId) {
    const serviceSelect = document.getElementById('service');
    if (!serviceSelect) {
        console.log('serviceSelect not found');
        return;
    }
    // Восстанавливаем все опции из бэкапа
    serviceSelect.innerHTML = '';
    serviceOptionsBackup.forEach(opt => {
        if (!opt.getAttribute('data-category') || String(opt.getAttribute('data-category')) === String(catId)) {
            serviceSelect.appendChild(opt.cloneNode(true));
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
    // Делаем бэкап всех опций (включая дефолтную)
    serviceOptionsBackup = Array.from(serviceSelect.options);

    // Не меняем выбранную категорию, если она пустая (оставляем -- Select category --)
    let initialCat = categorySelect.value;
    filterServicesByCategory(initialCat); // если пусто — фильтруем по пустому

    categorySelect.onchange = function() {
        filterServicesByCategory(this.value);
    };
    console.log('initCategoryServiceFiltering called');
}

// Глобальная функция для инициализации фильтрации категорий и сервисов
window.initCategoryServiceSelects = function() {
    initCategoryServiceFiltering();
};

document.addEventListener('DOMContentLoaded', function() {
    if (document.querySelector('.modal-overlay') && document.querySelector('.modal-overlay').style.display !== 'none') {
        initCategoryServiceFiltering();
    }
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

// --- Hashtag Chips & Dropdown ---
(function() {
    // Получаем allTags из data-атрибута контейнера
    const container = document.getElementById('hashtags-container');
    const input = document.getElementById('hashtags-input');
    const dropdown = document.getElementById('hashtags-dropdown');
    const hiddenInput = document.getElementById('hashtags-hidden');
    if (!container || !input || !dropdown || !hiddenInput) return;
    let allTags = [];
    try {
        allTags = JSON.parse(container.getAttribute('data-all-tags'));
    } catch (e) {
        allTags = [];
    }
    let selectedTags = [];

    input.addEventListener('input', function() {
        const value = input.value.toLowerCase();
        dropdown.innerHTML = '';
        if (value.length === 0) {
            dropdown.style.display = 'none';
            return;
        }
        const filtered = allTags.filter(tag =>
            tag.tag.toLowerCase().includes(value) &&
            !selectedTags.some(t => t.id === tag.id)
        );
        if (filtered.length === 0) {
            dropdown.style.display = 'none';
            return;
        }
        filtered.forEach(tag => {
            const option = document.createElement('div');
            option.className = 'dropdown-item';
            option.textContent = tag.tag;
            option.onclick = () => {
                addTag(tag);
                input.value = '';
                dropdown.style.display = 'none';
            };
            dropdown.appendChild(option);
        });
        dropdown.style.display = 'block';
    });

    function addTag(tag) {
        if (selectedTags.some(t => t.id === tag.id)) return;
        selectedTags.push(tag);
        renderTags();
    }
    function removeTag(tagId) {
        selectedTags = selectedTags.filter(t => t.id !== tagId);
        renderTags();
    }
    function renderTags() {
        container.querySelectorAll('.hashtag-chip').forEach(e => e.remove());
        selectedTags.forEach(tag => {
            const chip = document.createElement('span');
            chip.className = 'hashtag-chip';
            chip.textContent = tag.tag + ' ';
            const close = document.createElement('span');
            close.className = 'hashtag-chip-close';
            close.innerHTML = '&times;';
            close.onclick = () => removeTag(tag.id);
            chip.appendChild(close);
            container.insertBefore(chip, input);
        });
        hiddenInput.value = selectedTags.map(t => t.id).join(',');
    }
    document.addEventListener('click', function(e) {
        if (!container.contains(e.target) && !dropdown.contains(e.target)) {
            dropdown.style.display = 'none';
        }
    });
    container.addEventListener('click', function() {
        input.focus();
    });
    input.addEventListener('focus', function() {
        if (input.value.length === 0) {
            dropdown.innerHTML = '';
            const filtered = allTags.filter(tag => !selectedTags.some(t => t.id === tag.id));
            filtered.forEach(tag => {
                const option = document.createElement('div');
                option.className = 'dropdown-item';
                option.textContent = tag.tag;
                option.onclick = () => {
                    addTag(tag);
                    input.value = '';
                    dropdown.style.display = 'none';
                };
                dropdown.appendChild(option);
            });
            if (filtered.length > 0) dropdown.style.display = 'block';
        }
    });
    input.addEventListener('keydown', function(e) {
        if (e.key === 'Enter' && dropdown.style.display === 'block') {
            const first = dropdown.querySelector('.dropdown-item');
            if (first) {
                first.click();
                e.preventDefault();
            }
        }
        if (e.key === 'Backspace' && input.value === '' && selectedTags.length > 0) {
            removeTag(selectedTags[selectedTags.length - 1].id);
        }
    });
    window.addEventListener('DOMContentLoaded', function() {
        // Если нужно — подгрузить уже выбранные теги
    });
})(); 