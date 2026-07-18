document.addEventListener('DOMContentLoaded', function () {

  /* ===== Dummy Order Data ===== */
  var orders = [
    { id: 1042, customer: 'Pughal', email: 'pughalpughal336@gmail.com', avatar: 'PG', avatarColor: '#1565C0', date: '2026-07-18', products: [{ name: 'Mechanical Seal 50mm', qty: 1, price: 2800 }], total: 2800, payment: 'unpaid', status: 'pending', tracking: '' },
    { id: 1041, customer: 'Guhan', email: 'guhan6565@gmail.com', avatar: 'GU', avatarColor: '#16A34A', date: '2026-07-17', products: [{ name: 'Impeller X200', qty: 1, price: 4500 }, { name: 'Bearing 6205', qty: 2, price: 850 }], total: 6200, payment: 'paid', status: 'processing', tracking: 'IND12345678' },
    { id: 1040, customer: 'Peter', email: 'abc@gmail.com', avatar: 'PT', avatarColor: '#F59E0B', date: '2026-07-16', products: [{ name: 'Pump Shaft A10', qty: 1, price: 3200 }], total: 3200, payment: 'paid', status: 'shipped', tracking: 'IND87654321' },
    { id: 1039, customer: 'Kumar', email: 'kumar@example.com', avatar: 'KR', avatarColor: '#7C3AED', date: '2026-07-15', products: [{ name: 'Gasket Set Premium', qty: 3, price: 350 }], total: 1050, payment: 'paid', status: 'delivered', tracking: 'IND11223344' },
    { id: 1038, customer: 'Anitha', email: 'anitha@example.com', avatar: 'AN', avatarColor: '#0D9488', date: '2026-07-14', products: [{ name: 'Coupling 28mm', qty: 2, price: 1200 }], total: 2400, payment: 'paid', status: 'delivered', tracking: 'IND55667788' },
    { id: 1037, customer: 'Rajan', email: 'rajan@example.com', avatar: 'RJ', avatarColor: '#DC2626', date: '2026-07-13', products: [{ name: 'Capacitor 100μF', qty: 5, price: 450 }], total: 2250, payment: 'paid', status: 'delivered', tracking: 'IND99001122' },
    { id: 1036, customer: 'Meena', email: 'meena@example.com', avatar: 'MN', avatarColor: '#EC4899', date: '2026-07-12', products: [{ name: 'Oil Seal 35x50x8', qty: 10, price: 85 }], total: 850, payment: 'paid', status: 'cancelled', tracking: '' },
    { id: 1035, customer: 'Suresh', email: 'suresh@example.com', avatar: 'SR', avatarColor: '#1565C0', date: '2026-07-11', products: [{ name: 'Fan Blade 300mm', qty: 2, price: 680 }, { name: 'Bearing 7310', qty: 1, price: 1420 }], total: 2780, payment: 'paid', status: 'delivered', tracking: 'IND33445566' },
    { id: 1034, customer: 'Divya', email: 'divya@example.com', avatar: 'DV', avatarColor: '#F59E0B', date: '2026-07-10', products: [{ name: 'Cartridge Seal CS-40', qty: 1, price: 5200 }], total: 5200, payment: 'unpaid', status: 'pending', tracking: '' },
    { id: 1033, customer: 'Ravi', email: 'ravi@example.com', avatar: 'RV', avatarColor: '#16A34A', date: '2026-07-09', products: [{ name: 'O-Ring Kit', qty: 2, price: 480 }, { name: 'Gasket Set', qty: 1, price: 350 }], total: 1310, payment: 'paid', status: 'shipped', tracking: 'IND77889900' },
    { id: 1032, customer: 'Lakshmi', email: 'lakshmi@example.com', avatar: 'LK', avatarColor: '#7C3AED', date: '2026-07-08', products: [{ name: 'Relay 1-1.6A', qty: 3, price: 780 }], total: 2340, payment: 'paid', status: 'processing', tracking: '' },
    { id: 1031, customer: 'Karthik', email: 'karthik@example.com', avatar: 'KT', avatarColor: '#DC2626', date: '2026-07-07', products: [{ name: 'Terminal Box', qty: 5, price: 280 }], total: 1400, payment: 'paid', status: 'confirmed', tracking: '' },
    { id: 1030, customer: 'Priya', email: 'priya@example.com', avatar: 'PR', avatarColor: '#0D9488', date: '2026-07-06', products: [{ name: 'Gear Coupling 35mm', qty: 1, price: 2400 }], total: 2400, payment: 'paid', status: 'processing', tracking: '' },
    { id: 1029, customer: 'Arun', email: 'arun@example.com', avatar: 'AR', avatarColor: '#F59E0B', date: '2026-07-05', products: [{ name: 'Bearing 6308', qty: 4, price: 1100 }], total: 4400, payment: 'paid', status: 'pending', tracking: '' },
    { id: 1028, customer: 'Nisha', email: 'nisha@example.com', avatar: 'NI', avatarColor: '#EC4899', date: '2026-07-04', products: [{ name: 'V-Belt SPA-1120', qty: 6, price: 250 }], total: 1500, payment: 'refunded', status: 'cancelled', tracking: '' }
  ];

  /* ===== DOM ===== */
  var ordersBody = document.getElementById('ordersBody');
  var searchInput = document.getElementById('searchInput');
  var statusFilter = document.getElementById('statusFilter');
  var paymentFilter = document.getElementById('paymentFilter');
  var resultCount = document.getElementById('resultCount');
  var emptyState = document.getElementById('emptyState');
  var totalRevenue = document.getElementById('totalRevenue');

  var viewModal = document.getElementById('viewModal');
  var statusModal = document.getElementById('statusModal');
  var statusTarget = null;
  var selectedStatus = '';

  /* ===== Helpers ===== */
  function formatDate(d) {
    var months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    var dt = new Date(d);
    return months[dt.getMonth()] + ' ' + dt.getDate() + ', ' + dt.getFullYear();
  }

  function updateSummary() {
    var total = orders.length;
    var pending = orders.filter(function (o) { return o.status === 'pending'; }).length;
    var confirmed = orders.filter(function (o) { return o.status === 'confirmed'; }).length;
    var processing = orders.filter(function (o) { return o.status === 'processing'; }).length;
    var shipped = orders.filter(function (o) { return o.status === 'shipped'; }).length;
    var delivered = orders.filter(function (o) { return o.status === 'delivered'; }).length;
    var cancelled = orders.filter(function (o) { return o.status === 'cancelled'; }).length;
    var revenue = orders.filter(function (o) { return o.payment === 'paid'; }).reduce(function (s, o) { return s + o.total; }, 0);

    document.getElementById('totalOrders').textContent = total;
    document.getElementById('pendingOrders').textContent = pending;
    document.getElementById('processingOrders').textContent = confirmed + processing;
    document.getElementById('shippedOrders').textContent = shipped;
    document.getElementById('deliveredOrders').textContent = delivered;
    document.getElementById('cancelledOrders').textContent = cancelled;
    totalRevenue.textContent = '₹' + revenue.toLocaleString('en-IN');
  }

  /* ===== Render ===== */
  function renderTable(list) {
    ordersBody.innerHTML = '';
    if (list.length === 0) {
      emptyState.style.display = 'block';
      resultCount.textContent = '0 orders';
      return;
    }
    emptyState.style.display = 'none';
    resultCount.textContent = list.length + ' order' + (list.length !== 1 ? 's' : '');

    list.forEach(function (o) {
      var rowClass = o.status === 'cancelled' ? 'row-cancelled' : '';
      var productNames = o.products.map(function (p) { return p.name; }).join(', ');
      var productCount = o.products.length;
      var paymentLabel = o.payment.charAt(0).toUpperCase() + o.payment.slice(1);
      var statusLabel = o.status.charAt(0).toUpperCase() + o.status.slice(1);

      var row = document.createElement('tr');
      if (rowClass) row.className = rowClass;
      row.innerHTML =
        '<td><span class="order-id">#ORD-' + o.id + '</span></td>' +
        '<td>' +
          '<div class="customer-cell">' +
            '<div class="customer-avatar" style="background:' + o.avatarColor + '">' + o.avatar + '</div>' +
            '<div>' +
              '<div class="customer-name">' + o.customer + '</div>' +
              '<div class="customer-email">' + o.email + '</div>' +
            '</div>' +
          '</div>' +
        '</td>' +
        '<td class="td-date">' + formatDate(o.date) + '</td>' +
        '<td class="td-products"><span class="product-count">' + productCount + ' item' + (productCount > 1 ? 's' : '') + '</span><br><span class="product-list">' + productNames + '</span></td>' +
        '<td class="td-amount">₹' + o.total.toLocaleString('en-IN') + '</td>' +
        '<td><span class="payment-pill ' + o.payment + '"><span class="dot"></span>' + paymentLabel + '</span></td>' +
        '<td><span class="status-pill ' + o.status + '"><span class="dot"></span>' + statusLabel + '</span></td>' +
        '<td>' +
          '<div class="actions-cell">' +
            '<button class="action-btn view" title="View" data-id="' + o.id + '"><i class="fas fa-eye"></i></button>' +
            '<button class="action-btn edit" title="Update Status" data-id="' + o.id + '"><i class="fas fa-pen"></i></button>' +
          '</div>' +
        '</td>';
      ordersBody.appendChild(row);
    });

    attachRowActions();
    updateSummary();
  }

  function getFiltered() {
    var q = searchInput.value.trim().toLowerCase();
    var stat = statusFilter.value;
    var pay = paymentFilter.value;
    return orders.filter(function (o) {
      var matchQ = !q || ('#' + o.id).toLowerCase().indexOf(q) !== -1 || o.customer.toLowerCase().indexOf(q) !== -1 || o.email.toLowerCase().indexOf(q) !== -1;
      var matchStat = !stat || o.status === stat;
      var matchPay = !pay || o.payment === pay;
      return matchQ && matchStat && matchPay;
    });
  }

  function applyFilters() {
    renderTable(getFiltered());
  }

  searchInput.addEventListener('input', applyFilters);
  statusFilter.addEventListener('change', applyFilters);
  paymentFilter.addEventListener('change', applyFilters);

  /* ===== Row Actions ===== */
  function attachRowActions() {
    ordersBody.querySelectorAll('.action-btn.view').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var id = parseInt(btn.getAttribute('data-id'), 10);
        var o = orders.find(function (x) { return x.id === id; });
        if (o) openViewModal(o);
      });
    });

    ordersBody.querySelectorAll('.action-btn.edit').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var id = parseInt(btn.getAttribute('data-id'), 10);
        var o = orders.find(function (x) { return x.id === id; });
        if (o) openStatusModal(o);
      });
    });
  }

  /* ===== View Modal ===== */
  function openViewModal(o) {
    var paymentLabel = o.payment.charAt(0).toUpperCase() + o.payment.slice(1);
    var statusLabel = o.status.charAt(0).toUpperCase() + o.status.slice(1);
    var productRows = o.products.map(function (p) {
      return '<div class="detail-product-row"><span class="dpr-name">' + p.name + '</span><span class="dpr-qty">× ' + p.qty + '</span><span class="dpr-price">₹' + (p.price * p.qty).toLocaleString('en-IN') + '</span></div>';
    }).join('');

    document.getElementById('viewModalBody').innerHTML =
      '<div class="detail-grid">' +
        '<div class="detail-item"><span class="detail-label">Order ID</span><span class="detail-value">#ORD-' + o.id + '</span></div>' +
        '<div class="detail-item"><span class="detail-label">Date</span><span class="detail-value">' + formatDate(o.date) + '</span></div>' +
        '<div class="detail-item"><span class="detail-label">Customer</span><span class="detail-value">' + o.customer + '</span></div>' +
        '<div class="detail-item"><span class="detail-label">Email</span><span class="detail-value">' + o.email + '</span></div>' +
        '<div class="detail-item"><span class="detail-label">Payment</span><span class="detail-value"><span class="payment-pill ' + o.payment + '"><span class="dot"></span>' + paymentLabel + '</span></span></div>' +
        '<div class="detail-item"><span class="detail-label">Status</span><span class="detail-value"><span class="status-pill ' + o.status + '"><span class="dot"></span>' + statusLabel + '</span></span></div>' +
        '<div class="detail-item"><span class="detail-label">Total Amount</span><span class="detail-value">₹' + o.total.toLocaleString('en-IN') + '</span></div>' +
        '<div class="detail-item"><span class="detail-label">Tracking</span><span class="detail-value">' + (o.tracking || '—') + '</span></div>' +
        '<div class="detail-products"><h4>Products</h4>' + productRows + '</div>' +
      '</div>';
    viewModal.classList.add('show');
  }

  document.getElementById('viewModalClose').addEventListener('click', function () {
    viewModal.classList.remove('show');
  });
  viewModal.addEventListener('click', function (e) { if (e.target === viewModal) viewModal.classList.remove('show'); });

  /* ===== Status Modal ===== */
  function openStatusModal(o) {
    statusTarget = o;
    selectedStatus = o.status;
    document.getElementById('statusOrderInfo').innerHTML =
      '<div><span class="moi-id">#ORD-' + o.id + '</span></div>' +
      '<div><span class="moi-customer">' + o.customer + '</span><br><span class="moi-amount">₹' + o.total.toLocaleString('en-IN') + '</span></div>';
    document.getElementById('trackingInput').value = o.tracking || '';

    /* Set active status button */
    statusModal.querySelectorAll('.status-opt').forEach(function (opt) {
      opt.classList.toggle('active', opt.getAttribute('data-status') === o.status);
    });

    statusModal.classList.add('show');
  }

  function closeStatusModal() {
    statusModal.classList.remove('show');
    statusTarget = null;
  }

  document.getElementById('statusModalClose').addEventListener('click', closeStatusModal);
  document.getElementById('statusCancelBtn').addEventListener('click', closeStatusModal);
  statusModal.addEventListener('click', function (e) { if (e.target === statusModal) closeStatusModal(); });

  /* Status option click */
  statusModal.querySelectorAll('.status-opt').forEach(function (opt) {
    opt.addEventListener('click', function () {
      statusModal.querySelectorAll('.status-opt').forEach(function (o) { o.classList.remove('active'); });
      opt.classList.add('active');
      selectedStatus = opt.getAttribute('data-status');
    });
  });

  /* Save status */
  document.getElementById('statusSaveBtn').addEventListener('click', function () {
    if (!statusTarget || !selectedStatus) return;
    statusTarget.status = selectedStatus;
    statusTarget.tracking = document.getElementById('trackingInput').value.trim();

    var btnText = document.getElementById('statusSaveBtn').querySelector('.btn-text');
    var btnLoader = document.getElementById('statusSaveBtn').querySelector('.btn-loader');
    btnText.style.display = 'none';
    btnLoader.style.display = 'inline-flex';
    document.getElementById('statusSaveBtn').disabled = true;

    setTimeout(function () {
      btnText.style.display = 'inline-flex';
      btnLoader.style.display = 'none';
      document.getElementById('statusSaveBtn').disabled = false;
      closeStatusModal();
      applyFilters();
      showToast('Order #' + statusTarget.id + ' status updated!');
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
      viewModal.classList.remove('show');
      closeStatusModal();
      closeSidebar();
    }
  });

  /* ===== Init ===== */
  renderTable(orders);

});
