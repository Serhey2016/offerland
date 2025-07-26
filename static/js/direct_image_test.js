// Прямой тест загрузки изображений
console.log('=== DIRECT IMAGE LOADING TEST ===');

document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM loaded for direct image test');
    
    // Ищем все изображения в галерее
    const images = document.querySelectorAll('.social_feed_image_gallery_1 img');
    console.log('Found', images.length, 'images');
    
    if (images.length === 0) {
        console.error('❌ No images found in gallery');
        return;
    }
    
    // Тестируем первое изображение
    const firstImg = images[0];
    console.log('Testing first image:', firstImg.src);
    
    // Создаем новый элемент изображения для тестирования
    const testImg = new Image();
    
    testImg.onload = function() {
        console.log('✅ Test image loaded successfully');
        console.log('Natural size:', testImg.naturalWidth, 'x', testImg.naturalHeight);
        console.log('Current size:', testImg.width, 'x', testImg.height);
        
        // Показываем изображение на странице для проверки
        testImg.style.width = '200px';
        testImg.style.height = 'auto';
        testImg.style.border = '2px solid green';
        testImg.style.margin = '10px';
        document.body.appendChild(testImg);
        
        console.log('✅ Test image added to page');
    };
    
    testImg.onerror = function() {
        console.error('❌ Test image failed to load:', firstImg.src);
        
        // Пробуем загрузить с полным URL
        const fullUrl = window.location.origin + firstImg.src;
        console.log('Trying full URL:', fullUrl);
        
        const testImg2 = new Image();
        testImg2.onload = function() {
            console.log('✅ Test image loaded with full URL');
            testImg2.style.width = '200px';
            testImg2.style.height = 'auto';
            testImg2.style.border = '2px solid blue';
            testImg2.style.margin = '10px';
            document.body.appendChild(testImg2);
        };
        testImg2.onerror = function() {
            console.error('❌ Test image failed even with full URL');
        };
        testImg2.src = fullUrl;
    };
    
    testImg.src = firstImg.src;
    
    // Проверяем все изображения
    images.forEach((img, index) => {
        console.log(`Image ${index + 1}:`, {
            src: img.src,
            fullUrl: window.location.origin + img.src,
            naturalWidth: img.naturalWidth,
            naturalHeight: img.naturalHeight,
            complete: img.complete
        });
    });
    
    // Проверяем ссылки
    const links = document.querySelectorAll('.social_feed_image_gallery_1 a');
    console.log('Found', links.length, 'links');
    
    links.forEach((link, index) => {
        console.log(`Link ${index + 1}:`, {
            href: link.href,
            fullHref: window.location.origin + link.href,
            hasImg: !!link.querySelector('img')
        });
    });
    
    // Добавляем кнопку для тестирования
    const testButton = document.createElement('button');
    testButton.textContent = 'Test Image Loading';
    testButton.style.position = 'fixed';
    testButton.style.top = '10px';
    testButton.style.right = '10px';
    testButton.style.zIndex = '9999';
    testButton.style.padding = '10px';
    testButton.style.backgroundColor = 'red';
    testButton.style.color = 'white';
    testButton.style.border = 'none';
    testButton.style.cursor = 'pointer';
    
    testButton.onclick = function() {
        console.log('=== MANUAL TEST TRIGGERED ===');
        
        // Пробуем загрузить все изображения
        images.forEach((img, index) => {
            const testImg = new Image();
            testImg.onload = function() {
                console.log(`✅ Manual test: Image ${index + 1} loaded`);
            };
            testImg.onerror = function() {
                console.error(`❌ Manual test: Image ${index + 1} failed:`, img.src);
            };
            testImg.src = img.src;
        });
    };
    
    document.body.appendChild(testButton);
    console.log('✅ Test button added to page');
}); 