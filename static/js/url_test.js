// Тест URL изображений
console.log('=== URL TEST STARTED ===');

document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM loaded for URL test');
    
    // Ищем все изображения
    const images = document.querySelectorAll('.social_feed_image_gallery_1 img');
    console.log('Found', images.length, 'images');
    
    if (images.length === 0) {
        console.error('❌ No images found');
        return;
    }
    
    // Проверяем первое изображение
    const firstImg = images[0];
    console.log('First image URL:', firstImg.src);
    console.log('Current location:', window.location.href);
    console.log('Origin:', window.location.origin);
    
    // Создаем полный URL
    const fullUrl = window.location.origin + firstImg.src;
    console.log('Full URL:', fullUrl);
    
    // Тестируем загрузку изображения
    const testImg = new Image();
    
    testImg.onload = function() {
        console.log('✅ Image loaded successfully via JavaScript');
        console.log('Natural size:', testImg.naturalWidth, 'x', testImg.naturalHeight);
        
        // Показываем изображение на странице
        testImg.style.width = '300px';
        testImg.style.height = 'auto';
        testImg.style.border = '3px solid green';
        testImg.style.margin = '20px';
        testImg.style.display = 'block';
        document.body.insertBefore(testImg, document.body.firstChild);
        
        console.log('✅ Test image displayed on page');
    };
    
    testImg.onerror = function() {
        console.error('❌ Image failed to load via JavaScript');
        console.error('Failed URL:', testImg.src);
        
        // Пробуем другие варианты URL
        const urlVariants = [
            firstImg.src,
            fullUrl,
            firstImg.src.replace('/media/', '/static/'),
            firstImg.src.replace('/media/', '')
        ];
        
        console.log('Trying URL variants:', urlVariants);
        
        urlVariants.forEach((url, index) => {
            if (index === 0) return; // Пропускаем первый, он уже не сработал
            
            const variantImg = new Image();
            variantImg.onload = function() {
                console.log(`✅ Variant ${index} worked:`, url);
                variantImg.style.width = '200px';
                variantImg.style.height = 'auto';
                variantImg.style.border = '2px solid blue';
                variantImg.style.margin = '10px';
                document.body.appendChild(variantImg);
            };
            variantImg.onerror = function() {
                console.log(`❌ Variant ${index} failed:`, url);
            };
            variantImg.src = url;
        });
    };
    
    testImg.src = firstImg.src;
    
    // Проверяем все изображения
    images.forEach((img, index) => {
        console.log(`Image ${index + 1}:`, {
            src: img.src,
            fullUrl: window.location.origin + img.src,
            naturalWidth: img.naturalWidth,
            naturalHeight: img.naturalHeight,
            complete: img.complete,
            currentSrc: img.currentSrc
        });
    });
    
    // Добавляем кнопку для открытия изображения в новой вкладке
    const openButton = document.createElement('button');
    openButton.textContent = 'Open Image in New Tab';
    openButton.style.position = 'fixed';
    openButton.style.top = '50px';
    openButton.style.right = '10px';
    openButton.style.zIndex = '9999';
    openButton.style.padding = '10px';
    openButton.style.backgroundColor = 'orange';
    openButton.style.color = 'white';
    openButton.style.border = 'none';
    openButton.style.cursor = 'pointer';
    
    openButton.onclick = function() {
        if (firstImg.src) {
            window.open(firstImg.src, '_blank');
            console.log('Opened image in new tab:', firstImg.src);
        }
    };
    
    document.body.appendChild(openButton);
    
    // Добавляем кнопку для проверки PhotoSwipe
    const pswpButton = document.createElement('button');
    pswpButton.textContent = 'Test PhotoSwipe';
    pswpButton.style.position = 'fixed';
    pswpButton.style.top = '90px';
    pswpButton.style.right = '10px';
    pswpButton.style.zIndex = '9999';
    pswpButton.style.padding = '10px';
    pswpButton.style.backgroundColor = 'purple';
    pswpButton.style.color = 'white';
    pswpButton.style.border = 'none';
    pswpButton.style.cursor = 'pointer';
    
    pswpButton.onclick = function() {
        console.log('=== PHOTOSWIPE TEST ===');
        console.log('PhotoSwipeLightbox available:', typeof PhotoSwipeLightbox !== 'undefined');
        console.log('PhotoSwipe available:', typeof PhotoSwipe !== 'undefined');
        
        if (typeof PhotoSwipeLightbox !== 'undefined' && typeof PhotoSwipe !== 'undefined') {
            try {
                const lightbox = new PhotoSwipeLightbox({
                    gallery: '.social_feed_image_gallery_1',
                    children: 'a',
                    pswpModule: PhotoSwipe
                });
                
                lightbox.on('open', function() {
                    console.log('✅ PhotoSwipe opened');
                });
                
                lightbox.on('contentLoad', function(e) {
                    console.log('✅ Content loaded:', e.content.data);
                });
                
                lightbox.init();
                console.log('✅ PhotoSwipe initialized');
                
                // Симулируем клик на первое изображение
                const firstLink = document.querySelector('.social_feed_image_gallery_1 a');
                if (firstLink) {
                    firstLink.click();
                }
                
            } catch (error) {
                console.error('❌ PhotoSwipe error:', error);
            }
        } else {
            console.error('❌ PhotoSwipe libraries not available');
        }
    };
    
    document.body.appendChild(pswpButton);
    
    console.log('✅ Test buttons added to page');
}); 