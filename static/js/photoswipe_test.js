// Простой тест PhotoSwipe
document.addEventListener('DOMContentLoaded', function() {
    console.log('=== PhotoSwipe Test ===');
    
    // Проверяем доступность библиотек
    console.log('PhotoSwipeLightbox available:', typeof PhotoSwipeLightbox !== 'undefined');
    console.log('PhotoSwipe available:', typeof PhotoSwipe !== 'undefined');
    
    // Проверяем галерею
    const gallery = document.querySelector('.social_feed_image_gallery_1');
    console.log('Gallery found:', !!gallery);
    
    if (gallery) {
        const links = gallery.querySelectorAll('a');
        console.log('Image links found:', links.length);
        
        links.forEach((link, index) => {
            console.log(`Link ${index + 1}:`, {
                href: link.href,
                hasImg: !!link.querySelector('img'),
                imgSrc: link.querySelector('img')?.src
            });
        });
    }
    
    // Простая инициализация
    if (typeof PhotoSwipeLightbox !== 'undefined' && typeof PhotoSwipe !== 'undefined') {
        try {
            const lightbox = new PhotoSwipeLightbox({
                gallery: '.social_feed_image_gallery_1',
                children: 'a',
                pswpModule: PhotoSwipe
            });
            
            lightbox.on('open', function() {
                console.log('✅ PhotoSwipe opened successfully');
            });
            
            lightbox.on('contentLoad', function(e) {
                console.log('✅ Content loaded:', e.content.data.type);
                if (e.content.data.type === 'image') {
                    console.log('✅ Image URL:', e.content.data.src);
                }
            });
            
            lightbox.init();
            console.log('✅ PhotoSwipe initialized successfully');
            
        } catch (error) {
            console.error('❌ Error initializing PhotoSwipe:', error);
        }
    }
}); 