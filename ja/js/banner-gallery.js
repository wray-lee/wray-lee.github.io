// 在线随机东方图：paulzzh 东方随机图 API（图源 konachan.net 全年龄区，均带 touhou 标签）
// 每个 banner 位各取一张，同页按 md5 去重，按标签过滤不适合公开展示的图；
// 接口失败则保留构建时的占位图（主题默认 banner，灵梦）
(function() {
  var API = "https://img.paulzzh.com/touhou/random?type=json&size=pc";
  var BAD = /\b(nude|naked|nipples|breasts|cleavage|underwear|panties|pantsu|bra|bikini|swimsuit|bloomers|loli|blood|guro|ass|topless|bottomless|censored|lingerie|bondage)\b/;
  var seen = {};

  function fetchOne(tries) {
    return fetch(API + "&_=" + Math.random(), { cache: "no-store" })
      .then(function(r) { return r.json(); })
      .then(function(j) {
        if (seen[j.md5] || BAD.test(j.tags || "")) {
          if (tries > 1) return fetchOne(tries - 1);
          throw new Error("no suitable image");
        }
        seen[j.md5] = true;
        return "https://img.paulzzh.com/touhou/webp/" + j.md5.slice(0, 2) + "/" + j.md5 + ".webp";
      });
  }

  function apply() {
    // 标记由 scripts/fix-banner-fallback.js 在构建时添加（含失败回退）
    document.querySelectorAll('img[data-random-banner]').forEach(function(img) {
      fetchOne(3).then(function(url) {
        // lazyload 的 data-src 换掉；已有 src（头图，或 lazysizes 已处理过）也换
        if (img.hasAttribute("data-src")) img.setAttribute("data-src", url);
        if (img.hasAttribute("src")) img.src = url;
      }).catch(function() {});
    });
  }
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", apply);
  } else {
    apply();
  }
})();
