document.addEventListener('DOMContentLoaded', function () {

  /* ===== Populate from MotoStore ===== */
  var products = MotoStore.getProducts();
  var orders = MotoStore.getOrders();
  var categories = MotoStore.getCategories();

  var totalProducts = products.length;
  var totalOrders = orders.length;
  var pendingOrders = orders.filter(function(o){ return o.status === 'pending'; }).length;
  var deliveredOrders = orders.filter(function(o){ return o.status === 'delivered'; }).length;
  var lowStockProducts = products.filter(function(p){ return p.stock <= 10; });
  var totalRevenue = orders.filter(function(o){ return o.payment === 'cod' || o.payment === 'paid'; }).reduce(function(s,o){ return s + o.total; }, 0);

  var cardValues = document.querySelectorAll('.card-value');
  if (cardValues.length >= 1) cardValues[0].textContent = totalProducts;
  if (cardValues.length >= 3) cardValues[2].textContent = totalOrders;
  if (cardValues.length >= 4) cardValues[3].textContent = pendingOrders;
  if (cardValues.length >= 5) cardValues[4].textContent = deliveredOrders;
  if (cardValues.length >= 6) cardValues[5].textContent = lowStockProducts.length;

  /* Render recent orders */
  var recentOrders = orders.slice(0, 5);
  var orderTbody = document.querySelector('.panel-wide .data-table tbody');
  if (orderTbody && recentOrders.length > 0) {
    orderTbody.innerHTML = '';
    recentOrders.forEach(function(o) {
      var initials = o.customer.split(' ').map(function(w){ return w.charAt(0); }).join('').toUpperCase().slice(0,2);
      var colors = ['#1565C0','#16A34A','#F59E0B','#7C3AED','#DC2626','#0D9488'];
      var avColor = colors[o.id % colors.length];
      var productNames = o.items.map(function(p){ return p.name; }).join(', ');
      var row = document.createElement('tr');
      row.innerHTML =
        '<td class="td-id">#ORD-' + o.id + '</td>' +
        '<td><div class="customer-cell"><div class="customer-avatar" style="background:' + avColor + '">' + initials + '</div><span>' + o.customer + '</span></div></td>' +
        '<td>' + productNames + '</td>' +
        '<td class="td-amount">' + MotoStore.formatINR(o.total) + '</td>' +
        '<td>' + MotoStore.formatDate(o.date) + '</td>' +
        '<td><span class="status-badge ' + o.status + '">' + o.status.charAt(0).toUpperCase() + o.status.slice(1) + '</span></td>';
      orderTbody.appendChild(row);
    });
  } else if (orderTbody) {
    orderTbody.innerHTML = '<tr><td colspan="6" style="text-align:center;padding:30px;color:var(--text-tertiary)">No orders yet</td></tr>';
  }

  /* Render low stock products */
  var lowTbody = document.querySelectorAll('.panel-wide')[1] ? document.querySelectorAll('.panel-wide')[1].querySelector('.data-table tbody') : null;
  if (lowTbody) {
    var lowItems = lowStockProducts.slice(0, 5);
    if (lowItems.length > 0) {
      lowTbody.innerHTML = '';
      lowItems.forEach(function(p) {
        var statusClass = p.stock === 0 ? 'critical' : 'warning';
        var row = document.createElement('tr');
        row.innerHTML =
          '<td><div class="product-cell"><div class="product-thumb" style="background:' + MotoStore.getColor(p.category) + '"><i class="fas fa-cog" style="color:white"></i></div><div><span class="product-name">' + p.name + '</span><span class="product-sku">SKU: ' + p.part + '</span></div></div></td>' +
          '<td>' + p.category + '</td>' +
          '<td><span class="stock-value ' + statusClass + '">' + p.stock + '</span></td>' +
          '<td>10</td>' +
          '<td><span class="stock-status ' + statusClass + '">' + (p.stock === 0 ? 'Critical' : 'Low') + '</span></td>' +
          '<td><button class="btn-sm btn-blue">Restock</button></td>';
        lowTbody.appendChild(row);
      });
    } else {
      lowTbody.innerHTML = '<tr><td colspan="6" style="text-align:center;padding:30px;color:var(--text-tertiary)">All products are well-stocked</td></tr>';
    }
  }

  /* ===== Sidebar Toggle ===== */
  var sidebar = document.getElementById('sidebar');
  var menuToggle = document.getElementById('menuToggle');
  var sidebarClose = document.getElementById('sidebarClose');
  var sidebarOverlay = document.getElementById('sidebarOverlay');

  function openSidebar() {
    sidebar.classList.add('open');
    sidebarOverlay.classList.add('show');
    document.body.style.overflow = 'hidden';
  }

  function closeSidebar() {
    sidebar.classList.remove('open');
    sidebarOverlay.classList.remove('show');
    document.body.style.overflow = '';
  }

  menuToggle.addEventListener('click', openSidebar);
  sidebarClose.addEventListener('click', closeSidebar);
  sidebarOverlay.addEventListener('click', closeSidebar);

  /* Close sidebar on Escape */
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') closeSidebar();
  });

  /* ===== Profile Dropdown ===== */
  var profileBtn = document.getElementById('profileBtn');
  var profileDropdown = document.getElementById('profileDropdown');
  var notifDropdown = document.getElementById('notifDropdown');

  profileBtn.addEventListener('click', function (e) {
    e.stopPropagation();
    var isOpen = profileDropdown.classList.contains('show');
    notifDropdown.classList.remove('show');
    profileDropdown.classList.toggle('show', !isOpen);
  });

  /* ===== Notification Dropdown ===== */
  var notifBtn = document.getElementById('notifBtn');

  notifBtn.addEventListener('click', function (e) {
    e.stopPropagation();
    var isOpen = notifDropdown.classList.contains('show');
    profileDropdown.classList.remove('show');
    notifDropdown.classList.toggle('show', !isOpen);
  });

  /* Close dropdowns on outside click */
  document.addEventListener('click', function () {
    profileDropdown.classList.remove('show');
    notifDropdown.classList.remove('show');
  });

  /* Prevent dropdown click from closing */
  profileDropdown.addEventListener('click', function (e) { e.stopPropagation(); });
  notifDropdown.addEventListener('click', function (e) { e.stopPropagation(); });

  /* ===== Clear Notifications ===== */
  var notifClear = document.getElementById('notifClear');
  notifClear.addEventListener('click', function () {
    var items = notifDropdown.querySelectorAll('.notif-item');
    items.forEach(function (item) {
      item.classList.remove('unread');
    });
    var dot = notifBtn.querySelector('.notif-dot');
    if (dot) dot.style.display = 'none';
  });

  /* ===== Global Search ===== */
  var globalSearch = document.getElementById('globalSearch');
  globalSearch.addEventListener('keydown', function (e) {
    if (e.key === 'Enter') {
      var query = globalSearch.value.trim().toLowerCase();
      if (query) {
        var results = products.filter(function(p) {
          return p.name.toLowerCase().indexOf(query) !== -1 || p.part.toLowerCase().indexOf(query) !== -1 || p.brand.toLowerCase().indexOf(query) !== -1;
        });
        if (results.length > 0) {
          window.location.href = '/admin/products?q=' + encodeURIComponent(query);
        } else {
          var orderResults = orders.filter(function(o) {
            return ('#' + o.id).indexOf(query) !== -1 || o.customer.toLowerCase().indexOf(query) !== -1;
          });
          if (orderResults.length > 0) {
            window.location.href = '/admin/orders';
          }
        }
      }
    }
  });

  /* ===== Table Row Click - Navigate to Orders ===== */
  var tableRows = document.querySelectorAll('.panel-wide .data-table tbody tr');
  tableRows.forEach(function (row) {
    row.style.cursor = 'pointer';
    row.addEventListener('click', function () {
      window.location.href = '/admin/orders';
    });
  });

  /* ===== Quick Action Card Hover Effects ===== */
  var actionCards = document.querySelectorAll('.action-card');
  actionCards.forEach(function (card) {
    card.addEventListener('mouseenter', function () {
      card.style.transform = 'translateY(-2px)';
    });
    card.addEventListener('mouseleave', function () {
      card.style.transform = '';
    });
  });

  /* ===== Restock Button - Navigate to Inventory ===== */
  document.addEventListener('click', function (e) {
    var btn = e.target.closest('.btn-sm.btn-blue');
    if (btn) {
      e.stopPropagation();
      window.location.href = '/admin/stock';
    }
  });

  /* ===== Summary card values already set from MotoStore ===== */

});
