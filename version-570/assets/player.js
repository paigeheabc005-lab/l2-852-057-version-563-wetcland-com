(function () {
  function attachStream(video, streamUrl) {
    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = streamUrl;
      return null;
    }
    if (window.Hls && window.Hls.isSupported()) {
      var hls = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true
      });
      hls.loadSource(streamUrl);
      hls.attachMedia(video);
      return hls;
    }
    video.src = streamUrl;
    return null;
  }

  window.startMoviePlayer = function (videoId, buttonId, streamUrl) {
    var video = document.getElementById(videoId);
    var button = document.getElementById(buttonId);
    if (!video || !button || !streamUrl) return;
    var hls = null;
    var loaded = false;

    function load() {
      if (loaded) return;
      loaded = true;
      hls = attachStream(video, streamUrl);
      video.addEventListener("ended", function () {
        button.classList.remove("is-hidden");
      });
      window.addEventListener("pagehide", function () {
        if (hls && typeof hls.destroy === "function") hls.destroy();
      }, { once: true });
    }

    function play() {
      load();
      button.classList.add("is-hidden");
      var result = video.play();
      if (result && typeof result.catch === "function") {
        result.catch(function () {
          button.classList.remove("is-hidden");
        });
      }
    }

    button.addEventListener("click", play);
    video.addEventListener("click", function () {
      if (video.paused) play();
    });
  };
})();
