document.addEventListener('DOMContentLoaded', function () {

  /* ===== Load from shared store ===== */
  var categories = MotoStore.getCategories();
  var editingId = null;
  var selectedColor = '#1565C0';
  var deleteTargetId = null;

  /* ===== DOM ===== */
  var catBody = document.getElementById('catBody');
  var searchInput = document.getElementById('searchInput');
  var resultCount = document.getElementById('resultCount');
  var emptyState = document.getElementById('emptyState');
  var addCatBtn = document.getElementById('addCatBtn');
  var catModal = document.getElementById('catModal');
  var catModalTitle = document.getElementById('catModalTitle');
  var catModalHeader = document.getElementById('catModalHeader');
  var catModalClose = document.getElementById('catModalClose');
  var catModalCancel = document.getElementById('catModalCancel');
  var catModalSave = document.getElementById('catModalSave');
  var catName = document.getElementById('catName');
  var catDesc = document.getElementById('catDesc');
  var colorOptions = document.getElementById('colorOptions');
  var deleteModal = document.getElementById('deleteModal');
  var deleteModalClose = document.getElementById('deleteModalClose');
  var deleteCancelBtn = document.getElementById('deleteCancelBtn');
  var deleteConfirmBtn = document.getElementById('deleteConfirmBtn');
  var deleteCatName = document.getElementById('deleteCatName');

  /* ===== Helpers ===== */
  function formatDate(d) { return MotoStore.formatDate(d); }

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
        '<td><div class="cat-icon-cell" style="background:' + c.color + '"><i class="' + c.icon + '"></i></div></td>' +
        '<td><span class="cat-name-text">' + c.name + '</span></td>' +
        '<td class="td-desc">' + (c.desc || '\u2014') + '</td>' +
        '<td class="td-products">' + c.products + '</td>' +
        '<td><span class="status-pill ' + c.status + '"><span class="dot"></span>' + (c.status === 'active' ? 'Active' : 'Inactive') + '</span></td>' +
        '<td class="td-date">' + formatDate(c.dateCreated) + '</td>' +
        '<td>' +
          '<div class="actions-cell">' +
            '<button class="action-btn view-products" title="View Products" data-id="' + c.id + '"><i class="fas fa-box"></i></button>' +
            '<button class="action-btn edit" title="Edit" data-id="' + c.id + '"><i class="fas fa-pen"></i></button>' +
            '<button class="action-btn delete" title="Delete" data-id="' + c.id + '"><i class="fas fa-trash"></i></button>' +
          '</div>' +
        '</td>';
      catBody.appendChild(row);
    });

    attachRowActions();
  }

  function applyFilters() {
    categories = MotoStore.getCategories();
    updateStats();
    var q = searchInput.value.trim().toLowerCase();
    var list = categories.filter(function (c) {
      return !q || c.name.toLowerCase().indexOf(q) !== -1 || (c.desc && c.desc.toLowerCase().indexOf(q) !== -1);
    });
    renderTable(list);
  }

  searchInput.addEventListener('input', applyFilters);

  /* ===== Row Actions ===== */
  function attachRowActions() {
    catBody.querySelectorAll('.action-btn.view-products').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var id = parseInt(btn.getAttribute('data-id'), 10);
        var c = categories.find(function (x) { return x.id === id; });
        if (c) window.location.href = '/admin/products?category=' + encodeURIComponent(c.name);
      });
    });

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
  catModal.addEventListener('click', function (e) { if (e.target === catModal) closeModal(); });

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
        MotoStore.updateCategory(editingId, { name: name, desc: desc, color: selectedColor });
        showToast('Category updated!');
      } else {
        MotoStore.addCategory({ name: name, color: selectedColor, icon: 'fas fa-tag', desc: desc });
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
      MotoStore.deleteCategory(deleteTargetId);
      MotoStore.refreshCategoryCounts();
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

  /* ===== Update Stats from MotoStore ===== */
  function updateStats() {
    var cats = MotoStore.getCategories();
    var totalCount = cats.length;
    var activeCount = cats.filter(function(c) { return c.status === 'active'; }).length;
    var totalProducts = MotoStore.getProducts().length;
    var el1 = document.getElementById('totalCount');
    var el2 = document.getElementById('activeCount');
    var el3 = document.getElementById('totalProducts');
    if (el1) el1.textContent = totalCount;
    if (el2) el2.textContent = activeCount;
    if (el3) el3.textContent = totalProducts;
  }

  /* ===== Init ===== */
  updateStats();
  applyFilters();

});
