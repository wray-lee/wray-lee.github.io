// banner 容灾：如果随机图 API 挂了，图片加载失败时回退到主题自带默认 banner，
// 避免全站装饰图位大面积裂图。
hexo.extend.filter.register('after_render:html', function (data) {
  return data.replace(
    /<img(?![^>]*onerror)([^>]*www\.dmoe\.cc\/random\.php[^>]*)>/g,
    '<img onerror="this.onerror=null;this.src=\'/images/banner.webp\'"$1>'
  );
});
