// banner 容灾 + 随机化：
// 1. 给所有 dmoe.cc/random.php 图片加 onerror 回退到本地默认 banner；
// 2. 注入 /js/banner-random.js，每次加载页面时给随机图 URL 加时间戳，绕过浏览器缓存。
hexo.extend.filter.register('after_render:html', function (data) {
  // 1. onerror 回退（只加一次）
  data = data.replace(
    /<img(?![^>]*onerror)([^>]*www\.dmoe\.cc\/random\.php[^>]*)>/g,
    '<img onerror="this.onerror=null;this.src=\'/images/banner.webp\'"$1>'
  );
  // 2. 注入随机化脚本（只加一次）
  if (data.indexOf('banner-random.js') < 0 && data.indexOf('</body>') >= 0) {
    data = data.replace('</body>', '<script src="/js/banner-random.js"></script></body>');
  }
  return data;
});
