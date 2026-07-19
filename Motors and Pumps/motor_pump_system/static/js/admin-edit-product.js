document.addEventListener('DOMContentLoaded', function () {

  /* ===== Load product from URL or shared store ===== */
  var productId = null;
  var urlParts = window.location.pathname.split('/');
  var lastPart = urlParts[urlParts.length - 1];
  var params = new URLSearchParams(window.location.search);
  if (params.get('id')) {
    productId = parseInt(params.get('id'), 10);
  } else {
    productId = parseInt(lastPart, 10);
  }
  var product = MotoStore.getProductById(productId);

  if (!product) {
    product = {
      id: 5, name: 'Impeller X200 Centrifugal SS316', part_number: 'IMP-X200-SS', brand: 'Grundfos',
      category: 'Pump Impellers', price: 4500, stock_quantity: 3, reorder_level: 10,
      description: 'Open type centrifugal impeller made from SS316 stainless steel.',
      compatible_model: 'Grundfos CR 15-5, KSB Etanorm 50-210', capacity: '200mm / 15m\u00B3/h',
      warranty: '12 months', unit: 'Piece', status: 'active',
      image_url: 'https://placehold.co/80x80/0D9488/fff?text=IMP',
      dateAdded: '2026-01-08', lastUpdated: '2026-06-28'
    };
  } else {
    product.part_number = product.part;
    product.stock_quantity = product.stock;
    product.reorder_level = 10;
    product.description = product.desc;
    product.compatible_model = product.model;
    product.image_url = product.image;
  }

  /* ===== DOM References ===== */
  var form = document.getElementById('editProductForm');
  var saveBtn = document.getElementById('saveBtn');
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
    document.getElementById('compatible_model').value = product.compatible_model;
    document.getElementById('capacity').value = product.capacity;
    document.getElementById('warranty').value = product.warranty;
    document.getElementById('unit').value = product.unit;
    document.getElementById('status').value = product.status;
    document.getElementById('image_url').value = product.image_url;

    /* Set current image */
    var currentImgBox = document.querySelector('.current-img-box');
    currentImgBox.innerHTML = '<img src="' + product.image_url + '" alt="' + product.name + '" style="width:100%;height:100%;object-fit:cover;border-radius:var(--radius-sm)" onerror="this.parentElement.innerHTML=\'<i class=&quot;fas fa-cog&quot;></i>\'">';
    document.querySelector('.current-img-name').textContent = product.part_number + '.jpg';
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
    ['name', 'brand', 'category', 'price', 'compatible_model', 'capacity', 'warranty', 'unit', 'stock_quantity', 'reorder_level', 'image'].forEach(clearError);
  }

  ['name', 'brand', 'category', 'price', 'compatible_model', 'capacity', 'warranty', 'unit', 'stock_quantity', 'reorder_level'].forEach(function (id) {
    var el = document.getElementById(id);
    if (el) {
      el.addEventListener('input', function () { clearError(id); });
      el.addEventListener('change', function () { clearError(id); });
    }
  });

  /* ===== Validation ===== */
  function validate() {
    var valid = true;
    clearAllErrors();

    var name = document.getElementById('name').value.trim();
    var brand = document.getElementById('brand').value;
    var category = document.getElementById('category').value;
    var price = document.getElementById('price').value;
    var model = document.getElementById('compatible_model').value.trim();
    var capacity = document.getElementById('capacity').value.trim();
    var warranty = document.getElementById('warranty').value;
    var unit = document.getElementById('unit').value;
    var stock = document.getElementById('stock_quantity').value;
    var reorder = document.getElementById('reorder_level').value;

    if (!name) { showError('name', 'Product name is required'); valid = false; }
    else if (name.length < 3) { showError('name', 'Name must be at least 3 characters'); valid = false; }

    var partNumber = document.getElementById('part_number').value.trim();
    if (partNumber) {
      var allProducts = MotoStore.getProducts();
      var dup = allProducts.filter(function(p) { return p.part === partNumber && p.id !== product.id; });
      if (dup.length > 0) { showError('part_number', 'Part number already exists'); valid = false; }
    }

    if (!brand) { showError('brand', 'Please select a brand'); valid = false; }
    if (!category) { showError('category', 'Please select a category'); valid = false; }

    if (!price) { showError('price', 'Price is required'); valid = false; }
    else if (isNaN(parseFloat(price)) || parseFloat(price) < 0) { showError('price', 'Enter a valid price'); valid = false; }

    if (!model) { showError('compatible_model', 'Compatible model is required'); valid = false; }
    if (!capacity) { showError('capacity', 'Capacity / power rating is required'); valid = false; }
    if (!warranty) { showError('warranty', 'Please select warranty period'); valid = false; }
    if (!unit) { showError('unit', 'Please select unit of measure'); valid = false; }

    if (stock === '' || stock === null) { showError('stock_quantity', 'Stock quantity is required'); valid = false; }
    else if (parseInt(stock, 10) < 0) { showError('stock_quantity', 'Stock cannot be negative'); valid = false; }

    if (reorder === '' || reorder === null) { showError('reorder_level', 'Reorder level is required'); valid = false; }
    else if (parseInt(reorder, 10) < 0) { showError('reorder_level', 'Reorder level cannot be negative'); valid = false; }

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
      MotoStore.updateProduct(product.id, {
        name: document.getElementById('name').value.trim(),
        part: document.getElementById('part_number').value.trim(),
        brand: document.getElementById('brand').value,
        category: document.getElementById('category').value,
        price: parseFloat(document.getElementById('price').value),
        stock: parseInt(document.getElementById('stock_quantity').value, 10),
        model: document.getElementById('compatible_model').value.trim(),
        capacity: document.getElementById('capacity').value.trim(),
        warranty: document.getElementById('warranty').value,
        unit: document.getElementById('unit').value,
        desc: document.getElementById('description').value.trim(),
        status: document.getElementById('status').value,
        image: document.getElementById('image_url').value.trim() || product.image
      });
      MotoStore.refreshCategoryCounts();

      btnText.style.display = 'inline-flex';
      btnLoader.style.display = 'none';
      saveBtn.disabled = false;
      showToast();
      setTimeout(function () { window.location.href = '/admin/products'; }, 1500);
    }, 1500);
  });

  function showToast() {
    successToast.classList.add('show');
    setTimeout(function () { successToast.classList.remove('show'); }, 3000);
  }

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
