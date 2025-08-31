/**
 * Advertising Feed Hover Effects
 * Простые hover эффекты для advertising feed постов
 */

document.addEventListener('DOMContentLoaded', function() {
    // Находим все посты advertising feed
    const advertisingPosts = document.querySelectorAll('.social_feed');
    
    // Добавляем hover эффекты
    advertisingPosts.forEach(post => {
        post.addEventListener('mouseenter', function() {
            this.classList.add('hover');
        });
        
        post.addEventListener('mouseleave', function() {
            this.classList.remove('hover');
        });
    });
});
