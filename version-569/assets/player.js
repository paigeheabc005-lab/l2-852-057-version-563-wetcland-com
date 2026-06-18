(function () {
    function ready(callback) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", callback);
        } else {
            callback();
        }
    }

    function setupPlayer(root) {
        var video = root.querySelector("video");
        var trigger = root.querySelector(".play-cover");
        var streamUrl = root.getAttribute("data-stream");
        var hlsInstance = null;

        function attachStream() {
            if (!video || !streamUrl || video.dataset.ready === "1") {
                return;
            }

            if (window.Hls && window.Hls.isSupported()) {
                hlsInstance = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                hlsInstance.loadSource(streamUrl);
                hlsInstance.attachMedia(video);
                root._hlsInstance = hlsInstance;
            } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = streamUrl;
            } else {
                video.src = streamUrl;
            }

            video.dataset.ready = "1";
        }

        function playVideo() {
            attachStream();
            if (!video) {
                return;
            }
            video.controls = true;
            root.classList.add("is-playing");
            var promise = video.play();
            if (promise && typeof promise.catch === "function") {
                promise.catch(function () {
                    root.classList.remove("is-playing");
                    video.controls = true;
                });
            }
        }

        if (trigger) {
            trigger.addEventListener("click", playVideo);
        }
        if (video) {
            video.addEventListener("click", function () {
                if (video.paused) {
                    playVideo();
                }
            });
            video.addEventListener("play", function () {
                root.classList.add("is-playing");
            });
            video.addEventListener("pause", function () {
                if (!video.ended) {
                    root.classList.remove("is-playing");
                }
            });
        }
    }

    ready(function () {
        Array.prototype.slice.call(document.querySelectorAll(".video-shell")).forEach(setupPlayer);
    });
})();
