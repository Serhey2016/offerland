/**
 * Edit Time Slot Form JavaScript
 * Handles the edit time slot modal functionality
 */

class EditTimeSlotForm {
    constructor() {
        this.modal = null;
        this.form = null;
        this.currentTimeSlotId = null;
        this.currentTimeSlotData = null;
        this.hashtags = [];
        this.allTags = [];
        
        this.init();
    }
    
    init() {
        this.bindEvents();
        // Tags will be loaded when modal is created
    }
    
    bindEvents() {
        // Close button event
        document.addEventListener('click', (e) => {
            if (e.target.closest('.edit-timeslot-modal-close-btn')) {
                this.closeModal();
            }
        });
        
        // Cancel button event
        document.addEventListener('click', (e) => {
            if (e.target.closest('.cancel-btn')) {
                this.closeModal();
            }
        });
        
        // Update button event
        document.addEventListener('click', (e) => {
            if (e.target.closest('.update-btn')) {
                this.handleUpdate();
            }
        });
        
        // Close modal on overlay click
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('edit-timeslot-modal-overlay')) {
                this.closeModal();
            }
        });
        
        // Escape key to close modal
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.isModalOpen()) {
                this.closeModal();
            }
        });
        
        // Hashtag input events
        this.bindHashtagEvents();
    }
    
    bindHashtagEvents() {
        document.addEventListener('input', (e) => {
            if (e.target.id === 'edit-timeslot-hashtags-input') {
                this.handleHashtagInput(e.target.value);
            }
        });
        
        document.addEventListener('click', (e) => {
            if (e.target.closest('.hashtag-dropdown-item')) {
                const tag = e.target.textContent.trim();
                this.addHashtag(tag);
            }
            
            if (e.target.closest('.remove-tag')) {
                const hashtagChip = e.target.closest('.hashtag-chip');
                if (hashtagChip) {
                    const hashtag = hashtagChip.textContent;
                    this.removeHashtag(hashtag);
                }
            }
        });
        
        // Focus events for hashtag container
        document.addEventListener('focusin', (e) => {
            if (e.target.closest('#edit-timeslot-hashtags-container')) {
                // Show dropdown only if there are tags
                if (this.allTags && this.allTags.length > 0) {
                    this.showHashtagDropdown();
                }
            }
        });
        
        document.addEventListener('focusout', (e) => {
            if (!e.target.closest('#edit-timeslot-hashtags-container')) {
                setTimeout(() => this.hideHashtagDropdown(), 150);
            }
        });
    }
    
    loadAllTags() {
        // Get tags from the existing form
        const existingForm = document.querySelector('#time-slot-form');
        if (existingForm) {
            const existingContainer = existingForm.querySelector('#time-slot-hashtags-container');
            if (existingContainer && existingContainer.dataset.allTags) {
                try {
                    this.allTags = JSON.parse(existingContainer.dataset.allTags);
                    console.log('Tags loaded:', this.allTags.length);
                } catch (e) {
                    console.error('Error parsing all tags:', e);
                    this.allTags = [];
                }
            } else {
                console.warn('No tags data found in existing form');
                this.allTags = [];
            }
        } else {
            console.warn('Existing form not found for tags');
            this.allTags = [];
        }
    }
    
    openModal(timeSlotId, timeSlotData) {
        console.log('Opening modal for time slot:', timeSlotId, 'with data:', timeSlotData);
        
        this.currentTimeSlotId = timeSlotId;
        this.currentTimeSlotData = timeSlotData;
        
        // Create modal if it doesn't exist
        if (!this.modal) {
            this.createModal();
        }
        
        // Wait for modal to be created and populated
        setTimeout(() => {
            // Populate form with current data
            this.populateForm();
            
            // Show modal
            this.modal.style.display = 'flex';
            document.body.style.overflow = 'hidden';
            
            // Focus on first input
            const firstInput = this.modal.querySelector('input:not([type="hidden"]), select');
            if (firstInput) firstInput.focus();
            
            console.log('Modal opened and populated');
        }, 200);
    }
    
    createModal() {
        // Check if modal already exists
        if (document.getElementById('edit-timeslot-modal')) {
            this.modal = document.getElementById('edit-timeslot-modal');
            this.form = document.getElementById('edit-timeslot-form-element');
            console.log('Using existing modal');
            return;
        }
        
        console.log('Creating new modal');
        
                // Create modal HTML
        const modalHTML = `
            <div id="edit-timeslot-modal" class="edit-timeslot-modal-overlay" style="display: none;">
                <div class="edit-timeslot-modal-form">
                    <button class="edit-timeslot-modal-close-btn">
                        <svg width="24" height="24" viewBox="0 0 24 24">
                            <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
                        </svg>
                    </button>
                    
                    <div class="edit-timeslot-header">
                        <h3>Edit Time Slot</h3>
                    </div>
                    
                    <form class="edit-timeslot-form" id="edit-timeslot-form-element">
                        <input type="hidden" name="edit_item_id" id="edit-timeslot-id">
                        <input type="hidden" name="type_of_task" value="5">
                        
                        <div class="form-group">
                            <label for="edit-timeslot-category">Category</label>
                            <select id="edit-timeslot-category" name="category" required>
                                <option value="">-- Select category --</option>
                            </select>
                        </div>
                        
                        <div class="form-group">
                            <label for="edit-timeslot-service">Service</label>
                            <select id="edit-timeslot-service" name="services" required>
                                <option value="">-- Select service --</option>
                            </select>
                        </div>
                        
                        <div class="form-row">
                            <div class="form-group half">
                                <label for="edit-timeslot-date-start">Date and time start</label>
                                <input type="date" id="edit-timeslot-date-start" name="date_start" required>
                                <input type="time" id="edit-timeslot-time-start" name="time_start" class="time-input" required>
                            </div>
                            <div class="form-group half">
                                <label for="edit-timeslot-date-end">Date and time end</label>
                                <input type="date" id="edit-timeslot-date-end" name="date_end" required>
                                <input type="time" id="edit-timeslot-time-end" name="time_end" class="time-input" required>
                            </div>
                        </div>
                        
                        <div class="form-group">
                            <label for="edit-timeslot-reserved-time">Reserved time on road (minutes)</label>
                            <input type="number" id="edit-timeslot-reserved-time" name="reserved_time_on_road" placeholder="e.g. 30" required>
                        </div>
                        
                        <div class="form-group">
                            <label for="edit-timeslot-start-location">Start location (post-code)</label>
                            <input type="text" id="edit-timeslot-start-location" name="start_location" placeholder="Enter start location" required>
                        </div>
                        
                        <div class="form-group">
                            <label for="edit-timeslot-cost-hour">Cost of one hour of work in £</label>
                            <input type="number" id="edit-timeslot-cost-hour" name="cost_of_1_hour_of_work" placeholder="e.g. 100" step="0.01" required>
                        </div>
                        
                        <div class="form-group">
                            <label for="edit-timeslot-min-slot">Minimum slot</label>
                            <input type="text" id="edit-timeslot-min-slot" name="minimum_time_slot" placeholder="e.g. 9 hours" required>
                        </div>
                        
                        <div class="form-group">
                            <label for="edit-timeslot-hashtags">Hashtags: <a href="#">Don't find hashtag?</a></label>
                            <div id="edit-timeslot-hashtags-container" class="form-control hashtag-chip-container" tabindex="0">
                                <input type="text" id="edit-timeslot-hashtags-input" placeholder="Start typing tag..." autocomplete="off" class="hashtags-input-field">
                            </div>
                            <div id="edit-timeslot-hashtags-dropdown" class="hashtag-dropdown-menu"></div>
                        </div>
                        
                        <input type="hidden" name="hashtags" id="edit-timeslot-hashtags-hidden">
                        
                        <div class="form-actions">
                            <button type="button" class="btn btn-secondary cancel-btn">Cancel</button>
                            <button type="button" class="btn btn-primary update-btn">Update</button>
                        </div>
                    </form>
                </div>
            </div>
        `;
        
        // Insert modal into DOM
        document.body.insertAdjacentHTML('beforeend', modalHTML);
        
        // Get references
        this.modal = document.getElementById('edit-timeslot-modal');
        this.form = document.getElementById('edit-timeslot-form-element');
        
        console.log('Modal references after creation:', {
            modal: !!this.modal,
            form: !!this.form
        });
        
        // Load categories and services
        setTimeout(() => {
            this.loadCategoriesAndServices();
            this.loadAllTags();
            console.log('Modal created and initialized');
        }, 100);
    }
    
    async loadCategoriesAndServices() {
        try {
            // Get categories and services from the existing form
            const existingForm = document.querySelector('#time-slot-form');
            if (existingForm) {
                const categorySelect = existingForm.querySelector('#time-slot-category');
                const serviceSelect = existingForm.querySelector('#time-slot-service');
                
                if (categorySelect && serviceSelect) {
                    // Copy categories
                    const editCategorySelect = document.getElementById('edit-timeslot-category');
                    if (editCategorySelect) {
                        editCategorySelect.innerHTML = categorySelect.innerHTML;
                        console.log('Categories loaded:', editCategorySelect.options.length);
                    }
                    
                    // Copy services
                    const editServiceSelect = document.getElementById('edit-timeslot-service');
                    if (editServiceSelect) {
                        editServiceSelect.innerHTML = serviceSelect.innerHTML;
                        console.log('Services loaded:', editServiceSelect.options.length);
                    }
                    
                    // Bind category change event
                    if (editCategorySelect) {
                        editCategorySelect.addEventListener('change', () => {
                            this.filterServicesByCategory();
                        });
                    }
                } else {
                    console.warn('Category or service select not found in existing form');
                }
            } else {
                console.warn('Existing form not found');
            }
        } catch (error) {
            console.error('Error loading categories/services:', error);
        }
    }
    
    filterServicesByCategory() {
        const categorySelect = document.getElementById('edit-timeslot-category');
        const serviceSelect = document.getElementById('edit-timeslot-service');
        const selectedCategory = categorySelect.value;
        
        // Show/hide services based on category
        Array.from(serviceSelect.options).forEach(option => {
            if (option.value === '' || option.dataset.category === selectedCategory) {
                option.style.display = '';
            } else {
                option.style.display = 'none';
            }
        });
        
        // Reset service selection if current selection is not valid
        if (serviceSelect.value && !this.isServiceInCategory(serviceSelect.value, selectedCategory)) {
            serviceSelect.value = '';
        }
    }
    
    isServiceInCategory(serviceId, categoryId) {
        const serviceSelect = document.getElementById('edit-timeslot-service');
        const option = serviceSelect.querySelector(`option[value="${serviceId}"]`);
        return option && option.dataset.category === categoryId;
    }
    
    populateForm() {
        if (!this.currentTimeSlotData) return;
        
        const data = this.currentTimeSlotData;
        console.log('Populating form with data:', data);
        
        // Set hidden ID
        const idField = document.getElementById('edit-timeslot-id');
        if (idField) {
            idField.value = this.currentTimeSlotId;
            console.log('Set ID field to:', this.currentTimeSlotId);
        }
        
        // Set category and service
        if (data.category) {
            const categorySelect = document.getElementById('edit-timeslot-category');
            if (categorySelect) {
                categorySelect.value = data.category;
                console.log('Set category to:', data.category);
                this.filterServicesByCategory();
            }
        }
        
        if (data.services) {
            const serviceSelect = document.getElementById('edit-timeslot-service');
            if (serviceSelect) {
                serviceSelect.value = data.services;
                console.log('Set service to:', data.services);
            }
        }
        
        // Set dates and times
        if (data.date_start) {
            const dateStart = document.getElementById('edit-timeslot-date-start');
            if (dateStart) {
                dateStart.value = data.date_start;
                console.log('Set start date to:', data.date_start);
            }
        }
        if (data.time_start) {
            const timeStart = document.getElementById('edit-timeslot-time-start');
            if (timeStart) {
                timeStart.value = data.time_start;
                console.log('Set start time to:', data.time_start);
            }
        }
        if (data.date_end) {
            const dateEnd = document.getElementById('edit-timeslot-date-end');
            if (dateEnd) {
                dateEnd.value = data.date_end;
                console.log('Set end date to:', data.date_end);
            }
        }
        if (data.time_end) {
            const timeEnd = document.getElementById('edit-timeslot-time-end');
            if (timeEnd) {
                timeEnd.value = data.time_end;
                console.log('Set end time to:', data.time_end);
            }
        }
        
        // Set other fields
        if (data.reserved_time_on_road) {
            const reservedTime = document.getElementById('edit-timeslot-reserved-time');
            if (reservedTime) {
                reservedTime.value = data.reserved_time_on_road;
                console.log('Set reserved time to:', data.reserved_time_on_road);
            }
        }
        if (data.start_location) {
            const startLocation = document.getElementById('edit-timeslot-start-location');
            if (startLocation) {
                startLocation.value = data.start_location;
                console.log('Set start location to:', data.start_location);
            }
        }
        if (data.cost_of_1_hour_of_work) {
            const costHour = document.getElementById('edit-timeslot-cost-hour');
            if (costHour) {
                costHour.value = data.cost_of_1_hour_of_work;
                console.log('Set cost hour to:', data.cost_of_1_hour_of_work);
            }
        }
        if (data.minimum_time_slot) {
            const minSlot = document.getElementById('edit-timeslot-min-slot');
            if (minSlot) {
                minSlot.value = data.minimum_time_slot;
                console.log('Set min slot to:', data.minimum_time_slot);
            }
        }
        
        // Set hashtags
        this.hashtags = data.hashtags || [];
        console.log('Set hashtags to:', this.hashtags);
        this.updateHashtagDisplay();
        this.updateHashtagHidden();
    }
    
    handleHashtagInput(value) {
        if (!value.trim()) {
            this.hideHashtagDropdown();
            return;
        }
        
        if (!this.allTags || this.allTags.length === 0) {
            this.hideHashtagDropdown();
            return;
        }
        
        const filteredTags = this.allTags.filter(tag => 
            tag.toLowerCase().includes(value.toLowerCase()) && 
            !this.hashtags.includes(tag)
        );
        
        this.showHashtagDropdown(filteredTags);
    }
    
    showHashtagDropdown(tags = []) {
        const dropdown = document.getElementById('edit-timeslot-hashtags-dropdown');
        if (!dropdown) return;
        
        if (!tags || tags.length === 0) {
            this.hideHashtagDropdown();
            return;
        }
        
        dropdown.innerHTML = '';
        tags.forEach(tag => {
            if (tag && tag.trim()) {
                const item = document.createElement('div');
                item.className = 'hashtag-dropdown-item';
                item.textContent = tag.trim();
                dropdown.appendChild(item);
            }
        });
        
        if (dropdown.children.length > 0) {
            dropdown.style.display = 'block';
        } else {
            this.hideHashtagDropdown();
        }
    }
    
    hideHashtagDropdown() {
        const dropdown = document.getElementById('edit-timeslot-hashtags-dropdown');
        if (dropdown) {
            dropdown.style.display = 'none';
        }
    }
    
    addHashtag(tag) {
        if (tag && tag.trim() && !this.hashtags.includes(tag.trim())) {
            this.hashtags.push(tag.trim());
            this.updateHashtagDisplay();
            this.updateHashtagHidden();
        }
        
        // Clear input and hide dropdown
        const input = document.getElementById('edit-timeslot-hashtags-input');
        if (input) {
            input.value = '';
        }
        this.hideHashtagDropdown();
    }
    
    removeHashtag(tag) {
        const cleanTag = tag.replace('×', '').trim();
        const index = this.hashtags.indexOf(cleanTag);
        if (index > -1) {
            this.hashtags.splice(index, 1);
            this.updateHashtagDisplay();
            this.updateHashtagHidden();
        }
    }
    
    updateHashtagDisplay() {
        const container = document.getElementById('edit-timeslot-hashtags-container');
        if (!container) return;
        
        // Clear existing hashtags
        const existingChips = container.querySelectorAll('.hashtag-chip');
        existingChips.forEach(chip => chip.remove());
        
        // Add hashtag chips
        this.hashtags.forEach(tag => {
            const chip = document.createElement('span');
            chip.className = 'hashtag-chip';
            chip.innerHTML = `${tag}<span class="remove-tag">×</span>`;
            const inputField = container.querySelector('.hashtags-input-field');
            if (inputField) {
                container.insertBefore(chip, inputField);
            } else {
                container.appendChild(chip);
            }
        });
    }
    
    updateHashtagHidden() {
        const hiddenInput = document.getElementById('edit-timeslot-hashtags-hidden');
        if (hiddenInput) {
            hiddenInput.value = JSON.stringify(this.hashtags);
        }
        
        // Also update the hashtags in the form data
        if (this.form) {
            const formData = new FormData(this.form);
            formData.set('hashtags', JSON.stringify(this.hashtags));
        }
    }
    
    async handleUpdate() {
        if (!this.form) return;
        
        // Validate form
        if (!this.validateForm()) {
            return;
        }
        
        // Show loading state
        this.setFormSubmitting(true);
        
        try {
            // Prepare form data
            const formData = new FormData(this.form);
            
            // Ensure hashtags are properly set
            formData.set('hashtags', JSON.stringify(this.hashtags));
            
            console.log('Sending form data:', Object.fromEntries(formData));
            
            // Send update request
            const response = await fetch('/services_and_projects/update_form/', {
                method: 'POST',
                body: formData,
                headers: {
                    'X-CSRFToken': this.getCSRFToken()
                }
            });
            
            console.log('Response status:', response.status);
            
            if (response.ok) {
                const result = await response.json();
                console.log('Success response:', result);
                this.showSuccess('Time slot updated successfully!');
                this.closeModal();
                
                // Trigger refresh of the feed
                this.refreshTimeSlotFeed();
            } else {
                const error = await response.json();
                console.error('Error response:', error);
                this.showError(error.message || 'Failed to update time slot');
            }
            
        } catch (error) {
            console.error('Error updating time slot:', error);
            this.showError('An error occurred while updating the time slot');
        } finally {
            this.setFormSubmitting(false);
        }
    }
    
    validateForm() {
        const requiredFields = this.form.querySelectorAll('[required]');
        let isValid = true;
        
        requiredFields.forEach(field => {
            if (!field.value.trim()) {
                this.showFieldError(field, 'This field is required');
                isValid = false;
            } else {
                this.clearFieldError(field);
            }
        });
        
        // Validate dates
        const dateStart = document.getElementById('edit-timeslot-date-start');
        const dateEnd = document.getElementById('edit-timeslot-date-end');
        const timeStart = document.getElementById('edit-timeslot-time-start');
        const timeEnd = document.getElementById('edit-timeslot-time-end');
        
        if (dateStart && dateEnd && dateStart.value && dateEnd.value && dateStart.value > dateEnd.value) {
            this.showFieldError(dateEnd, 'End date must be after start date');
            isValid = false;
        }
        
        if (dateStart && dateEnd && timeStart && timeEnd && 
            dateStart.value === dateEnd.value && timeStart.value && timeEnd.value && 
            timeStart.value >= timeEnd.value) {
            this.showFieldError(timeEnd, 'End time must be after start time');
            isValid = false;
        }
        
        return isValid;
    }
    
    showFieldError(field, message) {
        const formGroup = field.closest('.form-group');
        if (formGroup) {
            formGroup.classList.add('error');
            
            // Remove existing error message
            const existingError = formGroup.querySelector('.error-message');
            if (existingError) {
                existingError.remove();
            }
            
            // Add new error message
            const errorDiv = document.createElement('div');
            errorDiv.className = 'error-message';
            errorDiv.textContent = message;
            formGroup.appendChild(errorDiv);
        }
    }
    
    clearFieldError(field) {
        const formGroup = field.closest('.form-group');
        if (formGroup) {
            formGroup.classList.remove('error');
            const errorMessage = formGroup.querySelector('.error-message');
            if (errorMessage) {
                errorMessage.remove();
            }
        }
    }
    
    setFormSubmitting(submitting) {
        if (this.form) {
            if (submitting) {
                this.form.classList.add('submitting');
                // Disable all buttons
                const buttons = this.form.querySelectorAll('button');
                buttons.forEach(btn => btn.disabled = true);
            } else {
                this.form.classList.remove('submitting');
                // Enable all buttons
                const buttons = this.form.querySelectorAll('button');
                buttons.forEach(btn => btn.disabled = false);
            }
        }
    }
    
    showSuccess(message) {
        // Simple success notification
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #28a745;
            color: white;
            padding: 15px 20px;
            border-radius: 5px;
            z-index: 10000;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        `;
        notification.textContent = message;
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.remove();
        }, 3000);
    }
    
    showError(message) {
        // Simple error notification
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #dc3545;
            color: white;
            padding: 15px 20px;
            border-radius: 5px;
            z-index: 10000;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        `;
        notification.textContent = 'Error: ' + message;
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.remove();
        }, 5000);
    }
    
    closeModal() {
        if (this.modal) {
            this.modal.style.display = 'none';
            document.body.style.overflow = '';
            
            // Reset form
            if (this.form) {
                this.form.reset();
                this.hashtags = [];
                this.updateHashtagDisplay();
                this.updateHashtagHidden();
                
                // Remove submitting state
                this.form.classList.remove('submitting');
                
                // Enable all buttons
                const buttons = this.form.querySelectorAll('button');
                buttons.forEach(btn => btn.disabled = false);
            }
            
            // Clear errors
            const errorFields = this.modal.querySelectorAll('.form-group.error');
            errorFields.forEach(field => field.classList.remove('error'));
            
            this.currentTimeSlotId = null;
            this.currentTimeSlotData = null;
        }
    }
    
    isModalOpen() {
        return this.modal && this.modal.style.display === 'flex';
    }
    
    getCSRFToken() {
        // Try to get CSRF token from the edit form first
        let token = document.querySelector('#edit-timeslot-form-element [name=csrfmiddlewaretoken]');
        if (!token) {
            // Fallback to any CSRF token on the page
            token = document.querySelector('[name=csrfmiddlewaretoken]');
        }
        
        const tokenValue = token ? token.value : '';
        console.log('CSRF Token found:', tokenValue ? 'Yes' : 'No');
        return tokenValue;
    }
    
    refreshTimeSlotFeed() {
        // Reload the page to show updated data
        window.location.reload();
    }
}

// Initialize the edit time slot form
const editTimeSlotForm = new EditTimeSlotForm();

// Export for global access
window.EditTimeSlotForm = editTimeSlotForm;
