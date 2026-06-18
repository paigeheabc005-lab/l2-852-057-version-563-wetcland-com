(function () {
    function onReady(callback) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", callback);
        } else {
            callback();
        }
    }

    function normalize(value) {
        return (value || "").toString().trim().toLowerCase();
    }

    onReady(function () {
        var header = document.querySelector("[data-header]");
        var menuToggle = document.querySelector("[data-menu-toggle]");
        var mobileNav = document.querySelector("[data-mobile-nav]");

        function syncHeader() {
            if (!header) {
                return;
            }
            header.classList.toggle("is-scrolled", window.scrollY > 18);
        }

        syncHeader();
        window.addEventListener("scroll", syncHeader, { passive: true });

        if (menuToggle && mobileNav) {
            menuToggle.addEventListener("click", function () {
                mobileNav.classList.toggle("is-open");
            });
        }

        document.querySelectorAll("[data-hero-carousel]").forEach(function (carousel) {
            var slides = Array.prototype.slice.call(carousel.querySelectorAll("[data-hero-slide]"));
            var dots = Array.prototype.slice.call(carousel.querySelectorAll("[data-hero-dot]"));
            var prev = carousel.querySelector("[data-hero-prev]");
            var next = carousel.querySelector("[data-hero-next]");
            var current = 0;
            var timer = null;

            function show(index) {
                if (!slides.length) {
                    return;
                }
                current = (index + slides.length) % slides.length;
                slides.forEach(function (slide, slideIndex) {
                    slide.classList.toggle("is-active", slideIndex === current);
                });
                dots.forEach(function (dot, dotIndex) {
                    dot.classList.toggle("is-active", dotIndex === current);
                });
            }

            function start() {
                stop();
                timer = window.setInterval(function () {
                    show(current + 1);
                }, 5200);
            }

            function stop() {
                if (timer) {
                    window.clearInterval(timer);
                    timer = null;
                }
            }

            if (prev) {
                prev.addEventListener("click", function () {
                    show(current - 1);
                    start();
                });
            }

            if (next) {
                next.addEventListener("click", function () {
                    show(current + 1);
                    start();
                });
            }

            dots.forEach(function (dot, index) {
                dot.addEventListener("click", function () {
                    show(index);
                    start();
                });
            });

            carousel.addEventListener("mouseenter", stop);
            carousel.addEventListener("mouseleave", start);
            show(0);
            start();
        });

        document.querySelectorAll("[data-filter-bar]").forEach(function (bar) {
            var scope = bar.parentElement || document;
            var search = bar.querySelector("[data-filter-search]");
            var category = bar.querySelector("[data-filter-category]");
            var year = bar.querySelector("[data-filter-year]");
            var cards = Array.prototype.slice.call(scope.querySelectorAll("[data-movie-card]"));
            var params = new URLSearchParams(window.location.search);
            var initialQuery = params.get("q");

            if (initialQuery && search) {
                search.value = initialQuery;
            }

            function passYear(cardYear, value) {
                if (!value) {
                    return true;
                }
                if (value === "older") {
                    return Number(cardYear) < 2022;
                }
                return cardYear === value;
            }

            function applyFilters() {
                var query = normalize(search && search.value);
                var selectedCategory = category ? category.value : "";
                var selectedYear = year ? year.value : "";

                cards.forEach(function (card) {
                    var haystack = normalize(card.getAttribute("data-search"));
                    var cardCategory = card.getAttribute("data-category") || "";
                    var cardYear = card.getAttribute("data-year") || "";
                    var matched = true;

                    if (query && haystack.indexOf(query) === -1) {
                        matched = false;
                    }

                    if (selectedCategory && cardCategory !== selectedCategory) {
                        matched = false;
                    }

                    if (!passYear(cardYear, selectedYear)) {
                        matched = false;
                    }

                    card.classList.toggle("is-hidden", !matched);
                });
            }

            [search, category, year].forEach(function (control) {
                if (control) {
                    control.addEventListener("input", applyFilters);
                    control.addEventListener("change", applyFilters);
                }
            });

            applyFilters();
        });
    });
})();
