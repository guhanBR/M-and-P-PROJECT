document.addEventListener('DOMContentLoaded', function () {

  /* ===== Dummy Category Data ===== */
  var categories = [
    { id: 1, name: 'Bearings', color: '#1565C0', icon: 'fas fa-circle', desc: 'Ball bearings, roller bearings, thrust bearings', products: 2, status: 'active' },
    { id: 2, name: 'Mechanical Seals', color: '#7C3AED', icon: 'fas fa-cog', desc: 'Single seals, double seals, cartridge seals', products: 2, status: 'active' },
    { id: 3, name: 'Pump Impellers', color: '#0D9488', icon: 'fas fa-compact-disc', desc: 'Open and closed type impellers', products: 2, status: 'active' },
    { id: 4, name: 'Pump Shafts', color: '#F59E0B', icon: 'fas fa-minus-circle', desc: 'Precision ground pump shafts', products: 2, status: 'active' },
    { id: 5, name: 'Capacitors', color: '#DC2626', icon: 'fas fa-bolt', desc: 'Start and run capacitors for motors', products: 2, status: 'active' },
    { id: 6, name: 'Couplings', color: '#7C3AED', icon: 'fas fa-link', desc: 'Flexible and gear couplings', products: 2, status: 'active' },
    { id: 7, name: 'Fan Blades', color: '#0D9488', icon: 'fas fa-fan', desc: 'Axial and cooling fan blades', products: 2, status: 'active' },
    { id: 8, name: 'Oil Seals', color: '#F59E0B', icon: 'fas fa-shield-alt', desc: 'NBR and Viton oil seals', products: 2, status: 'active' },
    { id: 9, name: 'Gaskets', color: '#16A34A', icon: 'fas fa-layer-group', desc: 'Pump gaskets, O-rings, gasket sets', products: 3, status: 'active' },
    { id: 10, name: 'Accessories', color: '#64748B', icon: 'fas fa-box', desc: 'Belts, terminal boxes, relays, terminals', products: 3, status: 'active' }
  ];

  var nextId = 11;

  /* ===== DOM ===== */
  var catBody = document.getElementById('catBody');
  var searchInput = document.getElementById('searchInput');
  var resultCount = document.getElementById('resultCount');
  var emptyState = document.getElementById('emptyState');
  var totalCount = document.getElementById('totalCount');
  var activeCount = document.getElementById('activeCount');
  var totalProducts = document.getElementById('totalProducts');

  var catModal = document.getElementById('catModal');
  var catModalTitle = document.getElementById('catModalTitle');
  var catModalHeader = document.getElementById('catModalHeader');
  var catName = document.getElementById('catName');
  var catDesc = document.getElementById('catDesc');
  var colorOptions = document.getElementById('colorOptions');
  var catForm = document.getElementById('catForm');

  var deleteModal = document.getElementById('deleteModal');
  var deleteCatName = document.getElementById('deleteCatName');
  var deleteTargetId = null;

  var addCatBtn = document.getElementById('addCatBtn');
  var catModalClose = document.getElementById('catModalClose');
  var catModalCancel = document.getElementById('catModalCancel');
  var catModalSave = document.getElementById('catModalSave');
  var deleteModalClose = document.getElementById('deleteModalClose');
  var deleteCancelBtn = document.getElementById('deleteCancelBtn');
  var deleteConfirmBtn = document.getElementById('deleteConfirmBtn');

  var editingId = null;
  var selectedColor = '#1565C0';

  /* ===== Render ===== */
  function renderTable(list) {
    catBody.innerHTML = '';
    if (list.length === 0) {
      emptyState.style.display = 'block';
      resultCount.textContent = '0 categories';
      return;
    }
    emptyState.style.display = 'none';
    resultCount.textContent = list.length + ' categor' + (list.length !== 1 ? 'ies' : 'y');

    list.forEach(function (c) {
      var row = document.createElement('tr');
      row.innerHTML =
        '<td><span class="color-dot" style="background:' + c.color + '"></span></td>' +
        '<td>' +
          '<div class="cat-name-cell">' +
            '<div class="cat-icon-box" style="background:' + c.color + '"><i class="' + c.icon + '"></i></div>' +
            '<span class="cat-name-text">' + c.name + '</span>' +
          '</div>' +
        '</td>' +
        '<td class="td-desc">' + (c.desc || '—') + '</td>' +
        '<td class="td-products">' + c.products + '</td>' +
        '<td><span class="status-pill ' + c.status + '"><span class="dot"></span>' + (c.status === 'active' ? 'Active' : 'Inactive') + '</span></td>' +
        '<td>' +
          '<div class="actions-cell">' +
            '<button class="action-btn edit" title="Edit" data-id="' + c.id + '"><i class="fas fa-pen"></i></button>' +
            '<button class="action-btn delete" title="Delete" data-id="' + c.id + '"><i class="fas fa-trash"></i></button>' +
          '</div>' +
        '</td>';
      catBody.appendChild(row);
    });

    updateStats();
    attachRowActions();
  }

  function updateStats() {
    var total = categories.length;
    var active = categories.filter(function (c) { return c.status === 'active'; }).length;
    var products = categories.reduce(function (s, c) { return s + c.products; }, 0);
    totalCount.textContent = total;
    activeCount.textContent = active;
    totalProducts.textContent = products;
  }

  function getFiltered() {
    var q = searchInput.value.trim().toLowerCase();
    return categories.filter(function (c) {
      return !q || c.name.toLowerCase().indexOf(q) !== -1;
    });
  }

  function applyFilters() {
    renderTable(getFiltered());
  }

  searchInput.addEventListener('input', applyFilters);

  /* ===== Row Actions ===== */
  function attachRowActions() {
    catBody.querySelectorAll('.action-btn.edit').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var id = parseInt(btn.getAttribute('data-id'), 10);
        var c = categories.find(function (x) { return x.id === id; });
        if (c) openEditModal(c);
      });
    });

    catBody.querySelectorAll('.action-btn.delete').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var id = parseInt(btn.getAttribute('data-id'), 10);
        var c = categories.find(function (x) { return x.id === id; });
        if (c) openDeleteModal(c);
      });
    });
  }

  /* ===== Color Picker ===== */
  colorOptions.querySelectorAll('.color-opt').forEach(function (opt) {
    opt.addEventListener('click', function () {
      colorOptions.querySelectorAll('.color-opt').forEach(function (o) { o.classList.remove('active'); });
      opt.classList.add('active');
      selectedColor = opt.getAttribute('data-color');
    });
  });

  function selectColor(color) {
    selectedColor = color;
    colorOptions.querySelectorAll('.color-opt').forEach(function (o) {
      o.classList.toggle('active', o.getAttribute('data-color') === color);
    });
  }

  /* ===== Add Modal ===== */
  addCatBtn.addEventListener('click', function () {
    editingId = null;
    catModalTitle.innerHTML = '<i class="fas fa-plus"></i> Add Category';
    catModalHeader.style.background = '';
    catName.value = '';
    catDesc.value = '';
    clearError();
    selectColor('#1565C0');
    catModal.classList.add('show');
    catName.focus();
  });

  /* ===== Edit Modal ===== */
  function openEditModal(c) {
    editingId = c.id;
    catModalTitle.innerHTML = '<i class="fas fa-pen"></i> Edit Category';
    catName.value = c.name;
    catDesc.value = c.desc || '';
    clearError();
    selectColor(c.color);
    catModal.classList.add('show');
    catName.focus();
  }

  function closeModal() {
    catModal.classList.remove('show');
    editingId = null;
  }

  catModalClose.addEventListener('click', closeModal);
  catModalCancel.addEventListener('click', closeModal);

  catModal.addEventListener('click', function (e) {
    if (e.target === catModal) closeModal();
  });

  /* ===== Validation ===== */
  function showError(msg) {
    var el = document.getElementById('catNameError');
    el.textContent = msg;
    el.classList.add('visible');
    catName.classList.add('error');
  }

  function clearError() {
    var el = document.getElementById('catNameError');
    el.textContent = '';
    el.classList.remove('visible');
    catName.classList.remove('error');
  }

  catName.addEventListener('input', clearError);

  /* ===== Save ===== */
  catModalSave.addEventListener('click', function () {
    clearError();
    var name = catName.value.trim();
    var desc = catDesc.value.trim();

    if (!name) { showError('Category name is required'); return; }
    if (name.length < 2) { showError('Name must be at least 2 characters'); return; }

    /* Check duplicate */
    var dup = categories.find(function (c) {
      return c.name.toLowerCase() === name.toLowerCase() && c.id !== editingId;
    });
    if (dup) { showError('A category with this name already exists'); return; }

    var btnText = catModalSave.querySelector('.btn-text');
    var btnLoader = catModalSave.querySelector('.btn-loader');
    btnText.style.display = 'none';
    btnLoader.style.display = 'inline-flex';
    catModalSave.disabled = true;

    setTimeout(function () {
      if (editingId !== null) {
        var c = categories.find(function (x) { return x.id === editingId; });
        if (c) { c.name = name; c.desc = desc; c.color = selectedColor; }
        showToast('Category updated!');
      } else {
        categories.push({
          id: nextId++,
          name: name,
          color: selectedColor,
          icon: 'fas fa-tag',
          desc: desc,
          products: 0,
          status: 'active'
        });
        showToast('Category added!');
      }

      btnText.style.display = 'inline-flex';
      btnLoader.style.display = 'none';
      catModalSave.disabled = false;
      closeModal();
      applyFilters();
    }, 800);
  });

  /* ===== Delete Modal ===== */
  function openDeleteModal(c) {
    deleteTargetId = c.id;
    deleteCatName.textContent = c.name;
    deleteModal.classList.add('show');
  }

  function closeDeleteModal() {
    deleteModal.classList.remove('show');
    deleteTargetId = null;
  }

  deleteModalClose.addEventListener('click', closeDeleteModal);
  deleteCancelBtn.addEventListener('click', closeDeleteModal);
  deleteModal.addEventListener('click', function (e) { if (e.target === deleteModal) closeDeleteModal(); });

  deleteConfirmBtn.addEventListener('click', function () {
    if (deleteTargetId !== null) {
      categories = categories.filter(function (c) { return c.id !== deleteTargetId; });
      applyFilters();
      showToast('Category deleted!');
    }
    closeDeleteModal();
  });

  /* ===== Toast ===== */
  function showToast(msg) {
    var toast = document.getElementById('toast');
    document.getElementById('toastMsg').textContent = msg;
    toast.classList.add('show');
    setTimeout(function () { toast.classList.remove('show'); }, 2500);
  }

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

  /* ===== Global Search ===== */
  var globalSearch = document.getElementById('globalSearch');
  globalSearch.addEventListener('keydown', function (e) {
    if (e.key === 'Enter') {
      searchInput.value = globalSearch.value;
      applyFilters();
    }
  });

  /* ===== Escape ===== */
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') {
      closeModal();
      closeDeleteModal();
      closeSidebar();
    }
  });

  /* ===== Init ===== */
  renderTable(categories);

});
