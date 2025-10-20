// Social Feed Overflow Menu Handler
document.addEventListener('DOMContentLoaded', function() {
    
    // Ensure all menus are hidden by default
    function hideAllOverflowMenus() {
        const allMenus = document.querySelectorAll('.social_feed_overflow_menu');
        allMenus.forEach(menu => {
            if (menu) {
                menu.classList.remove('show');
            }
        });
    }
    
    // Hide all menus when page loads
    hideAllOverflowMenus();
    
    // Function to close all open menus
    function closeAllOverflowMenus() {
        const openMenus = document.querySelectorAll('.social_feed_overflow_menu.show');
        openMenus.forEach(menu => {
            if (menu) {
                menu.classList.remove('show');
            }
        });
    }
    
    // Handler for menu icon click
    document.addEventListener('click', function(e) {
        // Validate event target
        if (!e.target || typeof e.target.closest !== 'function') {
            return;
        }
        
        if (e.target.closest('.social_feed_menu')) {
            e.preventDefault();
            e.stopPropagation();
            
            const menuContainer = e.target.closest('.social_feed_menu');
            const overflowMenu = menuContainer.querySelector('.social_feed_overflow_menu');
            
            // Close all other menus
            closeAllOverflowMenus();
            
            // Toggle current menu
            if (overflowMenu && overflowMenu.classList.contains('show')) {
                overflowMenu.classList.remove('show');
            } else if (overflowMenu) {
                overflowMenu.classList.add('show');
            }
        }
    });
    
    // Handler for menu item clicks
    document.addEventListener('click', function(e) {
        // Validate event target
        if (!e.target || typeof e.target.closest !== 'function') {
            return;
        }
        
        if (e.target.closest('.social_feed_overflow_menu_item')) {
            e.preventDefault();
            e.stopPropagation();
            
            const menuItem = e.target.closest('.social_feed_overflow_menu_item');
            const action = menuItem.dataset.action;
            const id = menuItem.dataset.id;
            
            // Close menu
            closeAllOverflowMenus();
            
            // Handle actions
            switch(action) {
                case 'start':
                    handleStart(id);
                    break;
                case 'edit':
                    handleEdit(id);
                    break;
                case 'remove':
                    handleRemove(id);
                    break;
            }
        }
    });
    
    // Handler for clicks outside menu to close it
    document.addEventListener('click', function(e) {
        // Validate event target
        if (!e.target || typeof e.target.closest !== 'function') {
            return;
        }
        
        if (!e.target.closest('.social_feed_menu')) {
            closeAllOverflowMenus();
        }
    });
    
    // Additional check - ensure menu is hidden on page load
    window.addEventListener('load', function() {
        hideAllOverflowMenus();
    });
    
    // Handler for Escape key to close menu
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            closeAllOverflowMenus();
        }
    });
    
    // Function to handle start action
    function handleStart(id) {
        console.log('Start item with ID:', id);
        
        // Get CSRF token
        const csrftoken = getCookie('csrftoken');
        
        if (!csrftoken) {
            alert('CSRF token not found. Please refresh the page and try again.');
            return;
        }
        
        // Send AJAX request to set start date
        fetch(`/services_and_projects/start_job_search/${id}/`, {
            method: 'POST',
            headers: {
                'X-CSRFToken': csrftoken,
                'Content-Type': 'application/json',
            },
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                // Update date display on page
                const startDateElement = document.getElementById(`post_start_date_${id}`);
                if (startDateElement) {
                    startDateElement.textContent = data.start_date;
                }
                
                // Show success notification
                if (typeof window.alertify !== 'undefined') {
                    window.alertify.success('Job search started successfully!');
                } else {
                    alert('Job search started successfully!');
                }
            } else if (data.warning) {
                // Show warning notification
                if (typeof window.alertify !== 'undefined') {
                    window.alertify.warning(data.message);
                } else {
                    alert(data.message);
                }
            } else {
                // Show error
                if (typeof window.alertify !== 'undefined') {
                    window.alertify.error('Error starting job search: ' + data.error);
                } else {
                    alert('Error starting job search: ' + data.error);
                }
            }
        })
        .catch(error => {
            console.error('Error:', error);
            
            // Show error
            if (typeof window.alertify !== 'undefined') {
                window.alertify.error('Network error occurred while starting job search');
            } else {
                alert('Network error occurred while starting job search');
            }
        });
    }
    
    // Function to handle edit action
    function handleEdit(id) {
        console.log('Edit item with ID:', id);
        // Here you can add logic for editing
        // For example, open modal window or redirect to edit page
        
        // Example: open modal window
        // showEditModal(id);
        
        // Or redirect to edit page
        // window.location.href = `/edit/${id}/`;
    }
    
    // Function to handle remove action
    function handleRemove(id) {
        console.log('Remove item with ID:', id);
        
        // Show delete confirmation
        if (confirm('Are you sure you want to delete this item?')) {
            // Here you can add logic for deletion
            // For example, send AJAX request to server
            
            // Example AJAX request:
            /*
            fetch(`/api/remove/${id}/`, {
                method: 'DELETE',
                headers: {
                    'X-CSRFToken': getCookie('csrftoken'),
                    'Content-Type': 'application/json',
                },
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    // Remove element from DOM
                    const element = document.querySelector(`[data-id="${id}"]`).closest('.post_info_top');
                    if (element) {
                        element.remove();
                    }
                } else {
                    alert('Error deleting: ' + data.message);
                }
            })
            .catch(error => {
                console.error('Error:', error);
                alert('An error occurred while deleting');
            });
            */
            
            // Temporary solution - just remove element from DOM
            const element = document.querySelector(`[data-id="${id}"]`).closest('.post_info_top');
            if (element) {
                element.remove();
            }
        }
    }
    
    // Helper function to get CSRF token
    function getCookie(name) {
        let cookieValue = null;
        if (document.cookie && document.cookie !== '') {
            const cookies = document.cookie.split(';');
            for (let i = 0; i < cookies.length; i++) {
                const cookie = cookies[i].trim();
                if (cookie.substring(0, name.length + 1) === (name + '=')) {
                    cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                    break;
                }
            }
        }
        return cookieValue;
    }
});
