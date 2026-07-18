document.addEventListener('DOMContentLoaded', function () {

  /* ===== Dummy Product Data ===== */
  var products = [
    { id: 1, name: 'Deep Groove Ball Bearing 6205', part: 'BRG-6205-2RS', brand: 'SKF', category: 'Bearings', price: 850, stock: 45, status: 'active', color: '#1565C0', icon: 'fas fa-circle', desc: 'Sealed ball bearing, 25x52x15mm' },
    { id: 2, name: 'Angular Contact Bearing 7310', part: 'BRG-7310-BECBM', brand: 'SKF', category: 'Bearings', price: 1420, stock: 18, status: 'active', color: '#1565C0', icon: 'fas fa-circle', desc: 'Angular contact, 50x110x27mm' },
    { id: 3, name: 'Mechanical Seal 50mm', part: 'MS-50-CR', brand: 'John Crane', category: 'Mechanical Seals', price: 2800, stock: 5, status: 'active', color: '#7C3AED', icon: 'fas fa-cog', desc: 'Type 2800 single seal, carbide/silicon carbide' },
    { id: 4, name: 'Mechanical Seal 65mm', part: 'MS-65-EG', brand: 'John Crane', category: 'Mechanical Seals', price: 3200, stock: 12, status: 'active', color: '#7C3AED', icon: 'fas fa-cog', desc: 'John Crane Eagleburg, elastomer bellows' },
    { id: 5, name: 'Impeller X200 Centrifugal', part: 'IMP-X200-SS', brand: 'Grundfos', category: 'Pump Impellers', price: 4500, stock: 3, status: 'active', color: '#0D9488', icon: 'fas fa-compact-disc', desc: 'Open type impeller, SS316' },
    { id: 6, name: 'Impeller M150 Closed', part: 'IMP-M150-CS', brand: 'KSB', category: 'Pump Impellers', price: 3800, stock: 7, status: 'active', color: '#0D9488', icon: 'fas fa-compact-disc', desc: 'Closed type, cast iron' },
    { id: 7, name: 'Pump Shaft A10', part: 'SHA-A10-SS', brand: 'Grundfos', category: 'Pump Shafts', price: 3200, stock: 2, status: 'active', color: '#F59E0B', icon: 'fas fa-minus-circle', desc: 'Precision ground SS shaft, 35mm dia' },
    { id: 8, name: 'Pump Shaft B20', part: 'SHA-B20-CS', brand: 'KSB', category: 'Pump Shafts', price: 2800, stock: 9, status: 'active', color: '#F59E0B', icon: 'fas fa-minus-circle', desc: 'Carbon steel shaft, 40mm dia' },
    { id: 9, name: 'Start Capacitor 100μF', part: 'CAP-START-100', brand: 'ABB', category: 'Capacitors', price: 450, stock: 60, status: 'active', color: '#DC2626', icon: 'fas fa-bolt', desc: 'Motor start capacitor, 450V AC' },
    { id: 10, name: 'Run Capacitor 30μF', part: 'CAP-RUN-30', brand: 'ABB', category: 'Capacitors', price: 320, stock: 75, status: 'active', color: '#DC2626', icon: 'fas fa-bolt', desc: 'Motor run capacitor, 440V AC' },
    { id: 11, name: 'Flexible Coupling 28mm', part: 'CPL-FLEX-28', brand: 'Siemens', category: 'Couplings', price: 1200, stock: 22, status: 'active', color: '#7C3AED', icon: 'fas fa-link', desc: 'Jaw type flexible coupling' },
    { id: 12, name: 'Gear Coupling 35mm', part: 'CPL-GEAR-35', brand: 'Eaton', category: 'Couplings', price: 2400, stock: 8, status: 'active', color: '#7C3AED', icon: 'fas fa-link', desc: 'Toothed gear coupling set' },
    { id: 13, name: 'Axial Fan Blade 300mm', part: 'FAN-AX-300', brand: 'Siemens', category: 'Fan Blades', price: 680, stock: 30, status: 'active', color: '#0D9488', icon: 'fas fa-fan', desc: 'Metal fan blade, 4-blade design' },
    { id: 14, name: 'Cooling Fan Blade 250mm', part: 'FAN-COOL-250', brand: 'ABB', category: 'Fan Blades', price: 520, stock: 40, status: 'active', color: '#0D9488', icon: 'fas fa-fan', desc: 'Plastic cooling fan, 5-blade' },
    { id: 15, name: 'Oil Seal 35x50x8', part: 'OS-35508-NBR', brand: 'Parker', category: 'Oil Seals', price: 85, stock: 4, status: 'active', color: '#F59E0B', icon: 'fas fa-shield-alt', desc: 'NBR oil seal, single lip' },
    { id: 16, name: 'Oil Seal 42x60x8', part: 'OS-42608-VIT', brand: 'Parker', category: 'Oil Seals', price: 120, stock: 15, status: 'active', color: '#F59E0B', icon: 'fas fa-shield-alt', desc: 'Viton oil seal, double lip' },
    { id: 17, name: 'Gasket Set Premium', part: 'GSK-PREM-SET', brand: 'Eaton', category: 'Gaskets', price: 350, stock: 50, status: 'active', color: '#16A34A', icon: 'fas fa-layer-group', desc: 'Full pump gasket set, fiber' },
    { id: 18, name: 'O-Ring Kit 100pc', part: 'GSK-ORING-100', brand: 'Parker', category: 'Gaskets', price: 480, stock: 35, status: 'active', color: '#16A34A', icon: 'fas fa-layer-group', desc: 'NBR O-ring assortment kit' },
    { id: 19, name: 'Thermal Overload Relay', part: 'ACC-THERM-OL', brand: 'ABB', category: 'Accessories', price: 780, stock: 25, status: 'active', color: '#64748B', icon: 'fas fa-thermometer-half', desc: 'Motor protection relay, 1-1.6A' },
    { id: 20, name: 'Motor Terminal Box', part: 'ACC-TERM-BOX', brand: 'Siemens', category: 'Accessories', price: 280, stock: 40, status: 'active', color: '#64748B', icon: 'fas fa-box', desc: 'IP55 terminal box, cast aluminum' },
    { id: 21, name: 'Ball Bearing 6308', part: 'BRG-6308-ZZ', brand: 'SKF', category: 'Bearings', price: 1100, stock: 0, status: 'inactive', color: '#1565C0', icon: 'fas fa-circle', desc: 'Shielded bearing, 40x90x23mm' },
    { id: 22, name: 'Cartridge Seal CS-40', part: 'MS-CS40-JC', brand: 'John Crane', category: 'Mechanical Seals', price: 5200, stock: 2, status: 'active', color: '#7C3AED', icon: 'fas fa-cog', desc: 'Cartridge mechanical seal assembly' },
    { id: 23, name: 'Pump Casing Gasket', part: 'GSK-CASE-150', brand: 'Grundfos', category: 'Gaskets', price: 180, stock: 60, status: 'active', color: '#16A34A', icon: 'fas fa-layer-group', desc: 'Pump casing gasket, graphite' },
    { id: 24, name: 'V-Belt SPA-1120', part: 'ACC-BELT-SPA', brand: 'Eaton', category: 'Accessories', price: 250, stock: 0, status: 'inactive', color: '#64748B', icon: 'fas fa-arrows-alt-v', desc: 'SPA section V-belt, 1120mm' }
  ];

  /* ===== DOM References ===== */
  var searchInput = document.getElementById('searchInput');
  var categoryFilter = document.getElementById('categoryFilter');
  var brandFilter = document.getElementById('brandFilter');
  var productsBody = document.getElementById('productsBody');
  var resultCount = document.getElementById('resultCount');
  var emptyState = document.getElementById('emptyState');
  var viewModal = document.getElementById('viewModal');
  var deleteModal = document.getElementById('deleteModal');
  var deleteTargetId = null;

  /* ===== Color map for thumbnails ===== */
  var colorMap = {
    'Bearings': '#1565C0',
    'Mechanical Seals': '#7C3AED',
    'Pump Impellers': '#0D9488',
    'Pump Shafts': '#F59E0B',
    'Capacitors': '#DC2626',
    'Couplings': '#7C3AED',
    'Fan Blades': '#0D9488',
    'Oil Seals': '#F59E0B',
    'Gaskets': '#16A34A',
    'Accessories': '#64748B'
  };

  /* ===== Brand color map ===== */
  var brandColors = {
    'SKF': '#0066B3',
    'John Crane': '#E31937',
    'Grundfos': '#003F72',
    'KSB': '#00529B',
    'ABB': '#FF000F',
    'Siemens': '#009999',
    'Eaton': '#00529B',
    'Parker': '#D12020'
  };

  /* ===== Render Products ===== */
  function renderProducts(list) {
    productsBody.innerHTML = '';
    if (list.length === 0) {
      emptyState.style.display = 'block';
      resultCount.textContent = '0 products';
      return;
    }
    emptyState.style.display = 'none';
    resultCount.textContent = list.length + ' product' + (list.length !== 1 ? 's' : '');

    list.forEach(function (p) {
      var color = colorMap[p.category] || '#64748B';
      var stockClass = p.stock === 0 ? 'out' : (p.stock <= 10 ? 'low' : 'in-stock');
      var stockLabel = p.stock === 0 ? 'Out of Stock' : (p.stock <= 10 ? 'Low Stock' : 'In Stock');
      var statusClass = p.status === 'active' ? 'active' : 'inactive';
      var statusDotClass = p.status === 'active' ? 'active' : 'inactive';
      var bColor = brandColors[p.brand] || '#64748B';

      var row = document.createElement('tr');
      row.innerHTML =
        '<td>' +
          '<div class="product-thumb-cell" style="background:' + color + '">' +
            '<i class="' + p.icon + '"></i>' +
          '</div>' +
        '</td>' +
        '<td>' +
          '<div class="product-info">' +
            '<span class="prod-name">' + p.name + '</span>' +
            '<span class="prod-desc">' + p.desc + '</span>' +
          '</div>' +
        '</td>' +
        '<td class="td-part">' + p.part + '</td>' +
        '<td class="td-brand"><span class="brand-dot" style="background:' + bColor + '"></span>' + p.brand + '</td>' +
        '<td>' + p.category + '</td>' +
        '<td class="td-price">₹' + p.price.toLocaleString() + '</td>' +
        '<td><span class="stock-pill ' + stockClass + '">' + p.stock + '</span></td>' +
        '<td><span class="status-pill ' + statusDotClass + '"><span class="dot"></span>' + stockLabel + '</span></td>' +
        '<td>' +
          '<div class="actions-cell">' +
            '<button class="action-btn view" title="View" data-id="' + p.id + '"><i class="fas fa-eye"></i></button>' +
            '<button class="action-btn edit" title="Edit" data-id="' + p.id + '"><i class="fas fa-pen"></i></button>' +
            '<button class="action-btn delete" title="Delete" data-id="' + p.id + '"><i class="fas fa-trash"></i></button>' +
          '</div>' +
        '</td>';
      productsBody.appendChild(row);
    });

    attachRowActions();
  }

  /* ===== Filter & Search ===== */
  function getFiltered() {
    var q = searchInput.value.trim().toLowerCase();
    var cat = categoryFilter.value;
    var br = brandFilter.value;
    return products.filter(function (p) {
      var matchQ = !q || p.name.toLowerCase().indexOf(q) !== -1 || p.part.toLowerCase().indexOf(q) !== -1 || p.brand.toLowerCase().indexOf(q) !== -1;
      var matchCat = !cat || p.category === cat;
      var matchBr = !br || p.brand === br;
      return matchQ && matchCat && matchBr;
    });
  }

  function applyFilters() {
    renderProducts(getFiltered());
  }

  searchInput.addEventListener('input', applyFilters);
  categoryFilter.addEventListener('change', applyFilters);
  brandFilter.addEventListener('change', applyFilters);

  /* ===== Row Actions ===== */
  function attachRowActions() {
    var viewBtns = productsBody.querySelectorAll('.action-btn.view');
    var editBtns = productsBody.querySelectorAll('.action-btn.edit');
    var deleteBtns = productsBody.querySelectorAll('.action-btn.delete');

    viewBtns.forEach(function (btn) {
      btn.addEventListener('click', function () {
        var id = parseInt(btn.getAttribute('data-id'), 10);
        var p = products.find(function (x) { return x.id === id; });
        if (p) openViewModal(p);
      });
    });

    editBtns.forEach(function (btn) {
      btn.addEventListener('click', function () {
        var id = parseInt(btn.getAttribute('data-id'), 10);
        alert('Edit product #' + id + '\n\nEdit functionality will be connected to the backend.');
      });
    });

    deleteBtns.forEach(function (btn) {
      btn.addEventListener('click', function () {
        var id = parseInt(btn.getAttribute('data-id'), 10);
        var p = products.find(function (x) { return x.id === id; });
        if (p) openDeleteModal(p);
      });
    });
  }

  /* ===== View Modal ===== */
  function openViewModal(p) {
    var color = colorMap[p.category] || '#64748B';
    var bColor = brandColors[p.brand] || '#64748B';
    var stockClass = p.stock === 0 ? 'out' : (p.stock <= 10 ? 'low' : 'in-stock');
    var stockLabel = p.stock === 0 ? 'Out of Stock' : (p.stock <= 10 ? 'Low Stock' : 'In Stock');

    document.getElementById('viewModalBody').innerHTML =
      '<div class="detail-grid">' +
        '<div class="detail-img">' +
          '<div class="detail-img-box" style="background:' + color + '">' +
            '<i class="' + p.icon + '" style="font-size:40px;color:white"></i>' +
          '</div>' +
        '</div>' +
        '<div class="detail-item"><span class="detail-label">Product Name</span><span class="detail-value">' + p.name + '</span></div>' +
        '<div class="detail-item"><span class="detail-label">Part Number</span><span class="detail-value">' + p.part + '</span></div>' +
        '<div class="detail-item"><span class="detail-label">Brand</span><span class="detail-value"><span class="brand-dot" style="background:' + bColor + ';display:inline-block;width:8px;height:8px;border-radius:50%;margin-right:6px"></span>' + p.brand + '</span></div>' +
        '<div class="detail-item"><span class="detail-label">Category</span><span class="detail-value">' + p.category + '</span></div>' +
        '<div class="detail-item"><span class="detail-label">Price</span><span class="detail-value">₹' + p.price.toLocaleString() + '</span></div>' +
        '<div class="detail-item"><span class="detail-label">Stock</span><span class="detail-value"><span class="stock-pill ' + stockClass + '">' + p.stock + '</span> ' + stockLabel + '</span></div>' +
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
      products = products.filter(function (p) { return p.id !== deleteTargetId; });
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
