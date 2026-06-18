document.addEventListener("DOMContentLoaded", function () {
  var toggle = document.querySelector("[data-mobile-toggle]");
  var mobileNav = document.querySelector("[data-mobile-nav]");

  if (toggle && mobileNav) {
    toggle.addEventListener("click", function () {
      mobileNav.classList.toggle("is-open");
    });
  }

  var slides = Array.prototype.slice.call(document.querySelectorAll("[data-hero-slide]"));
  var dots = Array.prototype.slice.call(document.querySelectorAll("[data-hero-dot]"));
  var activeSlide = 0;

  function showSlide(index) {
    if (!slides.length) {
      return;
    }

    activeSlide = (index + slides.length) % slides.length;

    slides.forEach(function (slide, slideIndex) {
      slide.classList.toggle("is-active", slideIndex === activeSlide);
    });

    dots.forEach(function (dot, dotIndex) {
      dot.classList.toggle("is-active", dotIndex === activeSlide);
    });
  }

  dots.forEach(function (dot, dotIndex) {
    dot.addEventListener("click", function () {
      showSlide(dotIndex);
    });
  });

  if (slides.length > 1) {
    window.setInterval(function () {
      showSlide(activeSlide + 1);
    }, 5200);
  }

  var searchInputs = Array.prototype.slice.call(document.querySelectorAll("[data-search-input]"));
  var cards = Array.prototype.slice.call(document.querySelectorAll("[data-search-card]"));
  var filterButtons = Array.prototype.slice.call(document.querySelectorAll("[data-filter-value]"));
  var emptyState = document.querySelector("[data-empty-state]");
  var activeFilter = "";

  function normalize(value) {
    return (value || "").toString().trim().toLowerCase();
  }

  function filterCards() {
    if (!cards.length) {
      return;
    }

    var query = normalize(searchInputs.length ? searchInputs[0].value : "");
    var visible = 0;

    cards.forEach(function (card) {
      var searchable = normalize(card.getAttribute("data-search"));
      var tags = normalize(card.getAttribute("data-tags"));
      var region = normalize(card.getAttribute("data-region"));
      var type = normalize(card.getAttribute("data-type"));
      var matchedQuery = !query || searchable.indexOf(query) !== -1;
      var matchedFilter = !activeFilter || searchable.indexOf(activeFilter) !== -1 || tags.indexOf(activeFilter) !== -1 || region.indexOf(activeFilter) !== -1 || type.indexOf(activeFilter) !== -1;
      var matched = matchedQuery && matchedFilter;

      card.style.display = matched ? "" : "none";

      if (matched) {
        visible += 1;
      }
    });

    if (emptyState) {
      emptyState.classList.toggle("is-visible", visible === 0);
    }
  }

  if (searchInputs.length && cards.length) {
    var params = new URLSearchParams(window.location.search);
    var q = params.get("q");

    if (q) {
      searchInputs.forEach(function (input) {
        input.value = q;
      });
    }

    searchInputs.forEach(function (input) {
      input.addEventListener("input", filterCards);
    });
  }

  filterButtons.forEach(function (button) {
    button.addEventListener("click", function () {
      activeFilter = normalize(button.getAttribute("data-filter-value"));

      filterButtons.forEach(function (item) {
        item.classList.toggle("is-active", item === button);
      });

      filterCards();
    });
  });

  filterCards();

  Array.prototype.slice.call(document.querySelectorAll("[data-player]")).forEach(function (player) {
    var video = player.querySelector("video");
    var button = player.querySelector("[data-play-button]");
    var source = player.getAttribute("data-stream");
    var ready = false;

    function prepare() {
      if (!video || !source || ready) {
        return;
      }

      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = source;
      } else if (window.Hls && window.Hls.isSupported()) {
        var hls = new window.Hls();
        hls.loadSource(source);
        hls.attachMedia(video);
        video.hlsInstance = hls;
      } else {
        video.src = source;
      }

      ready = true;
    }

    function play() {
      prepare();
      player.classList.add("is-playing");

      if (video) {
        var promise = video.play();

        if (promise && promise.catch) {
          promise.catch(function () {});
        }
      }
    }

    if (button) {
      button.addEventListener("click", function (event) {
        event.preventDefault();
        play();
      });
    }

    if (video) {
      video.addEventListener("click", function () {
        if (!ready) {
          play();
        }
      });
    }
  });
});
