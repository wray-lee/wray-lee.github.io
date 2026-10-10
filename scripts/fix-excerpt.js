// 修复主题首页摘要双重转义 bug：
// layout/_partial/post/summary.ejs 用 <%= stripHtml(post.excerpt) %> 输出，
// 已转义一次的实体（如 &amp;）会被 EJS 再次转义成 &amp;amp;，
// 导致首页摘要里出现字面量的 &gt; &#x27; 等。
// 这里把摘要块内的双重转义还原，等价于模板使用 <%- %> 时的正确输出。
// （直接改 node_modules 会在重装时丢失，故用 Hexo filter 在站点侧修复。）
hexo.extend.filter.register('after_render:html', function (data) {
  return data.replace(/<blockquote class="article-summary"[\s\S]*?<\/blockquote>/g, (block) =>
    block.replace(/&amp;([a-zA-Z]+|#\d+|#x[0-9a-fA-F]+);/g, (m, ent) => `&${ent};`)
  );
});
