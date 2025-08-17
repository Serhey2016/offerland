// Job Feed JavaScript Functionality

document.addEventListener('DOMContentLoaded', function() {
    // Инициализация функциональности job feed
    
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
            } else {
                console.error('Add activity form not found for JobSearch ID:', jobSearchId);
            }
        });
    });
    
    // Обработчик для сворачивания/разворачивания деталей job feed
    const jobFeedHideIcons = document.querySelectorAll('[id^="jobFeedHideIcon_"]');
    jobFeedHideIcons.forEach(icon => {
        const taskId = icon.id.replace('jobFeedHideIcon_', '');
        const detailsContainer = document.getElementById(`socialFeedDetails_${taskId}`);
        
        if (detailsContainer) {
            // Устанавливаем начальное состояние как свернутое
            icon.classList.add('collapsed');
            detailsContainer.classList.add('collapsed');
            detailsContainer.style.display = 'none'; // Начинаем скрытым
            
            icon.addEventListener('click', function() {
                const isExpanded = icon.classList.contains('expanded');
                
                if (isExpanded) {
                    // Сворачиваем с плавной анимацией
                    detailsContainer.style.maxHeight = detailsContainer.scrollHeight + 'px';
                    
                    // Небольшая задержка для корректной анимации
                    setTimeout(() => {
                        detailsContainer.style.maxHeight = '0px';
                        detailsContainer.style.padding = '0px';
                        detailsContainer.style.margin = '0px';
                        detailsContainer.style.border = 'none';
                        
                        // Скрываем после завершения анимации
                        setTimeout(() => {
                            detailsContainer.style.display = 'none';
                        }, 300);
                    }, 10);
                    
                    detailsContainer.classList.remove('expanded');
                    detailsContainer.classList.add('collapsed');
                    icon.classList.remove('expanded');
                    icon.classList.add('collapsed');
                } else {
                    // Разворачиваем с плавной анимацией
                    detailsContainer.style.display = 'block';
                    detailsContainer.style.maxHeight = '0px';
                    detailsContainer.style.padding = '0px';
                    detailsContainer.style.margin = '0px';
                    detailsContainer.style.border = 'none';
                    
                    // Небольшая задержка для корректной анимации
                    setTimeout(() => {
                        detailsContainer.style.maxHeight = '500px';
                        detailsContainer.style.padding = '24px';
                        detailsContainer.style.margin = '0px -20px -20px -20px';
                        detailsContainer.style.border = '2px solid #E2FEC3';
                        detailsContainer.style.borderTop = 'none';
                    }, 10);
                    
                    detailsContainer.classList.remove('collapsed');
                    detailsContainer.classList.add('expanded');
                    icon.classList.remove('collapsed');
                    icon.classList.add('expanded');
                }
            });
        }
    });
    
    // Обработчик для кнопки "next"
    const nextButton = document.getElementById('job_feed_next_action_id');
    if (nextButton) {
        nextButton.addEventListener('click', function() {
            console.log('Next action clicked');
            // Здесь можно добавить логику для перехода к следующему действию
        });
    }
    
    // Обработчик для разворачивания/сворачивания деталей
    const expandIcon = document.getElementById('job_feed_ca_expand_icon_id');
    const actionsDetails = document.getElementById('job_feed_actions_details_id');
    
    if (expandIcon && actionsDetails) {
        // Устанавливаем начальное состояние как свернутое
        actionsDetails.classList.add('collapsed');
        expandIcon.classList.add('collapsed');
        
        expandIcon.addEventListener('click', function() {
            const isExpanded = actionsDetails.classList.contains('expanded');
            
            if (isExpanded) {
                // Сворачиваем
                actionsDetails.classList.remove('expanded');
                actionsDetails.classList.add('collapsed');
                expandIcon.classList.remove('expanded');
                expandIcon.classList.add('collapsed');
            } else {
                // Разворачиваем
                actionsDetails.classList.remove('collapsed');
                actionsDetails.classList.add('expanded');
                expandIcon.classList.remove('collapsed');
                expandIcon.classList.add('expanded');
            }
        });
    }
    
    // Обработчик для иконок заметок
    const notesIcons = document.querySelectorAll('[id^="note_button_007_post_info_icon_notes_"]');
    notesIcons.forEach(icon => {
        icon.addEventListener('click', function() {
            const jobSearchId = icon.id.replace('note_button_007_post_info_icon_notes_', '');
            const notesPopup = document.getElementById(`note_button_007_notesPopup_${jobSearchId}`);
            
            if (notesPopup) {
                notesPopup.classList.add('show');
                console.log('Notes popup opened for JobSearch ID:', jobSearchId);
            } else {
                console.error('Notes popup not found for JobSearch ID:', jobSearchId);
            }
        });
    });
    
    // Обработчик для закрытия попапа заметок
    const closeNotesButtons = document.querySelectorAll('.notes-close-btn');
    closeNotesButtons.forEach(button => {
        button.addEventListener('click', function() {
            const popup = button.closest('.notes-popup-overlay');
            if (popup) {
                popup.classList.remove('show');
            }
        });
    });
    
    // Обработчик для кнопки Cancel в попапе заметок
    const cancelNotesButtons = document.querySelectorAll('.notes-cancel-btn');
    cancelNotesButtons.forEach(button => {
        button.addEventListener('click', function() {
            const popup = button.closest('.notes-popup-overlay');
            if (popup) {
                popup.classList.remove('show');
            }
        });
    });
    
    // Обработчик для отправки формы заметок
    const notesForms = document.querySelectorAll('[id^="note_button_007_notesForm_"]');
    notesForms.forEach(form => {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const formData = new FormData(form);
            const jobSearchId = form.id.replace('note_button_007_notesForm_', '');
            const notesTextarea = form.querySelector('textarea[name="notes"]');
            const notes = notesTextarea ? notesTextarea.value : '';
            
            console.log('Submitting notes for JobSearch ID:', jobSearchId, 'Notes:', notes);
            
            // Отправляем AJAX запрос
            fetch(form.action, {
                method: 'POST',
                body: formData,
                headers: {
                    'X-Requested-With': 'XMLHttpRequest'
                }
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    console.log('Notes saved successfully');
                    // Закрываем попап
                    const popup = form.closest('.notes-popup-overlay');
                    if (popup) {
                        popup.classList.remove('show');
                    }
                    // Можно добавить уведомление об успешном сохранении
                    if (window.alertify) {
                        window.alertify.success('Notes saved successfully!');
                    }
                } else {
                    console.error('Error saving notes:', data.error);
                    if (window.alertify) {
                        window.alertify.error('Error saving notes: ' + (data.error || 'Unknown error'));
                    }
                }
            })
            .catch(error => {
                console.error('Error submitting notes form:', error);
                if (window.alertify) {
                    window.alertify.error('Error saving notes: ' + error.message);
                }
            });
        });
    });
    
    // Убираем закрытие попапа при клике на фон
    // const notesPopups = document.querySelectorAll('.notes-popup-overlay');
    // notesPopups.forEach(popup => {
    //     popup.addEventListener('click', function(e) {
    //         if (e.target === popup) {
    //             popup.classList.remove('show');
    //         }
    //     });
    // });
    
    // Обработчик для иконок помощи
    const helpIcons = document.querySelectorAll('.job_feed_action_icon_help');
    helpIcons.forEach(icon => {
        icon.addEventListener('click', function() {
            console.log('Help icon clicked');
            // Здесь можно добавить логику для показа подсказки
        });
    });
    
    // Обработчик для ссылок на работу
    const jobLinks = document.querySelectorAll('.job_feed_ca_job_link');
    jobLinks.forEach(link => {
        link.addEventListener('click', function() {
            console.log('Job link clicked');
            // Здесь можно добавить логику для перехода к описанию работы
        });
    });
    
    // Обработчик для иконок CV
    const cvIcons = document.querySelectorAll('.job_feed_ca_job_cv');
    cvIcons.forEach(icon => {
        icon.addEventListener('click', function() {
            console.log('CV icon clicked');
            // Здесь можно добавить логику для просмотра/редактирования CV
        });
    });
    
    // Обработчик для закрытия формы добавления активности
    const closeActivityFormButtons = document.querySelectorAll('.modal_close_btn');
    closeActivityFormButtons.forEach(button => {
        button.addEventListener('click', function() {
            const modal = button.closest('.modal_close_btn').closest('.modal-overlay');
            if (modal) {
                modal.style.display = 'none';
            }
        });
    });
    
    // Обработчик для отправки формы добавления активности
    const activityForms = document.querySelectorAll('[id^="add-activity-form-"]');
    activityForms.forEach(form => {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            const formData = new FormData(form);
            const jobSearchId = form.id.replace('add-activity-form-', '');
            
            console.log('Submitting activity form for JobSearch ID:', jobSearchId);
            
            // Отправляем AJAX запрос
            fetch(form.action, {
                method: 'POST',
                body: formData,
                headers: {
                    'X-Requested-With': 'XMLHttpRequest'
                }
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    console.log('Activity added successfully');
                    // Закрываем форму
                    const modal = form.closest('.modal-overlay');
                    if (modal) {
                        modal.classList.remove('show');
                    }
                    // Показываем уведомление об успехе
                    if (window.alertify) {
                        window.alertify.success('Activity added successfully!');
                    }
                    // Перезагружаем страницу для отображения новой активности
                    setTimeout(() => {
                        window.location.reload();
                    }, 1000);
                } else {
                    console.error('Error adding activity:', data.error);
                    if (window.alertify) {
                        window.alertify.error('Error adding activity: ' + (data.error || 'Unknown error'));
                    }
                }
            })
            .catch(error => {
                console.error('Error submitting activity form:', error);
                if (window.alertify) {
                    window.alertify.error('Error adding activity: ' + error.message);
                }
            });
        });
    });
});

// Функция для обновления статуса заявки
function updateApplicationStatus(status) {
    const statusElement = document.getElementById('job_feed_ca_status_id');
    if (statusElement) {
        statusElement.textContent = status;
    }
}

// Функция для добавления нового действия
function addNewAction(actionText, actionDate, isCompleted = false) {
    const actionsContainer = document.getElementById('job_feed_actions_details_id');
    if (!actionsContainer) return;
    
    const newAction = document.createElement('div');
    newAction.className = 'job_feed_action_details';
    newAction.innerHTML = `
        <span class="job_feed_action_details_icon_done">
            <svg xmlns="http://www.w3.org/2000/svg" width="33.425" height="33.425" viewBox="0 0 33.425 33.425">
                <path d="M94.373-855.6l11.782-11.783-2.34-2.34-9.443,9.443-4.763-4.763-2.34,2.34Zm2.34,9.025a16.277,16.277,0,0,1-6.518-1.316,16.883,16.883,0,0,1-5.306-3.572,16.874,16.874,0,0,1-3.572-5.306A16.274,16.274,0,0,1,80-863.287a16.274,16.274,0,0,1,1.316-6.518,16.876,16.876,0,0,1,3.572-5.306,16.876,16.876,0,0,1,5.306-3.572A16.279,16.279,0,0,1,96.713-880a16.279,16.279,0,0,1,6.518,1.316,16.876,16.876,0,0,1,5.306,3.572,16.876,16.876,0,0,1,3.572,5.306,16.274,16.274,0,0,1,1.316,6.518,16.274,16.274,0,0,1-1.316,6.518,16.874,16.874,0,0,1-3.572,5.306,16.882,16.882,0,0,1-5.306,3.572A16.277,16.277,0,0,1,96.713-846.575Zm0-3.343A12.9,12.9,0,0,0,106.2-853.8a12.9,12.9,0,0,0,3.886-9.484,12.9,12.9,0,0,0-3.886-9.484,12.9,12.9,0,0,0-9.484-3.886,12.9,12.9,0,0,0-9.484,3.886,12.9,12.9,0,0,0-3.886,9.484,12.9,12.9,0,0,0,3.886,9.484A12.9,12.9,0,0,0,96.713-849.917ZM96.713-863.287Z" transform="translate(-80 880)" fill="${isCompleted ? '#00e608' : '#e8e8e8'}"/>
            </svg>
        </span>
        <span class="job_feed_action_details_text">${actionText}</span>
        <span class="job_feed_action_datetime_container">
            <span class="job_feed_action_details_date">${actionDate}</span>
        </span>
        <span class="job_feed_action_icon_help">💡</span>
    `;
    
    actionsContainer.appendChild(newAction);
}
