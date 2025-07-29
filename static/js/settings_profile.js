// Navigation functionality for settings page
document.addEventListener('DOMContentLoaded', function() {
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
    const nameLegalTrigger = document.querySelector('.item-link_stngs');
    const closeBtns = document.querySelectorAll('.close_stngs');
    const form = document.getElementById('nameLegalLocationForm');

    // Profile photo modal
    const photoModal = document.getElementById('profilePhotoModal');
    const photoTrigger = document.querySelectorAll('.item-link_stngs')[1]; // Second item-link is "Profile photo"

    // Email modal
    const emailModal = document.getElementById('emailModal');
    const emailTrigger = document.querySelectorAll('.item-link_stngs')[2]; // Third item-link is "Email address"

    // Phone modal
    const phoneModal = document.getElementById('phoneModal');
    const phoneTrigger = document.querySelectorAll('.item-link_stngs')[3]; // Fourth item-link is "Phone number"

    // Password modal
    const passwordModal = document.getElementById('passwordModal');
    const passwordTrigger = document.querySelectorAll('.item-link_stngs')[4]; // Fifth item-link is "Change password"

    // Open modal when clicking on "Name, Legal, location"
    if (nameLegalTrigger) {
        nameLegalTrigger.addEventListener('click', function(e) {
            e.preventDefault();
            nameLegalModal.style.display = 'block';
            document.body.style.overflow = 'hidden';
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
            phoneModal.style.display = 'block';
            document.body.style.overflow = 'hidden';
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
            const data = Object.fromEntries(formData);
            
            // Here you would typically send the data to your server
            console.log('Form data:', data);
            
            // Show success message (you can customize this)
            alert('Settings saved successfully!');
            
            // Close modal
            nameLegalModal.style.display = 'none';
            document.body.style.overflow = 'auto';
        });
    }

    // Profile photo functionality
    const photoUpload = document.getElementById('photoUpload');
    const currentPhoto = document.getElementById('currentPhoto');
    const photoPlaceholder = document.getElementById('photoPlaceholder');
    const deleteSection = document.getElementById('deleteSection');
    const deletePhotoBtn = document.getElementById('deletePhotoBtn');
    const savePhotoBtn = document.getElementById('savePhotoBtn');
    const cancelBtns = document.querySelectorAll('.cancel-btn_stngs');

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
            const displayedEmail = '04***5x@gmail.com'; // This should match the email shown in the UI
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
    const currentPhoneInput = document.getElementById('currentPhone');
    const newPhoneInput = document.getElementById('newPhone');
    const confirmPhoneInput = document.getElementById('confirmPhone');

    if (phoneForm) {
        phoneForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const currentPhone = currentPhoneInput.value.trim();
            const newPhone = newPhoneInput.value.trim();
            const confirmPhone = confirmPhoneInput.value.trim();
            
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
            
            // Here you would typically send the data to your server
            console.log('Phone change request:', {
                currentPhone: currentPhone,
                newPhone: newPhone
            });
            
            // Simulate successful phone change
            alert('Verification code has been sent to your new phone number. Please check your messages and enter the code.');
            
            // Close modal
            phoneModal.style.display = 'none';
            document.body.style.overflow = 'auto';
            
            // Reset form
            phoneForm.reset();
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
            
            // Check if current password is correct (example validation)
            if (currentPassword !== 'currentPassword123') {
                alert('Current password is incorrect');
                return;
            }
            
            // Check if new password is different from current
            if (newPassword === currentPassword) {
                alert('New password must be different from current password');
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
            
            // Here you would typically send the data to your server
            console.log('Password change request:', {
                currentPassword: currentPassword,
                newPassword: newPassword
            });
            
            // Simulate successful password change
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
});
