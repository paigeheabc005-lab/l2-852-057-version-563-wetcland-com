(function () {
    function ready(callback) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", callback);
        } else {
            callback();
        }
    }

    ready(function () {
        document.querySelectorAll("[data-player]").forEach(function (player) {
            var video = player.querySelector("video");
            var cover = player.querySelector(".player-cover");
            var message = player.querySelector("[data-player-message]");
            var stream = video ? video.getAttribute("data-stream") : "";
            var attached = false;
            var hls = null;

            function showMessage(text) {
                if (!message) {
                    return;
                }
                message.textContent = text;
                message.classList.add("is-visible");
            }

            function attachStream() {
                if (!video || !stream || attached) {
                    return;
                }
                attached = true;

                if (window.Hls && window.Hls.isSupported()) {
                    hls = new window.Hls({
                        enableWorker: true,
                        lowLatencyMode: true
                    });
                    hls.loadSource(stream);
                    hls.attachMedia(video);
                    hls.on(window.Hls.Events.ERROR, function (event, data) {
                        if (!data || !data.fatal) {
                            return;
                        }
                        if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
                            hls.startLoad();
                        } else if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
                            hls.recoverMediaError();
                        } else {
                            showMessage("播放暂时不可用，请稍后重试");
                            hls.destroy();
                        }
                    });
                } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
                    video.src = stream;
                } else {
                    showMessage("播放暂时不可用，请稍后重试");
                }
            }

            function beginPlayback() {
                attachStream();
                if (cover) {
                    cover.classList.add("is-hidden");
                }
                if (video) {
                    video.controls = true;
                    var playResult = video.play();
                    if (playResult && typeof playResult.catch === "function") {
                        playResult.catch(function () {
                            if (cover) {
                                cover.classList.remove("is-hidden");
                            }
                        });
                    }
                }
            }

            if (cover) {
                cover.addEventListener("click", beginPlayback);
            }

            if (video) {
                video.addEventListener("click", function () {
                    if (!attached) {
                        beginPlayback();
                    }
                }, { once: true });
            }

            window.addEventListener("beforeunload", function () {
                if (hls) {
                    hls.destroy();
                }
            });
        });
    });
})();
