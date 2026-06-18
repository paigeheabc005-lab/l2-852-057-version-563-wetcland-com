(function () {
  function ready(callback) {
    if (document.readyState !== 'loading') {
      callback();
      return;
    }

    document.addEventListener('DOMContentLoaded', callback);
  }

  ready(function () {
    var video = document.querySelector('[data-hls-player]');
    var status = document.querySelector('[data-player-status]');
    var playButtons = Array.prototype.slice.call(document.querySelectorAll('[data-play-now]'));

    if (!video) {
      return;
    }

    var src = video.getAttribute('data-src');
    var frame = video.closest('.video-frame');

    function setStatus(message) {
      if (status) {
        status.textContent = message;
      }
    }

    function setPlayingState(isPlaying) {
      if (frame) {
        frame.classList.toggle('is-playing', isPlaying);
      }
    }

    video.addEventListener('play', function () {
      setPlayingState(true);
      setStatus('正在播放');
    });

    video.addEventListener('pause', function () {
      setPlayingState(false);
      setStatus('已暂停');
    });

    video.addEventListener('error', function () {
      setStatus('视频加载失败，请检查播放源或网络连接');
    });

    playButtons.forEach(function (button) {
      button.addEventListener('click', function () {
        video.scrollIntoView({ behavior: 'smooth', block: 'center' });
        video.play().catch(function () {
          setStatus('浏览器阻止了自动播放，请在播放器中再次点击播放');
        });
      });
    });

    initializeHls(video, src, setStatus);
  });

  async function initializeHls(video, src, setStatus) {
    if (!src) {
      setStatus('未找到播放源');
      return;
    }

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = src;
      video.controls = true;
      setStatus('播放源已就绪');
      return;
    }

    var HlsClass = await loadHlsClass();

    if (!HlsClass || !HlsClass.isSupported()) {
      setStatus('当前浏览器不支持 HLS 播放');
      return;
    }

    var hls = new HlsClass({
      enableWorker: true,
      lowLatencyMode: false
    });

    hls.loadSource(src);
    hls.attachMedia(video);
    video.controls = true;

    hls.on(HlsClass.Events.MANIFEST_PARSED, function () {
      setStatus('播放源已就绪');
    });

    hls.on(HlsClass.Events.ERROR, function (_, data) {
      if (!data || !data.fatal) {
        return;
      }

      if (data.type === HlsClass.ErrorTypes.NETWORK_ERROR) {
        setStatus('网络错误，正在尝试重新加载');
        hls.startLoad();
        return;
      }

      if (data.type === HlsClass.ErrorTypes.MEDIA_ERROR) {
        setStatus('媒体错误，正在尝试恢复');
        hls.recoverMediaError();
        return;
      }

      setStatus('无法播放视频');
      hls.destroy();
    });
  }

  async function loadHlsClass() {
    if (window.Hls) {
      return window.Hls;
    }

    try {
      var currentScript = document.querySelector('script[src$="player.js"]');
      var moduleUrl = new URL('hls-dru42stk.js', currentScript ? currentScript.src : window.location.href).href;
      var module = await import(moduleUrl);
      return module.H;
    } catch (error) {
      return null;
    }
  }
})();
