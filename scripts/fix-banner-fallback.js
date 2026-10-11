// banner：注入随机图库脚本，每次加载页面时从爬取的 76 张图中完全随机挑选。
// 图片加载失败时回退到本地默认 banner。
hexo.extend.filter.register('after_render:html', function (data) {
  data = data.replace(
    /<img(?![^>]*onerror)([^>]*dmoe\.cc[^>]*)>/g,
    '<img onerror="this.onerror=null;this.src=\'/images/banner.webp\'"$1>'
  );
  if (data.indexOf('banner-gallery.js') < 0 && data.indexOf('</body>') >= 0) {
    data = data.replace('</body>', '<script src="/js/banner-gallery.js"></script></body>');
  }
  return data;
});
