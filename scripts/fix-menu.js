// 修复死链：Hexo deep merge 按索引合并数组，主题默认 menu 中的 friend 在 _config.reimu.yml 里删不掉。
// 在渲染时过滤掉没有对应页面的 friend 菜单项。
hexo.extend.filter.register("template_locals", function (locals) {
  const theme = locals && locals.theme;
  if (theme && Array.isArray(theme.menu)) {
    theme.menu = theme.menu.filter(item => item && item.name !== "friend");
  }
  return locals;
});