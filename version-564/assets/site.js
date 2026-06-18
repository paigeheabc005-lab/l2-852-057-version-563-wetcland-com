(function () {
  function ready(callback) {
    if (document.readyState !== 'loading') {
      callback();
      return;
    }

    document.addEventListener('DOMContentLoaded', callback);
  }

  ready(function () {
    initMobileNavigation();
    initHeroSlider();
    initSearchPanels();
    initImageFallbacks();
  });

  function initMobileNavigation() {
    var toggle = document.querySelector('[data-mobile-toggle]');
    var nav = document.querySelector('[data-mobile-nav]');

    if (!toggle || !nav) {
      return;
    }

    toggle.addEventListener('click', function () {
      nav.classList.toggle('is-open');
    });
  }

  function initHeroSlider() {
    var hero = document.querySelector('[data-hero]');

    if (!hero) {
      return;
    }

    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var prev = hero.querySelector('[data-hero-prev]');
    var next = hero.querySelector('[data-hero-next]');
    var current = 0;
    var timer = null;

    function activate(index) {
      current = (index + slides.length) % slides.length;

      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === current);
      });

      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === current);
      });
    }

    function restart() {
      window.clearInterval(timer);
      timer = window.setInterval(function () {
        activate(current + 1);
      }, 5200);
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        activate(Number(dot.getAttribute('data-hero-dot')) || 0);
        restart();
      });
    });

    if (prev) {
      prev.addEventListener('click', function () {
        activate(current - 1);
        restart();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        activate(current + 1);
        restart();
      });
    }

    restart();
  }

  function initSearchPanels() {
    var panels = Array.prototype.slice.call(document.querySelectorAll('[data-search-panel]'));

    panels.forEach(function (panel) {
      var input = panel.querySelector('[data-search-input]');
      var section = panel.closest('.content-section') || document;
      var list = section.querySelector('[data-card-list]') || section;
      var cards = Array.prototype.slice.call(list.querySelectorAll('[data-movie-card]'));
      var count = panel.querySelector('[data-result-count]');
      var filterButtons = Array.prototype.slice.call(panel.querySelectorAll('[data-filter-value]'));
      var activeFilter = 'all';

      function cardMatchesFilter(card) {
        if (activeFilter === 'all') {
          return true;
        }

        var haystack = [
          card.getAttribute('data-region'),
          card.getAttribute('data-type'),
          card.getAttribute('data-year'),
          card.getAttribute('data-category'),
          card.getAttribute('data-keywords')
        ].join(' ');

        return haystack.indexOf(activeFilter) !== -1;
      }

      function cardMatchesSearch(card, query) {
        if (!query) {
          return true;
        }

        var haystack = [
          card.getAttribute('data-title'),
          card.getAttribute('data-region'),
          card.getAttribute('data-type'),
          card.getAttribute('data-year'),
          card.getAttribute('data-keywords')
        ].join(' ').toLowerCase();

        return haystack.indexOf(query) !== -1;
      }

      function apply() {
        var query = input ? input.value.trim().toLowerCase() : '';
        var visible = 0;

        cards.forEach(function (card) {
          var shouldShow = cardMatchesFilter(card) && cardMatchesSearch(card, query);
          card.classList.toggle('is-hidden', !shouldShow);

          if (shouldShow) {
            visible += 1;
          }
        });

        if (count) {
          count.textContent = '当前显示 ' + visible + ' 部影片';
        }
      }

      filterButtons.forEach(function (button) {
        button.addEventListener('click', function () {
          activeFilter = button.getAttribute('data-filter-value') || 'all';

          filterButtons.forEach(function (item) {
            item.classList.toggle('is-active', item === button);
          });

          apply();
        });
      });

      if (input) {
        input.addEventListener('input', apply);
      }

      apply();
    });
  }

  function initImageFallbacks() {
    var images = Array.prototype.slice.call(document.querySelectorAll('img[data-fallback]'));

    images.forEach(function (image) {
      image.addEventListener('error', function () {
        image.classList.add('is-missing');
        image.alt = image.alt || '影片封面';
      });
    });
  }
})();
