// Time Slot Feed Dropdown Menu Functionality
document.addEventListener('DOMContentLoaded', function() {
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
