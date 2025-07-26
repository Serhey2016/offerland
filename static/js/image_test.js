// Тест загрузки изображений
console.log('=== IMAGE LOADING TEST ===');

document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM loaded for image test');
    
    // Ищем все изображения в галерее
    const images = document.querySelectorAll('.social_feed_image_gallery_1 img');
    console.log('Found', images.length, 'images');
    
    images.forEach((img, index) => {
        console.log(`Image ${index + 1}:`, {
            src: img.src,
            alt: img.alt,
            naturalWidth: img.naturalWidth,
            naturalHeight: img.naturalHeight,
            complete: img.complete,
            width: img.width,
            height: img.height
        });
        
        // Проверяем загрузку изображения
        if (img.complete) {
            console.log(`✅ Image ${index + 1} already loaded`);
        } else {
            console.log(`⏳ Image ${index + 1} still loading...`);
            img.addEventListener('load', function() {
                console.log(`✅ Image ${index + 1} loaded successfully`);
            });
            img.addEventListener('error', function() {
                console.error(`❌ Image ${index + 1} failed to load:`, img.src);
            });
        }
    });
    
    // Ищем ссылки
    const links = document.querySelectorAll('.social_feed_image_gallery_1 a');
    console.log('Found', links.length, 'links');
    
    links.forEach((link, index) => {
        console.log(`Link ${index + 1}:`, {
            href: link.href,
            hasImg: !!link.querySelector('img'),
            imgSrc: link.querySelector('img')?.src
        });
        
        // Добавляем обработчик клика для тестирования
        link.addEventListener('click', function(e) {
            e.preventDefault();
            console.log('🖱️ Link clicked:', link.href);
            console.log('🖱️ Image src:', link.querySelector('img')?.src);
            
            // Пробуем открыть изображение в новом окне
            window.open(link.href, '_blank');
        });
    });
    
    // Проверяем, есть ли изображения с ошибками загрузки
    setTimeout(function() {
        console.log('=== IMAGE LOADING STATUS CHECK ===');
        images.forEach((img, index) => {
            if (img.naturalWidth === 0 || img.naturalHeight === 0) {
                console.error(`❌ Image ${index + 1} failed to load properly:`, img.src);
            } else {
                console.log(`✅ Image ${index + 1} loaded properly:`, img.naturalWidth, 'x', img.naturalHeight);
            }
        });
    }, 3000);
}); 