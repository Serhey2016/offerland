// Job Feed JavaScript Functionality (wrapped to avoid globals)
(function() {
    if (window.__JobSearchFeedBootstrapped__) {
        return; // уже инициализировано
    }
    window.__JobSearchFeedBootstrapped__ = true;

    // Переменные для dropdown menu
    let activeJobSearchDropdown = null;

    document.addEventListener('DOMContentLoaded', function() {
    // === CSS СТИЛИ ДЛЯ CV ФАЙЛОВ ===
    const cvFileStyles = `
        .cv-file-info {
            display: flex;
            align-items: center;
            gap: 10px;
            padding: 10px;
            border: 1px solid #ddd;
            border-radius: 8px;
            background: #f9f9f9;
            margin-top: 10px;
        }
        
        .cv-file-name {
            flex-grow: 1;
            font-weight: 500;
            word-break: break-word;
        }
        
        .cv-file-size {
            font-size: 12px;
            color: #666;
            flex-shrink: 0;
        }
        
        .remove-cv-file-btn {
            background: #ff6b6b;
            color: white;
            border: none;
            border-radius: 50%;
            width: 24px;
            height: 24px;
            cursor: pointer;
            font-size: 16px;
            line-height: 1;
            display: flex;
            align-items: center;
            justify-content: center;
            flex-shrink: 0;
        }
        
        .remove-cv-file-btn:hover {
            background: #ff5252;
        }
    `;
    
    // Добавляем стили на страницу
    if (!document.getElementById('cv-file-upload-styles')) {
        const styleSheet = document.createElement('style');
        styleSheet.id = 'cv-file-upload-styles';
        styleSheet.textContent = cvFileStyles;
        document.head.appendChild(styleSheet);
    }

    // Инициализация функциональности job feed
    
    // Проверяем наличие alertify для обработки ошибок
    if (typeof window.alertify === 'undefined') {
        console.warn('Alertify not found. Installing fallback for error handling...');
        // Создаем простой fallback для alertify
        window.alertify = {
            success: function(message) {
                alert('✅ SUCCESS: ' + message);
            },
            error: function(message) {
                alert('❌ ERROR: ' + message);
            }
        };
    }
    
    // Инициализация компаний и dropdown menu
    initCompanies();
    initJobSearchDropdownMenu();
    
    // Обработчик для кнопки добавления новой активности (+)
    const addActivityButtons = document.querySelectorAll('[id="social_feed_button_container_button2_id"]');
    addActivityButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            const jobSearchId = button.closest('.social_feed2').querySelector('[id^="jobFeedHideIcon_"]').id.replace('jobFeedHideIcon_', '');
            const activityForm = document.getElementById(`add-activity-form-${jobSearchId}`);
            
            if (activityForm) {
                activityForm.style.display = 'block';
                
                // Повторно инициализируем компании для этой формы
                setTimeout(() => {
                    initCompanies();
                    initStatusIcons();
                }, 100);
            }
        });
    });
    
    // Обработчик для сворачивания/разворачивания деталей job feed
    const jobFeedHideIcons = document.querySelectorAll('[id^="jobFeedHideIcon_"]');
    jobFeedHideIcons.forEach(icon => {
        const jobSearchId = icon.id.replace('jobFeedHideIcon_', '');
        icon.addEventListener('click', function() {
            const detailsContainer = document.getElementById(`socialFeedDetails_${jobSearchId}`);
            if (detailsContainer) {
                const isHidden = detailsContainer.style.display === 'none';
                detailsContainer.style.display = isHidden ? 'block' : 'none';
                
                // Анимация иконки
                if (isHidden) {
                    icon.style.transform = 'rotate(180deg)';
                } else {
                    icon.style.transform = 'rotate(0deg)';
                }
            }
        });
    });
    
    // Обработчик для сворачивания/разворачивания деталей каждой активности
    const expandIcons = document.querySelectorAll('[id^="job_feed_ca_expand_icon_"]');
    expandIcons.forEach(icon => {
        // Инициализируем состояние иконки при загрузке страницы
        const activityId = icon.id.replace('job_feed_ca_expand_icon_', '');
        const actionsDetails = document.getElementById(`job_feed_actions_details_${activityId}`);
        
        if (actionsDetails && actionsDetails.classList.contains('collapsed')) {
            // Если детали свернуты, добавляем класс collapsed к иконке
            icon.classList.add('collapsed');
        } else {
            // Если детали развернуты, добавляем класс expanded к иконке
            icon.classList.add('expanded');
        }
        
        icon.addEventListener('click', function() {
            const activityId = icon.id.replace('job_feed_ca_expand_icon_', '');
            const actionsDetails = document.getElementById(`job_feed_actions_details_${activityId}`);
            
            if (actionsDetails) {
                const isCollapsed = actionsDetails.classList.contains('collapsed');
                
                if (isCollapsed) {
                    actionsDetails.classList.remove('collapsed');
                    actionsDetails.classList.add('expanded');
                    icon.classList.remove('collapsed');
                    icon.classList.add('expanded');
                } else {
                    actionsDetails.classList.remove('expanded');
                    actionsDetails.classList.add('collapsed');
                    icon.classList.remove('expanded');
                    icon.classList.add('collapsed');
                }
            }
        });
    });
    
    // Обработчик для закрытия модальных окон
    const closeButtons = document.querySelectorAll('.modal_close_btn');
    closeButtons.forEach(button => {
        button.addEventListener('click', function() {
            const modal = button.closest('.modal-overlay');
            if (modal) {
                modal.style.display = 'none';
            }
        });
    });
    
    // Обработчик для закрытия попапа заметок
    const notesCloseButtons = document.querySelectorAll('.notes-close-btn, .notes-cancel-btn');
    notesCloseButtons.forEach(button => {
        button.addEventListener('click', function() {
            const notesPopup = button.closest('.notes-popup-overlay');
            if (notesPopup) {
                notesPopup.classList.remove('show');
            }
        });
    });
    
    // Закрытие попапа при клике на оверлей
    const notesPopups = document.querySelectorAll('.notes-popup-overlay');
    notesPopups.forEach(popup => {
        popup.addEventListener('click', function(e) {
            if (e.target === this) {
                this.classList.remove('show');
            }
        });
    });
    
    // Закрытие попапа при нажатии Escape
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            const openPopups = document.querySelectorAll('.notes-popup-overlay.show');
            openPopups.forEach(popup => {
                popup.classList.remove('show');
            });
        }
    });
    
    // Обработчик для открытия попапа заметок
    const notesIcons = document.querySelectorAll('[id^="note_button_007_post_info_icon_notes_"]');
    notesIcons.forEach(icon => {
        icon.addEventListener('click', function() {
            const jobSearchId = icon.id.replace('note_button_007_post_info_icon_notes_', '');
            const notesPopup = document.getElementById(`note_button_007_notesPopup_${jobSearchId}`);
            if (notesPopup) {
                notesPopup.classList.add('show');
            }
        });
    });
    
    // Обработчик для форм добавления активности
    const activityForms = document.querySelectorAll('[id^="add-activity-form-"]');
    activityForms.forEach(form => {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const formData = new FormData(form);
            const jobSearchId = form.id.replace('add-activity-form-', '');
            const url = form.action;
            
            fetch(url, {
                method: 'POST',
                body: formData,
                headers: {
                    'X-CSRFToken': formData.get('csrfmiddlewaretoken')
                }
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    window.alertify.success(data.message);
                    form.style.display = 'none';
                    form.reset();
                    
                    // Перезагружаем страницу для отображения новой активности
                    setTimeout(() => {
                        window.location.reload();
                    }, 1000);
                } else {
                    window.alertify.error(data.error || 'Error adding activity');
                }
            })
            .catch(error => {
                console.error('Error:', error);
                window.alertify.error('Network error occurred');
            });
        });
    });
    
    // Обработчик для форм сохранения заметок
    const notesForms = document.querySelectorAll('[id^="note_button_007_notesForm_"]');
    notesForms.forEach(form => {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const formData = new FormData(form);
            const jobSearchId = form.id.replace('note_button_007_notesForm_', '');
            const url = form.action;
            
            fetch(url, {
                method: 'POST',
                body: formData,
                headers: {
                    'X-CSRFToken': formData.get('csrfmiddlewaretoken')
                }
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    window.alertify.success('Notes saved successfully');
                    const notesPopup = form.closest('.notes-popup');
                    if (notesPopup) {
                        notesPopup.style.display = 'none';
                    }
                } else {
                    window.alertify.error(data.error || 'Error saving notes');
                }
            })
            .catch(error => {
                console.error('Error:', error);
                window.alertify.error('Network error occurred');
            });
        });
    });
    });

    // Экспортируем часть API, если нужно в будущем
    window.JobSearchFeed = {
        initCompanies: initCompanies,
        initStatusIcons: initStatusIcons
    };
})();

// Функция инициализации компаний
function initCompanies() {
    const companyContainers = document.querySelectorAll('.company-chip-container');
    
    companyContainers.forEach((container, index) => {
        // Проверяем, были ли уже добавлены обработчики
        if (container.dataset.initialized === 'true') {
            return;
        }
        
        const input = container.querySelector('.company-input-field');
        const dropdown = container.nextElementSibling;
        const hiddenInput = dropdown.nextElementSibling;
        const rawData = container.dataset.allCompanies || '[]';
        
        let allCompanies = [];
        try {
            allCompanies = JSON.parse(rawData);
        } catch (error) {
            allCompanies = [];
        }
        
        if (!input || !hiddenInput || !dropdown) {
            return;
        }
        
        let selectedCompanies = [];
        

        
        // Обработчик клика по выпадающему списку
        dropdown.addEventListener('click', function(e) {
            if (e.target.classList.contains('company-dropdown-item')) {
                const companyName = e.target.dataset.companyName;
                const companyId = e.target.dataset.companyId;
                
                // Устанавливаем выбранную компанию в поле ввода
                input.value = companyName;
                
                // Добавляем стиль для выбранной компании
                input.classList.add('selected');
                
                // Сохраняем выбранную компанию
                selectedCompanies = [{ id: companyId, name: companyName }];
                
                // Обновляем скрытое поле
                updateHiddenInput(hiddenInput, selectedCompanies);
                
                // Скрываем выпадающий список
                dropdown.style.display = 'none';
                

            }
        });
        
        // Обработчик фокуса
        input.addEventListener('focus', function() {
            if (this.value.length > 0 && !selectedCompanies.length) {
                const query = this.value.toLowerCase();
                const filteredCompanies = allCompanies.filter(company => 
                    company.company_name.toLowerCase().includes(query)
                );
                displayCompanyDropdown(filteredCompanies, dropdown);
                dropdown.style.display = 'block';
            }
        });
        
        // Обработчик потери фокуса
        input.addEventListener('blur', function() {
            setTimeout(() => {
                dropdown.style.display = 'none';
            }, 200);
        });
        
        // Обработчик изменения поля ввода (для очистки выбранной компании)
        input.addEventListener('input', function() {
            const query = this.value.toLowerCase();
            
            // Если пользователь изменил текст, очищаем выбранную компанию
            if (query !== selectedCompanies[0]?.name?.toLowerCase()) {
                selectedCompanies = [];
                updateHiddenInput(hiddenInput, selectedCompanies);
                input.classList.remove('selected');
            }
            
            const filteredCompanies = allCompanies.filter(company => 
                company.company_name.toLowerCase().includes(query)
            );
            
            if (query.length > 0) {
                displayCompanyDropdown(filteredCompanies, dropdown);
                dropdown.style.display = 'block';
            } else {
                dropdown.style.display = 'none';
            }
        });
        
        // Обработчик двойного клика для очистки поля
        input.addEventListener('dblclick', function() {
            if (selectedCompanies.length > 0) {
                this.value = '';
                selectedCompanies = [];
                updateHiddenInput(hiddenInput, selectedCompanies);
                this.classList.remove('selected');

            }
        });
        
        // Помечаем контейнер как инициализированный
        container.dataset.initialized = 'true';
    });
    
    // Инициализация полей загрузки CV файлов
    initCVFileUploads();
    
    // Проверяем, есть ли поля загрузки CV файлов на странице
    const foundCVFileUploadAreas = document.querySelectorAll('.file-upload-area');
    
    // Инициализация иконок статуса
    initStatusIcons();
}

// Функция отображения выпадающего списка компаний
function displayCompanyDropdown(companies, dropdown) {
    dropdown.innerHTML = '';
    
    if (companies.length === 0) {
        dropdown.innerHTML = '<div class="company-dropdown-item no-results">No companies found</div>';
        return;
    }
    
    companies.forEach(company => {
        const item = document.createElement('div');
        item.className = 'company-dropdown-item';
        item.dataset.companyId = company.id_company;
        item.dataset.companyName = company.company_name;
        item.textContent = company.company_name;
        dropdown.appendChild(item);
    });
    
    // Позиционируем выпадающий список относительно поля ввода
    const input = dropdown.previousElementSibling.querySelector('.company-input-field');
    if (input) {
        const rect = input.getBoundingClientRect();
        dropdown.style.top = (rect.bottom + 4) + 'px';
        dropdown.style.left = rect.left + 'px';
        dropdown.style.width = rect.width + 'px';
    }
}

// Функция обновления скрытого поля
function updateHiddenInput(hiddenInput, companies) {
    if (hiddenInput) {
        if (companies.length > 0) {
            hiddenInput.value = companies[0].name; // Только первая компания
        } else {
            hiddenInput.value = '';
        }
    }
}

// Функция инициализации полей загрузки CV файлов
function initCVFileUploads() {
    // Ищем только поля загрузки CV файлов в формах активности job search
    const cvFileUploadAreas = document.querySelectorAll('[id^="add-activity-form-"] .file-upload-area');
    
    cvFileUploadAreas.forEach((area, index) => {
        // Проверяем, были ли уже добавлены обработчики
        if (area.dataset.cvFileUploadInitialized === 'true') {
            return;
        }
        
        const fileInput = area.querySelector('input[type="file"]');
        const dropZone = area.querySelector('.drop-zone');
        
        if (!fileInput || !dropZone) {
            return;
        }
        
        // Обработчик клика по drop-zone
        dropZone.addEventListener('click', function(e) {
            e.preventDefault();
            fileInput.click();
        });
        
        // Обработчик изменения файла
        fileInput.addEventListener('change', function() {
            if (this.files.length > 0) {
                const file = this.files[0];
                updateCVFileDisplay(dropZone, file);
            }
        });
        
        // Обработчик drag & drop для CV файлов
        area.addEventListener('dragover', function(e) {
            e.preventDefault();
            this.style.borderColor = '#007bff';
            this.style.backgroundColor = '#f8f9fa';
        });
        
        area.addEventListener('dragleave', function(e) {
            e.preventDefault();
            this.style.borderColor = '#ddd';
            this.style.backgroundColor = 'transparent';
        });
        
        area.addEventListener('drop', function(e) {
            e.preventDefault();
            this.style.borderColor = '#ddd';
            this.style.backgroundColor = 'transparent';
            
            if (e.dataTransfer.files.length > 0) {
                const file = e.dataTransfer.files[0];
                fileInput.files = e.dataTransfer.files;
                updateCVFileDisplay(dropZone, file);
            }
        });
        
        // Помечаем область как инициализированную для CV файлов
        area.dataset.cvFileUploadInitialized = 'true';
    });
}

// Функция обновления отображения выбранного CV файла
function updateCVFileDisplay(dropZone, file) {
    // Проверяем тип файла - только документы
    const allowedTypes = ['.pdf', '.doc', '.docx'];
    const fileExtension = '.' + file.name.split('.').pop().toLowerCase();
    
    if (!allowedTypes.includes(fileExtension)) {
        alert('Please select a valid CV file type: PDF, DOC, or DOCX');
        return;
    }
    
    // Обновляем отображение
    dropZone.innerHTML = `
        <div class="cv-file-info">
            <div class="cv-file-name">${file.name}</div>
            <div class="cv-file-size">${formatCVFileSize(file.size)}</div>
            <button type="button" class="remove-cv-file-btn">&times;</button>
        </div>
    `;
    
    // Добавляем обработчик для кнопки удаления
    const removeBtn = dropZone.querySelector('.remove-cv-file-btn');
    if (removeBtn) {
        removeBtn.addEventListener('click', function(e) {
            e.stopPropagation();
            const fileInput = dropZone.parentElement.querySelector('input[type="file"]');
            fileInput.value = '';
            dropZone.innerHTML = '<p>Drop CV file here or click to upload</p>';
        });
    }
}

// Функция форматирования размера CV файла
function formatCVFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// Функция инициализации иконок статуса
function initStatusIcons() {
    const statusElements = document.querySelectorAll('.job_feed_ca_status');
    
    statusElements.forEach((element, index) => {
        // Проверяем, были ли уже добавлены иконки
        if (element.dataset.initialized === 'true') {
            return;
        }
        
        const statusText = element.textContent.trim();
        
        // Заменяем текст на соответствующую иконку
        const statusIcon = getStatusIcon(statusText);
        if (statusIcon) {
            element.innerHTML = statusIcon;
            element.title = statusText; // Добавляем tooltip с текстом статуса
        }
        
        // Помечаем элемент как инициализированный
        element.dataset.initialized = 'true';
    });
}

// Функция получения иконки по статусу
function getStatusIcon(statusText) {
    const status = statusText.toLowerCase();
    
    if (status.includes('successful') || status.includes('успешно')) {
        return `<svg xmlns="http://www.w3.org/2000/svg" width="38.238" height="36.5" viewBox="0 0 38.238 36.5">
            <path id="verified_24dp_000000_FILL0_wght400_GRAD0_opsz24" d="M53.21-863.5l-3.3-5.562-6.257-1.391.608-6.431L40-881.75l4.258-4.867-.608-6.431,6.257-1.39L53.21-900l5.91,2.52,5.91-2.52,3.3,5.562,6.257,1.39-.608,6.431,4.258,4.867-4.258,4.867.608,6.431-6.257,1.391-3.3,5.562-5.91-2.52Zm1.477-4.432,4.432-1.912,4.519,1.912,2.433-4.171,4.78-1.13-.435-4.867,3.215-3.65-3.215-3.737.435-4.867-4.78-1.043-2.52-4.171-4.432,1.912L54.6-895.568,52.167-891.4l-4.78,1.043.435,4.867-3.215,3.737,3.215,3.65-.435,4.954,4.78,1.043ZM59.119-881.75Zm-1.825,6.17,9.82-9.82-2.433-2.52-7.387,7.387-3.737-3.65-2.433,2.433Z" transform="translate (-40 900)" fill="#a7c70b"/>
        </svg>`;
    } else if (status.includes('unsuccessful') || status.includes('неуспешно')) {
        return `<svg xmlns="http://www.w3.org/2000/svg" width="38.499" height="38.499" viewBox="0 0 38.499 38.499">
            <path id="error_24dp_000000_FILL0_wght400_GRAD0_opsz24" d="M99.25-851.126a1.863,1.863,0,0,0,1.372-.553,1.863,1.863,0,0,0,.553-1.372,1.862,1.862,0,0,0-.553-1.371,1.862,1.862,0,0,0-1.372-.553,1.862,1.862,0,0,0-1.372.553,1.862,1.862,0,0,0-.553,1.371,1.863,1.863,0,0,0,.553,1.372A1.863,1.863,0,0,0,99.25-851.126Zm-1.925-7.7h3.85v-11.55h-3.85ZM99.25-841.5a18.744,18.744,0,0,1-7.507-1.516,19.44,19.44,0,0,1-6.112-4.115,19.438,19.44,0,0,1-4.115-6.112A18.744,18.744,0,0,1,80-860.75a18.744,18.744,0,0,1,1.516-7.507,19.439,19.44,0,0,1,4.115-6.112,19.436,19.44,0,0,1,6.112-4.115A18.742,18.742,0,0,1,99.25-880a18.742,18.742,0,0,1,7.507,1.516,19.436,19.44,0,0,1,6.112,4.115,19.439,19.44,0,0,1,4.115,6.112,18.744,18.744,0,0,1,1.516,7.507,18.744,18.744,0,0,1-1.516,7.507,19.438,19.44,0,0,1-4.115,6.112,19.44,19.44,0,0,1-6.112,4.115A18.744,18.744,0,0,1,99.25-841.5Zm0-3.85a14.862,14.862,0,0,0,10.924-4.476,14.862,14.862,0,0,0,4.476-10.924,14.862,14.862,0,0,0-4.476-10.924A14.863,14.863,0,0,0,99.25-876.15a14.863,14.863,0,0,0-10.924,4.476A14.862,14.862,0,0,0,83.85-860.75a14.862,14.862,0,0,0,4.476,10.924A14.862,14.862,0,0,0,99.25-845.351ZM99.25-860.75Z" transform="translate (-80 880)" fill="#00d5ff"/>
        </svg>`;
    } else if (status.includes('canceled') || status.includes('отменено')) {
        return `<svg xmlns="http://www.w3.org/2000/svg" width="38.499" height="38.499" viewBox="0 0 38.499 38.499">
            <path id="cancel_24dp_000000_FILL0_wght400_GRAD0_opsz24" d="M99.25-851.126a1.863,1.863,0,0,0,1.372-.553,1.863,1.863,0,0,0,.553-1.372,1.862,1.862,0,0,0-.553-1.371,1.862,1.862,0,0,0-1.372-.553,1.862,1.862,0,0,0-1.372.553,1.862,1.862,0,0,0-.553,1.371,1.863,1.863,0,0,0,.553,1.372A1.863,1.863,0,0,0,99.25-851.126Zm-1.925-7.7h3.85v-11.55h-3.85ZM99.25-841.5a18.744,18.744,0,0,1-7.507-1.516,19.44,19.44,0,0,1-6.112-4.115,19.438,19.44,0,0,1-4.115-6.112A18.744,18.744,0,0,1,80-860.75a18.744,18.744,0,0,1,1.516-7.507,19.439,19.44,0,0,1,4.115-6.112,19.436,19.44,0,0,1,6.112-4.115A18.742,18.742,0,0,1,99.25-880a18.742,18.742,0,0,1,7.507,1.516,19.436,19.44,0,0,1,6.112,4.115,19.439,19.44,0,0,1,4.115,6.112,18.744,18.744,0,0,1,1.516,7.507,18.744,18.744,0,0,1-1.516,7.507,19.438,19.44,0,0,1-4.115,6.112,19.44,19.44,0,0,1-6.112,4.115A18.744,18.744,0,0,1,99.25-841.5Zm0-3.85a14.862,14.862,0,0,0,10.924-4.476,14.862,14.862,0,0,0,4.476-10.924,14.862,14.862,0,0,0-4.476-10.924A14.863,14.863,0,0,0,99.25-876.15a14.863,14.863,0,0,0-10.924,4.476A14.862,14.862,0,0,0,83.85-860.75a14.862,14.862,0,0,0,4.476,10.924A14.862,14.862,0,0,0,99.25-845.351ZM99.25-860.75Z" transform="translate (-80 880)" fill="#ff6b6b"/>
        </svg>`;
    }
    
    // Возвращаем null если статус не распознан
    return null;
}

// ===== DROPDOWN MENU ФУНКЦИОНАЛ ДЛЯ JOB SEARCH =====

// Инициализация dropdown menu для job search постов
function initJobSearchDropdownMenu() {
    // Ищем все dropdown menu по их ID
    const menuElements = document.querySelectorAll('[id^="jsf_dropdown_menu_"]');
    
    menuElements.forEach((menuElement, index) => {
        const postId = menuElement.id.replace('jsf_dropdown_menu_', '');
        const dropdown = document.getElementById(`jsf_dropdown_content_${postId}`);
        
        if (!dropdown) return;
        
        // Добавляем обработчик клика на кнопку меню
        menuElement.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            
            // Закрываем все открытые dropdown
            document.querySelectorAll('[id^="jsf_dropdown_content_"]').forEach(d => {
                d.classList.remove('show');
            });
            
            // Переключаем текущий dropdown
            if (dropdown.classList.contains('show')) {
                dropdown.classList.remove('show');
            } else {
                dropdown.classList.add('show');
            }
        });
        
        // Добавляем обработчики на пункты меню
        const menuItems = dropdown.querySelectorAll('.jsf_dropdown_item');
        
        menuItems.forEach(item => {
            item.addEventListener('click', function(e) {
                e.preventDefault();
                e.stopPropagation();
                
                const action = this.dataset.action;
                const itemPostId = this.dataset.id;
                
                handleJobSearchDropdownAction(action, itemPostId, menuElement.closest('.social_feed2'));
                
                // Закрываем dropdown после действия
                dropdown.classList.remove('show');
            });
        });
    });
    
    // Закрытие dropdown при клике вне его
    document.addEventListener('click', function(e) {
        // Validate event target
        if (!e.target || typeof e.target.closest !== 'function') {
            return;
        }
        
        if (!e.target.closest('[id^="jsf_dropdown_menu_"]') && !e.target.closest('[id^="jsf_dropdown_content_"]')) {
            document.querySelectorAll('[id^="jsf_dropdown_content_"]').forEach(d => {
                d.classList.remove('show');
            });
        }
    });
}

// Обработчик действий dropdown menu для job search
function handleJobSearchDropdownAction(action, postId, post) {
    switch (action) {
        case 'start':
            handleJobSearchStartAction(postId, post);
            break;
        case 'edit':
            handleJobSearchEditAction(postId, post);
            break;
        case 'publish':
            handleJobSearchPublishAction(postId, post);
            break;
        case 'remove':
            handleJobSearchRemoveAction(postId, post);
            break;
        default:
            console.warn('Job Search: Unknown action:', action);
    }
}

// Обработчик действия Start для job search
function handleJobSearchStartAction(postId, post) {
    // Получаем CSRF токен
    const csrftoken = getCookie('csrftoken');
    
    if (!csrftoken) {
        alert('CSRF token not found. Please refresh the page and try again.');
        return;
    }
    
    // Отправляем AJAX запрос для установки даты начала
    fetch(`/services_and_projects/start_job_search/${postId}/`, {
        method: 'POST',
        headers: {
            'X-CSRFToken': csrftoken,
            'Content-Type': 'application/json',
        },
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            // Обновляем отображение даты на странице
            const startDateElement = document.getElementById(`post_start_date_${postId}`);
            if (startDateElement) {
                startDateElement.textContent = data.start_date;
            }
            
            // Показываем уведомление об успехе
            if (typeof window.alertify !== 'undefined') {
                window.alertify.success('Job search started successfully!');
            } else {
                alert('Job search started successfully!');
            }
        } else if (data.warning) {
            // Показываем предупреждение
            if (typeof window.alertify !== 'undefined') {
                window.alertify.warning(data.message);
            } else {
                alert(data.message);
            }
        } else {
            // Показываем ошибку
            if (typeof window.alertify !== 'undefined') {
                window.alertify.error('Error starting job search: ' + data.error);
            } else {
                alert('Error starting job search: ' + data.error);
            }
        }
    })
    .catch(error => {
        console.error('Error:', error);
        
        // Показываем ошибку
        if (typeof window.alertify !== 'undefined') {
            window.alertify.error('Network error occurred while starting job search');
        } else {
            alert('Network error occurred while starting job search');
        }
    });
}

// Обработчик редактирования для job search
function handleJobSearchEditAction(postId, post) {
    // Открываем форму редактирования для Job Search
    if (typeof openEditForm === 'function') {
        openEditForm('job-search', postId);
    } else {
        console.error('openEditForm function not found');
        if (typeof window.alertify !== 'undefined') {
            window.alertify.error('Edit functionality not available');
        } else {
            alert('Edit functionality not available');
        }
    }
}

// Обработчик публикации для job search
function handleJobSearchPublishAction(postId, post) {
    // Здесь можно добавить логику публикации
    // Например, показать подтверждение и опубликовать пост
    if (confirm('Are you sure you want to publish this job search post?')) {
        if (typeof window.alertify !== 'undefined') {
            window.alertify.success('Publish functionality coming soon...');
        } else {
            alert('Publish functionality coming soon...');
        }
    }
}

// Обработчик удаления для job search
function handleJobSearchRemoveAction(postId, post) {
    // Здесь можно добавить логику удаления
    // Например, показать подтверждение и удалить пост
    if (confirm('Are you sure you want to remove this job search post?')) {
        if (typeof window.alertify !== 'undefined') {
            window.alertify.success('Job search post removed successfully!');
        } else {
            alert('Job search post removed successfully!');
        }
        // Здесь можно добавить AJAX запрос для удаления
    }
}

// ===== EDIT FORM FUNCTIONALITY =====

// Функция для открытия формы редактирования
function openEditForm(formType, itemId) {
    console.log('Opening edit form for:', formType, 'ID:', itemId);
    
    // Определяем ID формы на основе типа
    let formId;
    let formTitle;
    
    switch(formType) {
        case 'my-list':
            formId = 'my-list-form';
            formTitle = 'Edit Task';
            break;
        case 'tender':
            formId = 'tender-form';
            formTitle = 'Edit Tender';
            break;
        case 'project':
            formId = 'project-form';
            formTitle = 'Edit Project';
            break;
        case 'advertising':
            formId = 'advertising-form';
            formTitle = 'Edit Advertising';
            break;
        case 'job-search':
            formId = 'job-search-form';
            formTitle = 'Edit Job Search';
            break;
        default:
            console.error('Unknown form type:', formType);
            return;
    }
    
    // Находим форму
    const form = document.getElementById(formId);
    if (!form) {
        console.error('Form not found:', formId);
        return;
    }
    
    // Загружаем данные для редактирования
    loadEditData(formType, itemId, form);
    
            // Показываем форму
        form.style.display = 'flex';
        
        // Добавляем класс для анимации
        setTimeout(() => {
            form.classList.add('show');
        }, 10);
    
    // Обновляем заголовок формы
    const titleElement = form.querySelector('h2, .modal-header-actions h2');
    if (titleElement) {
        titleElement.textContent = formTitle;
    }
    
    // Добавляем скрытое поле для ID редактируемого элемента
    let hiddenIdField = form.querySelector('input[name="edit_item_id"]');
    if (!hiddenIdField) {
        hiddenIdField = document.createElement('input');
        hiddenIdField.type = 'hidden';
        hiddenIdField.name = 'edit_item_id';
        form.querySelector('form').appendChild(hiddenIdField);
    }
    hiddenIdField.value = itemId;
    
    // Изменяем действие формы на update
    const formElement = form.querySelector('form');
    if (formElement) {
        formElement.action = formElement.action.replace('submit_form', 'update_form');
    }
}

// Функция для загрузки данных для редактирования
function loadEditData(formType, itemId, form) {
    console.log('Loading edit data for:', formType, 'ID:', itemId);
    
    // Получаем CSRF токен
    const csrftoken = getCookie('csrftoken');
    
    if (!csrftoken) {
        alert('CSRF token not found. Please refresh the page and try again.');
        return;
    }
    
    // Отправляем AJAX запрос для получения данных
    fetch(`/services_and_projects/get_edit_data/${formType}/${itemId}/`, {
        method: 'GET',
        headers: {
            'X-CSRFToken': csrftoken,
            'Content-Type': 'application/json',
        },
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            // Заполняем форму данными
            populateEditForm(formType, form, data.data);
        } else {
            console.error('Error loading edit data:', data.error);
            if (typeof window.alertify !== 'undefined') {
                window.alertify.error('Error loading data for editing: ' + data.error);
            } else {
                alert('Error loading data for editing: ' + data.error);
            }
        }
    })
    .catch(error => {
        console.error('Error loading edit data:', error);
        if (typeof window.alertify !== 'undefined') {
            window.alertify.error('Network error occurred while loading data');
        } else {
            alert('Network error occurred while loading data');
        }
    });
}

// Функция для заполнения формы данными
function populateEditForm(formType, form, data) {
    console.log('Populating form with data:', data);
    
    // Заполняем основные поля
    const titleField = form.querySelector(`#${formType}-title`);
    if (titleField && data.title) {
        titleField.value = data.title;
    }
    
    const descriptionField = form.querySelector(`#${formType}-description`);
    if (descriptionField && data.description) {
        descriptionField.value = data.description;
    }
    
    // Заполняем категорию
    const categoryField = form.querySelector(`#${formType}-category`);
    if (categoryField && data.category) {
        categoryField.value = data.category;
    }
    
    // Заполняем сервис
    const serviceField = form.querySelector(`#${formType}-service`);
    if (serviceField && data.service) {
        serviceField.value = data.service;
    }
    
    // Заполняем статус
    const statusField = form.querySelector(`#${formType}-status`);
    if (statusField && data.status) {
        statusField.value = data.status;
    }
    
    // Заполняем документы
    const documentsField = form.querySelector(`#${formType}-documents`);
    if (documentsField && data.documents) {
        documentsField.value = data.documents;
    }
    
    // Заполняем хештеги
    if (data.hashtags && data.hashtags.length > 0) {
        const hashtagsContainer = form.querySelector(`#${formType}-hashtags-container`);
        const hashtagsHidden = form.querySelector(`#${formType}-hashtags-hidden`);
        
        if (hashtagsContainer && hashtagsHidden) {
            // Очищаем существующие хештеги
            hashtagsContainer.innerHTML = '';
            
            // Добавляем input для новых хештегов
            const hashtagsInput = document.createElement('input');
            hashtagsInput.type = 'text';
            hashtagsInput.id = `${formType}-hashtags-input`;
            hashtagsInput.placeholder = 'Start typing tag...';
            hashtagsInput.autocomplete = 'off';
            hashtagsInput.className = 'hashtags-input-field';
            hashtagsContainer.appendChild(hashtagsInput);
            
            // Добавляем существующие хештеги как чипы
            data.hashtags.forEach(tag => {
                const tagChip = document.createElement('span');
                tagChip.className = 'hashtag-chip';
                tagChip.textContent = tag.tag;
                tagChip.dataset.tag = tag.tag;
                
                const removeBtn = document.createElement('span');
                removeBtn.className = 'hashtag-remove';
                removeBtn.innerHTML = '&times;';
                removeBtn.onclick = function() {
                    tagChip.remove();
                    updateHashtagsHidden(hashtagsContainer, hashtagsHidden);
                };
                
                tagChip.appendChild(removeBtn);
                hashtagsContainer.appendChild(tagChip);
            });
            
            // Обновляем скрытое поле
            updateHashtagsHidden(hashtagsContainer, hashtagsHidden);
        }
    }
    
    // Заполняем исполнителей
    if (data.performers && data.performers.length > 0) {
        const performersList = form.querySelector(`#${formType}-performers-list`);
        if (performersList) {
            performersList.innerHTML = '';
            data.performers.forEach(performer => {
                const performerItem = document.createElement('div');
                performerItem.className = 'performer-item';
                performerItem.textContent = performer.get_full_name || performer.username;
                performerItem.dataset.performerId = performer.id;
                
                const removeBtn = document.createElement('span');
                removeBtn.className = 'performer-remove';
                removeBtn.innerHTML = '&times;';
                removeBtn.onclick = function() {
                    performerItem.remove();
                };
                
                performerItem.appendChild(removeBtn);
                performersList.appendChild(performerItem);
            });
        }
    }
    
    // Заполняем включенный проект
    const projectIncludedField = form.querySelector(`#${formType}-project-included`);
    if (projectIncludedField && data.project_included) {
        projectIncludedField.value = data.project_included;
    }
    
    // Заполняем фото (для форм с фото)
    if (data.photos && data.photos.length > 0) {
        const photosField = form.querySelector(`#${formType}-photos`);
        if (photosField && photosField.type === 'text') {
            // Для текстового поля (ссылка на фото)
            photosField.value = data.photos[0] || '';
        }
        // Для файловых полей можно добавить предварительный просмотр
    }
}

// Вспомогательная функция для обновления скрытого поля хештегов
function updateHashtagsHidden(container, hiddenField) {
    const tags = Array.from(container.querySelectorAll('.hashtag-chip')).map(chip => chip.dataset.tag);
    hiddenField.value = JSON.stringify(tags);
}

// Вспомогательная функция для получения CSRF токена
function getCookie(name) {
    let cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        const cookies = document.cookie.split(';');
        for (let i = 0; i < cookies.length; i++) {
            const cookie = cookies[i].trim();
            if (cookie.substring(0, name.length + 1) === (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}


