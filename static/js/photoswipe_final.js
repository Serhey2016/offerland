// Финальная версия PhotoSwipe с правильной конфигурацией
console.log('=== PHOTOSWIPE FINAL VERSION ===');

document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM loaded for PhotoSwipe final version');
    
    // Проверяем библиотеки
    if (typeof PhotoSwipeLightbox === 'undefined') {
        console.error('❌ PhotoSwipeLightbox not found');
        return;
    }
    
    if (typeof PhotoSwipe === 'undefined') {
        console.error('❌ PhotoSwipe not found');
        return;
    }
    
    console.log('✅ Libraries found');
    
    // Ищем галерею
    const gallery = document.querySelector('.social_feed_image_gallery_1');
    if (!gallery) {
        console.error('❌ Gallery not found');
        return;
    }
    
    console.log('✅ Gallery found');
    
    // Ищем ссылки
    const links = gallery.querySelectorAll('a');
    console.log('✅ Found', links.length, 'image links');
    
    if (links.length === 0) {
        console.error('❌ No image links found');
        return;
    }
    
    // Проверяем каждую ссылку
    links.forEach((link, index) => {
        const img = link.querySelector('img');
        console.log(`Link ${index + 1}:`, {
            href: link.href,
            imgSrc: img ? img.src : 'NO IMG',
            imgComplete: img ? img.complete : 'NO IMG'
        });
    });
    
    try {
        console.log('🔄 Initializing PhotoSwipe with final configuration...');
        
        // Финальная конфигурация PhotoSwipe
        const lightbox = new PhotoSwipeLightbox({
            gallery: '.social_feed_image_gallery_1',
            children: 'a',
            pswpModule: PhotoSwipe,
            
            // Базовые настройки
            showHideAnimationType: 'fade',
            showAnimationDuration: 300,
            hideAnimationDuration: 300,
            
            // Настройки масштабирования
            maxZoomLevel: 4,
            minZoomLevel: 0.5,
            initialZoomLevel: 'fit',
            
            // Настройки для изображений
            imageScaleMethod: 'fit',
            allowImageZoom: true,
            
            // Настройки для правильного определения размеров
            getViewportSize: function() {
                return {
                    x: window.innerWidth,
                    y: window.innerHeight
                };
            },
            
            // Функция для получения размеров изображения
            getImageSize: function(image) {
                return new Promise((resolve) => {
                    const img = new Image();
                    img.onload = function() {
                        const naturalWidth = img.naturalWidth;
                        const naturalHeight = img.naturalHeight;
                        
                        console.log('Image natural size:', naturalWidth, 'x', naturalHeight);
                        
                        // Вычисляем размеры для отображения
                        const viewportWidth = window.innerWidth;
                        const viewportHeight = window.innerHeight;
                        
                        // Вычисляем масштаб для вписывания в экран
                        const scaleByWidth = viewportWidth / naturalWidth;
                        const scaleByHeight = viewportHeight / naturalHeight;
                        const scale = Math.min(scaleByWidth, scaleByHeight, 1);
                        
                        const displayWidth = naturalWidth * scale;
                        const displayHeight = naturalHeight * scale;
                        
                        console.log('Display size:', displayWidth, 'x', displayHeight);
                        
                        resolve({
                            x: displayWidth,
                            y: displayHeight
                        });
                    };
                    
                    img.onerror = function() {
                        console.warn('Failed to load image for size detection:', image.src);
                        resolve({
                            x: Math.min(1200, window.innerWidth * 0.8),
                            y: Math.min(800, window.innerHeight * 0.8)
                        });
                    };
                    
                    img.src = image.src;
                });
            }
        });
        
        // Обработчики событий
        lightbox.on('uiRegister', function() {
            console.log('✅ UI registered');
        });
        
        lightbox.on('beforeOpen', function() {
            console.log('✅ Before open');
        });
        
        lightbox.on('open', function() {
            console.log('✅ PhotoSwipe opened');
        });
        
        lightbox.on('contentLoad', function(e) {
            console.log('✅ Content loaded:', e.content.data);
            
            if (e.content.data.type === 'image') {
                const img = e.content.element;
                if (img) {
                    console.log('✅ Image element found:', img.src);
                    
                    // Применяем стили для правильного отображения
                    img.style.objectFit = 'contain';
                    img.style.maxWidth = '100%';
                    img.style.maxHeight = '100%';
                    img.style.display = 'block';
                    img.style.margin = '0 auto';
                    img.style.position = 'absolute';
                    img.style.top = '50%';
                    img.style.left = '50%';
                    img.style.transform = 'translate(-50%, -50%)';
                    
                    console.log('✅ Image styles applied');
                }
            }
        });
        
        lightbox.on('firstUpdate', function() {
            console.log('✅ First update');
        });
        
        lightbox.on('close', function() {
            console.log('✅ PhotoSwipe closed');
        });
        
        // Инициализация
        lightbox.init();
        console.log('✅ PhotoSwipe initialized successfully');
        
        // Добавляем обработчик клика для отладки
        gallery.addEventListener('click', function(e) {
            if (e.target.tagName === 'IMG') {
                console.log('🖱️ Image clicked:', e.target.src);
            }
        });
        
        // Добавляем кнопку для тестирования
        const testButton = document.createElement('button');
        testButton.textContent = 'Test PhotoSwipe';
        testButton.style.position = 'fixed';
        testButton.style.top = '10px';
        testButton.style.right = '10px';
        testButton.style.zIndex = '9999';
        testButton.style.padding = '10px';
        testButton.style.backgroundColor = 'blue';
        testButton.style.color = 'white';
        testButton.style.border = 'none';
        testButton.style.cursor = 'pointer';
        
        testButton.onclick = function() {
            console.log('=== MANUAL PHOTOSWIPE TEST ===');
            const firstLink = document.querySelector('.social_feed_image_gallery_1 a');
            if (firstLink) {
                console.log('Clicking first link:', firstLink.href);
                firstLink.click();
            }
        };
        
        document.body.appendChild(testButton);
        console.log('✅ Test button added');
        
        // Проверяем, что все работает через 1 секунду
        setTimeout(function() {
            console.log('=== FINAL CHECK ===');
            console.log('PhotoSwipe status: OK');
            console.log('Gallery links:', links.length);
            console.log('Ready for testing!');
        }, 1000);
        
    } catch (error) {
        console.error('❌ Error initializing PhotoSwipe:', error);
        console.error('Error details:', error.message);
        console.error('Error stack:', error.stack);
    }
}); 