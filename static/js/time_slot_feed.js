// Time Slot Feed Dropdown Menu Functionality
document.addEventListener('DOMContentLoaded', function() {
    // Initialize heart icons
    initializeHeartIcons();
    
    // Handle dropdown menu toggle
    document.addEventListener('click', function(e) {
        const trigger = e.target.closest('.time_slot_dropdown_trigger');
        if (trigger) {
            const menuId = trigger.id.replace('time_slot_menu_trigger_', '');
            const menu = document.getElementById(`time_slot_overflow_menu_${menuId}`);
            
            // Close all other menus first
            document.querySelectorAll('.time_slot_dropdown_menu_content').forEach(m => {
                if (m !== menu) {
                    m.style.display = 'none';
                }
            });
            
            // Toggle current menu
            if (menu.style.display === 'none' || menu.style.display === '') {
                menu.style.display = 'block';
            } else {
                menu.style.display = 'none';
            }
            
            e.stopPropagation();
        }
        
        // Close menu when clicking outside
        if (!e.target.closest('.time_slot_dropdown_menu')) {
            document.querySelectorAll('.time_slot_dropdown_menu_content').forEach(menu => {
                menu.style.display = 'none';
            });
        }
    });
    
    // Handle menu item clicks
    document.addEventListener('click', function(e) {
        const menuItem = e.target.closest('.time_slot_dropdown_menu_item');
        if (menuItem) {
            const action = menuItem.dataset.action;
            const id = menuItem.dataset.id;
            
            console.log(`Action: ${action}, ID: ${id}`);
            
            // Handle different actions
            switch(action) {
                case 'edit':
                    handleEdit(id);
                    break;
                case 'publish':
                    handlePublish(id);
                    break;
                case 'archive':
                    handleArchive(id);
                    break;
            }
            
            // Close menu after action
            const menu = menuItem.closest('.time_slot_dropdown_menu_content');
            if (menu) {
                menu.style.display = 'none';
            }
            
            e.stopPropagation();
        }
    });
    
    // Action handlers
    function handleEdit(id) {
        // Implement edit functionality
        console.log(`Editing time slot ${id}`);
        // Add your edit logic here
    }
    
    function handlePublish(id) {
        // Implement publish functionality
        console.log(`Publishing time slot ${id}`);
        // Add your publish logic here
    }
    
    function handleArchive(id) {
        // Implement archive functionality
        console.log(`Archiving time slot ${id}`);
        // Add your archive logic here
    }
    
    // Add hover effects for menu items
    document.addEventListener('mouseenter', function(e) {
        const menuItem = e.target.closest('.time_slot_dropdown_menu_item');
        if (menuItem) {
            menuItem.style.backgroundColor = '#f5f5f5';
        }
    }, true);
    
    document.addEventListener('mouseleave', function(e) {
        const menuItem = e.target.closest('.time_slot_dropdown_menu_item');
        if (menuItem) {
            menuItem.style.backgroundColor = '';
        }
    }, true);
});

// Heart icon functionality
function initializeHeartIcons() {
    const heartIcons = document.querySelectorAll('.sftsts1_favorites_icon');
    
    heartIcons.forEach(icon => {
        // Set initial state (unfilled by default)
        icon.dataset.favorite = 'false';
        
        // Add click event
        icon.addEventListener('click', function() {
            toggleHeartIcon(this);
        });
        
        // Add hover effects
        icon.addEventListener('mouseenter', function() {
            this.style.transform = 'scale(1.1)';
        });
        
        icon.addEventListener('mouseleave', function() {
            this.style.transform = 'scale(1)';
        });
    });
}

function toggleHeartIcon(icon) {
    const isFavorite = icon.dataset.favorite === 'true';
    const svg = icon.querySelector('svg');
    const path = svg.querySelector('path');
    
    if (isFavorite) {
        // Change to unfilled heart
        path.setAttribute('fill', '#282d3b');
        icon.dataset.favorite = 'false';
        
        // Add animation
        icon.style.animation = 'heartUnfavorite 0.3s ease-in-out';
        setTimeout(() => {
            icon.style.animation = '';
        }, 300);
        
        console.log('Removed from favorites');
    } else {
        // Change to filled heart
        path.setAttribute('fill', 'red');
        icon.dataset.favorite = 'true';
        
        // Add animation
        icon.style.animation = 'heartFavorite 0.3s ease-in-out';
        setTimeout(() => {
            icon.style.animation = '';
        }, 300);
        
        console.log('Added to favorites');
    }
}

// Add CSS animations for heart icons
const style = document.createElement('style');
style.textContent = `
    @keyframes heartFavorite {
        0% { transform: scale(1); }
        50% { transform: scale(1.3); }
        100% { transform: scale(1.1); }
    }
    
    @keyframes heartUnfavorite {
        0% { transform: scale(1.1); }
        50% { transform: scale(0.8); }
        100% { transform: scale(1); }
    }
`;
document.head.appendChild(style);
