document.addEventListener('DOMContentLoaded', function () {

  /* ===== Load from shared store ===== */
  var orders = MotoStore.getOrders();

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
  function formatDate(d) { return MotoStore.formatDate(d); }

  function updateSummary() {
    orders = MotoStore.getOrders();
    var total = orders.length;
    var pending = orders.filter(function (o) { return o.status === 'pending'; }).length;
    var confirmed = orders.filter(function (o) { return o.status === 'confirmed'; }).length;
    var processing = orders.filter(function (o) { return o.status === 'processing'; }).length;
    var shipped = orders.filter(function (o) { return o.status === 'shipped'; }).length;
    var delivered = orders.filter(function (o) { return o.status === 'delivered'; }).length;
    var cancelled = orders.filter(function (o) { return o.status === 'cancelled'; }).length;
    var revenue = orders.filter(function (o) { return o.payment === 'paid' || o.payment === 'cod'; }).reduce(function (s, o) { return s + o.total; }, 0);

    document.getElementById('totalOrders').textContent = total;
    document.getElementById('pendingOrders').textContent = pending;
    document.getElementById('processingOrders').textContent = confirmed + processing;
    document.getElementById('shippedOrders').textContent = shipped;
    document.getElementById('deliveredOrders').textContent = delivered;
    document.getElementById('cancelledOrders').textContent = cancelled;
    totalRevenue.textContent = MotoStore.formatINR(revenue);
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
      var productNames = o.items.map(function (p) { return p.name; }).join(', ');
      var productCount = o.items.length;
      var paymentLabel = o.payment === 'cod' ? 'COD' : o.payment.charAt(0).toUpperCase() + o.payment.slice(1);
      var statusLabel = o.status.charAt(0).toUpperCase() + o.status.slice(1);
      var initials = o.customer.split(' ').map(function (w) { return w.charAt(0); }).join('').toUpperCase().slice(0, 2);
      var colors = ['#1565C0','#16A34A','#F59E0B','#7C3AED','#DC2626','#0D9488','#EC4899'];
      var avatarColor = colors[o.id % colors.length];

      var row = document.createElement('tr');
      if (rowClass) row.className = rowClass;
      row.innerHTML =
        '<td><span class="order-id">#ORD-' + o.id + '</span></td>' +
        '<td>' +
          '<div class="customer-cell">' +
            '<div class="customer-avatar" style="background:' + avatarColor + '">' + initials + '</div>' +
            '<div>' +
              '<div class="customer-name">' + o.customer + '</div>' +
              '<div class="customer-email">' + o.email + '</div>' +
            '</div>' +
          '</div>' +
        '</td>' +
        '<td class="td-date">' + formatDate(o.date) + '</td>' +
        '<td class="td-products"><span class="product-count">' + productCount + ' item' + (productCount > 1 ? 's' : '') + '</span><br><span class="product-list">' + productNames + '</span></td>' +
        '<td class="td-amount">' + MotoStore.formatINR(o.total) + '</td>' +
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
    orders = MotoStore.getOrders();
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
        var o = MotoStore.getOrderById(id);
        if (o) openViewModal(o);
      });
    });

    ordersBody.querySelectorAll('.action-btn.edit').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var id = parseInt(btn.getAttribute('data-id'), 10);
        var o = MotoStore.getOrderById(id);
        if (o) openStatusModal(o);
      });
    });
  }

  /* ===== View Modal ===== */
  function openViewModal(o) {
    var paymentLabel = o.payment === 'cod' ? 'COD' : o.payment.charAt(0).toUpperCase() + o.payment.slice(1);
    var statusLabel = o.status.charAt(0).toUpperCase() + o.status.slice(1);
    var productRows = o.items.map(function (p) {
      return '<div class="detail-product-row"><span class="dpr-name">' + p.name + '</span><span class="dpr-qty">\u00D7 ' + p.qty + '</span><span class="dpr-price">' + MotoStore.formatINR(p.subtotal) + '</span></div>';
    }).join('');

    document.getElementById('viewModalBody').innerHTML =
      '<div class="detail-grid">' +
        '<div class="detail-item"><span class="detail-label">Order ID</span><span class="detail-value">#ORD-' + o.id + '</span></div>' +
        '<div class="detail-item"><span class="detail-label">Date</span><span class="detail-value">' + formatDate(o.date) + '</span></div>' +
        '<div class="detail-item"><span class="detail-label">Customer</span><span class="detail-value">' + o.customer + '</span></div>' +
        '<div class="detail-item"><span class="detail-label">Email</span><span class="detail-value">' + o.email + '</span></div>' +
        '<div class="detail-item"><span class="detail-label">Phone</span><span class="detail-value">' + (o.phone || '\u2014') + '</span></div>' +
        '<div class="detail-item"><span class="detail-label">Address</span><span class="detail-value">' + (o.address || '\u2014') + '</span></div>' +
        '<div class="detail-item"><span class="detail-label">Payment</span><span class="detail-value"><span class="payment-pill ' + o.payment + '"><span class="dot"></span>' + paymentLabel + '</span></span></div>' +
        '<div class="detail-item"><span class="detail-label">Status</span><span class="detail-value"><span class="status-pill ' + o.status + '"><span class="dot"></span>' + statusLabel + '</span></span></div>' +
        '<div class="detail-item"><span class="detail-label">Total Amount</span><span class="detail-value">' + MotoStore.formatINR(o.total) + '</span></div>' +
        '<div class="detail-item"><span class="detail-label">Tracking</span><span class="detail-value">' + (o.tracking || '\u2014') + '</span></div>' +
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
      '<div><span class="moi-customer">' + o.customer + '</span><br><span class="moi-amount">' + MotoStore.formatINR(o.total) + '</span></div>';
    document.getElementById('trackingInput').value = o.tracking || '';

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

  statusModal.querySelectorAll('.status-opt').forEach(function (opt) {
    opt.addEventListener('click', function () {
      statusModal.querySelectorAll('.status-opt').forEach(function (o) { o.classList.remove('active'); });
      opt.classList.add('active');
      selectedStatus = opt.getAttribute('data-status');
    });
  });

  document.getElementById('statusSaveBtn').addEventListener('click', function () {
    if (!statusTarget || !selectedStatus) return;
    var tracking = document.getElementById('trackingInput').value.trim();

    var btnText = document.getElementById('statusSaveBtn').querySelector('.btn-text');
    var btnLoader = document.getElementById('statusSaveBtn').querySelector('.btn-loader');
    btnText.style.display = 'none';
    btnLoader.style.display = 'inline-flex';
    document.getElementById('statusSaveBtn').disabled = true;

    setTimeout(function () {
      MotoStore.updateOrderStatus(statusTarget.id, selectedStatus, tracking);
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
  applyFilters();

});
