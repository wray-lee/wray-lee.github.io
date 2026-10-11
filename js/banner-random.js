// 随机 banner：每次页面加载时给 dmoe.cc/random.php 加时间戳参数，
// 绕过浏览器缓存，确保每次都是新图。同时保留加载失败回退。
(function() {
  function randomizeBanner() {
    var imgs = document.querySelectorAll('img[src*="dmoe.cc/random.php"]');
    var t = Date.now() + "_" + Math.floor(Math.random() * 1e9);
    imgs.forEach(function(img) {
      var src = img.getAttribute("src");
      if (!src) return;
      // 去掉旧的时间戳参数，避免叠加
      src = src.replace(/[?&]t=\d+_\d+/g, "");
      var sep = src.indexOf("?") >= 0 ? "&" : "?";
      var newSrc = src + sep + "t=" + t;
      // 只有 src 真的变化时才更新（避免重复触发 load）
      if (img.src !== newSrc) {
        img.setAttribute("src", newSrc);
      }
      // 失败回退到本地默认 banner
      img.onerror = function() {
        img.onerror = null;
        img.src = "/images/banner.webp";
      };
    });
  }
  // DOM 就绪后执行；lazyload 的图片在 data-src，也处理
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", randomizeBanner);
  } else {
    randomizeBanner();
  }
  // 兼容 lazyload：data-src 也加上时间戳
  document.querySelectorAll('img[data-src*="dmoe.cc/random.php"]').forEach(function(img) {
    var ds = img.getAttribute("data-src");
    if (ds && ds.indexOf("t=") < 0) {
      var sep = ds.indexOf("?") >= 0 ? "&" : "?";
      img.setAttribute("data-src", ds + sep + "t=" + Date.now() + "_" + Math.floor(Math.random() * 1e9));
    }
  });
})();
