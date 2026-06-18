(function () {
  function ready(fn) {
    if (document.readyState !== "loading") {
      fn();
    } else {
      document.addEventListener("DOMContentLoaded", fn);
    }
  }

  function initMenu() {
    var button = document.querySelector("[data-menu-button]");
    var menu = document.querySelector("[data-mobile-menu]");
    if (!button || !menu) return;
    button.addEventListener("click", function () {
      menu.classList.toggle("is-open");
    });
  }

  function initHero() {
    var hero = document.querySelector("[data-hero]");
    if (!hero) return;
    var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
    if (slides.length < 2) return;
    var index = 0;
    var timer = null;

    function activate(next) {
      index = (next + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle("is-active", i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle("is-active", i === index);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        activate(index + 1);
      }, 5200);
    }

    function stop() {
      if (timer) window.clearInterval(timer);
    }

    dots.forEach(function (dot, i) {
      dot.addEventListener("click", function () {
        activate(i);
        start();
      });
    });
    hero.addEventListener("mouseenter", stop);
    hero.addEventListener("mouseleave", start);
    start();
  }

  function normalize(value) {
    return String(value || "").trim().toLowerCase();
  }

  function initFilters() {
    var panels = Array.prototype.slice.call(document.querySelectorAll("[data-filter-panel]"));
    panels.forEach(function (panel) {
      var scope = panel.closest("[data-filter-scope]") || document;
      var cards = Array.prototype.slice.call(scope.querySelectorAll("[data-movie-card]"));
      var keywordInput = panel.querySelector("[data-filter-keyword]");
      var regionSelect = panel.querySelector("[data-filter-region]");
      var typeSelect = panel.querySelector("[data-filter-type]");
      var yearSelect = panel.querySelector("[data-filter-year]");
      var empty = scope.querySelector("[data-empty-state]");
      var params = new URLSearchParams(window.location.search);
      var initialQuery = params.get("q");

      if (initialQuery && keywordInput) {
        keywordInput.value = initialQuery;
      }

      function apply() {
        var keyword = normalize(keywordInput && keywordInput.value);
        var region = normalize(regionSelect && regionSelect.value);
        var type = normalize(typeSelect && typeSelect.value);
        var year = normalize(yearSelect && yearSelect.value);
        var visible = 0;

        cards.forEach(function (card) {
          var haystack = normalize([
            card.dataset.title,
            card.dataset.region,
            card.dataset.type,
            card.dataset.year,
            card.dataset.tags,
            card.dataset.summary
          ].join(" "));
          var ok = true;
          if (keyword && haystack.indexOf(keyword) === -1) ok = false;
          if (region && normalize(card.dataset.region) !== region) ok = false;
          if (type && normalize(card.dataset.type) !== type) ok = false;
          if (year && normalize(card.dataset.year) !== year) ok = false;
          card.classList.toggle("is-filtered-out", !ok);
          if (ok) visible += 1;
        });

        if (empty) {
          empty.classList.toggle("is-visible", visible === 0);
        }
      }

      [keywordInput, regionSelect, typeSelect, yearSelect].forEach(function (element) {
        if (!element) return;
        element.addEventListener("input", apply);
        element.addEventListener("change", apply);
      });
      apply();
    });
  }

  ready(function () {
    initMenu();
    initHero();
    initFilters();
  });
})();
