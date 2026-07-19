document.addEventListener('DOMContentLoaded', function () {

  /* ===== Load from shared store ===== */
  var inventory = [];
  var deleteTargetId = null;

  function loadInventory() {
    var products = MotoStore.getProducts();
    inventory = products.map(function (p) {
      var catInfo = MotoStore.getCategoryByName(p.category);
      return {
        id: p.id,
        name: p.name,
        sku: p.part,
        brand: p.brand,
        brandColor: MotoStore.getBrandColor(p.brand),
        category: p.category,
        stock: p.stock,
        minStock: 10,
        color: MotoStore.getColor(p.category),
        icon: catInfo ? catInfo.icon : 'fas fa-box'
      };
    });
  }

  /* ===== DOM ===== */
  var inventoryBody = document.getElementById('inventoryBody');
  var searchInput = document.getElementById('searchInput');
  var categoryFilter = document.getElementById('categoryFilter');
  var statusFilter = document.getElementById('statusFilter');
  var resultCount = document.getElementById('resultCount');
  var emptyState = document.getElementById('emptyState');

  var updateModal = document.getElementById('updateModal');
  var updateQty = document.getElementById('updateQty');
  var updateReason = document.getElementById('updateReason');
  var updateSaveBtn = document.getElementById('updateSaveBtn');
  var previewLine = document.getElementById('previewLine');
  var previewCurrent = document.getElementById('previewCurrent');
  var previewNew = document.getElementById('previewNew');

  var updateTarget = null;

  /* ===== Helpers ===== */
  function getStatus(item) {
    if (item.stock === 0) return 'out';
    if (item.stock <= item.minStock) return 'low';
    return 'in-stock';
  }

  function getStatusLabel(status) {
    if (status === 'out') return 'Out of Stock';
    if (status === 'low') return 'Low Stock';
    return 'In Stock';
  }

  function updateSummary() {
    var total = inventory.length;
    var inStock = inventory.filter(function (i) { return getStatus(i) === 'in-stock'; }).length;
    var low = inventory.filter(function (i) { return getStatus(i) === 'low'; }).length;
    var out = inventory.filter(function (i) { return getStatus(i) === 'out'; }).length;
    document.getElementById('totalItems').textContent = total;
    document.getElementById('inStockCount').textContent = inStock;
    document.getElementById('lowStockCount').textContent = low;
    document.getElementById('outStockCount').textContent = out;
  }

  /* ===== Render ===== */
  function renderTable(list) {
    inventoryBody.innerHTML = '';
    if (list.length === 0) {
      emptyState.style.display = 'block';
      resultCount.textContent = '0 items';
      return;
    }
    emptyState.style.display = 'none';
    resultCount.textContent = list.length + ' item' + (list.length !== 1 ? 's' : '');

    list.forEach(function (item) {
      var status = getStatus(item);
      var rowClass = status === 'out' ? 'row-out' : (status === 'low' ? 'row-low' : '');
      var pct = item.minStock > 0 ? Math.min(Math.round((item.stock / (item.minStock * 3)) * 100), 100) : 0;
      var barClass = status === 'out' ? 'out' : (status === 'low' ? 'low' : 'good');
      var qtyClass = status === 'out' ? 'critical' : (status === 'low' ? 'warning' : 'good');

      var row = document.createElement('tr');
      if (rowClass) row.className = rowClass;
      row.innerHTML =
        '<td>' +
          '<div class="product-cell">' +
            '<div class="product-thumb" style="background:' + item.color + '"><i class="' + item.icon + '"></i></div>' +
            '<span class="product-name">' + item.name + '</span>' +
          '</div>' +
        '</td>' +
        '<td class="td-sku">' + item.sku + '</td>' +
        '<td>' + item.category + '</td>' +
        '<td><span class="brand-dot" style="background:' + item.brandColor + '"></span>' + item.brand + '</td>' +
        '<td class="stock-qty ' + qtyClass + '">' + item.stock + '</td>' +
        '<td class="min-stock">' + item.minStock + '</td>' +
        '<td>' +
          '<div class="stock-bar-wrap">' +
            '<div class="stock-bar"><div class="stock-bar-fill ' + barClass + '" style="width:' + pct + '%"></div></div>' +
            '<span class="stock-pct">' + pct + '%</span>' +
          '</div>' +
        '</td>' +
        '<td><span class="status-pill ' + status + '"><span class="dot"></span>' + getStatusLabel(status) + '</span></td>' +
        '<td><button class="btn-update" data-id="' + item.id + '"><i class="fas fa-edit"></i> Update</button></td>';
      inventoryBody.appendChild(row);
    });

    attachUpdateButtons();
    updateSummary();
  }

  function getFiltered() {
    var q = searchInput.value.trim().toLowerCase();
    var cat = categoryFilter.value;
    var stat = statusFilter.value;
    return inventory.filter(function (item) {
      var matchQ = !q || item.name.toLowerCase().indexOf(q) !== -1 || item.sku.toLowerCase().indexOf(q) !== -1 || item.brand.toLowerCase().indexOf(q) !== -1;
      var matchCat = !cat || item.category === cat;
      var matchStat = !stat || getStatus(item) === stat;
      return matchQ && matchCat && matchStat;
    });
  }

  function applyFilters() {
    loadInventory();
    renderTable(getFiltered());
  }

  searchInput.addEventListener('input', applyFilters);
  categoryFilter.addEventListener('change', applyFilters);
  statusFilter.addEventListener('change', applyFilters);

  /* ===== Update Modal ===== */
  function attachUpdateButtons() {
    inventoryBody.querySelectorAll('.btn-update').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var id = parseInt(btn.getAttribute('data-id'), 10);
        var item = inventory.find(function (x) { return x.id === id; });
        if (item) openUpdateModal(item);
      });
    });
  }

  function openUpdateModal(item) {
    updateTarget = item;
    var info = document.getElementById('modalProductInfo');
    info.innerHTML =
      '<div class="mpi-thumb" style="background:' + item.color + '"><i class="' + item.icon + '" style="color:white"></i></div>' +
      '<div>' +
        '<div class="mpi-name">' + item.name + '</div>' +
        '<div class="mpi-stock">Current stock: <strong>' + item.stock + '</strong> | Min: ' + item.minStock + '</div>' +
      '</div>';
    updateQty.value = '';
    updateReason.value = '';
    clearError();
    updatePreview();
    updateModal.classList.add('show');
    updateQty.focus();
  }

  function closeUpdateModal() {
    updateModal.classList.remove('show');
    updateTarget = null;
  }

  document.getElementById('updateModalClose').addEventListener('click', closeUpdateModal);
  document.getElementById('updateCancelBtn').addEventListener('click', closeUpdateModal);
  updateModal.addEventListener('click', function (e) { if (e.target === updateModal) closeUpdateModal(); });

  /* Radio change */
  document.querySelectorAll('input[name="updateType"]').forEach(function (radio) {
    radio.addEventListener('change', updatePreview);
  });

  updateQty.addEventListener('input', updatePreview);

  function getUpdateType() {
    return document.querySelector('input[name="updateType"]:checked').value;
  }

  function updatePreview() {
    if (!updateTarget) return;
    var val = parseInt(updateQty.value, 10);
    if (isNaN(val) || val < 0) {
      previewLine.style.display = 'none';
      return;
    }
    var type = getUpdateType();
    var newStock;
    if (type === 'set') newStock = val;
    else if (type === 'add') newStock = updateTarget.stock + val;
    else newStock = Math.max(0, updateTarget.stock - val);

    previewLine.style.display = 'flex';
    previewCurrent.textContent = updateTarget.stock;
    previewNew.textContent = newStock;
    previewNew.style.color = newStock <= updateTarget.minStock ? '#DC2626' : '#16A34A';
  }

  /* Validation */
  function showError(msg) {
    var el = document.getElementById('updateQtyError');
    el.textContent = msg;
    el.classList.add('visible');
    updateQty.classList.add('error');
  }

  function clearError() {
    var el = document.getElementById('updateQtyError');
    el.textContent = '';
    el.classList.remove('visible');
    updateQty.classList.remove('error');
  }

  updateQty.addEventListener('input', clearError);

  /* Save — write back to MotoStore */
  updateSaveBtn.addEventListener('click', function () {
    clearError();
    var val = parseInt(updateQty.value, 10);
    if (isNaN(val) || val < 0) { showError('Enter a valid quantity'); return; }
    if (!updateTarget) return;

    var type = getUpdateType();
    var newStock;
    if (type === 'set') newStock = val;
    else if (type === 'add') newStock = updateTarget.stock + val;
    else newStock = Math.max(0, updateTarget.stock - val);

    var btnText = updateSaveBtn.querySelector('.btn-text');
    var btnLoader = updateSaveBtn.querySelector('.btn-loader');
    btnText.style.display = 'none';
    btnLoader.style.display = 'inline-flex';
    updateSaveBtn.disabled = true;

    setTimeout(function () {
      MotoStore.updateStock(updateTarget.id, newStock);

      btnText.style.display = 'inline-flex';
      btnLoader.style.display = 'none';
      updateSaveBtn.disabled = false;
      closeUpdateModal();
      applyFilters();
      showToast('Stock updated for ' + updateTarget.name);
    }, 800);
  });

  /* ===== Toast ===== */
  function showToast(msg) {
    document.getElementById('toastMsg').textContent = msg;
    var toast = document.getElementById('toast');
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
      closeUpdateModal();
      closeSidebar();
    }
  });

  /* ===== Init ===== */
  loadInventory();
  renderTable(getFiltered());

});
