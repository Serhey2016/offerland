// Alertify.js Integration for Task Feed Notifications
// This file contains integration code for alertify.js library to handle notifications
// for task feed interactions (save/cancel actions)

// Initialize alertify configuration
document.addEventListener('DOMContentLoaded', function() {
    // Configure alertify for notifications - top-right position
    alertify.set('notifier', 'position', 'top-right');
    alertify.set('notifier', 'delay', 5);
    
    // Force top-right positioning with additional settings
    alertify.set('notifier', 'position', 'top-right');
    
    // Override existing showNotification function
    overrideShowNotification();
    
    // Initialize cancel notification functionality
    // Wait a bit for other scripts to load
    setTimeout(function() {
        addCancelNotification();
    }, 100);
    
    // Force positioning after a delay to ensure CSS is applied
    setTimeout(function() {
        forceTopRightPositioning();
    }, 200);
    
    // Monitor DOM changes for new alertify elements
    const observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            if (mutation.type === 'childList') {
                mutation.addedNodes.forEach(function(node) {
                    if (node.nodeType === 1 && (node.classList.contains('alertify-logs') || node.classList.contains('ajs-notifier') || node.querySelector && (node.querySelector('.alertify-logs') || node.querySelector('.ajs-notifier')))) {
                        setTimeout(function() {
                            forceTopRightPositioning();
                        }, 10);
                    }
                });
            }
        });
    });
    
    observer.observe(document.body, {
        childList: true,
        subtree: true
    });
});

function forceTopRightPositioning() {
    // Force all alertify elements to top-right
    const alertifyElements = document.querySelectorAll('.alertify-logs, .ajs-notifier, .alertify-logs *, .ajs-notifier *');
    alertifyElements.forEach(function(element) {
        element.style.position = 'fixed';
        element.style.top = '20px';
        element.style.right = '20px';
        element.style.bottom = 'auto';
        element.style.left = 'auto';
        element.style.zIndex = '9999';
        element.style.transform = 'none';
    });
    
    // Also target any elements that might be created dynamically
    setTimeout(function() {
        const allAlertifyElements = document.querySelectorAll('[class*="alertify"], [class*="ajs-"]');
        allAlertifyElements.forEach(function(element) {
            element.style.position = 'fixed';
            element.style.top = '20px';
            element.style.right = '20px';
            element.style.bottom = 'auto';
            element.style.left = 'auto';
            element.style.zIndex = '9999';
            element.style.transform = 'none';
        });
    }, 100);
}

function overrideShowNotification() {
    // Store the original showNotification function if it exists
    if (typeof window.showNotification !== 'undefined') {
        window.originalShowNotification = window.showNotification;
    }
    
    // Override with alertify version only - no duplicate notifications
    window.showNotification = function(message, type) {
        showAlertifyNotification(message, type);
        // Removed call to original function to prevent duplicate notifications
    };
}

function showAlertifyNotification(message, type) {
    switch (type) {
        case 'success':
            alertify.success(message);
            break;
        case 'error':
            alertify.error(message);
            break;
        case 'warning':
            alertify.warning(message);
            break;
        case 'message':
        default:
            alertify.message(message);
            break;
    }
    
    // Force positioning after showing notification
    setTimeout(function() {
        forceTopRightPositioning();
    }, 50);
}

// Add cancel notification functionality to existing closeNotesPopup function
function addCancelNotification() {
    // Store original closeNotesPopup function
    if (typeof window.closeNotesPopup !== 'undefined') {
        window.originalCloseNotesPopup = window.closeNotesPopup;
        
        // Override with new version that shows notification
        window.closeNotesPopup = function(taskId) {
            // Show notification that changes were not saved
            showAlertifyNotification('Changes to notes were not saved', 'warning');
            
            // Call original function
            if (window.originalCloseNotesPopup) {
                window.originalCloseNotesPopup(taskId);
            }
        };
    }
}

// Export functions for global access
window.showAlertifyNotification = showAlertifyNotification;
window.addCancelNotification = addCancelNotification;
window.forceTopRightPositioning = forceTopRightPositioning;
