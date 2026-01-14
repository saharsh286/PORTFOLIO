(function () {
  const settings = window.__BACK_TO_TOP_SETTINGS__ || {
    enabled: true,
    position: "bottom-right",
    color: "#000",
  };

  if (!settings.enabled) return;

  function init() {
    const btn = document.getElementById("back-to-top-btn");
    if (!btn) return;

    // Apply styles from settings
    btn.style.background = settings.color || "#000";

    if (settings.position === "bottom-left") {
      btn.style.left = "20px";
      btn.style.right = "auto";
    } else {
      btn.style.right = "20px";
      btn.style.left = "auto";
    }

    // Show / hide on scroll
    window.addEventListener("scroll", function () {
      if (window.scrollY > 200) btn.style.display = "block";
      else btn.style.display = "none";
    });

    // Scroll to top
    btn.addEventListener("click", function () {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
