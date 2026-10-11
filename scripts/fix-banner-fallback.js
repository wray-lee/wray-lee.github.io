// banner：给使用默认 banner 占位的 <img> 打标记，并注入随机图库脚本，每次加载页面时随机替换。
// 加载失败回退到默认 banner。
hexo.extend.filter.register('after_render:html', function (data) {
  data = data.replace(
    /<img(?![^>]*data-random-banner)([^>]*\/images\/banner\.webp"[^>]*)>/g,
    '<img data-random-banner onerror="this.onerror=null;this.src=\'/images/banner.webp\'"$1>'
  );
  if (data.indexOf('banner-gallery.js') < 0 && data.indexOf('</body>') >= 0) {
    data = data.replace('</body>', '<script src="/js/banner-gallery.js"></script></body>');
  }
  return data;
});
