(function() {
    const menuButton = document.querySelector("[data-menu-toggle]");
    const mobilePanel = document.querySelector("[data-mobile-panel]");

    if (menuButton && mobilePanel) {
        menuButton.addEventListener("click", function() {
            mobilePanel.classList.toggle("is-open");
        });
    }

    document.querySelectorAll("[data-search-form]").forEach(function(form) {
        form.addEventListener("submit", function(event) {
            event.preventDefault();
            const input = form.querySelector("input[name='q']");
            const value = input ? input.value.trim() : "";
            const target = value ? "./search.html?q=" + encodeURIComponent(value) : "./search.html";
            window.location.href = target;
        });
    });

    document.querySelectorAll("[data-hero]").forEach(function(hero) {
        const slides = Array.from(hero.querySelectorAll("[data-hero-slide]"));
        const dots = Array.from(hero.querySelectorAll("[data-hero-dot]"));
        const prev = hero.querySelector("[data-hero-prev]");
        const next = hero.querySelector("[data-hero-next]");
        let index = 0;
        let timer = null;

        function show(nextIndex) {
            if (!slides.length) {
                return;
            }
            index = (nextIndex + slides.length) % slides.length;
            slides.forEach(function(slide, slideIndex) {
                slide.classList.toggle("is-active", slideIndex === index);
            });
            dots.forEach(function(dot, dotIndex) {
                dot.classList.toggle("is-active", dotIndex === index);
            });
        }

        function restart() {
            if (timer) {
                window.clearInterval(timer);
            }
            timer = window.setInterval(function() {
                show(index + 1);
            }, 5200);
        }

        if (prev) {
            prev.addEventListener("click", function() {
                show(index - 1);
                restart();
            });
        }

        if (next) {
            next.addEventListener("click", function() {
                show(index + 1);
                restart();
            });
        }

        dots.forEach(function(dot) {
            dot.addEventListener("click", function() {
                show(Number(dot.getAttribute("data-hero-dot")) || 0);
                restart();
            });
        });

        show(0);
        restart();
    });

    document.querySelectorAll("[data-filter-scope]").forEach(function(scope) {
        const input = scope.querySelector("[data-filter-input]");
        const category = scope.querySelector("[data-filter-category]");
        const year = scope.querySelector("[data-filter-year]");
        const region = scope.querySelector("[data-filter-region]");
        const reset = scope.querySelector("[data-filter-reset]");
        const empty = scope.querySelector("[data-no-results]");
        const cards = Array.from(scope.querySelectorAll("[data-movie-card]"));
        const params = new URLSearchParams(window.location.search);
        const query = params.get("q") || "";

        if (query && input) {
            input.value = query;
        }

        function match(card) {
            const keyword = input ? input.value.trim().toLowerCase() : "";
            const selectedCategory = category ? category.value : "";
            const selectedYear = year ? year.value : "";
            const selectedRegion = region ? region.value : "";
            const haystack = [
                card.getAttribute("data-title"),
                card.getAttribute("data-region"),
                card.getAttribute("data-type"),
                card.getAttribute("data-genre"),
                card.getAttribute("data-tags")
            ].join(" ").toLowerCase();
            const keywordMatch = !keyword || haystack.indexOf(keyword) !== -1;
            const categoryMatch = !selectedCategory || card.getAttribute("data-category") === selectedCategory;
            const yearMatch = !selectedYear || card.getAttribute("data-year") === selectedYear;
            const regionMatch = !selectedRegion || card.getAttribute("data-region") === selectedRegion;
            return keywordMatch && categoryMatch && yearMatch && regionMatch;
        }

        function update() {
            let visible = 0;
            cards.forEach(function(card) {
                const ok = match(card);
                card.classList.toggle("hidden-by-filter", !ok);
                if (ok) {
                    visible += 1;
                }
            });
            if (empty) {
                empty.classList.toggle("is-visible", visible === 0);
            }
        }

        [input, category, year, region].forEach(function(control) {
            if (control) {
                control.addEventListener("input", update);
                control.addEventListener("change", update);
            }
        });

        if (reset) {
            reset.addEventListener("click", function() {
                window.setTimeout(update, 0);
            });
        }

        update();
    });
}());
