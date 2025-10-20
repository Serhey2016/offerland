// Navigation functionality for settings page

// Global function to get CSRF token
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

document.addEventListener('DOMContentLoaded', function() {
    console.log('settings_profile.js loaded');
    const navItems = document.querySelectorAll('.nav-item_stngs');
    const sections = document.querySelectorAll('.settings-section_stngs');

    navItems.forEach(item => {
        item.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Remove active class from all nav items
            navItems.forEach(nav => nav.classList.remove('active'));
            
            // Add active class to clicked item
            this.classList.add('active');
            
            // Hide all sections
            sections.forEach(section => section.classList.add('hidden_stngs'));
            
            // Show corresponding section
            const targetSection = this.getAttribute('data-section');
            document.getElementById(targetSection + '-section').classList.remove('hidden_stngs');
        });
    });

    // Modal functionality
    const nameLegalModal = document.getElementById('nameLegalLocationModal');
    const nameLegalTrigger = document.getElementById('nameLegalLocationTrigger');
    const closeBtns = document.querySelectorAll('.close_stngs');
    const form = document.getElementById('nameLegalLocationForm');

    // Profile photo modal
    const photoModal = document.getElementById('profilePhotoModal');
    const photoTrigger = document.querySelectorAll('.item-link_stngs')[1]; // Second item-link is "Profile photo"

    // Email modal
    const emailModal = document.getElementById('emailModal');
    const emailTrigger = document.querySelectorAll('.item-link_stngs')[2]; // Third item-link is "Email address"

    // Phone modals
    const phoneModal = document.getElementById('phoneModal');
    const addPhoneModal = document.getElementById('addPhoneModal');
    const phoneTrigger = document.getElementById('phoneTrigger');

    // Password modal
    const passwordModal = document.getElementById('passwordModal');
    const passwordTrigger = document.querySelectorAll('.item-link_stngs')[4]; // Fifth item-link is "Change password"

    // Open modal when clicking on "Name, Legal, location"
    if (nameLegalTrigger) {
        nameLegalTrigger.addEventListener('click', function(e) {
            e.preventDefault();
            console.log('Name, Legal, location clicked');
            initializeProfileForm();
            nameLegalModal.style.display = 'block';
            document.body.style.overflow = 'hidden';
        });
    } else {
        console.warn('Element with id nameLegalLocationTrigger not found');
    }
    
    // Function to initialize profile form with current data
    function initializeProfileForm() {
        // Set checkbox states based on existing data
        const utrField = document.getElementById('utr');
        const companyNumberField = document.getElementById('companyNumber');
        const companyNameField = document.getElementById('companyName');
        const websiteField = document.getElementById('website');
        
        // Self employed checkbox
        if (utrField && utrField.value) {
            document.getElementById('selfEmployed').checked = true;
            document.getElementById('utrField').style.display = 'block';
        } else {
            document.getElementById('selfEmployed').checked = false;
            document.getElementById('utrField').style.display = 'none';
        }
        
        // Has company checkbox
        if ((companyNumberField && companyNumberField.value) || (companyNameField && companyNameField.value)) {
            document.getElementById('hasCompany').checked = true;
            document.getElementById('companyFields').style.display = 'block';
        } else {
            document.getElementById('hasCompany').checked = false;
            document.getElementById('companyFields').style.display = 'none';
        }
        
        // Has website checkbox
        if (websiteField && websiteField.value) {
            document.getElementById('hasWebsite').checked = true;
            document.getElementById('websiteField').style.display = 'block';
        } else {
            document.getElementById('hasWebsite').checked = false;
            document.getElementById('websiteField').style.display = 'none';
        }
        
        // Log current form data for debugging
        console.log('Form initialized with data:', {
            firstName: document.getElementById('firstName').value,
            lastName: document.getElementById('lastName').value,
            utr: document.getElementById('utr').value,
            companyNumber: document.getElementById('companyNumber').value,
            companyName: document.getElementById('companyName').value,
            website: document.getElementById('website').value,
            country: document.getElementById('country').value,
            postalCode: document.getElementById('postalCode').value,
            city: document.getElementById('city').value
        });
    }

    // Open modal when clicking on "Profile photo"
    if (photoTrigger) {
        photoTrigger.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Initialize photo state when opening modal
            restorePhotoState();
            
            // Reset file input
            if (photoUpload) {
                photoUpload.value = '';
            }
            
            // Reset selected file
            selectedFile = null;
            
            photoModal.style.display = 'block';
            document.body.style.overflow = 'hidden';
        });
    }

    // Open modal when clicking on "Email address"
    if (emailTrigger) {
        emailTrigger.addEventListener('click', function(e) {
            e.preventDefault();
            emailModal.style.display = 'block';
            document.body.style.overflow = 'hidden';
        });
    }

    // Open modal when clicking on "Phone number"
    if (phoneTrigger) {
        phoneTrigger.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Check if user has a phone number
            const hasPhone = this.getAttribute('data-has-phone') === 'true';
            
            if (hasPhone) {
                // User has a phone number - show change modal
                phoneModal.style.display = 'block';
                document.body.style.overflow = 'hidden';
            } else {
                // User doesn't have a phone number - show add modal
                addPhoneModal.style.display = 'block';
                document.body.style.overflow = 'hidden';
            }
        });
    }

    // Open modal when clicking on "Change password"
    if (passwordTrigger) {
        passwordTrigger.addEventListener('click', function(e) {
            e.preventDefault();
            passwordModal.style.display = 'block';
            document.body.style.overflow = 'hidden';
        });
    }

    // Close modals when clicking on X
    closeBtns.forEach(closeBtn => {
        closeBtn.addEventListener('click', function() {
            const modalId = this.getAttribute('data-modal');
            const modal = document.getElementById(modalId);
            if (modal) {
                // Reset photo state if closing profile photo modal
                if (modalId === 'profilePhotoModal') {
                    selectedFile = null;
                    photoUpload.value = '';
                    restorePhotoState();
                }
                
                modal.style.display = 'none';
                document.body.style.overflow = 'auto';
            }
        });
    });
    
    // Close modals when clicking on Cancel buttons
    const cancelBtns = document.querySelectorAll('.cancel-btn_stngs');
    cancelBtns.forEach(cancelBtn => {
        cancelBtn.addEventListener('click', function() {
            const modalId = this.getAttribute('data-modal');
            const modal = document.getElementById(modalId);
            if (modal) {
                modal.style.display = 'none';
                document.body.style.overflow = 'auto';
            }
        });
    });

    // Close modals when clicking outside of them
    window.addEventListener('click', function(e) {
        if (e.target.classList.contains('modal_stngs')) {
            const modal = e.target;
            const modalId = modal.id;
            
            // Reset photo state if closing profile photo modal
            if (modalId === 'profilePhotoModal') {
                selectedFile = null;
                photoUpload.value = '';
                restorePhotoState();
            }
            
            modal.style.display = 'none';
            document.body.style.overflow = 'auto';
        }
    });

    // Close modals on Escape key
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            const openModals = document.querySelectorAll('.modal_stngs[style*="block"]');
            openModals.forEach(modal => {
                const modalId = modal.id;
                
                // Reset photo state if closing profile photo modal
                if (modalId === 'profilePhotoModal') {
                    selectedFile = null;
                    photoUpload.value = '';
                    restorePhotoState();
                }
                
                modal.style.display = 'none';
                document.body.style.overflow = 'auto';
            });
        }
    });

    // Handle checkbox interactions
    const selfEmployedCheckbox = document.getElementById('selfEmployed');
    const utrField = document.getElementById('utrField');
    
    const hasCompanyCheckbox = document.getElementById('hasCompany');
    const companyFields = document.getElementById('companyFields');
    
    const hasWebsiteCheckbox = document.getElementById('hasWebsite');
    const websiteField = document.getElementById('websiteField');

    // Self employed checkbox
    if (selfEmployedCheckbox && utrField) {
        selfEmployedCheckbox.addEventListener('change', function() {
            if (this.checked) {
                utrField.style.display = 'block';
                // Focus on UTR field when shown
                setTimeout(() => {
                    document.getElementById('utr').focus();
                }, 100);
            } else {
                utrField.style.display = 'none';
                document.getElementById('utr').value = '';
            }
        });
    }

    // Has company checkbox
    if (hasCompanyCheckbox && companyFields) {
        hasCompanyCheckbox.addEventListener('change', function() {
            if (this.checked) {
                companyFields.style.display = 'block';
                // Focus on company name field when shown
                setTimeout(() => {
                    document.getElementById('companyName').focus();
                }, 100);
            } else {
                companyFields.style.display = 'none';
                document.getElementById('companyNumber').value = '';
                document.getElementById('companyName').value = '';
            }
        });
    }

    // Has website checkbox
    if (hasWebsiteCheckbox && websiteField) {
        hasWebsiteCheckbox.addEventListener('change', function() {
            if (this.checked) {
                websiteField.style.display = 'block';
                // Focus on website field when shown
                setTimeout(() => {
                    document.getElementById('website').focus();
                }, 100);
            } else {
                websiteField.style.display = 'none';
                document.getElementById('website').value = '';
            }
        });
    }

    // Handle form submission
    if (form) {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Collect form data
            const formData = new FormData(form);
            const data = {};
            
            // Convert FormData to object and handle checkboxes
            for (let [key, value] of formData.entries()) {
                if (key === 'self_employed' || key === 'has_company' || key === 'has_website') {
                    data[key] = true;
                } else {
                    data[key] = value;
                }
            }
            
            // Handle checkbox states
            data.self_employed = document.getElementById('selfEmployed').checked;
            data.has_company = document.getElementById('hasCompany').checked;
            data.has_website = document.getElementById('hasWebsite').checked;
            
            // Validate required fields
            if (!data.first_name || !data.last_name) {
                alert('First name and last name are required');
                return;
            }
            
            // Validate UTR if self-employed is checked
            if (data.self_employed && (!data.utr || data.utr.length !== 10 || !/^\d{10}$/.test(data.utr))) {
                alert('UTR must be exactly 10 digits when self-employed is selected');
                return;
            }
            
            // Validate company number if has company is checked
            if (data.has_company && data.company_number && (data.company_number.length !== 8 || !/^\d{8}$/.test(data.company_number))) {
                alert('Company number must be exactly 8 digits');
                return;
            }
            
            // Get CSRF token
            const csrftoken = getCookie('csrftoken');
            
            // Send data to server
            fetch('/update-profile/', {
                method: 'POST',
                headers: {
                    'X-CSRFToken': csrftoken,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data)
            })
            .then(response => response.json())
            .then(result => {
                if (result.success) {
                    alert('Profile updated successfully!');
                    // Close modal
                    nameLegalModal.style.display = 'none';
                    document.body.style.overflow = 'auto';
                    
                    // Optionally refresh the page to show updated data
                    // window.location.reload();
                } else {
                    alert('Error: ' + result.message);
                }
            })
            .catch(error => {
                console.error('Error:', error);
                alert('Error updating profile. Please try again.');
            });
        });
    }

    // Profile photo functionality
    const photoUpload = document.getElementById('photoUpload');
    const currentPhoto = document.getElementById('currentPhoto');
    const photoPlaceholder = document.getElementById('photoPlaceholder');
    const deleteSection = document.getElementById('deleteSection');
    const deletePhotoBtn = document.getElementById('deletePhotoBtn');
    const savePhotoBtn = document.getElementById('savePhotoBtn');

    let selectedFile = null;
    
    // Helper function to restore photo state
    function restorePhotoState() {
        if (currentPhoto && currentPhoto.src && currentPhoto.src !== window.location.href) {
            // User has an existing avatar - show it
            currentPhoto.style.display = 'block';
            photoPlaceholder.style.display = 'none';
            deleteSection.style.display = 'block';
        } else {
            // No existing avatar - show placeholder
            currentPhoto.style.display = 'none';
            photoPlaceholder.style.display = 'flex';
            deleteSection.style.display = 'none';
        }
    }
    
    // Initialize photo state if user already has an avatar
    restorePhotoState();

    // Handle file upload
    if (photoUpload) {
        photoUpload.addEventListener('change', function(e) {
            const file = e.target.files[0];
            if (file) {
                // Check file size (5MB limit)
                if (file.size > 5 * 1024 * 1024) {
                    alert('File size must be less than 5MB');
                    return;
                }

                // Check file type
                if (!file.type.startsWith('image/')) {
                    alert('Please select an image file');
                    return;
                }

                selectedFile = file;
                const reader = new FileReader();
                
                reader.onload = function(e) {
                    currentPhoto.src = e.target.result;
                    currentPhoto.style.display = 'block';
                    photoPlaceholder.style.display = 'none';
                    deleteSection.style.display = 'block';
                };
                
                reader.readAsDataURL(file);
            }
        });
    }

    // Handle delete photo
    if (deletePhotoBtn) {
        deletePhotoBtn.addEventListener('click', function() {
            if (confirm('Are you sure you want to delete your profile photo?')) {
                // Get CSRF token from cookie
                const csrftoken = getCookie('csrftoken');
                
                // Send delete request to server
                fetch('/delete-avatar/', {
                    method: 'POST',
                    headers: {
                        'X-CSRFToken': csrftoken,
                        'Content-Type': 'application/json',
                    }
                })
                .then(response => response.json())
                .then(data => {
                    if (data.success) {
                        selectedFile = null;
                        currentPhoto.style.display = 'none';
                        photoPlaceholder.style.display = 'flex';
                        deleteSection.style.display = 'none';
                        photoUpload.value = '';
                        alert('Profile photo deleted successfully!');
                    } else {
                        alert('Error: ' + data.message);
                    }
                })
                .catch(error => {
                    console.error('Error:', error);
                    alert('Error deleting photo. Please try again.');
                });
            }
        });
    }

    // Handle save photo
    if (savePhotoBtn) {
        savePhotoBtn.addEventListener('click', function() {
            if (selectedFile) {
                // Create FormData for file upload
                const formData = new FormData();
                formData.append('avatar', selectedFile);
                
                // Get CSRF token from cookie
                const csrftoken = getCookie('csrftoken');
                
                // Upload file to server
                fetch('/upload-avatar/', {
                    method: 'POST',
                    headers: {
                        'X-CSRFToken': csrftoken,
                    },
                    body: formData
                })
                .then(response => response.json())
                .then(data => {
                    if (data.success) {
                        alert('Profile photo updated successfully!');
                        // Close modal
                        photoModal.style.display = 'none';
                        document.body.style.overflow = 'auto';
                    } else {
                        alert('Error: ' + data.message);
                    }
                })
                .catch(error => {
                    console.error('Error:', error);
                    alert('Error uploading file. Please try again.');
                });
            } else {
                alert('Please select a photo to upload');
                return;
            }
        });
    }

    // Handle cancel buttons
    cancelBtns.forEach(cancelBtn => {
        cancelBtn.addEventListener('click', function() {
            const modalId = this.getAttribute('data-modal');
            const modal = document.getElementById(modalId);
            if (modal) {
                // Reset photo state
                if (modalId === 'profilePhotoModal') {
                    selectedFile = null;
                    photoUpload.value = '';
                    restorePhotoState();
                }
                
                // Reset email form
                if (modalId === 'emailModal') {
                    document.getElementById('emailForm').reset();
                }
                
                // Reset phone form
                if (modalId === 'phoneModal') {
                    document.getElementById('phoneForm').reset();
                }
                
                // Reset add phone form
                if (modalId === 'addPhoneModal') {
                    document.getElementById('addPhoneForm').reset();
                }
                
                // Reset password form
                if (modalId === 'passwordModal') {
                    document.getElementById('passwordForm').reset();
                    // Reset password strength indicator
                    const strengthFill = document.getElementById('strengthFill');
                    const strengthText = document.getElementById('strengthText');
                    if (strengthFill && strengthText) {
                        strengthFill.className = 'strength-fill_stngs';
                        strengthText.className = 'strength-text_stngs';
                        strengthText.textContent = 'Weak';
                    }
                }
                
                modal.style.display = 'none';
                document.body.style.overflow = 'auto';
            }
        });
    });

    // Email form functionality
    const emailForm = document.getElementById('emailForm');
    const currentEmailInput = document.getElementById('currentEmail');
    const newEmailInput = document.getElementById('newEmail');
    const confirmEmailInput = document.getElementById('confirmEmail');

    if (emailForm) {
        emailForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const currentEmail = currentEmailInput.value.trim();
            const newEmail = newEmailInput.value.trim();
            const confirmEmail = confirmEmailInput.value.trim();
            
            // Validation
            if (!currentEmail || !newEmail || !confirmEmail) {
                alert('Please fill in all fields');
                return;
            }
            
            // Check if current email matches the displayed email
            const displayedEmail = document.querySelector('.email-mask_stngs').textContent; // Get the masked email from UI
            if (currentEmail !== '0432502095x@gmail.com') { // Full email for verification
                alert('Current email address does not match our records');
                return;
            }
            
            // Check if new email is different from current
            if (newEmail === '0432502095x@gmail.com') {
                alert('New email address must be different from current email address');
                return;
            }
            
            // Check if new email and confirm email match
            if (newEmail !== confirmEmail) {
                alert('New email address and confirmation email address do not match');
                return;
            }
            
            // Email format validation
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(newEmail)) {
                alert('Please enter a valid email address');
                return;
            }
            
            // Here you would typically send the data to your server
            console.log('Email change request:', {
                currentEmail: currentEmail,
                newEmail: newEmail
            });
            
            // Simulate successful email change
            alert('Verification email has been sent to your new email address. Please check your inbox and follow the verification link.');
            
            // Close modal
            emailModal.style.display = 'none';
            document.body.style.overflow = 'auto';
            
            // Reset form
            emailForm.reset();
        });
    }

    // Real-time email validation
    if (newEmailInput && confirmEmailInput) {
        confirmEmailInput.addEventListener('input', function() {
            const newEmail = newEmailInput.value.trim();
            const confirmEmail = this.value.trim();
            
            if (confirmEmail && newEmail !== confirmEmail) {
                this.style.borderColor = '#dc3545';
            } else if (confirmEmail && newEmail === confirmEmail) {
                this.style.borderColor = '#28a745';
            } else {
                this.style.borderColor = '#e1e5e9';
            }
        });
    }

    // Phone form functionality
    const phoneForm = document.getElementById('phoneForm');
    const addPhoneForm = document.getElementById('addPhoneForm');
    const currentPhoneInput = document.getElementById('currentPhone');
    const newPhoneInput = document.getElementById('newPhone');
    const confirmPhoneInput = document.getElementById('confirmPhone');
    const addPhoneNumberInput = document.getElementById('addPhoneNumber');
    const confirmAddPhoneInput = document.getElementById('confirmAddPhone');

    if (phoneForm) {
        phoneForm.addEventListener('submit', function(e) {
            e.preventDefault();
            console.log('Change phone form submitted');
            
            const currentPhone = currentPhoneInput.value.trim();
            const newPhone = newPhoneInput.value.trim();
            const confirmPhone = confirmPhoneInput.value.trim();
            
            console.log('Current phone:', currentPhone);
            console.log('New phone:', newPhone);
            console.log('Confirm phone:', confirmPhone);
            
            // Validation
            if (!currentPhone || !newPhone || !confirmPhone) {
                alert('Please fill in all fields');
                return;
            }
            
            // Check if current phone matches the expected format
            // Assuming the current phone number is +44 432 502 095 (example)
            const expectedCurrentPhone = '+44 432 502 095';
            if (currentPhone !== expectedCurrentPhone) {
                alert('Current phone number does not match our records');
                return;
            }
            
            // Check if new phone is different from current
            if (newPhone === expectedCurrentPhone) {
                alert('New phone number must be different from current phone number');
                return;
            }
            
            // Check if new phone and confirm phone match
            if (newPhone !== confirmPhone) {
                alert('New phone number and confirmation phone number do not match');
                return;
            }
            
            // Phone format validation (basic international format)
            const phoneRegex = /^\+?[\d\s\-\(\)]{10,}$/;
            if (!phoneRegex.test(newPhone)) {
                alert('Please enter a valid phone number');
                return;
            }
            
            console.log('Sending AJAX request to /update-phone/');
            console.log('CSRF token:', getCookie('csrftoken'));
            
            // Send AJAX request to update phone number
            fetch('/update-phone/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': getCookie('csrftoken')
                },
                body: JSON.stringify({
                    phone_number: newPhone
                })
            })
            .then(response => {
                console.log('Response status:', response.status);
                return response.json();
            })
            .then(data => {
                console.log('Response data:', data);
                if (data.success) {
                    alert('Phone number updated successfully!');
                    
                    // Update the phone trigger to reflect the new state
                    const phoneTrigger = document.getElementById('phoneTrigger');
                    if (phoneTrigger) {
                        phoneTrigger.setAttribute('data-has-phone', 'true');
                    }
                    
                    // Close modal
                    phoneModal.style.display = 'none';
                    document.body.style.overflow = 'auto';
                    
                    // Reset form
                    phoneForm.reset();
                } else {
                    alert('Error: ' + data.message);
                }
            })
            .catch(error => {
                console.error('Error:', error);
                alert('An error occurred while updating the phone number. Please try again.');
            });
        });
    }

    // Real-time phone validation
    if (newPhoneInput && confirmPhoneInput) {
        confirmPhoneInput.addEventListener('input', function() {
            const newPhone = newPhoneInput.value.trim();
            const confirmPhone = this.value.trim();
            
            if (confirmPhone && newPhone !== confirmPhone) {
                this.style.borderColor = '#dc3545';
            } else if (confirmPhone && newPhone === confirmPhone) {
                this.style.borderColor = '#28a745';
            } else {
                this.style.borderColor = '#e1e5e9';
            }
        });
    }

    // Add phone form functionality
    if (addPhoneForm) {
        addPhoneForm.addEventListener('submit', function(e) {
            e.preventDefault();
            console.log('Add phone form submitted');
            
            const phoneNumber = addPhoneNumberInput.value.trim();
            const confirmPhone = confirmAddPhoneInput.value.trim();
            
            console.log('Phone number:', phoneNumber);
            console.log('Confirm phone:', confirmPhone);
            
            // Validation
            if (!phoneNumber || !confirmPhone) {
                alert('Please fill in all fields');
                return;
            }
            
            // Check if phone numbers match
            if (phoneNumber !== confirmPhone) {
                alert('Phone number and confirmation phone number do not match');
                return;
            }
            
            // Phone format validation (basic international format)
            const phoneRegex = /^\+?[\d\s\-\(\)]{10,}$/;
            if (!phoneRegex.test(phoneNumber)) {
                alert('Please enter a valid phone number');
                return;
            }
            
            console.log('Sending AJAX request to /update-phone/');
            console.log('CSRF token:', getCookie('csrftoken'));
            
            // Send AJAX request to add phone number
            fetch('/update-phone/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': getCookie('csrftoken')
                },
                body: JSON.stringify({
                    phone_number: phoneNumber
                })
            })
            .then(response => {
                console.log('Response status:', response.status);
                return response.json();
            })
            .then(data => {
                console.log('Response data:', data);
                if (data.success) {
                    alert('Phone number added successfully!');
                    
                    // Update the phone trigger to reflect the new state
                    const phoneTrigger = document.getElementById('phoneTrigger');
                    if (phoneTrigger) {
                        phoneTrigger.setAttribute('data-has-phone', 'true');
                    }
                    
                    // Close modal
                    addPhoneModal.style.display = 'none';
                    document.body.style.overflow = 'auto';
                    
                    // Reset form
                    addPhoneForm.reset();
                } else {
                    alert('Error: ' + data.message);
                }
            })
            .catch(error => {
                console.error('Error:', error);
                alert('An error occurred while adding the phone number. Please try again.');
            });
        });
    }

    // Real-time validation for add phone form
    if (addPhoneNumberInput && confirmAddPhoneInput) {
        confirmAddPhoneInput.addEventListener('input', function() {
            const phoneNumber = addPhoneNumberInput.value.trim();
            const confirmPhone = this.value.trim();
            
            if (confirmPhone && phoneNumber !== confirmPhone) {
                this.style.borderColor = '#dc3545';
            } else if (confirmPhone && phoneNumber === confirmPhone) {
                this.style.borderColor = '#28a745';
            } else {
                this.style.borderColor = '#e1e5e9';
            }
        });
    }

    // Password functionality
    const passwordForm = document.getElementById('passwordForm');
    const currentPasswordInput = document.getElementById('currentPassword');
    const newPasswordInput = document.getElementById('newPassword');
    const confirmPasswordInput = document.getElementById('confirmPassword');
    const togglePasswordBtns = document.querySelectorAll('.toggle-password_stngs');

    // Toggle password visibility
    togglePasswordBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const targetId = this.getAttribute('data-target');
            const input = document.getElementById(targetId);
            
            if (input.type === 'password') {
                input.type = 'text';
                this.textContent = '🙈';
            } else {
                input.type = 'password';
                this.textContent = '👁️';
            }
        });
    });

    // Password strength checker
    function checkPasswordStrength(password) {
        let score = 0;
        let feedback = [];

        // Length check
        if (password.length >= 8) {
            score += 1;
        } else {
            feedback.push('At least 8 characters');
        }

        // Uppercase check
        if (/[A-Z]/.test(password)) {
            score += 1;
        } else {
            feedback.push('Uppercase letter');
        }

        // Lowercase check
        if (/[a-z]/.test(password)) {
            score += 1;
        } else {
            feedback.push('Lowercase letter');
        }

        // Number check
        if (/\d/.test(password)) {
            score += 1;
        } else {
            feedback.push('Number');
        }

        // Special character check
        if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
            score += 1;
        } else {
            feedback.push('Special character');
        }

        return { score, feedback };
    }

    function updatePasswordStrength(password) {
        const strengthFill = document.getElementById('strengthFill');
        const strengthText = document.getElementById('strengthText');
        
        if (!strengthFill || !strengthText) return;

        const { score, feedback } = checkPasswordStrength(password);
        
        // Remove all existing classes
        strengthFill.className = 'strength-fill_stngs';
        strengthText.className = 'strength-text_stngs';
        
        if (score <= 1) {
            strengthFill.classList.add('weak');
            strengthText.classList.add('weak');
            strengthText.textContent = 'Weak';
        } else if (score <= 2) {
            strengthFill.classList.add('fair');
            strengthText.classList.add('fair');
            strengthText.textContent = 'Fair';
        } else if (score <= 3) {
            strengthFill.classList.add('good');
            strengthText.classList.add('good');
            strengthText.textContent = 'Good';
        } else {
            strengthFill.classList.add('strong');
            strengthText.classList.add('strong');
            strengthText.textContent = 'Strong';
        }
    }

    // Real-time password strength checking
    if (newPasswordInput) {
        newPasswordInput.addEventListener('input', function() {
            updatePasswordStrength(this.value);
        });
    }

    // Password form submission
    if (passwordForm) {
        passwordForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const currentPassword = currentPasswordInput.value;
            const newPassword = newPasswordInput.value;
            const confirmPassword = confirmPasswordInput.value;
            
            // Validation
            if (!currentPassword || !newPassword || !confirmPassword) {
                alert('Please fill in all fields');
                return;
            }
            
            // Check if new password and confirm password match
            if (newPassword !== confirmPassword) {
                alert('New password and confirmation password do not match');
                return;
            }
            
            // Check password strength
            const { score, feedback } = checkPasswordStrength(newPassword);
            if (score < 3) {
                alert('Password is too weak. Please include: ' + feedback.join(', '));
                return;
            }
            
            console.log('Sending password change request to /update-password/');
            console.log('CSRF token:', getCookie('csrftoken'));
            
            // Send AJAX request to change password
            fetch('/update-password/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': getCookie('csrftoken')
                },
                body: JSON.stringify({
                    currentPassword: currentPassword,
                    newPassword: newPassword
                })
            })
            .then(response => {
                console.log('Response status:', response.status);
                return response.json();
            })
            .then(data => {
                console.log('Response data:', data);
                if (data.success) {
                    alert('Password updated successfully!');
                    
                    // Close modal
                    passwordModal.style.display = 'none';
                    document.body.style.overflow = 'auto';
                    
                    // Reset form
                    passwordForm.reset();
                    
                    // Reset password strength indicator
                    const strengthFill = document.getElementById('strengthFill');
                    const strengthText = document.getElementById('strengthText');
                    if (strengthFill && strengthText) {
                        strengthFill.className = 'strength-fill_stngs';
                        strengthText.className = 'strength-text_stngs';
                        strengthText.textContent = 'Weak';
                    }
                } else {
                    alert('Error: ' + data.message);
                }
            })
            .catch(error => {
                console.error('Error:', error);
                alert('An error occurred while updating the password. Please try again.');
            });
        });
    }

    // Real-time password confirmation validation
    if (newPasswordInput && confirmPasswordInput) {
        confirmPasswordInput.addEventListener('input', function() {
            const newPassword = newPasswordInput.value;
            const confirmPassword = this.value;
            
            if (confirmPassword && newPassword !== confirmPassword) {
                this.style.borderColor = '#dc3545';
            } else if (confirmPassword && newPassword === confirmPassword) {
                this.style.borderColor = '#28a745';
            } else {
                this.style.borderColor = '#e1e5e9';
            }
        });
    }
    
    // Real-time validation for UTR field
    const utrInput = document.getElementById('utr');
    if (utrInput) {
        utrInput.addEventListener('input', function() {
            const value = this.value.replace(/\D/g, ''); // Remove non-digits
            this.value = value.substring(0, 10); // Limit to 10 digits
            
            if (value.length === 10) {
                this.style.borderColor = '#28a745';
            } else if (value.length > 0) {
                this.style.borderColor = '#dc3545';
            } else {
                this.style.borderColor = '#e1e5e9';
            }
        });
    }
    
    // Real-time validation for Company Number field
    const companyNumberInput = document.getElementById('companyNumber');
    if (companyNumberInput) {
        companyNumberInput.addEventListener('input', function() {
            const value = this.value.replace(/\D/g, ''); // Remove non-digits
            this.value = value.substring(0, 8); // Limit to 8 digits
            
            if (value.length === 8) {
                this.style.borderColor = '#28a745';
            } else if (value.length > 0) {
                this.style.borderColor = '#dc3545';
            } else {
                this.style.borderColor = '#e1e5e9';
            }
        });
    }
    
    // Real-time validation for Website field
    const websiteInput = document.getElementById('website');
    if (websiteInput) {
        websiteInput.addEventListener('input', function() {
            const value = this.value;
            const urlPattern = /^https?:\/\/.+/;
            
            if (value && urlPattern.test(value)) {
                this.style.borderColor = '#28a745';
            } else if (value) {
                this.style.borderColor = '#dc3545';
            } else {
                this.style.borderColor = '#e1e5e9';
            }
        });
    }

    // Delete account functionality
    const deleteAccountModal = document.getElementById('deleteAccountModal');
    const deleteAccountTrigger = document.querySelector('.delete-account_stngs');
    const deleteAccountForm = document.getElementById('deleteAccountForm');

    // Open delete account modal when clicking on "Delete account"
    if (deleteAccountTrigger) {
        deleteAccountTrigger.addEventListener('click', function(e) {
            e.preventDefault();
            deleteAccountModal.style.display = 'block';
            document.body.style.overflow = 'hidden';
        });
    }

    // Handle delete account form submission
    if (deleteAccountForm) {
        deleteAccountForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const password = document.getElementById('deletePassword').value;
            
            if (!password) {
                alert('Please enter your password to confirm account deletion.');
                return;
            }

            // Show confirmation dialog
            if (!confirm('Are you sure you want to delete your account? This action cannot be undone and all your data will be permanently lost.')) {
                return;
            }

            // Send delete request
            fetch('/delete-account/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': getCookie('csrftoken')
                },
                body: JSON.stringify({
                    password: password
                })
            })
            .then(response => response.json())
            .then(data => {
                console.log('Response data:', data);
                if (data.success) {
                    alert('Account deleted successfully! You will be redirected to the home page.');
                    
                    // Close modal
                    deleteAccountModal.style.display = 'none';
                    document.body.style.overflow = 'auto';
                    
                    // Reset form
                    deleteAccountForm.reset();
                    
                    // Redirect to home page after a short delay
                    setTimeout(() => {
                        window.location.href = '/';
                    }, 2000);
                } else {
                    alert('Error: ' + data.message);
                }
            })
            .catch(error => {
                console.error('Error:', error);
                alert('An error occurred while deleting your account. Please try again.');
            });
        });
    }
});
