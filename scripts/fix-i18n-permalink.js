// 多语言：译文 xxx.en.md / xxx.ja.md 的 :title 取自文件名，带 .en/.ja 后缀，和中文原文 permalink 对不上，
// 主题按 permalink 配对译文，配不上就把中文正文挂到 /en/、/ja/ 下（切换语言正文不变）。
// 在默认 post_permalink（priority 10）之后去掉末尾的语言后缀，让译文与原文同 permalink。
hexo.extend.filter.register('post_permalink', function (permalink) {
  var langs = (hexo.theme.config.i18n && hexo.theme.config.i18n.languages) || [];
  if (!langs.length) return permalink;
  return permalink.replace(new RegExp('\\.(' + langs.join('|') + ')/$'), '/');
}, 11);
