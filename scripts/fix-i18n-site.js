// 主题的多语言只覆盖文章/页面，站点级文案（_config.yml 的 title/subtitle/description）
// 在 /en/、/ja/ 下仍是中文。这里按输出页面的 <html lang> 替换这几处固定文案。
// 这三个字符串不出现在正文里（已确认），所以整页替换是安全的。
var STRINGS = {
  "zh-CN": {},
  en: {
    "Wray的Blog": "Wray's Blog",
    "技术笔记与折腾记录": "Tech notes &amp; tinkering logs",
    "Wray Lee 的技术笔记：折腾、备忘与学习记录":
      "Wray Lee's tech notes: tinkering, cheatsheets and study logs",
  },
  ja: {
    "Wray的Blog": "Wrayのブログ",
    "技术笔记与折腾记录": "技術メモと改造記録",
    "Wray Lee 的技术笔记：折腾、备忘与学习记录":
      "Wray Lee の技術メモ：改造・備忘・学習の記録",
  },
};

hexo.extend.filter.register('after_render:html', function (data) {
  var m = data.match(/<html[^>]*\blang="([^"]+)"/);
  var map = m && STRINGS[m[1]];
  if (!map || !Object.keys(map).length) return data; // 默认语言（zh-CN）不改
  Object.keys(map).forEach(function (from) {
    data = data.split(from).join(map[from]);
  });
  // 页头 RSS 按钮与 <link rel="alternate"> 指向该语言自己的 feed（见下方 atom 生成器）
  return data.split('href="/atom.xml"').join('href="/' + m[1] + '/atom.xml"');
}, 20);

// RSS（hexo-generator-feed）按语言分开输出：/atom.xml 只收中文原文，/en/atom.xml、/ja/atom.xml 收对应译文。
// 插件默认把三种语言的同一篇文章塞进同一个 feed（订阅后每篇出现三次），且译文 permalink 不带 /en/ 前缀。
// scripts/ 在插件之后加载，这里用同名注册覆盖插件的 'atom' 生成器。
var feedFn = require('hexo-generator-feed/lib/generator');
hexo.extend.generator.register('atom', function (locals) {
  var cfg = hexo.config;
  var langs = (hexo.theme.config.i18n && hexo.theme.config.i18n.languages) || [cfg.language];
  var root = cfg.url.replace(/\/$/, '');
  return langs.map(function (lang, i) {
    var isDefault = i === 0;
    var t = STRINGS[lang] || {};
    // 生成器只读 this.config 上的站点信息；url 带语言前缀后，feed 自身链接与首页链接随之正确
    var ctx = Object.create(hexo);
    ctx.config = Object.assign({}, cfg, {
      url: isDefault ? cfg.url : root + '/' + lang,
      title: (t[cfg.title] || cfg.title).replace('&amp;', '&'),
      subtitle: (t[cfg.subtitle] || cfg.subtitle).replace('&amp;', '&'),
      description: t[cfg.description] || cfg.description,
      language: lang,
    });
    var posts = locals.posts.filter(function (p) { return isDefault ? !p.lang : p.lang === lang; });
    // 传 'atom.xml' 让 self 链接 = 带前缀的 url + atom.xml，输出路径再改成 <lang>/atom.xml
    var out = feedFn.call(ctx, { posts: posts }, 'atom', 'atom.xml');
    if (out && !isDefault) {
      out.path = lang + '/atom.xml';
      // 条目链接（<id>、href/scheme 属性；permalink 与原文相同）补上语言前缀；
      // 只改属性/id，不碰正文里引用本站的链接；已带前缀的（feed 自身、首页）不重复加
      out.data = out.data.replace(
        new RegExp('(<id>|href="|scheme=")' + root.replace(/\./g, '\\.') + '/(?!' + lang + '/)', 'g'),
        '$1' + root + '/' + lang + '/'
      );
    }
    return out;
  }).filter(Boolean);
});
