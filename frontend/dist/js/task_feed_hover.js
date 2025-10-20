/**
 * Task Feed Hover Effects
 * Простые hover эффекты для task feed постов
 */

document.addEventListener('DOMContentLoaded', function() {
    // Находим все посты task feed
    const taskPosts = document.querySelectorAll('.social_feed2');
    
    // Добавляем hover эффекты
    taskPosts.forEach(post => {
        post.addEventListener('mouseenter', function() {
            this.classList.add('hover');
        });
        
        post.addEventListener('mouseleave', function() {
            this.classList.remove('hover');
        });
    });
});
