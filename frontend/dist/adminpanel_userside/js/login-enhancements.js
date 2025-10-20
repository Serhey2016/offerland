// Login Page Enhancements
document.addEventListener('DOMContentLoaded', function() {
    
    // Enhanced form validation
    const form = document.querySelector('form[method="post"]');
    const emailInput = document.querySelector('input[name="username"]');
    const passwordInput = document.querySelector('input[name="password"]');
    const submitButton = document.querySelector('button[type="submit"]');
    
    if (form) {
        form.addEventListener('submit', function(e) {
            // Basic validation
            if (!emailInput.value.trim()) {
                e.preventDefault();
                showError('Please enter your email address');
                emailInput.focus();
                return;
            }
            
            if (!passwordInput.value.trim()) {
                e.preventDefault();
                showError('Please enter your password');
                passwordInput.focus();
                return;
            }
            
            // Email validation
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(emailInput.value.trim())) {
                e.preventDefault();
                showError('Please enter a valid email address');
                emailInput.focus();
                return;
            }
            
            // Show loading state
            submitButton.classList.add('loading');
            submitButton.textContent = 'Signing in...';
        });
    }
    
    // Real-time validation
    if (emailInput) {
        emailInput.addEventListener('blur', function() {
            const email = this.value.trim();
            if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
                this.style.borderColor = '#dc3545';
                showFieldError(this, 'Please enter a valid email address');
            } else if (email) {
                this.style.borderColor = '#28a745';
                hideFieldError(this);
            } else {
                this.style.borderColor = '#e1e5e9';
                hideFieldError(this);
            }
        });
        
        emailInput.addEventListener('input', function() {
            if (this.style.borderColor === 'rgb(220, 53, 69)') {
                this.style.borderColor = '#e1e5e9';
                hideFieldError(this);
            }
        });
    }
    
    if (passwordInput) {
        passwordInput.addEventListener('blur', function() {
            const password = this.value.trim();
            if (password && password.length < 6) {
                this.style.borderColor = '#dc3545';
                showFieldError(this, 'Password must be at least 6 characters');
            } else if (password) {
                this.style.borderColor = '#28a745';
                hideFieldError(this);
            } else {
                this.style.borderColor = '#e1e5e9';
                hideFieldError(this);
            }
        });
        
        passwordInput.addEventListener('input', function() {
            if (this.style.borderColor === 'rgb(220, 53, 69)') {
                this.style.borderColor = '#e1e5e9';
                hideFieldError(this);
            }
        });
    }
    
    // Enhanced floating labels
    const floatingLabels = document.querySelectorAll('.floating-label');
    floatingLabels.forEach(label => {
        const input = label.previousElementSibling;
        if (input) {
            // Check if input has value on page load
            if (input.value.trim()) {
                label.style.top = '-10px';
                label.style.fontSize = '12px';
                label.style.color = '#667eea';
                label.style.background = 'white';
                label.style.padding = '0 5px';
                label.style.fontWeight = '500';
            }
            
            input.addEventListener('focus', function() {
                label.style.top = '-10px';
                label.style.fontSize = '12px';
                label.style.color = '#667eea';
                label.style.background = 'white';
                label.style.padding = '0 5px';
                label.style.fontWeight = '500';
            });
            
            input.addEventListener('blur', function() {
                if (!this.value.trim()) {
                    label.style.top = '15px';
                    label.style.fontSize = '16px';
                    label.style.color = '#6c757d';
                    label.style.background = 'transparent';
                    label.style.padding = '0';
                    label.style.fontWeight = 'normal';
                }
            });
        }
    });
    
    // Social buttons hover effects
    const socialButtons = document.querySelectorAll('.social .btn');
    socialButtons.forEach(button => {
        button.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-3px)';
            this.style.boxShadow = '0 8px 20px rgba(0, 0, 0, 0.2)';
        });
        
        button.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0)';
            this.style.boxShadow = 'none';
        });
    });
    
    // Auto-hide messages after 5 seconds
    const messages = document.querySelectorAll('.alert');
    messages.forEach(message => {
        setTimeout(() => {
            message.style.opacity = '0';
            setTimeout(() => {
                message.remove();
            }, 300);
        }, 5000);
    });
    
    // Helper functions
    function showError(message) {
        const existingError = document.querySelector('.alert-error');
        if (existingError) {
            existingError.remove();
        }
        
        const errorDiv = document.createElement('div');
        errorDiv.className = 'alert alert-error';
        errorDiv.textContent = message;
        
        const form = document.querySelector('form');
        form.insertBefore(errorDiv, form.firstChild);
        
        // Auto-hide after 5 seconds
        setTimeout(() => {
            errorDiv.style.opacity = '0';
            setTimeout(() => {
                errorDiv.remove();
            }, 300);
        }, 5000);
    }
    
    function showFieldError(input, message) {
        // Remove existing error
        hideFieldError(input);
        
        const errorDiv = document.createElement('div');
        errorDiv.className = 'field-error';
        errorDiv.textContent = message;
        errorDiv.style.color = '#dc3545';
        errorDiv.style.fontSize = '12px';
        errorDiv.style.marginTop = '5px';
        errorDiv.style.marginLeft = '5px';
        
        input.parentNode.appendChild(errorDiv);
    }
    
    function hideFieldError(input) {
        const existingError = input.parentNode.querySelector('.field-error');
        if (existingError) {
            existingError.remove();
        }
    }
    
    // Add smooth transitions
    const style = document.createElement('style');
    style.textContent = `
        .alert {
            transition: opacity 0.3s ease;
        }
        .field-error {
            animation: slideIn 0.3s ease;
        }
        @keyframes slideIn {
            from {
                opacity: 0;
                transform: translateY(-10px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }
    `;
    document.head.appendChild(style);
}); 