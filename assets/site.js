(function () {
  var toggle = document.querySelector('.nav-toggle');
  var mobileNav = document.querySelector('.mobile-nav');

  if (toggle && mobileNav) {
    toggle.addEventListener('click', function () {
      mobileNav.classList.toggle('is-open');
    });
  }

  var hero = document.querySelector('[data-hero]');
  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var current = 0;
    var timer = null;

    function showSlide(index) {
      if (!slides.length) {
        return;
      }
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === current);
      });
    }

    function startTimer() {
      window.clearInterval(timer);
      timer = window.setInterval(function () {
        showSlide(current + 1);
      }, 5200);
    }

    dots.forEach(function (dot, index) {
      dot.addEventListener('click', function () {
        showSlide(index);
        startTimer();
      });
    });

    showSlide(0);
    startTimer();
  }

  Array.prototype.slice.call(document.querySelectorAll('[data-global-search]')).forEach(function (form) {
    form.addEventListener('submit', function (event) {
      event.preventDefault();
      var input = form.querySelector('input[name="q"]');
      var query = input ? input.value.trim() : '';
      var target = './search.html';
      if (query) {
        target += '?q=' + encodeURIComponent(query);
      }
      window.location.href = target;
    });
  });

  var localInput = document.querySelector('[data-local-search]');
  var cards = Array.prototype.slice.call(document.querySelectorAll('[data-search-card]'));
  var filterButtons = Array.prototype.slice.call(document.querySelectorAll('[data-filter-value]'));
  var activeFilter = '';

  function normalize(value) {
    return String(value || '').toLowerCase().replace(/\s+/g, ' ').trim();
  }

  function applyFilters() {
    var query = normalize(localInput ? localInput.value : '');
    var filter = normalize(activeFilter);
    cards.forEach(function (card) {
      var searchText = normalize(card.getAttribute('data-search'));
      var filterText = normalize(card.getAttribute('data-filters'));
      var matchQuery = !query || searchText.indexOf(query) !== -1;
      var matchFilter = !filter || filterText.indexOf(filter) !== -1;
      card.hidden = !(matchQuery && matchFilter);
    });
  }

  if (localInput && cards.length) {
    var params = new URLSearchParams(window.location.search);
    var queryParam = params.get('q');
    if (queryParam) {
      localInput.value = queryParam;
    }
    localInput.addEventListener('input', applyFilters);
  }

  filterButtons.forEach(function (button) {
    button.addEventListener('click', function () {
      activeFilter = button.getAttribute('data-filter-value') || '';
      filterButtons.forEach(function (item) {
        item.classList.toggle('is-active', item === button);
      });
      applyFilters();
    });
  });

  applyFilters();
})();
