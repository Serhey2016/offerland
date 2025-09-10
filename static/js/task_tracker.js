// Task Tracker JavaScript
document.addEventListener('DOMContentLoaded', function() {
    // Dynamic greeting based on time of day
    function updateGreeting() {
        const greetingTimeElement = document.getElementById('greeting-time');
        const greetingSubtitleElement = document.getElementById('greeting-subtitle');
        
        if (!greetingTimeElement || !greetingSubtitleElement) return;
        
        const currentHour = new Date().getHours();
        let greeting;
        let subtitle;
        
        if (currentHour >= 5 && currentHour < 12) {
            greeting = 'Good Morning.';
            subtitle = 'Today is a great day!';
        } else if (currentHour >= 12 && currentHour < 17) {
            greeting = 'Good Afternoon.';
            subtitle = 'Hope you\'re having a productive day!';
        } else if (currentHour >= 17 && currentHour < 21) {
            greeting = 'Good Evening.';
            subtitle = 'Time to wrap up and relax!';
        } else {
            greeting = 'Good Night.';
            subtitle = 'Time for some rest!';
        }
        
        greetingTimeElement.textContent = greeting;
        greetingSubtitleElement.textContent = subtitle;
    }
    
    // Update greeting on page load
    updateGreeting();
    
    // Update greeting every hour
    setInterval(updateGreeting, 3600000); // 3600000ms = 1 hour
    
    // Dynamic date and time updates
    function updateDateTime() {
        const now = new Date();
        
        // Update day name
        const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        const dayNameElement = document.getElementById('day-name');
        if (dayNameElement) {
            dayNameElement.textContent = dayNames[now.getDay()];
        }
        
        // Update day number
        const dayNumberElement = document.getElementById('day-number');
        if (dayNumberElement) {
            dayNumberElement.textContent = now.getDate();
        }
        
        // Update month name
        const monthNames = ['JANUARY', 'FEBRUARY', 'MARCH', 'APRIL', 'MAY', 'JUNE', 
                           'JULY', 'AUGUST', 'SEPTEMBER', 'OCTOBER', 'NOVEMBER', 'DECEMBER'];
        const monthNameElement = document.getElementById('month-name');
        if (monthNameElement) {
            monthNameElement.textContent = monthNames[now.getMonth()];
        }
        
        // Update current time
        const currentTimeElement = document.getElementById('current-time');
        if (currentTimeElement) {
            const hours = now.getHours();
            const minutes = now.getMinutes();
            const timeString = `${hours}.${minutes.toString().padStart(2, '0')}`;
            currentTimeElement.textContent = timeString;
        }
        
        // Update location (you can customize this based on your needs)
        const locationElement = document.getElementById('location');
        if (locationElement) {
            // For now, using a default location. You can integrate with geolocation API later
            locationElement.textContent = 'London';
        }
    }
    
    // Update date/time on page load
    updateDateTime();
    
    // Update time every minute
    setInterval(updateDateTime, 60000); // 60000ms = 1 minute
    
    // Sub-menu horizontal scrolling functionality
    function initSubMenuScrolling() {
        const scrollableContainer = document.querySelector('.sub_menu_navigation_items');
        if (!scrollableContainer) return;
        
        let isDown = false;
        let startX;
        let scrollLeft;
        
        // Mouse events
        scrollableContainer.addEventListener('mousedown', (e) => {
            isDown = true;
            scrollableContainer.style.cursor = 'grabbing';
            startX = e.pageX - scrollableContainer.offsetLeft;
            scrollLeft = scrollableContainer.scrollLeft;
        });
        
        scrollableContainer.addEventListener('mouseleave', () => {
            isDown = false;
            scrollableContainer.style.cursor = 'grab';
        });
        
        scrollableContainer.addEventListener('mouseup', () => {
            isDown = false;
            scrollableContainer.style.cursor = 'grab';
        });
        
        scrollableContainer.addEventListener('mousemove', (e) => {
            if (!isDown) return;
            e.preventDefault();
            const x = e.pageX - scrollableContainer.offsetLeft;
            const walk = (x - startX) * 2; // Scroll speed multiplier
            scrollableContainer.scrollLeft = scrollLeft - walk;
        });
        
        // Touch events for mobile
        let startTouchX;
        let scrollLeftTouch;
        
        scrollableContainer.addEventListener('touchstart', (e) => {
            startTouchX = e.touches[0].pageX;
            scrollLeftTouch = scrollableContainer.scrollLeft;
        });
        
        scrollableContainer.addEventListener('touchmove', (e) => {
            if (!startTouchX) return;
            const x = e.touches[0].pageX;
            const walk = (startTouchX - x) * 2;
            scrollableContainer.scrollLeft = scrollLeftTouch + walk;
        });
        
        scrollableContainer.addEventListener('touchend', () => {
            startTouchX = null;
        });
        
        // Set initial cursor
        scrollableContainer.style.cursor = 'grab';
    }
    
    // Initialize sub-menu scrolling
    initSubMenuScrolling();
    
    // Left sidebar submenu functionality
    function initSidebarSubmenus() {
        const expandableButtons = document.querySelectorAll('.task_tracker_menu_item.expandable');
        
        expandableButtons.forEach(button => {
            button.addEventListener('click', function() {
                const targetId = this.getAttribute('data-target');
                const submenu = document.getElementById(targetId);
                
                if (submenu) {
                    const isExpanded = this.classList.contains('expanded');
                    
                    if (isExpanded) {
                        // Collapse submenu
                        submenu.classList.remove('show');
                        this.classList.remove('expanded');
                    } else {
                        // Expand submenu
                        submenu.classList.add('show');
                        this.classList.add('expanded');
                    }
                }
            });
        });
        
        // Handle submenu item clicks
        const submenuItems = document.querySelectorAll('.submenu_item');
        submenuItems.forEach(item => {
            item.addEventListener('click', function() {
                // Remove active state from all submenu items
                submenuItems.forEach(subItem => subItem.classList.remove('active'));
                // Add active state to clicked item
                this.classList.add('active');
            });
        });
    }
    
    // Initialize sidebar submenus
    initSidebarSubmenus();
    
    // Sub-category menu functionality
    function initSubCategoryMenu() {
        const subCatItems = document.querySelectorAll('.sub_cat_menu_item');
        
        subCatItems.forEach(item => {
            item.addEventListener('click', function() {
                const isCurrentlyActive = this.classList.contains('active');
                
                if (isCurrentlyActive) {
                    // If clicked item is already active, deselect it
                    this.classList.remove('active');
                } else {
                    // Remove active state from all items
                    subCatItems.forEach(subItem => subItem.classList.remove('active'));
                    // Add active state to clicked item
                    this.classList.add('active');
                }
            });
        });
        
        // No default active state - user must select manually
    }
    
    // Initialize sub-category menu
    initSubCategoryMenu();
});
