// Simple Sign-Up Form with Testing Challenges
class SignUpForm {
  constructor() {
    this.formData = {};
    this.isSubmitting = false;

    this.init();
  }

  init() {
    this.setupEventListeners();
    this.showRandomPopup();
  }

  showRandomPopup() {
    // Random popup that appears during form interaction (testing challenge)
    setTimeout(() => {
      this.showInterruptivePopup();
    }, Math.random() * 20_000);
  }

  showInterruptivePopup() {
    const popup = document.createElement('div');
    popup.className = 'popup-modal';
    popup.innerHTML = `
      <div class="popup-content">
        <div class="popup-icon">🎯</div>
        <h3 class="popup-title">Special Offer!</h3>
        <p>Sign up now and get 50% off your first month. Limited time offer!</p>
        <div style="display: flex; gap: 1rem; justify-content: center;">
          <button class="wizard-btn" onclick="this.closest('.popup-modal').remove()">Maybe Later</button>
          <button class="wizard-btn next-btn" onclick="this.closest('.popup-modal').remove()">Claim Offer</button>
        </div>
      </div>
    `;
    document.body.appendChild(popup);

    // Auto-remove after 10 seconds if not interacted with
    setTimeout(() => {
      if (document.body.contains(popup)) {
        popup.remove();
      }
    }, 10000);
  }

  setupEventListeners() {
    const form = document.getElementById('signupForm');
    const nameInput = document.getElementById('fullName');
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    const confirmPasswordInput = document.getElementById('confirmPassword');
    const termsCheckbox = document.getElementById('agreeTerms');

    // Form submission
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      if (!this.isSubmitting) {
        this.submitForm();
      }
    });

    // Real-time validation
    nameInput.addEventListener('input', (e) => {
      if (!e.target.hasAttribute('data-touched')) {
        e.target.setAttribute('data-touched', 'true');
      }
      this.validateName(e.target.value);
      this.updateSubmitButton();
    });

    nameInput.addEventListener('blur', () => {
      nameInput.setAttribute('data-touched', 'true');
      this.validateName(nameInput.value);
      this.updateSubmitButton();
    });

    emailInput.addEventListener('input', (e) => {
      if (!e.target.hasAttribute('data-touched')) {
        e.target.setAttribute('data-touched', 'true');
      }
      this.validateEmail(e.target.value);
      this.updateSubmitButton();
    });

    emailInput.addEventListener('blur', (e) => {
      emailInput.setAttribute('data-touched', 'true');
      if (e.target.value) {
        this.checkEmailAvailability(e.target.value);
      }
      this.validateEmail(e.target.value);
      this.updateSubmitButton();
    });

    passwordInput.addEventListener('input', (e) => {
      if (!e.target.hasAttribute('data-touched')) {
        e.target.setAttribute('data-touched', 'true');
      }
      this.validatePassword(e.target.value);
      this.updatePasswordStrength(e.target.value);
      this.validatePasswordMatch();
      this.updateSubmitButton();
    });

    passwordInput.addEventListener('blur', () => {
      passwordInput.setAttribute('data-touched', 'true');
      this.validatePassword(passwordInput.value);
      this.validatePasswordMatch();
      this.updateSubmitButton();
    });

    confirmPasswordInput.addEventListener('input', (e) => {
      if (!e.target.hasAttribute('data-touched')) {
        e.target.setAttribute('data-touched', 'true');
      }
      this.validatePasswordMatch();
      this.updateSubmitButton();
    });

    confirmPasswordInput.addEventListener('blur', () => {
      confirmPasswordInput.setAttribute('data-touched', 'true');
      this.validatePasswordMatch();
      this.updateSubmitButton();
    });

    termsCheckbox.addEventListener('change', (e) => {
      e.target.setAttribute('data-touched', 'true');
      this.validateTerms();
      this.updateSubmitButton();
    });

    // Reset and retry buttons
    document.addEventListener('click', (e) => {
      if (e.target.classList.contains('retry-btn')) {
        this.showForm();
      } else if (e.target.classList.contains('reset-btn')) {
        this.resetForm();
      }
    });
  }

  validateName(value) {
    const nameInput = document.getElementById('fullName');
    const errorElement = nameInput
      .closest('.form-group')
      .querySelector('.error-message');

    // Only show errors if the field has been touched
    if (!nameInput.hasAttribute('data-touched')) {
      errorElement.textContent = '';
      return true;
    }

    let isValid = true;
    let errorMessage = '';

    if (!value.trim()) {
      isValid = false;
      errorMessage = 'Full name is required';
    } else if (value.trim().length < 2) {
      isValid = false;
      errorMessage = 'Name must be at least 2 characters';
    } else if (!/^[a-zA-Z\s]+$/.test(value)) {
      isValid = false;
      errorMessage = 'Name can only contain letters and spaces';
    }

    nameInput.classList.toggle('error', !isValid);
    errorElement.textContent = errorMessage;

    this.formData.fullName = value;
    return isValid;
  }

  validateEmail(value) {
    const emailInput = document.getElementById('email');
    const errorElement = emailInput
      .closest('.form-group')
      .querySelector('.error-message');

    // Only show errors if the field has been touched
    if (!emailInput.hasAttribute('data-touched')) {
      errorElement.textContent = '';
      return true;
    }

    let isValid = true;
    let errorMessage = '';

    if (!value.trim()) {
      isValid = false;
      errorMessage = 'Email address is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
      isValid = false;
      errorMessage = 'Please enter a valid email address';
    }

    emailInput.classList.toggle('error', !isValid);
    errorElement.textContent = errorMessage;

    this.formData.email = value;
    return isValid;
  }

  checkEmailAvailability(email) {
    const emailInput = document.getElementById('email');
    const statusElement =
      emailInput.parentNode.querySelector('.validation-status');

    // Show checking status
    statusElement.innerHTML =
      '<span style="color: #6b7280;">⏳ Checking availability...</span>';

    // Simulate API call with random delay and occasional "already exists" error
    setTimeout(() => {
      const isAvailable = Math.random() > 0.3; // 70% chance email is available

      if (isAvailable) {
        statusElement.innerHTML =
          '<span style="color: #10b981;">✓ Email available</span>';
      } else {
        statusElement.innerHTML =
          '<span style="color: #ef4444;">⚠ Email already taken</span>';
        emailInput.classList.add('error');
        emailInput.parentNode.querySelector('.error-message').textContent =
          'This email is already registered. Please use a different email.';
      }
    }, Math.random() * 2000 + 500); // 500ms - 2.5s delay
  }

  validatePassword(value) {
    const passwordInput = document.getElementById('password');
    const errorElement =
      passwordInput.parentNode.querySelector('.error-message');

    // Only show errors if the field has been touched
    if (!passwordInput.hasAttribute('data-touched')) {
      errorElement.textContent = '';
      return true;
    }

    let isValid = true;
    let errorMessage = '';

    if (!value.trim()) {
      isValid = false;
      errorMessage = 'Password is required';
    } else if (value.length < 8) {
      isValid = false;
      errorMessage = 'Password must be at least 8 characters';
    } else if (
      !/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/.test(
        value
      )
    ) {
      isValid = false;
      errorMessage =
        'Password must include uppercase, lowercase, number, and special character';
    }

    passwordInput.classList.toggle('error', !isValid);
    errorElement.textContent = errorMessage;

    this.formData.password = value;
    return isValid;
  }

  updatePasswordStrength(password) {
    const strengthBar = document.querySelector('.strength-bar');
    const strengthText = document.querySelector('.strength-text');

    let strength = 0;
    let strengthLabel = 'Enter a password';

    if (password.length >= 8) strength++;
    if (/[a-z]/.test(password)) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/\d/.test(password)) strength++;
    if (/[@$!%*?&]/.test(password)) strength++;

    // Remove existing classes
    strengthBar.classList.remove('weak', 'medium', 'strong');

    if (strength >= 4) {
      strengthBar.classList.add('strong');
      strengthLabel = 'Strong password';
    } else if (strength >= 2) {
      strengthBar.classList.add('medium');
      strengthLabel = 'Medium strength';
    } else if (password.length > 0) {
      strengthBar.classList.add('weak');
      strengthLabel = 'Weak password';
    }

    strengthText.textContent = strengthLabel;
  }

  validatePasswordMatch() {
    const passwordInput = document.getElementById('password');
    const confirmPasswordInput = document.getElementById('confirmPassword');
    const errorElement =
      confirmPasswordInput.parentNode.querySelector('.error-message');

    // Only show errors if the field has been touched
    if (!confirmPasswordInput.hasAttribute('data-touched')) {
      errorElement.textContent = '';
      return true;
    }

    let isValid = true;
    let errorMessage = '';

    if (!confirmPasswordInput.value) {
      isValid = false;
      errorMessage = 'Please confirm your password';
    } else if (confirmPasswordInput.value !== passwordInput.value) {
      isValid = false;
      errorMessage = 'Passwords do not match';
    }

    confirmPasswordInput.classList.toggle('error', !isValid);
    errorElement.textContent = errorMessage;

    return isValid;
  }

  validateTerms() {
    const termsCheckbox = document.getElementById('agreeTerms');
    const errorElement = termsCheckbox
      .closest('.form-group')
      .querySelector('.error-message');

    const isValid = termsCheckbox.checked;
    const hasBeenTouched = termsCheckbox.hasAttribute('data-touched');

    // Only show error if the checkbox has been touched and is not checked
    errorElement.textContent =
      hasBeenTouched && !isValid
        ? 'You must accept the terms and conditions'
        : '';

    return isValid;
  }

  updateSubmitButton() {
    const submitBtn = document.querySelector('.submit-btn');
    const nameInput = document.getElementById('fullName');
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    const confirmPasswordInput = document.getElementById('confirmPassword');
    const termsCheckbox = document.getElementById('agreeTerms');

    // Only validate fields that have been touched or have content
    const nameValid = nameInput.value.trim()
      ? this.validateName(nameInput.value)
      : true;
    const emailValid = emailInput.value.trim()
      ? this.validateEmail(emailInput.value)
      : true;
    const passwordValid = passwordInput.value.trim()
      ? this.validatePassword(passwordInput.value)
      : true;
    const passwordMatchValid = confirmPasswordInput.value.trim()
      ? this.validatePasswordMatch()
      : true;
    const termsValid =
      termsCheckbox.checked || !termsCheckbox.hasAttribute('data-touched')
        ? this.validateTerms()
        : true;

    const isValid =
      nameValid &&
      emailValid &&
      passwordValid &&
      passwordMatchValid &&
      termsValid;

    submitBtn.disabled = !isValid || this.isSubmitting;
  }

  submitForm() {
    this.isSubmitting = true;
    const submitBtn = document.querySelector('.submit-btn');
    const btnText = submitBtn.querySelector('.btn-text');
    const spinner = submitBtn.querySelector('.loading-spinner');

    // Show loading state
    btnText.textContent = 'Creating Account...';
    spinner.style.display = 'inline-block';
    submitBtn.disabled = true;

    // Simulate form submission with random outcome and timing
    setTimeout(() => {
      const isSuccess = Math.random() > 0.3; // 70% success rate

      if (isSuccess) {
        this.showSuccess();
      } else {
        this.showError();
      }

      this.isSubmitting = false;
    }, Math.random() * 3000 + 1500); // 1.5-4.5 seconds
  }

  showSuccess() {
    document.getElementById('signupForm').style.display = 'none';
    document.getElementById('successState').style.display = 'block';
    document.getElementById('errorState').style.display = 'none';
  }

  showError() {
    const errors = [
      'Network error. Please check your connection and try again.',
      'Server is temporarily unavailable. Please try again in a moment.',
      'Account creation failed. Please try again.',
      'Email verification service is down. Please try again later.',
      'Service maintenance in progress. Please try again later.',
    ];

    const randomError = errors[Math.floor(Math.random() * errors.length)];
    document.getElementById('errorMessage').textContent = randomError;

    document.getElementById('signupForm').style.display = 'none';
    document.getElementById('errorState').style.display = 'block';
    document.getElementById('successState').style.display = 'none';
  }

  showForm() {
    document.getElementById('signupForm').style.display = 'block';
    document.getElementById('successState').style.display = 'none';
    document.getElementById('errorState').style.display = 'none';

    // Reset button state
    const submitBtn = document.querySelector('.submit-btn');
    const btnText = submitBtn.querySelector('.btn-text');
    const spinner = submitBtn.querySelector('.loading-spinner');

    btnText.textContent = 'Create Account';
    spinner.style.display = 'none';
    this.updateSubmitButton();
  }

  resetForm() {
    const form = document.getElementById('signupForm');
    const inputs = form.querySelectorAll('input');
    const errorMessages = form.querySelectorAll('.error-message');
    const strengthBar = document.querySelector('.strength-bar');
    const strengthText = document.querySelector('.strength-text');
    const validationStatus = document.querySelector('.validation-status');

    // Reset form and clear data
    form.reset();
    this.formData = {};

    // Clear error states and messages
    inputs.forEach((input) => {
      input.classList.remove('error');
      input.removeAttribute('data-touched');
    });

    errorMessages.forEach((msg) => {
      msg.textContent = '';
    });

    // Reset password strength indicator
    strengthBar.className = 'strength-bar';
    strengthText.textContent = 'Enter a password';

    // Clear email validation status
    if (validationStatus) {
      validationStatus.innerHTML = '';
    }

    // Reset form display
    this.showForm();
    this.updateSubmitButton();
  }
}

// Initialize the sign-up form when the page loads
document.addEventListener('DOMContentLoaded', () => {
  new SignUpForm();
});
