/**
 * Testpage JavaScript functionality
 * Handles smooth scrolling for tags and other page-specific features
 */

document.addEventListener('DOMContentLoaded', function() {
    initSmoothScrolling();
});

/**
 * Initializes smooth scrolling functionality for tag sections
 */
function initSmoothScrolling() {
    const tagSections = document.querySelectorAll('.social_feed_time_slot_tag_section');
    
    tagSections.forEach(section => {
        const scrollContainer = section.querySelector('.social_feed_tags_scroll_container');
        const tagsContainer = section.querySelector('.social_feed_tags');
        
        if (!scrollContainer || !tagsContainer) return;
        
        let isScrolling = false;
        let scrollDirection = 0;
        let scrollInterval;
        
        // Smooth scrolling function
        function smoothScroll() {
            if (scrollDirection !== 0) {
                scrollContainer.scrollLeft += scrollDirection * 2;
                
                // Stop scrolling when reaching edges
                if (scrollDirection > 0 && scrollContainer.scrollLeft >= scrollContainer.scrollWidth - scrollContainer.clientWidth) {
                    scrollDirection = 0;
                } else if (scrollDirection < 0 && scrollContainer.scrollLeft <= 0) {
                    scrollDirection = 0;
                }
            }
        }
        
        // Mouse movement handler
        section.addEventListener('mousemove', function(e) {
            const rect = section.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const width = rect.width;
            
            // Define scroll zones (20px from edges)
            const scrollZone = 20;
            
            if (x < scrollZone) {
                // Scroll left
                scrollDirection = -1;
                if (!isScrolling) {
                    isScrolling = true;
                    scrollInterval = setInterval(smoothScroll, 16); // ~60fps
                }
            } else if (x > width - scrollZone) {
                // Scroll right
                scrollDirection = 1;
                if (!isScrolling) {
                    isScrolling = true;
                    scrollInterval = setInterval(smoothScroll, 16); // ~60fps
                }
            } else {
                // Stop scrolling
                scrollDirection = 0;
                if (isScrolling) {
                    isScrolling = false;
                    clearInterval(scrollInterval);
                }
            }
        });
        
        // Stop scrolling when mouse leaves
        section.addEventListener('mouseleave', function() {
            scrollDirection = 0;
            if (isScrolling) {
                isScrolling = false;
                clearInterval(scrollInterval);
            }
        });
    });
}
