document.addEventListener('DOMContentLoaded', function () {

  /* ===== Sample Product Data (pre-fill) ===== */
  var product = {
    id: 5,
    name: 'Impeller X200 Centrifugal',
    part_number: 'IMP-X200-SS',
    brand: 'Grundfos',
    category: 'Pump Impellers',
    price: 4500,
    stock_quantity: 3,
    reorder_level: 10,
    description: 'Open type centrifugal impeller made from SS316 stainless steel. Designed for high-efficiency fluid transfer in industrial pump systems. Compatible with Grundfos CR and KSB Etanorm series pumps.',
    motor_model: 'Siemens 1LE1001, ABB M3AA100, WEG W22',
    pump_model: 'Grundfos CR 15-5, KSB Etanorm 50-210',
    image_name: 'IMP-X200-SS.jpg',
    color: '#0D9488',
    icon: 'fas fa-compact-disc',
    specs: {
      'Material': 'SS316 Stainless Steel',
      'Diameter': '200mm',
      'Type': 'Open',
      'Max Flow': '15 m³/h',
      'Max Head': '35m',
      'Weight': '2.8 kg'
    }
  };

  /* ===== DOM References ===== */
  var form = document.getElementById('editProductForm');
  var saveBtn = document.getElementById('saveBtn');
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

  /* ===== Pre-fill Fields ===== */
  function prefillProduct() {
    document.getElementById('name').value = product.name;
    document.getElementById('part_number').value = product.part_number;
    document.getElementById('brand').value = product.brand;
    document.getElementById('category').value = product.category;
    document.getElementById('price').value = product.price;
    document.getElementById('stock_quantity').value = product.stock_quantity;
    document.getElementById('reorder_level').value = product.reorder_level;
    document.getElementById('description').value = product.description;
    document.getElementById('motor_model').value = product.motor_model;
    document.getElementById('pump_model').value = product.pump_model;

    /* Pre-fill specifications */
    specsList.innerHTML = '';
    var keys = Object.keys(product.specs);
    keys.forEach(function (key) {
      addSpecRow(key, product.specs[key]);
    });

    /* Set current image */
    var currentImgBox = document.querySelector('.current-img-box');
    currentImgBox.style.background = product.color;
    currentImgBox.innerHTML = '<i class="' + product.icon + '"></i>';
    document.querySelector('.current-img-name').textContent = product.image_name;
  }

  /* ===== Validation Helpers ===== */
  function showError(id, message) {
    var el = document.getElementById(id + 'Error');
    if (el) { el.textContent = message; el.classList.add('visible'); }
    var input = document.getElementById(id);
    if (input) input.classList.add('error');
  }

  function clearError(id) {
    var el = document.getElementById(id + 'Error');
    if (el) { el.textContent = ''; el.classList.remove('visible'); }
    var input = document.getElementById(id);
    if (input) input.classList.remove('error');
  }

  function clearAllErrors() {
    ['name', 'brand', 'category', 'price', 'stock_quantity', 'reorder_level', 'image'].forEach(clearError);
  }

  ['name', 'brand', 'category', 'price', 'stock_quantity', 'reorder_level'].forEach(function (id) {
    var el = document.getElementById(id);
    if (el) { el.addEventListener('input', function () { clearError(id); }); }
  });

  /* ===== Validation ===== */
  function validate() {
    var valid = true;
    clearAllErrors();

    var name = document.getElementById('name').value.trim();
    var brand = document.getElementById('brand').value;
    var category = document.getElementById('category').value;
    var price = document.getElementById('price').value;
    var stock = document.getElementById('stock_quantity').value;
    var reorder = document.getElementById('reorder_level').value;

    if (!name) { showError('name', 'Product name is required'); valid = false; }
    else if (name.length < 3) { showError('name', 'Name must be at least 3 characters'); valid = false; }

    if (!brand) { showError('brand', 'Please select a brand'); valid = false; }
    if (!category) { showError('category', 'Please select a category'); valid = false; }

    if (!price) { showError('price', 'Price is required'); valid = false; }
    else if (isNaN(parseFloat(price)) || parseFloat(price) < 0) { showError('price', 'Enter a valid price'); valid = false; }

    if (stock === '' || stock === null) { showError('stock_quantity', 'Stock quantity is required'); valid = false; }
    else if (parseInt(stock, 10) < 0) { showError('stock_quantity', 'Stock cannot be negative'); valid = false; }

    if (reorder === '' || reorder === null) { showError('reorder_level', 'Reorder level is required'); valid = false; }
    else if (parseInt(reorder, 10) < 0) { showError('reorder_level', 'Reorder level cannot be negative'); valid = false; }

    /* Validate specs */
    var specRows = specsList.querySelectorAll('.spec-row');
    specRows.forEach(function (row) {
      var key = row.querySelector('.spec-key').value.trim();
      var val = row.querySelector('.spec-val').value.trim();
      if (key && !val) { row.querySelector('.spec-val').style.borderColor = '#DC2626'; valid = false; }
      else if (!key && val) { row.querySelector('.spec-key').style.borderColor = '#DC2626'; valid = false; }
      else { row.querySelector('.spec-key').style.borderColor = ''; row.querySelector('.spec-val').style.borderColor = ''; }
    });

    uploadedFiles.forEach(function (f) {
      if (f.size > 5 * 1024 * 1024) { showError('image', f.name + ' exceeds 5MB limit'); valid = false; }
    });

    return valid;
  }

  /* ===== Form Submit ===== */
  form.addEventListener('submit', function (e) {
    e.preventDefault();

    if (!validate()) {
      var content = document.querySelector('.main-content');
      content.classList.remove('shake');
      void content.offsetWidth;
      content.classList.add('shake');
      return;
    }

    var btnText = saveBtn.querySelector('.btn-text');
    var btnLoader = saveBtn.querySelector('.btn-loader');
    btnText.style.display = 'none';
    btnLoader.style.display = 'inline-flex';
    saveBtn.disabled = true;

    setTimeout(function () {
      btnText.style.display = 'inline-flex';
      btnLoader.style.display = 'none';
      saveBtn.disabled = false;
      showToast();
    }, 1500);
  });

  function showToast() {
    successToast.classList.add('show');
    setTimeout(function () { successToast.classList.remove('show'); }, 3000);
  }

  /* ===== Specifications ===== */
  function addSpecRow(key, val) {
    var row = document.createElement('div');
    row.className = 'spec-row';
    row.innerHTML =
      '<input type="text" class="spec-key" placeholder="Key (e.g. Material)">' +
      '<input type="text" class="spec-val" placeholder="Value (e.g. SS316)">' +
      '<button type="button" class="spec-remove" title="Remove"><i class="fas fa-times"></i></button>';
    if (key) row.querySelector('.spec-key').value = key;
    if (val) row.querySelector('.spec-val').value = val;
    specsList.appendChild(row);
    attachSpecRemove(row);
  }

  function attachSpecRemove(row) {
    row.querySelector('.spec-remove').addEventListener('click', function () {
      var rows = specsList.querySelectorAll('.spec-row');
      if (rows.length > 1) {
        row.remove();
      } else {
        row.querySelectorAll('input').forEach(function (i) { i.value = ''; });
      }
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
    attachSpecRemove(row);
    row.querySelector('.spec-key').focus();
  });

  /* ===== Image Upload ===== */
  uploadZone.addEventListener('click', function () { fileInput.click(); });

  uploadZone.addEventListener('dragover', function (e) {
    e.preventDefault();
    uploadZone.classList.add('dragover');
  });

  uploadZone.addEventListener('dragleave', function () { uploadZone.classList.remove('dragover'); });

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
      if (f.size > 5 * 1024 * 1024) { showError('image', f.name + ' exceeds 5MB limit'); return; }
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
          if (uploadedFiles.length === 0) { uploadPreview.style.display = 'none'; uploadPlaceholder.style.display = 'block'; }
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

  /* ===== Initialize ===== */
  prefillProduct();

});
