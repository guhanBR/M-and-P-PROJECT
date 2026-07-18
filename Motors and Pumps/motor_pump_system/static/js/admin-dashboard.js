document.addEventListener('DOMContentLoaded', function () {

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
      var query = globalSearch.value.trim();
      if (query) {
        alert('Search for: "' + query + '"\n\nSearch functionality will be connected to the backend.');
      }
    }
  });

  /* ===== Table Row Hover Effects ===== */
  var tableRows = document.querySelectorAll('.data-table tbody tr');
  tableRows.forEach(function (row) {
    row.style.cursor = 'pointer';
    row.addEventListener('click', function () {
      var id = row.querySelector('.td-id');
      if (id) {
        alert('View details for ' + id.textContent + '\n\nNavigation will be connected to the backend.');
      }
    });
  });

  /* ===== Quick Action Card Feedback ===== */
  var actionCards = document.querySelectorAll('.action-card');
  actionCards.forEach(function (card) {
    card.addEventListener('click', function (e) {
      e.preventDefault();
      var label = card.querySelector('span').textContent;
      alert('Action: ' + label + '\n\nNavigation will be connected to the backend.');
    });
  });

  /* ===== Restock Button Feedback ===== */
  var restockBtns = document.querySelectorAll('.btn-sm.btn-blue');
  restockBtns.forEach(function (btn) {
    btn.addEventListener('click', function (e) {
      e.stopPropagation();
      var row = btn.closest('tr');
      var productName = row.querySelector('.product-name');
      if (productName) {
        alert('Restock: ' + productName.textContent + '\n\nRestock functionality will be connected to the backend.');
      }
    });
  });

  /* ===== Animate summary card values on load ===== */
  var cardValues = document.querySelectorAll('.card-value');
  cardValues.forEach(function (el) {
    var target = parseInt(el.textContent.replace(/,/g, ''), 10);
    if (isNaN(target)) return;
    var current = 0;
    var step = Math.ceil(target / 30);
    var interval = setInterval(function () {
      current += step;
      if (current >= target) {
        current = target;
        clearInterval(interval);
      }
      el.textContent = current.toLocaleString();
    }, 30);
  });

});
