// Открытие popup чата по кнопке .fixed_circle.sub3

document.addEventListener('DOMContentLoaded', function () {
    // Создаём popup и overlay, если их нет
    let chatOverlay = document.querySelector('.chat_modal_overlay');
    let chatPopup = document.querySelector('.chat_messages_container');
    
    // Скрываем контейнер чата до инициализации
    if (chatPopup) {
        chatPopup.style.display = 'none';
        chatPopup.style.opacity = '0';
    }
    
    if (!chatOverlay) {
        chatOverlay = document.createElement('div');
        chatOverlay.className = 'chat_modal_overlay hidden';
        document.body.appendChild(chatOverlay);
    }
    
    if (chatPopup && !chatOverlay.contains(chatPopup)) {
        chatOverlay.appendChild(chatPopup);
        // Показываем контейнер только после перемещения в overlay
        chatPopup.style.display = 'flex';
    }

    // Добавляем крестик, если его нет
    if (!chatPopup.querySelector('.chat_messages_close_btn')) {
        const closeBtn = document.createElement('button');
        closeBtn.className = 'chat_messages_close_btn';
        closeBtn.innerHTML = '&times;';
        chatPopup.appendChild(closeBtn);
    }
    const closeBtn = chatPopup.querySelector('.chat_messages_close_btn');

    // Открытие по клику на .fixed_circle.sub3
    const sub3 = document.querySelector('.fixed_circle.sub3');
    if (sub3) {
        sub3.addEventListener('click', function (e) {
            e.stopPropagation();
            chatOverlay.classList.remove('hidden');
            // Показываем контейнер чата
            if (chatPopup) {
                chatPopup.style.display = 'flex';
                // Устанавливаем полную прозрачность
                chatPopup.style.opacity = '1';
            }
        });
    }

    // Закрытие по крестику
    closeBtn.addEventListener('click', function () {
        chatOverlay.classList.add('hidden');
        // Скрываем контейнер чата
        if (chatPopup) {
            chatPopup.style.opacity = '0';
            // Небольшая задержка перед скрытием для плавности
            setTimeout(() => {
                chatPopup.style.display = 'none';
            }, 200);
        }
    });

    // Закрытие по клику вне окна
    chatOverlay.addEventListener('mousedown', function (e) {
        if (e.target === chatOverlay) {
            chatOverlay.classList.add('hidden');
            // Скрываем контейнер чата
            if (chatPopup) {
                chatPopup.style.opacity = '0';
                // Небольшая задержка перед скрытием для плавности
                setTimeout(() => {
                    chatPopup.style.display = 'none';
                }, 200);
            }
        }
    });

    // --- Новая логика для overlay_cmc_messages ---
    const overlayCmc = document.getElementById('cmcMessagesOverlay');
    
    // Открытие overlay по клику на контакт
    if (chatPopup && overlayCmc) {
        const contactsContainer = chatPopup.querySelector('.cmc_contacts_container');
        if (contactsContainer) {
            contactsContainer.addEventListener('click', function (e) {
                const contact = e.target.closest('.cmc_contact');
                if (contact) {
                    e.preventDefault();
                    e.stopPropagation();
                    
                    // Скрываем первый popup
                    chatOverlay.classList.add('hidden');
                    
                    // Показываем второй popup без размытия
                    overlayCmc.style.display = 'flex';
                    overlayCmc.classList.add('active');
                    
                    // Убираем размытие сразу
                    const popup = overlayCmc.querySelector('.cmc_messages_container');
                    if (popup) {
                        popup.style.filter = 'none';
                        popup.style.opacity = '1';
                        popup.style.backdropFilter = 'none';
                    }
                }
            });
        }
        
        // Кнопка закрытия overlay
        const closeBtn = overlayCmc.querySelector('.cmc_messages_container_close_btn');
        if (closeBtn) {
            closeBtn.addEventListener('click', function () {
                overlayCmc.style.display = 'none';
                overlayCmc.classList.remove('active');
                // Возвращаемся к списку чатов
                chatOverlay.classList.remove('hidden');
                // Показываем контейнер чата
                if (chatPopup) {
                    chatPopup.style.opacity = '1';
                    chatPopup.style.display = 'flex';
                }
            });
        }
        
        // Кнопка назад
        const backBtn = overlayCmc.querySelector('.cmc_messages_left_top_button_back');
        if (backBtn) {
            backBtn.addEventListener('click', function () {
                overlayCmc.style.display = 'none';
                overlayCmc.classList.remove('active');
                // Возвращаемся к списку чатов
                chatOverlay.classList.remove('hidden');
                // Показываем контейнер чата
                if (chatPopup) {
                    chatPopup.style.opacity = '1';
                    chatPopup.style.display = 'flex';
                }
            });
        }
    }

    // Закрытие по клику вне окна overlay
    if (overlayCmc) {
        overlayCmc.addEventListener('mousedown', function(e) {
            if (e.target === overlayCmc) {
                overlayCmc.style.display = 'none';
                overlayCmc.classList.remove('active');
                // Возвращаемся к списку чатов
                chatOverlay.classList.remove('hidden');
            }
        });
    }
    
    // Закрытие по Esc
    document.addEventListener('keydown', function(event) {
        if (event.key === 'Escape') {
            if (overlayCmc && overlayCmc.style.display !== 'none') {
                overlayCmc.style.display = 'none';
                overlayCmc.classList.remove('active');
                // Возвращаемся к списку чатов
                chatOverlay.classList.remove('hidden');
            } else if (chatOverlay && !chatOverlay.classList.contains('hidden')) {
                chatOverlay.classList.add('hidden');
                // Скрываем контейнер чата
                if (chatPopup) {
                    chatPopup.style.display = 'none';
                }
            }
        }
    });
});