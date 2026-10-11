// 缓存击穿：Cloudflare 对 /css、/js 缓存 4 小时且 URL 不变，部署后会继续返回旧文件。
// 给本站 css/js 链接加 ?v=构建时间，每次部署 URL 都变。priority 20 晚于默认 10，覆盖其他 filter 注入的脚本。
var v = Date.now().toString(36);
hexo.extend.filter.register('after_render:html', function (data) {
  return data.replace(/((?:href|src)="?\/(?:css|js)\/[^"\s>?]+\.(?:css|js))(?=["\s>])/g, '$1?v=' + v);
}, 20);
