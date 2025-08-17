// Job Feed JavaScript Functionality

document.addEventListener('DOMContentLoaded', function() {
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
    
    // Инициализация компаний
    initCompanies();
    
    // Проверяем, есть ли формы активности на странице
    const foundActivityForms = document.querySelectorAll('[id^="add-activity-form-"]');
    console.log('Found activity forms:', foundActivityForms.length);
    
    // Проверяем, есть ли контейнеры компаний на странице
    const foundCompanyContainers = document.querySelectorAll('.company-chip-container');
    console.log('Found company containers:', foundCompanyContainers.length);
    
    // Проверяем, есть ли контейнеры компаний в формах активности
    foundActivityForms.forEach((form, index) => {
        const companyContainer = form.querySelector('.company-chip-container');
        console.log(`Form ${index} company container:`, companyContainer);
        if (companyContainer) {
            console.log(`Form ${index} company container data:`, companyContainer.dataset.allCompanies);
        }
    });
    
    // Обработчик для кнопки добавления новой активности (+)
    const addActivityButtons = document.querySelectorAll('[id="social_feed_button_container_button2_id"]');
    addActivityButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            const jobSearchId = button.closest('.social_feed2').querySelector('[id^="jobFeedHideIcon_"]').id.replace('jobFeedHideIcon_', '');
            const activityForm = document.getElementById(`add-activity-form-${jobSearchId}`);
            
            if (activityForm) {
                activityForm.style.display = 'block';
                console.log('Add activity form opened for JobSearch ID:', jobSearchId);
                
                // Повторно инициализируем компании для этой формы
                setTimeout(() => {
                    initCompanies();
                    initStatusIcons();
                }, 100);
            } else {
                console.error('Add activity form not found for JobSearch ID:', jobSearchId);
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
            const notesPopup = button.closest('.notes-popup');
            if (notesPopup) {
                notesPopup.style.display = 'none';
            }
        });
    });
    
    // Обработчик для открытия попапа заметок
    const notesIcons = document.querySelectorAll('[id^="note_button_007_post_info_icon_notes_"]');
    notesIcons.forEach(icon => {
        icon.addEventListener('click', function() {
            const jobSearchId = icon.id.replace('note_button_007_post_info_icon_notes_', '');
            const notesPopup = document.getElementById(`note_button_007_notesPopup_${jobSearchId}`);
            if (notesPopup) {
                notesPopup.style.display = 'block';
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

// Функция инициализации компаний
function initCompanies() {
    const companyContainers = document.querySelectorAll('.company-chip-container');
    console.log('Found company containers:', companyContainers.length);
    
    companyContainers.forEach((container, index) => {
        // Проверяем, были ли уже добавлены обработчики
        if (container.dataset.initialized === 'true') {
            console.log(`Company container ${index}: Already initialized, skipping`);
            return;
        }
        
        const input = container.querySelector('.company-input-field');
        const dropdown = container.nextElementSibling;
        const hiddenInput = dropdown.nextElementSibling;
        const rawData = container.dataset.allCompanies || '[]';
        console.log(`Container ${index} raw data:`, rawData);
        
        let allCompanies = [];
        try {
            allCompanies = JSON.parse(rawData);
            console.log(`Container ${index} parsed companies:`, allCompanies);
        } catch (error) {
            console.error(`Container ${index} JSON parse error:`, error);
            console.error('Raw data:', rawData);
            allCompanies = [];
        }
        
        console.log(`Container ${index}:`, {
            container: container,
            input: input,
            hiddenInput: hiddenInput,
            dropdown: dropdown,
            allCompaniesCount: allCompanies.length,
            allCompanies: allCompanies,
            containerHTML: container.outerHTML,
            nextSibling: container.nextElementSibling,
            nextNextSibling: container.nextElementSibling?.nextElementSibling
        });
        
        if (!input || !hiddenInput || !dropdown) {
            console.log(`Container ${index}: Missing required elements`);
            console.log('Input:', input);
            console.log('HiddenInput:', hiddenInput);
            console.log('Dropdown:', dropdown);
            return;
        }
        
        // Проверяем, что dropdown имеет правильный класс
        console.log(`Container ${index} dropdown classes:`, dropdown.className);
        console.log(`Container ${index} dropdown tag:`, dropdown.tagName);
        
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
                
                console.log('Company selected:', { id: companyId, name: companyName });
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
            console.log('Input event, query:', query);
            console.log('All companies available:', allCompanies);
            
            // Если пользователь изменил текст, очищаем выбранную компанию
            if (query !== selectedCompanies[0]?.name?.toLowerCase()) {
                selectedCompanies = [];
                updateHiddenInput(hiddenInput, selectedCompanies);
                input.classList.remove('selected');
            }
            
            const filteredCompanies = allCompanies.filter(company => 
                company.company_name.toLowerCase().includes(query)
            );
            console.log('Filtered companies:', filteredCompanies);
            
            if (query.length > 0) {
                displayCompanyDropdown(filteredCompanies, dropdown);
                dropdown.style.display = 'block';
                console.log('Dropdown shown, display:', dropdown.style.display);
                console.log('Dropdown element:', dropdown);
                console.log('Dropdown computed style:', window.getComputedStyle(dropdown));
                console.log('Dropdown position:', {
                    top: dropdown.style.top,
                    left: dropdown.style.left,
                    width: dropdown.style.width
                });
            } else {
                dropdown.style.display = 'none';
                console.log('Dropdown hidden');
            }
        });
        
        // Обработчик двойного клика для очистки поля
        input.addEventListener('dblclick', function() {
            if (selectedCompanies.length > 0) {
                this.value = '';
                selectedCompanies = [];
                updateHiddenInput(hiddenInput, selectedCompanies);
                this.classList.remove('selected');
                console.log('Field cleared');
            }
        });
        
        // Помечаем контейнер как инициализированный
        container.dataset.initialized = 'true';
        console.log(`Company container ${index}: Initialized successfully`);
    });
    
    // Инициализация полей загрузки файлов
    initFileUploads();
    
    // Проверяем, есть ли поля загрузки файлов на странице
    const foundFileUploadAreas = document.querySelectorAll('.file-upload-area');
    console.log('Found file upload areas:', foundFileUploadAreas.length);
    
    // Инициализация иконок статуса
    initStatusIcons();
}

// Функция отображения выпадающего списка компаний
function displayCompanyDropdown(companies, dropdown) {
    console.log('Displaying dropdown with companies:', companies);
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
    
    console.log('Dropdown HTML:', dropdown.innerHTML);
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

// Функция инициализации полей загрузки файлов
function initFileUploads() {
    const fileUploadAreas = document.querySelectorAll('.file-upload-area');
    console.log('Initializing file uploads, found areas:', fileUploadAreas.length);
    
    fileUploadAreas.forEach((area, index) => {
        // Проверяем, были ли уже добавлены обработчики
        if (area.dataset.initialized === 'true') {
            console.log(`File upload area ${index}: Already initialized, skipping`);
            return;
        }
        
        const fileInput = area.querySelector('input[type="file"]');
        const dropZone = area.querySelector('.drop-zone');
        
        console.log(`File upload area ${index}:`, {
            area: area,
            fileInput: fileInput,
            dropZone: dropZone
        });
        
        if (!fileInput || !dropZone) {
            console.log(`File upload area ${index}: Missing required elements`);
            return;
        }
        
        // Обработчик клика по drop-zone
        dropZone.addEventListener('click', function(e) {
            e.preventDefault();
            console.log('Drop zone clicked, triggering file input');
            fileInput.click();
        });
        
        // Обработчик изменения файла
        fileInput.addEventListener('change', function() {
            console.log('File input changed, files:', this.files);
            if (this.files.length > 0) {
                const file = this.files[0];
                console.log('Selected file:', file.name, file.size, file.type);
                updateFileDisplay(dropZone, file);
            }
        });
        
        // Обработчик drag & drop
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
                updateFileDisplay(dropZone, file);
            }
        });
        
        // Помечаем область как инициализированную
        area.dataset.initialized = 'true';
        console.log(`File upload area ${index}: Initialized successfully`);
    });
}

// Функция обновления отображения выбранного файла
function updateFileDisplay(dropZone, file) {
    // Проверяем тип файла
    const allowedTypes = ['.pdf', '.doc', '.docx'];
    const fileExtension = '.' + file.name.split('.').pop().toLowerCase();
    
    if (!allowedTypes.includes(fileExtension)) {
        alert('Please select a valid file type: PDF, DOC, or DOCX');
        return;
    }
    
    // Обновляем отображение
    dropZone.innerHTML = `
        <div class="file-info">
            <div class="file-name">${file.name}</div>
            <div class="file-size">${formatFileSize(file.size)}</div>
            <button type="button" class="remove-file-btn">&times;</button>
        </div>
    `;
    
    // Добавляем обработчик для кнопки удаления
    const removeBtn = dropZone.querySelector('.remove-file-btn');
    if (removeBtn) {
        removeBtn.addEventListener('click', function(e) {
            e.stopPropagation();
            const fileInput = dropZone.parentElement.querySelector('input[type="file"]');
            fileInput.value = '';
            dropZone.innerHTML = '<p>Drop CV file here or click to upload</p>';
        });
    }
}

// Функция форматирования размера файла
function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// Функция инициализации иконок статуса
function initStatusIcons() {
    const statusElements = document.querySelectorAll('.job_feed_ca_status');
    console.log('Found status elements:', statusElements.length);
    
    statusElements.forEach((element, index) => {
        // Проверяем, были ли уже добавлены иконки
        if (element.dataset.initialized === 'true') {
            console.log(`Status element ${index}: Already initialized, skipping`);
            return;
        }
        
        const statusText = element.textContent.trim();
        console.log(`Status element ${index}: Status text: "${statusText}"`);
        
        // Заменяем текст на соответствующую иконку
        const statusIcon = getStatusIcon(statusText);
        if (statusIcon) {
            element.innerHTML = statusIcon;
            element.title = statusText; // Добавляем tooltip с текстом статуса
            console.log(`Status element ${index}: Icon replaced successfully`);
        } else {
            console.log(`Status element ${index}: No icon found for status: "${statusText}"`);
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
            <path id="verified_24dp_000000_FILL0_wght400_GRAD0_opsz24" d="M53.21-863.5l-3.3-5.562-6.257-1.391.608-6.431L40-881.75l4.258-4.867-.608-6.431,6.257-1.39L53.21-900l5.91,2.52,5.91-2.52,3.3,5.562,6.257,1.39-.608,6.431,4.258,4.867-4.258,4.867.608,6.431-6.257,1.391-3.3,5.562-5.91-2.52Zm1.477-4.432,4.432-1.912,4.519,1.912,2.433-4.171,4.78-1.13-.435-4.867,3.215-3.65-3.215-3.737.435-4.867-4.78-1.043-2.52-4.171-4.432,1.912L54.6-895.568,52.167-891.4l-4.78,1.043.435,4.867-3.215,3.737,3.215,3.65-.435,4.954,4.78,1.043ZM59.119-881.75Zm-1.825,6.17,9.82-9.82-2.433-2.52-7.387,7.387-3.737-3.65-2.433,2.433Z" transform="translate(-40 900)" fill="#a7c70b"/>
        </svg>`;
    } else if (status.includes('unsuccessful') || status.includes('неуспешно')) {
        return `<svg xmlns="http://www.w3.org/2000/svg" width="38.499" height="38.499" viewBox="0 0 38.499 38.499">
            <path id="error_24dp_000000_FILL0_wght400_GRAD0_opsz24" d="M99.25-851.126a1.863,1.863,0,0,0,1.372-.553,1.863,1.863,0,0,0,.553-1.372,1.862,1.862,0,0,0-.553-1.371,1.862,1.862,0,0,0-1.372-.553,1.862,1.862,0,0,0-1.372.553,1.862,1.862,0,0,0-.553,1.371,1.863,1.863,0,0,0,.553,1.372A1.863,1.863,0,0,0,99.25-851.126Zm-1.925-7.7h3.85v-11.55h-3.85ZM99.25-841.5a18.744,18.744,0,0,1-7.507-1.516,19.44,19.44,0,0,1-6.112-4.115,19.438,19.44,0,0,1-4.115-6.112A18.744,18.744,0,0,1,80-860.75a18.744,18.744,0,0,1,1.516-7.507,19.439,19.44,0,0,1,4.115-6.112,19.436,19.44,0,0,1,6.112-4.115A18.742,18.742,0,0,1,99.25-880a18.742,18.742,0,0,1,7.507,1.516,19.436,19.44,0,0,1,6.112,4.115,19.439,19.44,0,0,1,4.115,6.112,18.744,18.744,0,0,1,1.516,7.507,18.744,18.744,0,0,1-1.516,7.507,19.438,19.44,0,0,1-4.115,6.112,19.44,19.44,0,0,1-6.112,4.115A18.744,18.744,0,0,1,99.25-841.5Zm0-3.85a14.862,14.862,0,0,0,10.924-4.476,14.862,14.862,0,0,0,4.476-10.924,14.862,14.862,0,0,0-4.476-10.924A14.863,14.863,0,0,0,99.25-876.15a14.863,14.863,0,0,0-10.924,4.476A14.862,14.862,0,0,0,83.85-860.75a14.862,14.862,0,0,0,4.476,10.924A14.862,14.862,0,0,0,99.25-845.351ZM99.25-860.75Z" transform="translate(-80 880)" fill="#00d5ff"/>
        </svg>`;
    } else if (status.includes('canceled') || status.includes('отменено')) {
        return `<svg xmlns="http://www.w3.org/2000/svg" width="38.499" height="38.499" viewBox="0 0 38.499 38.499">
            <path id="cancel_24dp_000000_FILL0_wght400_GRAD0_opsz24" d="M99.25-851.126a1.863,1.863,0,0,0,1.372-.553,1.863,1.863,0,0,0,.553-1.372,1.862,1.862,0,0,0-.553-1.371,1.862,1.862,0,0,0-1.372-.553,1.862,1.862,0,0,0-1.372.553,1.862,1.862,0,0,0-.553,1.371,1.863,1.863,0,0,0,.553,1.372A1.863,1.863,0,0,0,99.25-851.126Zm-1.925-7.7h3.85v-11.55h-3.85ZM99.25-841.5a18.744,18.744,0,0,1-7.507-1.516,19.44,19.44,0,0,1-6.112-4.115,19.438,19.44,0,0,1-4.115-6.112A18.744,18.744,0,0,1,80-860.75a18.744,18.744,0,0,1,1.516-7.507,19.439,19.44,0,0,1,4.115-6.112,19.436,19.44,0,0,1,6.112-4.115A18.742,18.742,0,0,1,99.25-880a18.742,18.742,0,0,1,7.507,1.516,19.436,19.44,0,0,1,6.112,4.115,19.439,19.44,0,0,1,4.115,6.112,18.744,18.744,0,0,1,1.516,7.507,18.744,18.744,0,0,1-1.516,7.507,19.438,19.44,0,0,1-4.115,6.112,19.44,19.44,0,0,1-6.112,4.115A18.744,18.744,0,0,1,99.25-841.5Zm0-3.85a14.862,14.862,0,0,0,10.924-4.476,14.862,14.862,0,0,0,4.476-10.924,14.862,14.862,0,0,0-4.476-10.924A14.863,14.863,0,0,0,99.25-876.15a14.863,14.863,0,0,0-10.924,4.476A14.862,14.862,0,0,0,83.85-860.75a14.862,14.862,0,0,0,4.476,10.924A14.862,14.862,0,0,0,99.25-845.351ZM99.25-860.75Z" transform="translate(-80 880)" fill="#ff6b6b"/>
        </svg>`;
    }
    
    // Возвращаем null если статус не распознан
    return null;
}


