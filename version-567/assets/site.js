(function () {
  var menuButton = document.querySelector('[data-menu-toggle]');
  if (menuButton) {
    menuButton.addEventListener('click', function () {
      document.body.classList.toggle('menu-open');
    });
  }

  var hero = document.querySelector('[data-hero]');
  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var active = 0;
    var show = function (next) {
      if (!slides.length) {
        return;
      }
      active = (next + slides.length) % slides.length;
      slides.forEach(function (slide, index) {
        slide.classList.toggle('is-active', index === active);
      });
      dots.forEach(function (dot, index) {
        dot.classList.toggle('active', index === active);
      });
    };
    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        show(Number(dot.getAttribute('data-hero-dot')) || 0);
      });
    });
    if (slides.length > 1) {
      window.setInterval(function () {
        show(active + 1);
      }, 5200);
    }
  }

  var inputs = Array.prototype.slice.call(document.querySelectorAll('.site-search'));
  inputs.forEach(function (input) {
    var selector = input.getAttribute('data-filter-target');
    var items = selector ? Array.prototype.slice.call(document.querySelectorAll(selector)) : [];
    input.addEventListener('input', function () {
      var query = input.value.trim().toLowerCase();
      items.forEach(function (item) {
        var haystack = (item.getAttribute('data-search') || item.textContent || '').toLowerCase();
        item.classList.toggle('is-hidden', query && haystack.indexOf(query) === -1);
      });
    });
  });
})();
