const videoModal = document.querySelector("#videoModal");
const videoFrame = document.querySelector("#teamVideoFrame");
const videoButtons = document.querySelectorAll(".video-button[data-video-id]");
const closeButtons = document.querySelectorAll("[data-video-close]");
const expandButton = document.querySelector("[data-video-expand]");

if (videoModal && videoFrame && expandButton) {
  function buildEmbedUrl(button) {
    const videoId = button.dataset.videoId;
    const start = button.dataset.videoStart;
    const end = button.dataset.videoEnd;
    const query = new URLSearchParams({
      start,
      end,
      autoplay: "1",
      rel: "0"
    });

    return `https://www.youtube.com/embed/${videoId}?${query.toString()}`;
  }

  function openVideo(button) {
    videoFrame.src = buildEmbedUrl(button);
    videoModal.classList.add("is-open");
    videoModal.setAttribute("aria-hidden", "false");
  }

  function closeVideo() {
    videoFrame.src = "";
    videoModal.classList.remove("is-open", "is-expanded");
    videoModal.setAttribute("aria-hidden", "true");
  }

  function toggleExpandedVideo() {
    videoModal.classList.toggle("is-expanded");
    expandButton.textContent = videoModal.classList.contains("is-expanded") ? "Shrink" : "Expand";
  }

  videoButtons.forEach((button) => {
    button.addEventListener("click", () => openVideo(button));
  });

  closeButtons.forEach((button) => {
    button.addEventListener("click", closeVideo);
  });

  expandButton.addEventListener("click", toggleExpandedVideo);

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && videoModal.classList.contains("is-open")) {
      closeVideo();
    }
  });
}
