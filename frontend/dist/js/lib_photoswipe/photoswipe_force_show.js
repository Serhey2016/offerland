// Простое решение для PhotoSwipe с поддержкой зума и перетаскивания
document.addEventListener('DOMContentLoaded', function() {
    setupPhotoSwipe();
});

function setupPhotoSwipe() {
    // Настройка для галереи social_feed_image_gallery_1
    const galleryLinks = document.querySelectorAll('.social_feed_image_gallery_1 a');
    setupGalleryLinks(galleryLinks, '.social_feed_image_gallery_1', 'a');
    
    // Настройка для фотографий в social_feed_details_photos
    const detailPhotoLinks = document.querySelectorAll('.social_feed_details_photos a.photo-gallery-item');
    setupGalleryLinks(detailPhotoLinks, '.social_feed_details_photos', 'a.photo-gallery-item');
}

function setupGalleryLinks(links, gallerySelector, linkSelector) {
    links.forEach(function(link, index) {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            const href = link.href;
            const dataWidth = link.getAttribute('data-pswp-width') || 1200;
            const dataHeight = link.getAttribute('data-pswp-height') || 800;
            
            // Находим все изображения в текущей галерее
            const gallery = link.closest(gallerySelector);
            const allLinks = gallery.querySelectorAll(linkSelector);
            const currentIndex = Array.from(allLinks).indexOf(link);
            
            showPhotoSwipe(allLinks, currentIndex);
        });
    });
}

function showPhotoSwipe(allLinks, currentIndex) {
    const pswp = document.querySelector('.pswp');
    if (!pswp) return;
    
    // Полупрозрачный фон
    pswp.style.display = 'block';
    pswp.style.visibility = 'visible';
    pswp.style.opacity = '1';
    pswp.style.background = 'rgba(0, 0, 0, 0.9)';
    
    // Показываем текущее изображение
    showImage(allLinks, currentIndex);
    
    // Добавляем обработчики закрытия
    addCloseHandlers(pswp);
    
    // Добавляем навигацию
    addNavigation(pswp, allLinks, currentIndex);
    
    // Добавляем кнопки зума
    addZoomControls(pswp);
}

function showImage(allLinks, index) {
    const pswp = document.querySelector('.pswp');
    const container = pswp.querySelector('.pswp__container');
    
    if (container && allLinks[index]) {
        const link = allLinks[index];
        const src = link.href;
        
        container.innerHTML = `
            <div class="pswp__item">
                <div class="pswp__content">
                    <img src="${src}" class="zoomable-image" style="max-width: 100%; max-height: 100%; object-fit: contain; cursor: zoom-in;">
                </div>
            </div>
        `;
        
        // Добавляем обработчики зума для нового изображения
        setupZoomHandlers();
    }
}

function setupZoomHandlers() {
    const image = document.querySelector('.zoomable-image');
    if (!image) return;
    
    let currentZoom = 1;
    let isZoomed = false;
    let isDragging = false;
    let startX = 0;
    let startY = 0;
    let translateX = 0;
    let translateY = 0;
    const maxZoom = 3;
    const minZoom = 0.5;
    
    // Двойной клик для зума
    image.addEventListener('dblclick', function(e) {
        e.preventDefault();
        e.stopPropagation();
        
        if (isZoomed) {
            // Возвращаем к нормальному размеру
            currentZoom = 1;
            isZoomed = false;
            translateX = 0;
            translateY = 0;
            image.style.cursor = 'zoom-in';
        } else {
            // Увеличиваем в 2 раза
            currentZoom = 2;
            isZoomed = true;
            image.style.cursor = 'grab';
        }
        
        applyTransform();
    });
    
    // Колесико мыши для зума
    image.addEventListener('wheel', function(e) {
        e.preventDefault();
        e.stopPropagation();
        
        const delta = e.deltaY > 0 ? -0.2 : 0.2;
        const oldZoom = currentZoom;
        currentZoom = Math.max(minZoom, Math.min(maxZoom, currentZoom + delta));
        
        isZoomed = currentZoom > 1.1;
        image.style.cursor = isZoomed ? 'grab' : 'zoom-in';
        
        // Центрируем зум относительно позиции мыши
        if (isZoomed && oldZoom !== currentZoom) {
            const rect = image.getBoundingClientRect();
            const mouseX = e.clientX - rect.left;
            const mouseY = e.clientY - rect.top;
            
            const scaleChange = currentZoom / oldZoom;
            translateX = mouseX - (mouseX - translateX) * scaleChange;
            translateY = mouseY - (mouseY - translateY) * scaleChange;
        }
        
        applyTransform();
    });
    
    // Перетаскивание изображения
    image.addEventListener('mousedown', function(e) {
        if (!isZoomed) return;
        
        e.preventDefault();
        isDragging = true;
        startX = e.clientX - translateX;
        startY = e.clientY - translateY;
        image.style.cursor = 'grabbing';
        
        // Добавляем обработчики для всего документа
        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);
    });
    
    function handleMouseMove(e) {
        if (!isDragging) return;
        
        translateX = e.clientX - startX;
        translateY = e.clientY - startY;
        
        // Ограничиваем перемещение границами изображения
        const rect = image.getBoundingClientRect();
        const maxTranslateX = (currentZoom - 1) * rect.width / 2;
        const maxTranslateY = (currentZoom - 1) * rect.height / 2;
        
        translateX = Math.max(-maxTranslateX, Math.min(maxTranslateX, translateX));
        translateY = Math.max(-maxTranslateY, Math.min(maxTranslateY, translateY));
        
        applyTransform();
    }
    
    function handleMouseUp() {
        isDragging = false;
        if (isZoomed) {
            image.style.cursor = 'grab';
        }
        
        // Удаляем обработчики
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
    }
    
    // Жесты для мобильных устройств
    let initialDistance = 0;
    let initialZoom = 1;
    let initialTranslateX = 0;
    let initialTranslateY = 0;
    let touchStartX = 0;
    let touchStartY = 0;
    
    image.addEventListener('touchstart', function(e) {
        if (e.touches.length === 1) {
            // Одиночное касание - начало перетаскивания
            if (isZoomed) {
                const touch = e.touches[0];
                touchStartX = touch.clientX - translateX;
                touchStartY = touch.clientY - translateY;
            }
        } else if (e.touches.length === 2) {
            // Двойное касание - зум
            initialDistance = getDistance(e.touches[0], e.touches[1]);
            initialZoom = currentZoom;
            initialTranslateX = translateX;
            initialTranslateY = translateY;
        }
    });
    
    image.addEventListener('touchmove', function(e) {
        if (e.touches.length === 1 && isZoomed) {
            // Перетаскивание одним пальцем
            e.preventDefault();
            const touch = e.touches[0];
            translateX = touch.clientX - touchStartX;
            translateY = touch.clientY - touchStartY;
            
            // Ограничиваем перемещение
            const rect = image.getBoundingClientRect();
            const maxTranslateX = (currentZoom - 1) * rect.width / 2;
            const maxTranslateY = (currentZoom - 1) * rect.height / 2;
            
            translateX = Math.max(-maxTranslateX, Math.min(maxTranslateX, translateX));
            translateY = Math.max(-maxTranslateY, Math.min(maxTranslateY, translateY));
            
            applyTransform();
        } else if (e.touches.length === 2) {
            // Зум двумя пальцами
            e.preventDefault();
            const currentDistance = getDistance(e.touches[0], e.touches[1]);
            const scale = currentDistance / initialDistance;
            currentZoom = Math.max(minZoom, Math.min(maxZoom, initialZoom * scale));
            
            isZoomed = currentZoom > 1.1;
            
            applyTransform();
        }
    });
    
    function applyTransform() {
        image.style.transform = `translate(${translateX}px, ${translateY}px) scale(${currentZoom})`;
        image.style.transition = isDragging ? 'none' : 'transform 0.2s ease';
    }
    
    function getDistance(touch1, touch2) {
        const dx = touch1.clientX - touch2.clientX;
        const dy = touch1.clientY - touch2.clientY;
        return Math.sqrt(dx * dx + dy * dy);
    }
}

function addZoomControls(pswp) {
    // Удаляем старые кнопки зума
    const oldZoomButtons = pswp.querySelectorAll('.zoom-button');
    oldZoomButtons.forEach(btn => btn.remove());
    
    // Кнопка увеличения
    const zoomInButton = document.createElement('div');
    zoomInButton.className = 'zoom-button zoom-in-button';
    zoomInButton.innerHTML = '+';
    zoomInButton.title = 'Увеличить';
    zoomInButton.onclick = function() {
        zoomImage(0.5);
    };
    pswp.appendChild(zoomInButton);
    
    // Кнопка уменьшения
    const zoomOutButton = document.createElement('div');
    zoomOutButton.className = 'zoom-button zoom-out-button';
    zoomOutButton.innerHTML = '−';
    zoomOutButton.title = 'Уменьшить';
    zoomOutButton.onclick = function() {
        zoomImage(-0.5);
    };
    pswp.appendChild(zoomOutButton);
    
    // Кнопка сброса зума
    const resetZoomButton = document.createElement('div');
    resetZoomButton.className = 'zoom-button reset-zoom-button';
    resetZoomButton.innerHTML = '⟲';
    resetZoomButton.title = 'Сбросить масштаб';
    resetZoomButton.onclick = function() {
        resetZoom();
    };
    pswp.appendChild(resetZoomButton);
}

function zoomImage(delta) {
    const image = document.querySelector('.zoomable-image');
    if (!image) return;
    
    const currentTransform = image.style.transform;
    const currentScale = currentTransform.includes('scale') 
        ? parseFloat(currentTransform.match(/scale\(([^)]+)\)/)?.[1] || 1)
        : 1;
    
    const newScale = Math.max(0.5, Math.min(3, currentScale + delta));
    
    // Если уменьшаем до нормального размера, сбрасываем позицию
    if (newScale <= 1) {
        image.style.transform = `translate(0px, 0px) scale(${newScale})`;
        image.style.cursor = 'zoom-in';
    } else {
        image.style.transform = `translate(0px, 0px) scale(${newScale})`;
        image.style.cursor = 'grab';
    }
    
    image.style.transition = 'transform 0.2s ease';
}

function resetZoom() {
    const image = document.querySelector('.zoomable-image');
    if (!image) return;
    
    image.style.transform = 'translate(0px, 0px) scale(1)';
    image.style.transition = 'transform 0.3s ease';
    image.style.cursor = 'zoom-in';
}

function addCloseHandlers(pswp) {
    // Удаляем старые обработчики
    const oldCloseButton = pswp.querySelector('.close-button');
    if (oldCloseButton) {
        oldCloseButton.remove();
    }
    
    // Создаем кнопку закрытия
    const closeButton = document.createElement('div');
    closeButton.className = 'close-button';
    closeButton.innerHTML = '×';
    closeButton.onclick = function() {
        closePhotoSwipe();
    };
    pswp.appendChild(closeButton);
    
    // Закрытие по клику на фон
    const bg = pswp.querySelector('.pswp__bg');
    if (bg) {
        bg.onclick = function() {
            closePhotoSwipe();
        };
    }
    
    // Закрытие по клавише Escape
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            closePhotoSwipe();
        }
    });
}

function closePhotoSwipe() {
    const pswp = document.querySelector('.pswp');
    if (pswp) {
        pswp.style.display = 'none';
        pswp.style.opacity = '0.003';
        pswp.style.visibility = 'hidden';
        
        // Очищаем содержимое
        const container = pswp.querySelector('.pswp__container');
        if (container) {
            container.innerHTML = '';
        }
        
        // Удаляем кнопки навигации и счетчик
        const navButtons = pswp.querySelectorAll('.nav-button, .image-counter, .close-button, .zoom-button');
        navButtons.forEach(btn => btn.remove());
    }
}

function addNavigation(pswp, allLinks, currentIndex) {
    // Удаляем старые кнопки навигации
    const oldButtons = pswp.querySelectorAll('.nav-button, .image-counter');
    oldButtons.forEach(btn => btn.remove());
    
    // Кнопка "Назад"
    if (currentIndex > 0) {
        const prevButton = document.createElement('div');
        prevButton.className = 'nav-button prev-button';
        prevButton.innerHTML = '‹';
        prevButton.onclick = function() {
            showImage(allLinks, currentIndex - 1);
            addNavigation(pswp, allLinks, currentIndex - 1);
        };
        pswp.appendChild(prevButton);
    }
    
    // Кнопка "Вперед"
    if (currentIndex < allLinks.length - 1) {
        const nextButton = document.createElement('div');
        nextButton.className = 'nav-button next-button';
        nextButton.innerHTML = '›';
        nextButton.onclick = function() {
            showImage(allLinks, currentIndex + 1);
            addNavigation(pswp, allLinks, currentIndex + 1);
        };
        pswp.appendChild(nextButton);
    }
    
    // Счетчик изображений
    const counter = document.createElement('div');
    counter.className = 'image-counter';
    counter.textContent = `${currentIndex + 1} / ${allLinks.length}`;
    pswp.appendChild(counter);
} 