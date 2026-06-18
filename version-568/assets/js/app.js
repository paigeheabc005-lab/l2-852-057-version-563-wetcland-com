import { H as Hls } from './hls.mjs';

const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => Array.from(root.querySelectorAll(selector));

function setupMobileNav() {
  const toggle = $('.mobile-toggle');
  const panel = $('.mobile-panel');
  if (!toggle || !panel) {
    return;
  }

  toggle.addEventListener('click', () => {
    const nextState = panel.hasAttribute('hidden');
    panel.toggleAttribute('hidden', !nextState);
    toggle.setAttribute('aria-expanded', String(nextState));
  });
}

function setupBackTop() {
  $$('.back-top').forEach((button) => {
    button.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  });
}

function setupImageFallbacks() {
  $$('img[data-cover]').forEach((image) => {
    image.addEventListener('error', () => {
      image.classList.add('is-missing');
      image.setAttribute('aria-hidden', 'true');
    }, { once: true });
  });
}

function setupHeroCarousel() {
  const slides = $$('[data-hero-slide]');
  const dots = $$('[data-hero-dot]');
  if (!slides.length) {
    return;
  }

  let activeIndex = 0;
  let timer = null;

  const showSlide = (index) => {
    activeIndex = (index + slides.length) % slides.length;
    slides.forEach((slide, current) => {
      slide.classList.toggle('is-active', current === activeIndex);
    });
    dots.forEach((dot, current) => {
      dot.classList.toggle('is-active', current === activeIndex);
    });
  };

  const start = () => {
    timer = window.setInterval(() => showSlide(activeIndex + 1), 5200);
  };

  dots.forEach((dot) => {
    dot.addEventListener('click', () => {
      window.clearInterval(timer);
      showSlide(Number(dot.dataset.heroDot || 0));
      start();
    });
  });

  start();
}

function setupCardFilters() {
  $$('[data-filter-grid]').forEach((grid) => {
    const scope = grid.closest('section') || document;
    const searchInput = $('[data-card-search]', scope) || $('[data-card-search]');
    const selects = $$('[data-card-select]', scope);
    const cards = $$('.movie-card', grid);

    if (!cards.length || (!searchInput && !selects.length)) {
      return;
    }

    const empty = document.createElement('div');
    empty.className = 'empty-state';
    empty.textContent = '没有找到符合条件的影片。';

    const update = () => {
      const keyword = (searchInput?.value || '').trim().toLowerCase();
      const rules = selects.map((select) => ({
        attr: select.dataset.cardSelect,
        value: select.value.trim().toLowerCase(),
      })).filter((rule) => rule.attr && rule.value);

      let visibleCount = 0;
      cards.forEach((card) => {
        const haystack = [
          card.dataset.title,
          card.dataset.genre,
          card.dataset.region,
          card.dataset.year,
          card.dataset.type,
          card.textContent,
        ].join(' ').toLowerCase();

        const matchedKeyword = !keyword || haystack.includes(keyword);
        const matchedRules = rules.every((rule) => String(card.getAttribute(rule.attr) || '').toLowerCase() === rule.value);
        const visible = matchedKeyword && matchedRules;
        card.classList.toggle('is-hidden', !visible);
        if (visible) {
          visibleCount += 1;
        }
      });

      if (!visibleCount && !empty.parentNode) {
        grid.appendChild(empty);
      }
      if (visibleCount && empty.parentNode) {
        empty.remove();
      }
    };

    searchInput?.addEventListener('input', update);
    selects.forEach((select) => select.addEventListener('change', update));
  });
}

function setupSelectOptions() {
  $$('select[data-card-select]').forEach((select) => {
    if (select.options.length > 1) {
      return;
    }
    const attr = select.dataset.cardSelect;
    const grid = select.closest('section')?.querySelector('[data-filter-grid]') || $('[data-filter-grid]');
    if (!attr || !grid) {
      return;
    }
    const values = new Set($$('.movie-card', grid).map((card) => card.getAttribute(attr)).filter(Boolean));
    Array.from(values).sort().reverse().forEach((value) => {
      const option = document.createElement('option');
      option.value = value;
      option.textContent = value;
      select.appendChild(option);
    });
  });
}

function setupSearchPage() {
  const resultGrid = $('[data-search-results]');
  if (!resultGrid || !window.MOVIE_SEARCH_DATA) {
    return;
  }

  const params = new URLSearchParams(window.location.search);
  const query = (params.get('q') || '').trim();
  const input = $('[data-search-input]');
  const title = $('[data-search-title]');
  const count = $('[data-search-count]');

  if (input) {
    input.value = query;
  }

  if (!query) {
    return;
  }

  const normalized = query.toLowerCase();
  const results = window.MOVIE_SEARCH_DATA.filter((movie) => {
    return [movie.title, movie.genre, movie.region, movie.year, movie.type, movie.tags].join(' ').toLowerCase().includes(normalized);
  }).slice(0, 240);

  if (title) {
    title.textContent = `“${query}” 的搜索结果`;
  }
  if (count) {
    count.textContent = results.length ? `为你找到 ${results.length} 条相关内容。` : '没有找到相关影片，可以尝试更换关键词。';
  }

  if (!results.length) {
    resultGrid.innerHTML = '<div class="empty-state">没有找到相关影片。</div>';
    return;
  }

  resultGrid.innerHTML = results.map((movie) => `
    <article class="movie-card" data-title="${escapeHtml(movie.title)}" data-genre="${escapeHtml(movie.genre)}" data-region="${escapeHtml(movie.region)}" data-year="${escapeHtml(movie.year)}" data-type="${escapeHtml(movie.type)}">
      <a class="poster-wrap" href="movie/${movie.id}.html" aria-label="观看 ${escapeHtml(movie.title)}" data-number="${movie.index}">
        <img src="${movie.poster}" alt="${escapeHtml(movie.title)}" loading="lazy" data-cover>
        <span class="score-badge">${escapeHtml(movie.rating)}</span>
        <span class="play-badge">播放</span>
      </a>
      <div class="movie-card-body">
        <div class="card-meta">
          <span>${escapeHtml(movie.year)}</span>
          <span>${escapeHtml(movie.region)}</span>
          <span>${escapeHtml(movie.type)}</span>
        </div>
        <h3><a href="movie/${movie.id}.html">${escapeHtml(movie.title)}</a></h3>
        <p>${escapeHtml(movie.oneLine)}</p>
        <div class="tag-row">${movie.tags.split(',').slice(0, 3).map((tag) => `<span>${escapeHtml(tag.trim())}</span>`).join('')}</div>
      </div>
    </article>
  `).join('');

  setupImageFallbacks();
}

function setupPlayers() {
  $$('.player-shell').forEach((shell) => {
    const video = $('.movie-player', shell);
    const button = $('.player-trigger', shell);
    const message = $('.player-message', shell);
    const source = shell.dataset.stream;

    if (!video || !button || !source) {
      return;
    }

    const setMessage = (text) => {
      if (message) {
        message.textContent = text;
      }
    };

    button.addEventListener('click', async () => {
      shell.classList.add('is-playing');
      video.setAttribute('controls', 'controls');
      setMessage('正在初始化高清播放源…');

      try {
        if (Hls.isSupported()) {
          const hls = new Hls({
            enableWorker: true,
            lowLatencyMode: true,
          });
          hls.loadSource(source);
          hls.attachMedia(video);
          hls.on(Hls.Events.MANIFEST_PARSED, async () => {
            setMessage('播放源加载完成。');
            await video.play();
          });
          hls.on(Hls.Events.ERROR, (_event, data) => {
            if (data?.fatal) {
              setMessage('播放源加载失败，请刷新页面后重试。');
            }
          });
          shell.hlsInstance = hls;
        } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
          video.src = source;
          await video.play();
          setMessage('播放源加载完成。');
        } else {
          setMessage('当前浏览器不支持 HLS 播放，请使用新版浏览器访问。');
        }
      } catch (error) {
        shell.classList.remove('is-playing');
        setMessage('播放器启动失败，请再次点击播放。');
      }
    });
  });
}

function escapeHtml(value) {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

setupMobileNav();
setupBackTop();
setupImageFallbacks();
setupHeroCarousel();
setupSelectOptions();
setupCardFilters();
setupSearchPage();
setupPlayers();
