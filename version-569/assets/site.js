(function () {
    function ready(callback) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", callback);
        } else {
            callback();
        }
    }

    function escapeHtml(value) {
        return String(value || "")
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#39;");
    }

    function initHeader() {
        var header = document.querySelector(".site-header");
        var toggle = document.querySelector("[data-menu-toggle]");
        var nav = document.querySelector("[data-nav-links]");

        function updateHeader() {
            if (!header) {
                return;
            }
            header.classList.toggle("is-scrolled", window.scrollY > 12);
        }

        updateHeader();
        window.addEventListener("scroll", updateHeader, { passive: true });

        if (toggle && nav) {
            toggle.addEventListener("click", function () {
                nav.classList.toggle("is-open");
            });
        }
    }

    function initHero() {
        var root = document.querySelector("[data-hero]");
        if (!root) {
            return;
        }

        var slides = Array.prototype.slice.call(root.querySelectorAll(".hero-slide"));
        var dots = Array.prototype.slice.call(root.querySelectorAll("[data-hero-dot]"));
        var current = 0;

        function show(index) {
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, pos) {
                slide.classList.toggle("is-active", pos === current);
            });
            dots.forEach(function (dot, pos) {
                dot.classList.toggle("is-active", pos === current);
            });
        }

        dots.forEach(function (dot, pos) {
            dot.addEventListener("click", function () {
                show(pos);
            });
        });

        if (slides.length > 1) {
            window.setInterval(function () {
                show(current + 1);
            }, 5200);
        }
    }

    function initImageFallback() {
        document.addEventListener("error", function (event) {
            var target = event.target;
            if (target && target.tagName === "IMG") {
                target.classList.add("image-failed");
            }
        }, true);
    }

    function initCategoryFilters() {
        var scopes = Array.prototype.slice.call(document.querySelectorAll("[data-filter-scope]"));
        scopes.forEach(function (scope) {
            var textInput = scope.querySelector("[data-filter-text]");
            var regionSelect = scope.querySelector("[data-filter-region]");
            var yearSelect = scope.querySelector("[data-filter-year]");
            var cards = Array.prototype.slice.call(scope.querySelectorAll("[data-movie-card]"));
            var empty = scope.querySelector("[data-filter-empty]");

            function apply() {
                var keyword = textInput ? textInput.value.trim().toLowerCase() : "";
                var region = regionSelect ? regionSelect.value : "";
                var year = yearSelect ? yearSelect.value : "";
                var visible = 0;

                cards.forEach(function (card) {
                    var haystack = [
                        card.dataset.title,
                        card.dataset.genre,
                        card.dataset.tags,
                        card.dataset.type,
                        card.dataset.region,
                        card.dataset.year
                    ].join(" ").toLowerCase();
                    var ok = true;
                    if (keyword && haystack.indexOf(keyword) === -1) {
                        ok = false;
                    }
                    if (region && card.dataset.region !== region) {
                        ok = false;
                    }
                    if (year && card.dataset.year !== year) {
                        ok = false;
                    }
                    card.hidden = !ok;
                    if (ok) {
                        visible += 1;
                    }
                });

                if (empty) {
                    empty.hidden = visible > 0;
                }
            }

            [textInput, regionSelect, yearSelect].forEach(function (control) {
                if (control) {
                    control.addEventListener("input", apply);
                    control.addEventListener("change", apply);
                }
            });
        });
    }

    function movieCard(movie) {
        return [
            '<a class="movie-card" href="' + escapeHtml(movie.url) + '">',
            '    <div class="movie-poster">',
            '        <img src="' + escapeHtml(movie.cover) + '" alt="' + escapeHtml(movie.title) + '" loading="lazy">',
            '        <span class="poster-badge">' + escapeHtml(movie.year) + '</span>',
            '        <span class="poster-play">▶</span>',
            '    </div>',
            '    <div class="movie-card-body">',
            '        <h3>' + escapeHtml(movie.title) + '</h3>',
            '        <p>' + escapeHtml(movie.oneLine) + '</p>',
            '        <div class="movie-meta">',
            '            <span>' + escapeHtml(movie.category) + '</span>',
            '            <span>' + escapeHtml(movie.type) + '</span>',
            '        </div>',
            '    </div>',
            '</a>'
        ].join("");
    }

    function initSearch() {
        var page = document.querySelector("[data-search-page]");
        if (!page || !window.SITE_MOVIES) {
            return;
        }

        var input = page.querySelector("[data-site-search]");
        var button = page.querySelector("[data-site-search-button]");
        var results = page.querySelector("[data-search-results]");
        var empty = page.querySelector("[data-search-empty]");
        var title = page.querySelector("[data-search-title]");
        var subtitle = page.querySelector("[data-search-subtitle]");
        var defaultMovies = window.SITE_MOVIES.slice(0, 24);

        function render(items, keyword) {
            var limited = items.slice(0, 120);
            results.innerHTML = limited.map(movieCard).join("");
            if (empty) {
                empty.hidden = limited.length > 0;
            }
            if (title) {
                title.textContent = keyword ? "搜索结果" : "热门推荐";
            }
            if (subtitle) {
                subtitle.textContent = keyword ? "点击影片卡片进入详情页播放" : "可直接浏览，也可使用上方搜索框筛选";
            }
        }

        function run() {
            var keyword = input ? input.value.trim().toLowerCase() : "";
            if (!keyword) {
                render(defaultMovies, "");
                return;
            }
            var matches = window.SITE_MOVIES.filter(function (movie) {
                return [
                    movie.title,
                    movie.oneLine,
                    movie.region,
                    movie.type,
                    movie.genre,
                    movie.tags,
                    movie.year,
                    movie.category
                ].join(" ").toLowerCase().indexOf(keyword) !== -1;
            });
            render(matches, keyword);
        }

        if (input) {
            input.addEventListener("input", run);
            input.addEventListener("keydown", function (event) {
                if (event.key === "Enter") {
                    run();
                }
            });
        }
        if (button) {
            button.addEventListener("click", run);
        }
    }

    ready(function () {
        initHeader();
        initHero();
        initImageFallback();
        initCategoryFilters();
        initSearch();
    });
})();
