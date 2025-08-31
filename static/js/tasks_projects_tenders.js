// tasks_projects_tenders.js - Функциональность для заметок в задачах, проектах и тендерах

// Проверяем, что DOM загружен
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initNotesPopup);
} else {
    initNotesPopup();
}

// Глобальные переменные
let isInitialized = false;
let currentTaskId = null;

// Основная функция инициализации
function initNotesPopup() {
    if (isInitialized) {
        return;
    }
    
    initEventHandlers();
    initHeartIcons(); // Добавляем инициализацию сердечек
    isInitialized = true;
}

// Инициализация сердечек для избранного
function initHeartIcons() {
    const heartIcons = document.querySelectorAll('.sftsts1_favorites_icon');
            // Initializing heart icons for tasks/projects/tenders
    
    heartIcons.forEach(icon => {
        // Устанавливаем начальное состояние
        if (!icon.dataset.favorite) {
            icon.dataset.favorite = 'false';
        }
        
        // Убираем все старые обработчики
        const newIcon = icon.cloneNode(true);
        icon.parentNode.replaceChild(newIcon, icon);
        
        // Добавляем обработчик клика
        newIcon.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            
            const isFavorite = newIcon.dataset.favorite === 'true';
            // Heart clicked in task/project/tender
            
            if (isFavorite) {
                // Убираем из избранного
                newIcon.classList.remove('favorite-checked');
                newIcon.classList.add('favorite-unchecked');
                newIcon.dataset.favorite = 'false';
                // Removed from favorites
            } else {
                // Добавляем в избранное
                newIcon.classList.remove('favorite-unchecked');
                newIcon.classList.add('favorite-checked');
                newIcon.dataset.favorite = 'true';
                // Added to favorites
            }
        });
        
                    // Heart icon initialized for task/project/tender
    });
}

// Инициализация обработчиков событий
function initEventHandlers() {
    const notesIcons = document.querySelectorAll('.notes-icon');
    const notesPopups = document.querySelectorAll('.notes-popup');
    const notesForms = document.querySelectorAll('.notes-form');
    
    // Обработчики для иконок заметок
    notesIcons.forEach(icon => {
        icon.addEventListener('click', function(e) {
            e.preventDefault();
            const taskId = this.dataset.taskId;
            openNotesPopup(taskId);
        });
    });
    
    // Обработчики для форм заметок
    notesForms.forEach(form => {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            const taskId = this.dataset.taskId;
            saveNotes(taskId);
        });
    });
    
    // Глобальные обработчики событий
    initGlobalEventHandlers();
}

// Глобальные обработчики событий
function initGlobalEventHandlers() {
    if (window.globalEventHandlersInitialized) {
        return;
    }
    
    // Обработчик для кнопки Save
    document.addEventListener('click', function(e) {
        // Validate event target
        if (!e.target || typeof e.target.classList !== 'object' || typeof e.target.closest !== 'function') {
            return;
        }
        
        if (e.target.classList.contains('save-btn')) {
            const form = e.target.closest('form');
            if (form) {
                const taskId = form.dataset.taskId;
                saveNotes(taskId);
            }
        }
    });
    
    // Обработчик для кнопки Cancel
    document.addEventListener('click', function(e) {
        // Validate event target
        if (!e.target || typeof e.target.classList !== 'object' || typeof e.target.closest !== 'function') {
            return;
        }
        
        if (e.target.classList.contains('cancel-btn')) {
            const form = e.target.closest('form');
            if (form) {
                const taskId = form.dataset.taskId;
                closeNotesPopup(taskId);
            }
        }
    });
    
    // Обработчик для кнопки Close
    document.addEventListener('click', function(e) {
        // Validate event target
        if (!e.target || typeof e.target.classList !== 'object' || typeof e.target.closest !== 'function') {
            return;
        }
        
        if (e.target.classList.contains('close-btn')) {
            const form = e.target.closest('form');
            if (form) {
                const taskId = form.dataset.taskId;
                closeNotesPopup(taskId);
            }
        }
    });
    
    // Обработчик для кнопки Notes
    document.addEventListener('mousedown', function(e) {
        if (e.target.classList.contains('notes-btn')) {
            const taskId = e.target.dataset.taskId;
            openNotesPopup(taskId);
        }
    });
    
    window.globalEventHandlersInitialized = true;
}

// Открытие попапа заметок
function openNotesPopup(taskId) {
    const popup = document.querySelector(`[data-task-id="${taskId}"].notes-popup`);
    if (!popup) {
        return;
    }
    
    popup.style.display = 'block';
    currentTaskId = taskId;
    
    // Инициализация CKEditor
    initCKEditor(taskId);
    
    // Загрузка существующих заметок
    loadNotes(taskId);
}

// Закрытие попапа заметок
function closeNotesPopup(taskId) {
    const popup = document.querySelector(`[data-task-id="${taskId}"].notes-popup`);
    if (!popup) {
        return;
    }
    
    popup.style.display = 'none';
    
    // Уничтожение CKEditor
    destroyCKEditor(taskId);
    
    if (currentTaskId === taskId) {
        currentTaskId = null;
    }
}

// Инициализация CKEditor
function initCKEditor(taskId) {
    const textarea = document.querySelector(`[data-task-id="${taskId}"].notes-textarea`);
    if (!textarea || textarea.dataset.ckeditorInitialized === 'true') {
        return;
    }
    
    if (typeof ClassicEditor !== 'undefined') {
        ClassicEditor
            .create(textarea, {
                toolbar: ['heading', '|', 'bold', 'italic', 'link', 'bulletedList', 'numberedList', '|', 'undo', 'redo'],
                placeholder: 'Enter your notes here...'
            })
            .then(editor => {
                textarea.dataset.ckeditorInitialized = 'true';
                textarea.dataset.ckeditorInstance = editor;
            })
            .catch(error => {
                // CKEditor initialization error
            });
    }
}

// Уничтожение CKEditor
function destroyCKEditor(taskId) {
    const textarea = document.querySelector(`[data-task-id="${taskId}"].notes-textarea`);
    if (!textarea || textarea.dataset.ckeditorInitialized !== 'true') {
        return;
    }
    
    const editor = textarea.dataset.ckeditorInstance;
    if (editor && typeof editor.destroy === 'function') {
        editor.destroy();
        textarea.dataset.ckeditorInitialized = 'false';
        delete textarea.dataset.ckeditorInstance;
    }
}

// Загрузка заметок
function loadNotes(taskId) {
    // Здесь можно добавить AJAX запрос для загрузки существующих заметок
    // Пока что просто очищаем поле
    const textarea = document.querySelector(`[data-task-id="${taskId}"].notes-textarea`);
    if (textarea) {
        textarea.value = '';
    }
}

// Сохранение заметок
function saveNotes(taskId) {
    const form = document.querySelector(`[data-task-id="${taskId}"].notes-form`);
    if (!form) {
        return;
    }
    
    const formData = new FormData(form);
    const notes = formData.get('notes');
    
    // AJAX запрос для сохранения заметок
    fetch('/api/notes/save/', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': getCookie('csrftoken')
        },
        body: JSON.stringify({
            task_id: taskId,
            notes: notes
        })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            showNotification('Notes saved successfully!', 'success');
            closeNotesPopup(taskId);
        } else {
            showNotification('Failed to save notes: ' + data.error, 'error');
        }
    })
    .catch(error => {
        showNotification('Error saving notes: ' + error.message, 'error');
    });
}

// Вспомогательные функции
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

function showNotification(message, type) {
    if (typeof showAlertifyNotification !== 'undefined') {
        showAlertifyNotification(message, type);
    } else if (typeof alertify !== 'undefined') {
        alertify[type](message);
    } else {
        alert(message);
    }
}

// Экспорт функций
window.NotesPopup = {
    open: openNotesPopup,
    close: closeNotesPopup,
    save: saveNotes
};

window.HeartIcons = {
    init: initHeartIcons
};


