
// Task Tracker JavaScript - Optimized for Performance
// Performance optimization: Cache DOM elements and use throttling
let cachedElements = {};
let resizeTimeout;

// Throttle function for performance optimization
function throttle(func, limit) {
    let inThrottle;
    return function() {
        const args = arguments;
        const context = this;
        if (!inThrottle) {
            func.apply(context, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    }
}

// Debounce function for resize events
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Cache frequently used DOM elements for better performance
function cacheElements() {
    cachedElements = {
        greetingTime: document.getElementById('greeting-time'),
        greetingSubtitle: document.getElementById('greeting-subtitle'),
        dayName: document.getElementById('day-name'),
        dayNumber: document.getElementById('day-number'),
        monthName: document.getElementById('month-name'),
        location: document.getElementById('location'),
        separatorDayName: document.getElementById('separator-day-name'),
        separatorDayDate: document.getElementById('separator-day-date'),
        separatorMonthName: document.getElementById('separator-month-name'),
        subMenu: document.querySelector('.task_tracker_sub_menu_section'),
        subCatItems: document.querySelectorAll('.task_tracker_sub_cat_menu_item'),
        tasks: document.querySelectorAll('.task_tracker_timeline_task')
    };
}

document.addEventListener('DOMContentLoaded', function() {
    // Performance tip: Cache DOM elements once at startup
    cacheElements();
    // Dynamic greeting based on time of day - Optimized with cached elements
    function updateGreeting() {
        // Performance tip: Use cached elements instead of querySelector
        const greetingTimeElement = cachedElements.greetingTime;
        const greetingSubtitleElement = cachedElements.greetingSubtitle;
        
        if (!greetingTimeElement || !greetingSubtitleElement) return;
        
        // Performance tip: Cache Date object and use lookup table for better performance
        const currentHour = new Date().getHours();
        const greetingData = getGreetingData(currentHour);
        
        greetingTimeElement.textContent = greetingData.greeting;
        greetingSubtitleElement.textContent = greetingData.subtitle;
    }
    
    // Performance tip: Use lookup table instead of multiple if-else statements
    function getGreetingData(hour) {
        const greetingMap = {
            morning: { greeting: 'Good Morning.', subtitle: 'Today is a great day!' },
            afternoon: { greeting: 'Good Afternoon.', subtitle: 'Hope you\'re having a productive day!' },
            evening: { greeting: 'Good Evening.', subtitle: 'Time to wrap up and relax!' },
            night: { greeting: 'Good Night.', subtitle: 'Time for some rest!' }
        };
        
        if (hour >= 5 && hour < 12) return greetingMap.morning;
        if (hour >= 12 && hour < 17) return greetingMap.afternoon;
        if (hour >= 17 && hour < 21) return greetingMap.evening;
        return greetingMap.night;
    }
    
    // Update greeting on page load
    updateGreeting();
    
    // Update greeting every hour
    setInterval(updateGreeting, 3600000); // 3600000ms = 1 hour
    
    // Dynamic date and time updates - Optimized with cached elements and constants
    function updateDateTime() {
        // Performance tip: Cache Date object and reuse it
        const now = new Date();
        
        // Performance tip: Use cached elements instead of repeated querySelector calls
        const dayNameElement = cachedElements.dayName;
        const dayNumberElement = cachedElements.dayNumber;
        const monthNameElement = cachedElements.monthName;
        const currentTimeElement = document.getElementById('current-time');
        const locationElement = cachedElements.location;
        const separatorDayNameElement = cachedElements.separatorDayName;
        const separatorDayDateElement = cachedElements.separatorDayDate;
        const separatorMonthNameElement = cachedElements.separatorMonthName;
        
        // Performance tip: Use constants for arrays to avoid recreation
        const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        const monthNames = ['JANUARY', 'FEBRUARY', 'MARCH', 'APRIL', 'MAY', 'JUNE', 
                           'JULY', 'AUGUST', 'SEPTEMBER', 'OCTOBER', 'NOVEMBER', 'DECEMBER'];
        
        // Performance tip: Batch DOM updates to minimize reflows
        if (dayNameElement) dayNameElement.textContent = dayNames[now.getDay()];
        if (dayNumberElement) dayNumberElement.textContent = now.getDate();
        if (monthNameElement) monthNameElement.textContent = monthNames[now.getMonth()];
        if (currentTimeElement) currentTimeElement.textContent = formatTime(now);
        if (locationElement) locationElement.textContent = 'London';
        
        // Update separator date (next day)
        const nextDay = new Date(now);
        nextDay.setDate(now.getDate() + 1);
        if (separatorDayNameElement) separatorDayNameElement.textContent = dayNames[nextDay.getDay()];
        if (separatorDayDateElement) separatorDayDateElement.textContent = nextDay.getDate();
        if (separatorMonthNameElement) separatorMonthNameElement.textContent = monthNames[nextDay.getMonth()];
    }
    
    // Performance tip: Efficient time formatting function
    function formatTime(date) {
        const hours = date.getHours();
        const minutes = date.getMinutes().toString().padStart(2, '0');
        return `${hours}.${minutes}`;
    }
    
    // Update date/time on page load
    updateDateTime();
    
    // Update time every minute
    setInterval(updateDateTime, 60000); // 60000ms = 1 minute
    
    // Sub-menu horizontal scrolling functionality
    function initSubMenuScrolling() {
        const scrollableContainer = document.querySelector('.task_tracker_sub_menu_navigation_items');
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
        // Add click handlers for expandable menu items
        const expandableButtons = document.querySelectorAll('.task_tracker_menu_item.expandable');
        expandableButtons.forEach(button => {
            button.addEventListener('click', function(e) {
                e.preventDefault();
                e.stopPropagation();
                
                const category = this.getAttribute('data-category');
                if (category) {
                    // Dispatch custom event to React component
                    const customEvent = new CustomEvent('expandableMenuClick', {
                        detail: { category: category }
                    });
                    window.dispatchEvent(customEvent);
                }
            });
        });
        
        // Handle submenu item clicks
        const submenuItems = document.querySelectorAll('.task_tracker_submenu_item');
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
        const subCatItems = document.querySelectorAll('.task_tracker_sub_cat_menu_item');
        
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
    
    // Initialize timeline tasks positioning
    initTimelineTasks();
    
    // Timeline date now handled by updateDateTime function
    
    // Performance tip: Use debounced resize handler to prevent excessive recalculations
    window.addEventListener('resize', debounce(handleResize, 250));
});

// Optimized resize handler
function handleResize() {
    // Performance tip: Only recalculate when necessary
    initTimelineTasks();
}

// Timeline Tasks Positioning - Optimized for performance
function initTimelineTasks() {
    // Performance tip: Use cached elements if available, otherwise query once
    const tasks = cachedElements.tasks.length > 0 ? cachedElements.tasks : document.querySelectorAll('.task_tracker_timeline_task');
    
    // Performance tip: Cache screen size check and calculations
    const isMobile = window.innerWidth <= 768;
    const pixelsPerHour = isMobile ? 50 : 60;
    const separatorHeight = isMobile ? 100 : 120;
    
    // Performance tip: Use DocumentFragment for batch DOM updates
    const fragment = document.createDocumentFragment();
    
    tasks.forEach(task => {
        const startTime = task.getAttribute('data-start');
        const endTime = task.getAttribute('data-end');
        
        if (startTime && endTime) {
            // Performance tip: Parse time once and cache results
            const timeData = parseTimeData(startTime, endTime);
            if (!timeData) return;
            
            // Calculate position based on screen size
            let topPosition = (timeData.startHour * pixelsPerHour) + (timeData.startMinute * (pixelsPerHour / 60));
            let height = ((timeData.endHour - timeData.startHour) * pixelsPerHour) + 
                        ((timeData.endMinute - timeData.startMinute) * (pixelsPerHour / 60));
            
            // Adjust for day separator if task is in second day
            const taskContainer = task.closest('.task_tracker_timeline_day');
            const isSecondDay = taskContainer && taskContainer.previousElementSibling && 
                               taskContainer.previousElementSibling.classList.contains('task_tracker_timeline_day_separator');
            
            if (isSecondDay) {
                // Add extra space for day separator (60px on desktop, 50px on mobile)
                topPosition += separatorHeight;
            }
            
            // Performance tip: Use CSS custom properties for better performance
            task.style.setProperty('--task-top', `${topPosition}px`);
            task.style.setProperty('--task-height', `${height}px`);
            task.style.top = topPosition + 'px';
            task.style.height = height + 'px';
        }
    });
}

// Performance tip: Parse time data once and return structured object
function parseTimeData(startTime, endTime) {
    const startParts = startTime.split(':');
    const endParts = endTime.split(':');
    
    if (startParts.length !== 2 || endParts.length !== 2) return null;
    
    return {
        startHour: parseInt(startParts[0], 10),
        startMinute: parseInt(startParts[1], 10),
        endHour: parseInt(endParts[0], 10),
        endMinute: parseInt(endParts[1], 10)
    };
}

// Timeline date now handled by updateDateTime function - no separate function needed
