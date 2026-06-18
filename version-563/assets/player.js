(function () {
  var blocks = Array.prototype.slice.call(document.querySelectorAll('[data-player]'));

  blocks.forEach(function (block) {
    var video = block.querySelector('video');
    var overlay = block.querySelector('.player-overlay');
    var message = block.querySelector('.player-message');
    var stream = block.getAttribute('data-stream');
    var attached = false;
    var hlsInstance = null;

    function showMessage(text) {
      if (message) {
        message.textContent = text || '';
      }
    }

    function attachStream() {
      if (attached || !video || !stream) {
        return;
      }
      attached = true;
      showMessage('');

      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = stream;
        return;
      }

      if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true,
          backBufferLength: 60
        });
        hlsInstance.loadSource(stream);
        hlsInstance.attachMedia(video);
        hlsInstance.on(window.Hls.Events.ERROR, function (event, data) {
          if (!data || !data.fatal) {
            return;
          }
          if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
            hlsInstance.startLoad();
            return;
          }
          if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
            hlsInstance.recoverMediaError();
            return;
          }
          showMessage('播放暂时遇到问题，请稍后重试');
          hlsInstance.destroy();
        });
        return;
      }

      video.src = stream;
    }

    function startPlayback() {
      attachStream();
      if (overlay) {
        overlay.classList.add('is-hidden');
      }
      if (video) {
        var playPromise = video.play();
        if (playPromise && typeof playPromise.catch === 'function') {
          playPromise.catch(function () {
            if (overlay) {
              overlay.classList.remove('is-hidden');
            }
          });
        }
      }
    }

    if (overlay) {
      overlay.addEventListener('click', startPlayback);
    }

    if (video) {
      video.addEventListener('play', function () {
        if (overlay) {
          overlay.classList.add('is-hidden');
        }
      });
      video.addEventListener('pause', function () {
        if (overlay && video.currentTime === 0) {
          overlay.classList.remove('is-hidden');
        }
      });
    }

    window.addEventListener('pagehide', function () {
      if (hlsInstance) {
        hlsInstance.destroy();
      }
    });
  });
})();
