document.addEventListener('DOMContentLoaded', function () {

  var form = document.getElementById('addProductForm');
  var saveBtn = document.getElementById('saveBtn');
  var resetBtn = document.getElementById('resetBtn');
  var specsList = document.getElementById('specsList');
  var addSpecBtn = document.getElementById('addSpecBtn');
  var uploadZone = document.getElementById('uploadZone');
  var fileInput = document.getElementById('image_file');
  var uploadPreview = document.getElementById('uploadPreview');
  var uploadPlaceholder = document.getElementById('uploadPlaceholder');
  var successToast = document.getElementById('successToast');

  var uploadedFiles = [];

  /* ===== Sidebar ===== */
  var sidebar = document.getElementById('sidebar');
  var menuToggle = document.getElementById('menuToggle');
  var sidebarClose = document.getElementById('sidebarClose');
  var sidebarOverlay = document.getElementById('sidebarOverlay');

  menuToggle.addEventListener('click', function () {
    sidebar.classList.add('open');
    sidebarOverlay.classList.add('show');
    document.body.style.overflow = 'hidden';
  });

  function closeSidebar() {
    sidebar.classList.remove('open');
    sidebarOverlay.classList.remove('show');
    document.body.style.overflow = '';
  }

  sidebarClose.addEventListener('click', closeSidebar);
  sidebarOverlay.addEventListener('click', closeSidebar);

  /* ===== Profile Dropdown ===== */
  var profileBtn = document.getElementById('profileBtn');
  var profileDropdown = document.getElementById('profileDropdown');

  profileBtn.addEventListener('click', function (e) {
    e.stopPropagation();
    profileDropdown.classList.toggle('show');
  });

  document.addEventListener('click', function () { profileDropdown.classList.remove('show'); });
  profileDropdown.addEventListener('click', function (e) { e.stopPropagation(); });

  /* ===== Validation Helpers ===== */
  function showError(id, message) {
    var el = document.getElementById(id + 'Error');
    if (el) {
      el.textContent = message;
      el.classList.add('visible');
    }
    var input = document.getElementById(id);
    if (input) input.classList.add('error');
  }

  function clearError(id) {
    var el = document.getElementById(id + 'Error');
    if (el) {
      el.textContent = '';
      el.classList.remove('visible');
    }
    var input = document.getElementById(id);
    if (input) input.classList.remove('error');
  }

  function clearAllErrors() {
    var ids = ['name', 'part_number', 'brand', 'category', 'price', 'stock_quantity', 'reorder_level', 'image'];
    ids.forEach(clearError);
  }

  /* Live clearing on input */
  ['name', 'part_number', 'brand', 'category', 'price', 'stock_quantity', 'reorder_level'].forEach(function (id) {
    var el = document.getElementById(id);
    if (el) {
      el.addEventListener('input', function () { clearError(id); });
      el.addEventListener('change', function () { clearError(id); });
    }
  });

  /* ===== Form Validation ===== */
  function validate() {
    var valid = true;
    clearAllErrors();

    var name = document.getElementById('name').value.trim();
    var partNumber = document.getElementById('part_number').value.trim();
    var brand = document.getElementById('brand').value;
    var category = document.getElementById('category').value;
    var price = document.getElementById('price').value;
    var stock = document.getElementById('stock_quantity').value;
    var reorder = document.getElementById('reorder_level').value;

    if (!name) { showError('name', 'Product name is required'); valid = false; }
    else if (name.length < 3) { showError('name', 'Name must be at least 3 characters'); valid = false; }

    if (!partNumber) { showError('part_number', 'Part number is required'); valid = false; }
    else if (!/^[A-Za-z0-9\-_.]+$/.test(partNumber)) { showError('part_number', 'Invalid part number format'); valid = false; }

    if (!brand) { showError('brand', 'Please select a brand'); valid = false; }
    if (!category) { showError('category', 'Please select a category'); valid = false; }

    if (!price) { showError('price', 'Price is required'); valid = false; }
    else if (isNaN(parseFloat(price)) || parseFloat(price) < 0) { showError('price', 'Enter a valid price'); valid = false; }

    if (stock === '' || stock === null) { showError('stock_quantity', 'Stock quantity is required'); valid = false; }
    else if (parseInt(stock, 10) < 0) { showError('stock_quantity', 'Stock cannot be negative'); valid = false; }

    if (reorder === '' || reorder === null) { showError('reorder_level', 'Reorder level is required'); valid = false; }
    else if (parseInt(reorder, 10) < 0) { showError('reorder_level', 'Reorder level cannot be negative'); valid = false; }

    /* Validate specs (non-empty key requires non-empty val) */
    var specRows = specsList.querySelectorAll('.spec-row');
    specRows.forEach(function (row) {
      var key = row.querySelector('.spec-key').value.trim();
      var val = row.querySelector('.spec-val').value.trim();
      if (key && !val) {
        row.querySelector('.spec-val').style.borderColor = '#DC2626';
        valid = false;
      } else if (!key && val) {
        row.querySelector('.spec-key').style.borderColor = '#DC2626';
        valid = false;
      } else {
        row.querySelector('.spec-key').style.borderColor = '';
        row.querySelector('.spec-val').style.borderColor = '';
      }
    });

    /* Validate image (optional but warn if > 5MB) */
    uploadedFiles.forEach(function (f) {
      if (f.size > 5 * 1024 * 1024) {
        showError('image', f.name + ' exceeds 5MB limit');
        valid = false;
      }
    });

    return valid;
  }

  /* ===== Form Submit ===== */
  form.addEventListener('submit', function (e) {
    e.preventDefault();

    if (!validate()) {
      /* Shake animation */
      form.closest('.main-content').classList.remove('shake');
      void form.closest('.main-content').offsetWidth;
      form.closest('.main-content').classList.add('shake');
      return;
    }

    /* Show loader */
    var btnText = saveBtn.querySelector('.btn-text');
    var btnLoader = saveBtn.querySelector('.btn-loader');
    btnText.style.display = 'none';
    btnLoader.style.display = 'inline-flex';
    saveBtn.disabled = true;

    /* Simulate save (no backend) */
    setTimeout(function () {
      btnText.style.display = 'inline-flex';
      btnLoader.style.display = 'none';
      saveBtn.disabled = false;
      showToast();
    }, 1500);
  });

  /* ===== Toast ===== */
  function showToast() {
    successToast.classList.add('show');
    setTimeout(function () { successToast.classList.remove('show'); }, 3000);
  }

  /* ===== Reset ===== */
  resetBtn.addEventListener('click', function () {
    if (!confirm('Reset all fields? This cannot be undone.')) return;
    form.reset();
    clearAllErrors();

    /* Reset specs to single empty row */
    specsList.innerHTML =
      '<div class="spec-row">' +
        '<input type="text" class="spec-key" placeholder="Key (e.g. Material)">' +
        '<input type="text" class="spec-val" placeholder="Value (e.g. SS316)">' +
        '<button type="button" class="spec-remove" title="Remove"><i class="fas fa-times"></i></button>' +
      '</div>';
    attachSpecRemove();

    /* Reset upload */
    uploadedFiles = [];
    uploadPreview.innerHTML = '';
    uploadPreview.style.display = 'none';
    uploadPlaceholder.style.display = 'block';
    clearError('image');
  });

  /* ===== Specifications ===== */
  function attachSpecRemove() {
    specsList.querySelectorAll('.spec-remove').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var rows = specsList.querySelectorAll('.spec-row');
        if (rows.length > 1) {
          btn.closest('.spec-row').remove();
        } else {
          btn.closest('.spec-row').querySelectorAll('input').forEach(function (i) { i.value = ''; });
        }
      });
    });
  }

  addSpecBtn.addEventListener('click', function () {
    var row = document.createElement('div');
    row.className = 'spec-row';
    row.innerHTML =
      '<input type="text" class="spec-key" placeholder="Key (e.g. Material)">' +
      '<input type="text" class="spec-val" placeholder="Value (e.g. SS316)">' +
      '<button type="button" class="spec-remove" title="Remove"><i class="fas fa-times"></i></button>';
    specsList.appendChild(row);
    attachSpecRemove();
    row.querySelector('.spec-key').focus();
  });

  attachSpecRemove();

  /* ===== Image Upload ===== */
  uploadZone.addEventListener('click', function () {
    fileInput.click();
  });

  uploadZone.addEventListener('dragover', function (e) {
    e.preventDefault();
    uploadZone.classList.add('dragover');
  });

  uploadZone.addEventListener('dragleave', function () {
    uploadZone.classList.remove('dragover');
  });

  uploadZone.addEventListener('drop', function (e) {
    e.preventDefault();
    uploadZone.classList.remove('dragover');
    handleFiles(e.dataTransfer.files);
  });

  fileInput.addEventListener('change', function () {
    handleFiles(fileInput.files);
    fileInput.value = '';
  });

  function handleFiles(files) {
    Array.from(files).forEach(function (f) {
      if (!f.type.startsWith('image/')) return;
      if (f.size > 5 * 1024 * 1024) {
        showError('image', f.name + ' exceeds 5MB limit');
        return;
      }
      if (uploadedFiles.length >= 6) return;

      uploadedFiles.push(f);
      var reader = new FileReader();
      reader.onload = function (ev) {
        var item = document.createElement('div');
        item.className = 'preview-item';
        item.innerHTML =
          '<img src="' + ev.target.result + '" alt="' + f.name + '">' +
          '<button type="button" class="preview-remove" data-name="' + f.name + '"><i class="fas fa-times"></i></button>';
        uploadPreview.appendChild(item);

        item.querySelector('.preview-remove').addEventListener('click', function (e) {
          e.stopPropagation();
          var name = item.querySelector('.preview-remove').getAttribute('data-name');
          uploadedFiles = uploadedFiles.filter(function (x) { return x.name !== name; });
          item.remove();
          if (uploadedFiles.length === 0) {
            uploadPreview.style.display = 'none';
            uploadPlaceholder.style.display = 'block';
          }
        });
      };
      reader.readAsDataURL(f);
    });

    if (uploadedFiles.length > 0) {
      uploadPlaceholder.style.display = 'none';
      uploadPreview.style.display = 'grid';
      clearError('image');
    }
  }

  /* ===== Escape closes sidebar ===== */
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') closeSidebar();
  });

});
