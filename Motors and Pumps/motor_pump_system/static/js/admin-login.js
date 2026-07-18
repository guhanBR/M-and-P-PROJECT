document.addEventListener('DOMContentLoaded', function () {
  var form = document.getElementById('adminLoginForm');
  var emailInput = document.getElementById('email');
  var passwordInput = document.getElementById('password');
  var togglePassword = document.getElementById('togglePassword');
  var loginBtn = document.getElementById('loginBtn');
  var forgotLink = document.getElementById('forgotLink');

  /* ---- Show / Hide Password ---- */
  togglePassword.addEventListener('click', function () {
    var isPassword = passwordInput.type === 'password';
    passwordInput.type = isPassword ? 'text' : 'password';
    var eyeOpen = togglePassword.querySelector('.eye-open');
    var eyeClosed = togglePassword.querySelector('.eye-closed');
    if (isPassword) {
      eyeOpen.style.display = 'none';
      eyeClosed.style.display = 'block';
      togglePassword.setAttribute('aria-label', 'Hide password');
    } else {
      eyeOpen.style.display = 'block';
      eyeClosed.style.display = 'none';
      togglePassword.setAttribute('aria-label', 'Show password');
    }
  });

  /* ---- Validation ---- */
  function validateEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  function showError(id, message) {
    var el = document.getElementById(id);
    el.textContent = message;
    el.classList.add('visible');
    var input = id === 'emailError' ? emailInput : passwordInput;
    input.classList.add('error');
  }

  function clearError(id) {
    var el = document.getElementById(id);
    el.textContent = '';
    el.classList.remove('visible');
    var input = id === 'emailError' ? emailInput : passwordInput;
    input.classList.remove('error');
  }

  emailInput.addEventListener('input', function () {
    clearError('emailError');
  });

  passwordInput.addEventListener('input', function () {
    clearError('passwordError');
  });

  /* ---- Form Submit (client-side validation, then native POST) ---- */
  form.addEventListener('submit', function (e) {
    var valid = true;

    clearError('emailError');
    clearError('passwordError');

    if (!emailInput.value.trim()) {
      showError('emailError', 'Email address is required');
      valid = false;
    } else if (!validateEmail(emailInput.value.trim())) {
      showError('emailError', 'Please enter a valid email address');
      valid = false;
    }

    if (!passwordInput.value) {
      showError('passwordError', 'Password is required');
      valid = false;
    }

    if (!valid) {
      e.preventDefault();
      var card = document.querySelector('.login-card');
      card.classList.remove('shake');
      void card.offsetWidth;
      card.classList.add('shake');
      return;
    }

    var btnText = loginBtn.querySelector('.btn-text');
    var btnLoader = loginBtn.querySelector('.btn-loader');
    btnText.style.display = 'none';
    btnLoader.style.display = 'inline-flex';
    loginBtn.disabled = true;
  });

  /* ---- Forgot Password (UI only) ---- */
  forgotLink.addEventListener('click', function (e) {
    e.preventDefault();
    alert('Please contact the system administrator to reset your password.');
  });
});
