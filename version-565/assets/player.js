(function () {
  function ready(fn) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', fn);
    } else {
      fn();
    }
  }

  ready(function () {
    var video = document.querySelector('.movie-player');
    var overlay = document.querySelector('.player-overlay');
    if (!video) {
      return;
    }
    var source = video.getAttribute('data-m3u8');
    var loaded = false;
    var hls = null;

    function hideOverlay() {
      if (overlay) {
        overlay.classList.add('is-hidden');
      }
    }

    function fail() {
      hideOverlay();
      var box = video.closest('.player-frame');
      if (box && !box.querySelector('.play-error')) {
        var message = document.createElement('div');
        message.className = 'play-error';
        message.textContent = '视频加载失败，请稍后重试';
        box.appendChild(message);
      }
    }

    function load() {
      if (loaded || !source) {
        return Promise.resolve();
      }
      loaded = true;
      if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({ enableWorker: true, lowLatencyMode: true });
        hls.loadSource(source);
        hls.attachMedia(video);
        hls.on(window.Hls.Events.ERROR, function (event, data) {
          if (data && data.fatal) {
            fail();
          }
        });
        return Promise.resolve();
      }
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = source;
        return Promise.resolve();
      }
      fail();
      return Promise.resolve();
    }

    function play() {
      hideOverlay();
      load().then(function () {
        var promise = video.play();
        if (promise && promise.catch) {
          promise.catch(function () {});
        }
      });
    }

    if (overlay) {
      overlay.addEventListener('click', play);
    }
    video.addEventListener('click', function () {
      if (!loaded) {
        play();
      }
    });
    video.addEventListener('play', hideOverlay);
    window.addEventListener('beforeunload', function () {
      if (hls) {
        hls.destroy();
      }
    });
  });
})();
