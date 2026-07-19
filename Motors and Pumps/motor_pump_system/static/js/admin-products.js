document.addEventListener('DOMContentLoaded', function () {

  /* ===== Load from shared store ===== */
  var products = MotoStore.getProducts();

  /* ===== DOM References ===== */
  var searchInput = document.getElementById('searchInput');
  var categoryFilter = document.getElementById('categoryFilter');
  var brandFilter = document.getElementById('brandFilter');
  var sortFilter = document.getElementById('sortFilter');
  var productsBody = document.getElementById('productsBody');
  var resultCount = document.getElementById('resultCount');
  var emptyState = document.getElementById('emptyState');
  var viewModal = document.getElementById('viewModal');
  var deleteModal = document.getElementById('deleteModal');
  var deleteTargetId = null;

  var paginationWrap = document.getElementById('paginationWrap');
  var paginationInfo = document.getElementById('paginationInfo');
  var pagination = document.getElementById('pagination');
  var currentPage = 1;
  var perPage = 10;

  /* ===== Helpers ===== */
  function formatDate(d) { return MotoStore.formatDate(d); }

  /* ===== Render Products ===== */
  function renderProducts(list) {
    productsBody.innerHTML = '';
    if (list.length === 0) {
      emptyState.style.display = 'block';
      paginationWrap.style.display = 'none';
      resultCount.textContent = '0 products';
      return;
    }
    emptyState.style.display = 'none';
    paginationWrap.style.display = 'flex';

    var totalPages = Math.ceil(list.length / perPage);
    if (currentPage > totalPages) currentPage = totalPages;
    var start = (currentPage - 1) * perPage;
    var end = start + perPage;
    var pageItems = list.slice(start, end);

    resultCount.textContent = list.length + ' product' + (list.length !== 1 ? 's' : '');
    paginationInfo.textContent = 'Showing ' + (start + 1) + '-' + Math.min(end, list.length) + ' of ' + list.length;

    pageItems.forEach(function (p) {
      var color = MotoStore.getColor(p.category);
      var stockClass = p.stock === 0 ? 'out' : (p.stock <= 10 ? 'low' : 'in-stock');
      var stockLabel = p.stock === 0 ? 'Out of Stock' : (p.stock <= 10 ? 'Low Stock' : 'In Stock');
      var statusClass = p.status === 'active' ? 'active' : 'inactive';
      var bColor = MotoStore.getBrandColor(p.brand);

      var row = document.createElement('tr');
      row.innerHTML =
        '<td><div class="product-thumb-cell" style="background:' + color + '"><img src="' + p.image + '" alt="' + p.name + '" onerror="this.style.display=\'none\'"></div></td>' +
        '<td><div class="product-info"><span class="prod-name">' + p.name + '</span><span class="prod-desc">' + p.desc + '</span></div></td>' +
        '<td class="td-part">' + p.part + '</td>' +
        '<td class="td-brand"><span class="brand-dot" style="background:' + bColor + '"></span>' + p.brand + '</td>' +
        '<td>' + p.category + '</td>' +
        '<td class="td-model">' + p.model + '</td>' +
        '<td class="td-capacity">' + p.capacity + '</td>' +
        '<td class="td-price">' + MotoStore.formatINR(p.price) + '</td>' +
        '<td class="td-warranty">' + p.warranty + '</td>' +
        '<td><span class="stock-pill ' + stockClass + '">' + p.stock + '</span></td>' +
        '<td><span class="status-pill ' + statusClass + '"><span class="dot"></span>' + (p.status === 'active' ? 'Active' : 'Inactive') + '</span></td>' +
        '<td><div class="actions-cell">' +
          '<button class="action-btn view" title="View" data-id="' + p.id + '"><i class="fas fa-eye"></i></button>' +
          '<button class="action-btn edit" title="Edit" data-id="' + p.id + '"><i class="fas fa-pen"></i></button>' +
          '<button class="action-btn delete" title="Delete" data-id="' + p.id + '"><i class="fas fa-trash"></i></button>' +
        '</div></td>';
      productsBody.appendChild(row);
    });

    renderPagination(totalPages);
    attachRowActions();
  }

  /* ===== Pagination ===== */
  function renderPagination(totalPages) {
    pagination.innerHTML = '';
    if (totalPages <= 1) { paginationWrap.style.display = 'none'; return; }

    var prevBtn = document.createElement('button');
    prevBtn.className = 'page-btn';
    prevBtn.innerHTML = '<i class="fas fa-chevron-left"></i>';
    prevBtn.disabled = currentPage === 1;
    prevBtn.addEventListener('click', function () { currentPage--; applyFilters(); });
    pagination.appendChild(prevBtn);

    for (var i = 1; i <= totalPages; i++) {
      if (totalPages > 7 && i > 2 && i < totalPages - 1 && Math.abs(i - currentPage) > 1) {
        if (i === 3 || i === totalPages - 2) {
          var dots = document.createElement('span');
          dots.className = 'page-dots';
          dots.textContent = '...';
          pagination.appendChild(dots);
        }
        continue;
      }
      var btn = document.createElement('button');
      btn.className = 'page-btn' + (i === currentPage ? ' active' : '');
      btn.textContent = i;
      (function (page) {
        btn.addEventListener('click', function () { currentPage = page; applyFilters(); });
      })(i);
      pagination.appendChild(btn);
    }

    var nextBtn = document.createElement('button');
    nextBtn.className = 'page-btn';
    nextBtn.innerHTML = '<i class="fas fa-chevron-right"></i>';
    nextBtn.disabled = currentPage === totalPages;
    nextBtn.addEventListener('click', function () { currentPage++; applyFilters(); });
    pagination.appendChild(nextBtn);
  }

  /* ===== Filter, Search & Sort ===== */
  function getFiltered() {
    var q = searchInput.value.trim().toLowerCase();
    var cat = categoryFilter.value;
    var br = brandFilter.value;
    var sort = sortFilter.value;
    var list = products.filter(function (p) {
      var matchQ = !q || p.name.toLowerCase().indexOf(q) !== -1 || p.part.toLowerCase().indexOf(q) !== -1 || p.brand.toLowerCase().indexOf(q) !== -1;
      var matchCat = !cat || p.category === cat;
      var matchBr = !br || p.brand === br;
      return matchQ && matchCat && matchBr;
    });

    if (sort) {
      var parts = sort.split('-');
      var key = parts[0];
      var dir = parts[1];
      list.sort(function (a, b) {
        var va = key === 'name' ? a[key].toLowerCase() : a[key];
        var vb = key === 'name' ? b[key].toLowerCase() : b[key];
        if (va < vb) return dir === 'asc' ? -1 : 1;
        if (va > vb) return dir === 'asc' ? 1 : -1;
        return 0;
      });
    }
    return list;
  }

  function applyFilters() {
    products = MotoStore.getProducts();
    renderProducts(getFiltered());
  }

  searchInput.addEventListener('input', function () { currentPage = 1; applyFilters(); });
  categoryFilter.addEventListener('change', function () { currentPage = 1; applyFilters(); });
  brandFilter.addEventListener('change', function () { currentPage = 1; applyFilters(); });
  sortFilter.addEventListener('change', function () { currentPage = 1; applyFilters(); });

  /* ===== Row Actions ===== */
  function attachRowActions() {
    productsBody.querySelectorAll('.action-btn.view').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var id = parseInt(btn.getAttribute('data-id'), 10);
        var p = MotoStore.getProductById(id);
        if (p) openViewModal(p);
      });
    });

    productsBody.querySelectorAll('.action-btn.edit').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var id = parseInt(btn.getAttribute('data-id'), 10);
        window.location.href = '/admin/products/edit/' + id;
      });
    });

    productsBody.querySelectorAll('.action-btn.delete').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var id = parseInt(btn.getAttribute('data-id'), 10);
        var p = MotoStore.getProductById(id);
        if (p) openDeleteModal(p);
      });
    });
  }

  /* ===== View Modal ===== */
  function openViewModal(p) {
    var color = MotoStore.getColor(p.category);
    var bColor = MotoStore.getBrandColor(p.brand);
    var stockClass = p.stock === 0 ? 'out' : (p.stock <= 10 ? 'low' : 'in-stock');
    var stockLabel = p.stock === 0 ? 'Out of Stock' : (p.stock <= 10 ? 'Low Stock' : 'In Stock');

    document.getElementById('viewModalBody').innerHTML =
      '<div class="detail-grid">' +
        '<div class="detail-img"><div class="detail-img-box" style="background:' + color + '"><img src="' + p.image + '" alt="' + p.name + '" style="width:100%;height:100%;object-fit:cover;border-radius:var(--radius-sm)" onerror="this.parentElement.innerHTML=\'<i class=&quot;fas fa-cog&quot; style=&quot;font-size:40px;color:white&quot;></i>\'"></div></div>' +
        '<div class="detail-item"><span class="detail-label">Product Name</span><span class="detail-value">' + p.name + '</span></div>' +
        '<div class="detail-item"><span class="detail-label">Part Number</span><span class="detail-value">' + p.part + '</span></div>' +
        '<div class="detail-item"><span class="detail-label">Category</span><span class="detail-value">' + p.category + '</span></div>' +
        '<div class="detail-item"><span class="detail-label">Brand</span><span class="detail-value"><span class="brand-dot" style="background:' + bColor + ';display:inline-block;width:8px;height:8px;border-radius:50%;margin-right:6px"></span>' + p.brand + '</span></div>' +
        '<div class="detail-item"><span class="detail-label">Compatible Model</span><span class="detail-value">' + p.model + '</span></div>' +
        '<div class="detail-item"><span class="detail-label">Capacity</span><span class="detail-value">' + p.capacity + '</span></div>' +
        '<div class="detail-item"><span class="detail-label">Price</span><span class="detail-value">' + MotoStore.formatINR(p.price) + '</span></div>' +
        '<div class="detail-item"><span class="detail-label">Warranty</span><span class="detail-value">' + p.warranty + '</span></div>' +
        '<div class="detail-item"><span class="detail-label">Stock</span><span class="detail-value"><span class="stock-pill ' + stockClass + '">' + p.stock + '</span> ' + stockLabel + '</span></div>' +
        '<div class="detail-item"><span class="detail-label">Unit</span><span class="detail-value">' + p.unit + '</span></div>' +
        '<div class="detail-item"><span class="detail-label">Status</span><span class="detail-value"><span class="status-pill ' + p.status + '"><span class="dot"></span>' + (p.status === 'active' ? 'Active' : 'Inactive') + '</span></span></div>' +
        '<div class="detail-item"><span class="detail-label">Date Added</span><span class="detail-value">' + formatDate(p.dateAdded) + '</span></div>' +
        '<div class="detail-item"><span class="detail-label">Last Updated</span><span class="detail-value">' + formatDate(p.lastUpdated) + '</span></div>' +
        '<div class="detail-item" style="grid-column:1/-1"><span class="detail-label">Description</span><span class="detail-value">' + p.desc + '</span></div>' +
      '</div>';
    viewModal.classList.add('show');
  }

  document.getElementById('viewModalClose').addEventListener('click', function () {
    viewModal.classList.remove('show');
  });

  viewModal.addEventListener('click', function (e) {
    if (e.target === viewModal) viewModal.classList.remove('show');
  });

  /* ===== Delete Modal ===== */
  function openDeleteModal(p) {
    deleteTargetId = p.id;
    document.getElementById('deleteProductName').textContent = p.name;
    deleteModal.classList.add('show');
  }

  document.getElementById('deleteModalClose').addEventListener('click', function () {
    deleteModal.classList.remove('show');
    deleteTargetId = null;
  });

  document.getElementById('deleteCancel').addEventListener('click', function () {
    deleteModal.classList.remove('show');
    deleteTargetId = null;
  });

  deleteModal.addEventListener('click', function (e) {
    if (e.target === deleteModal) {
      deleteModal.classList.remove('show');
      deleteTargetId = null;
    }
  });

  document.getElementById('deleteConfirm').addEventListener('click', function () {
    if (deleteTargetId !== null) {
      MotoStore.deleteProduct(deleteTargetId);
      applyFilters();
    }
    deleteModal.classList.remove('show');
    deleteTargetId = null;
  });

  /* ===== Sidebar Toggle ===== */
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

  document.addEventListener('click', function () {
    profileDropdown.classList.remove('show');
  });

  profileDropdown.addEventListener('click', function (e) { e.stopPropagation(); });

  /* ===== Global Search ===== */
  var globalSearch = document.getElementById('globalSearch');
  globalSearch.addEventListener('keydown', function (e) {
    if (e.key === 'Enter') {
      var q = globalSearch.value.trim();
      if (q) {
        searchInput.value = q;
        currentPage = 1;
        applyFilters();
      }
    }
  });

  /* ===== Escape closes modals ===== */
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') {
      viewModal.classList.remove('show');
      deleteModal.classList.remove('show');
      closeSidebar();
    }
  });

  /* ===== Initial Render ===== */
  renderProducts(products);

});
