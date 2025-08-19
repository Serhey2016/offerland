/**
 * Feeds Filtering System
 * Handles the filtration form modal and filtering functionality
 */

class FeedsFiltering {
    constructor() {
        this.modal = null;
        this.form = null;
        this.hashtagInput = null;
        this.hashtagDropdown = null;
        this.hashtagContainer = null;
        this.hashtagHidden = null;
        this.allHashtags = [];
        this.selectedHashtags = new Set();
        
        this.init();
    }

    init() {
        this.initializeElements();
        this.bindEvents();
        this.loadStoredFilters();
        this.loadHashtags();
    }

    initializeElements() {
        this.modal = document.getElementById('filtration-form');
        this.form = document.getElementById('filtration-form-form');
        this.hashtagInput = document.getElementById('hashtags-input');
        this.hashtagDropdown = document.querySelector('.hashtag-dropdown-menu');
        this.hashtagContainer = document.querySelector('.hashtag-chip-container');
        this.hashtagHidden = document.getElementById('filtration-hashtags-hidden');
    }

    bindEvents() {
        // Open modal button
        const filterButton = document.getElementById('filter_button_id');
        if (filterButton) {
            filterButton.addEventListener('click', () => this.openModal());
        }

        // Close modal events
        const closeButton = document.getElementById('close-filtration-modal');
        if (closeButton) {
            closeButton.addEventListener('click', () => this.closeModal());
        }

        // Close on overlay click - REMOVED
        // if (this.modal) {
        //     this.modal.addEventListener('click', (e) => {
        //         if (e.target === this.modal) {
        //             this.closeModal();
        //         }
        //     });
        // }

        // ESC key to close
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.modal && this.modal.style.display !== 'none') {
                this.closeModal();
            }
        });

        // Form submission
        if (this.form) {
            this.form.addEventListener('submit', (e) => this.handleFormSubmit(e));
        }

        // Clear filters button
        const clearButton = document.getElementById('clear-filters-btn');
        if (clearButton) {
            clearButton.addEventListener('click', () => this.clearAllFilters());
        }

        // Hashtag input events
        if (this.hashtagInput) {
            this.hashtagInput.addEventListener('input', (e) => this.handleHashtagInput(e));
            this.hashtagInput.addEventListener('focus', () => this.showHashtagDropdown());
            this.hashtagInput.addEventListener('blur', () => {
                // Delay hiding to allow dropdown clicks
                setTimeout(() => this.hideHashtagDropdown(), 200);
            });
        }

        // Date validation
        const dateStart = document.getElementById('date-start-filter');
        const dateEnd = document.getElementById('date-end-filter');
        if (dateStart && dateEnd) {
            dateStart.addEventListener('change', () => this.validateDateRange());
            dateEnd.addEventListener('change', () => this.validateDateRange());
        }

        // Type filter change
        const typeFilter = document.getElementById('type-filter');
        if (typeFilter) {
            typeFilter.addEventListener('change', () => this.handleTypeFilterChange());
        }
    }

    openModal() {
        if (this.modal) {
            this.modal.style.display = 'flex';
            document.body.style.overflow = 'hidden';
            
            // Focus on first input
            const firstInput = this.form.querySelector('input, select');
            if (firstInput) {
                firstInput.focus();
            }
        }
    }

    closeModal() {
        if (this.modal) {
            this.modal.style.display = 'none';
            document.body.style.overflow = '';
            
            // Clear hashtag input
            if (this.hashtagInput) {
                this.hashtagInput.value = '';
                this.hideHashtagDropdown();
            }
        }
    }

    async loadHashtags() {
        try {
            // This would typically fetch from your backend
            // For now, using sample data
            this.allHashtags = [
                'technology', 'design', 'marketing', 'development', 'consulting',
                'web', 'mobile', 'ui', 'ux', 'digital', 'branding', 'strategy',
                'analytics', 'seo', 'content', 'social', 'email', 'automation'
            ];
        } catch (error) {
            console.error('Error loading hashtags:', error);
        }
    }

    handleHashtagInput(e) {
        const value = e.target.value.trim();
        
        if (value.length === 0) {
            this.hideHashtagDropdown();
            return;
        }

        const filteredHashtags = this.allHashtags.filter(tag => 
            tag.toLowerCase().includes(value.toLowerCase()) && 
            !this.selectedHashtags.has(tag)
        );

        this.populateHashtagDropdown(filteredHashtags);
        this.showHashtagDropdown();
    }

    populateHashtagDropdown(hashtags) {
        if (!this.hashtagDropdown) return;

        this.hashtagDropdown.innerHTML = '';
        
        if (hashtags.length === 0) {
            this.hashtagDropdown.innerHTML = '<div class="hashtag-dropdown-item">No hashtags found</div>';
            return;
        }

        hashtags.forEach(tag => {
            const item = document.createElement('div');
            item.className = 'hashtag-dropdown-item';
            item.textContent = tag;
            item.addEventListener('click', () => this.addHashtag(tag));
            this.hashtagDropdown.appendChild(item);
        });
    }

    showHashtagDropdown() {
        if (this.hashtagDropdown) {
            this.hashtagDropdown.style.display = 'block';
        }
    }

    hideHashtagDropdown() {
        if (this.hashtagDropdown) {
            this.hashtagDropdown.style.display = 'none';
        }
    }

    addHashtag(tagName) {
        if (this.selectedHashtags.has(tagName)) return;

        this.selectedHashtags.add(tagName);
        this.updateHashtagDisplay();
        this.updateHashtagHidden();
        
        // Clear input and hide dropdown
        if (this.hashtagInput) {
            this.hashtagInput.value = '';
            this.hideHashtagDropdown();
        }
    }

    removeHashtag(tagName) {
        this.selectedHashtags.delete(tagName);
        this.updateHashtagDisplay();
        this.updateHashtagHidden();
    }

    updateHashtagDisplay() {
        if (!this.hashtagContainer) return;

        this.hashtagContainer.innerHTML = '';
        
        this.selectedHashtags.forEach(tag => {
            const chip = document.createElement('span');
            chip.className = 'hashtag-chip';
            chip.innerHTML = `
                ${tag}
                <button type="button" class="remove-hashtag" onclick="feedsFiltering.removeHashtag('${tag}')">
                    ×
                </button>
            `;
            this.hashtagContainer.appendChild(chip);
        });
    }

    updateHashtagHidden() {
        if (this.hashtagHidden) {
            this.hashtagHidden.value = Array.from(this.selectedHashtags).join(',');
        }
    }

    validateDateRange() {
        const dateStart = document.getElementById('date-start-filter');
        const dateEnd = document.getElementById('date-end-filter');
        
        if (dateStart && dateEnd && dateStart.value && dateEnd.value) {
            const startDate = new Date(dateStart.value);
            const endDate = new Date(dateEnd.value);
            
            if (startDate > endDate) {
                dateEnd.setCustomValidity('End date must be after start date');
                dateEnd.reportValidity();
            } else {
                dateEnd.setCustomValidity('');
            }
        }
    }

    handleTypeFilterChange() {
        const typeFilter = document.getElementById('type-filter');
        const timeSlotSection = document.querySelector('.time-slot-section');
        
        if (typeFilter && timeSlotSection) {
            const selectedTypes = Array.from(typeFilter.selectedOptions).map(option => option.value);
            const showTimeSlot = selectedTypes.includes('time_slot');
            
            timeSlotSection.style.display = showTimeSlot ? 'block' : 'none';
        }
    }

    async handleFormSubmit(e) {
        e.preventDefault();
        
        if (!this.validateForm()) {
            return;
        }

        const formData = this.collectFormData();
        
        try {
            await this.applyFilters(formData);
            this.closeModal();
            this.showSuccessMessage('Filters applied successfully');
        } catch (error) {
            console.error('Error applying filters:', error);
            this.showErrorMessage('Error applying filters. Please try again.');
        }
    }

    validateForm() {
        const typeFilter = document.getElementById('type-filter');
        
        if (typeFilter && typeFilter.selectedOptions.length === 0) {
            this.showErrorMessage('Please select at least one type');
            typeFilter.focus();
            return false;
        }

        return true;
    }

    collectFormData() {
        const formData = new FormData(this.form);
        const data = {};
        
        // Collect all form data
        for (let [key, value] of formData.entries()) {
            if (key === 'type') {
                // Handle multiple select
                if (!data[key]) data[key] = [];
                data[key].push(value);
            } else if (key === 'hashtags') {
                data[key] = Array.from(this.selectedHashtags);
            } else {
                data[key] = value;
            }
        }

        // Add checkbox values
        const checkboxes = this.form.querySelectorAll('input[type="checkbox"]:checked');
        checkboxes.forEach(checkbox => {
            data[checkbox.name] = checkbox.value;
        });

        return data;
    }

    async applyFilters(filterData) {
        // Store filters in localStorage
        this.storeFilters(filterData);
        
        // Here you would typically send the filter data to your backend
        // and update the page content accordingly
        
        console.log('Applying filters:', filterData);
        
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Trigger content update (this would be implemented based on your backend)
        this.updatePageContent(filterData);
    }

    updatePageContent(filterData) {
        // This function would update the page content based on filters
        // Implementation depends on your backend and content structure
        
        // For now, just log the action
        console.log('Updating page content with filters:', filterData);
        
        // You could trigger a page reload or AJAX request here
        // window.location.reload();
    }

    storeFilters(filterData) {
        try {
            localStorage.setItem('offerland_filters', JSON.stringify(filterData));
        } catch (error) {
            console.error('Error storing filters:', error);
        }
    }

    loadStoredFilters() {
        try {
            const stored = localStorage.getItem('offerland_filters');
            if (stored) {
                const filters = JSON.parse(stored);
                this.populateFormWithFilters(filters);
            }
        } catch (error) {
            console.error('Error loading stored filters:', error);
        }
    }

    populateFormWithFilters(filters) {
        // Populate type filter
        if (filters.type && Array.isArray(filters.type)) {
            const typeFilter = document.getElementById('type-filter');
            if (typeFilter) {
                filters.type.forEach(type => {
                    const option = typeFilter.querySelector(`option[value="${type}"]`);
                    if (option) option.selected = true;
                });
                this.handleTypeFilterChange();
            }
        }

        // Populate hashtags
        if (filters.hashtags && Array.isArray(filters.hashtags)) {
            this.selectedHashtags = new Set(filters.hashtags);
            this.updateHashtagDisplay();
            this.updateHashtagHidden();
        }

        // Populate other fields
        Object.keys(filters).forEach(key => {
            if (key === 'type' || key === 'hashtags') return;
            
            const element = this.form.querySelector(`[name="${key}"]`);
            if (element) {
                if (element.type === 'checkbox') {
                    element.checked = filters[key] === element.value;
                } else {
                    element.value = filters[key];
                }
            }
        });
    }

    clearAllFilters() {
        // Reset form
        this.form.reset();
        
        // Clear hashtags
        this.selectedHashtags.clear();
        this.updateHashtagDisplay();
        this.updateHashtagHidden();
        
        // Hide time slot section
        const timeSlotSection = document.querySelector('.time-slot-section');
        if (timeSlotSection) {
            timeSlotSection.style.display = 'none';
        }
        
        // Clear stored filters
        localStorage.removeItem('offerland_filters');
        
        this.showSuccessMessage('All filters cleared');
    }

    showSuccessMessage(message) {
        // Use your preferred notification system
        if (typeof alertify !== 'undefined') {
            alertify.success(message);
        } else {
            alert(message);
        }
    }

    showErrorMessage(message) {
        // Use your preferred notification system
        if (typeof alertify !== 'undefined') {
            alertify.error(message);
        } else {
            alert(message);
        }
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.feedsFiltering = new FeedsFiltering();
});

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = FeedsFiltering;
}
