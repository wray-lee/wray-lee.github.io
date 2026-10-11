// 修复粗体不渲染：CommonMark 的 flanking 规则下，** 外侧紧邻文字、内侧紧邻标点时
// （如 按**用户数（会话数）**算、**“筛选”**的）整段粗体失效，页面露出字面量 **。
// 中文全角标点很常见，笔记和译文里大量命中。渲染前把这类失效的 **…** 换成 <strong>，
// 源文件不动（不影响翻译 manifest），所有语言版本统一生效。

function fixLine(line) {
  // 一对失效还会让后面的 ** 配错对，按上下文判断不可靠；**…** 一律换成 <strong>，
  // 本来就正常的渲染结果相同。行内代码换成占位符（粗体里可能包着代码），避免误改
  const codes = [];
  return line
    .replace(/`[^`\n]*`/g, (c) => `\0${codes.push(c) - 1}\0`)
    // 两端的 * 都不能是 \* 转义（如 ***标题？\***）
    .replace(/(?<!\\)\*\*([^*\n]*?[^*\n\\])\*\*/g, '<strong>$1</strong>')
    .replace(/\0(\d+)\0/g, (_, i) => codes[i]);
}

function fixBold(text) {
  // 跳过围栏代码块和缩进代码行
  return text.split(/(^(?:```|~~~)[\s\S]*?^(?:```|~~~))/m).map((p, i) =>
    i % 2 ? p : p.split('\n').map((l) => (/^( {4}|\t)/.test(l) ? l : fixLine(l))).join('\n')
  ).join('');
}

if (typeof hexo !== 'undefined') {
  hexo.extend.filter.register('before_post_render', (data) => {
    if (data.content && data.content.includes('**')) data.content = fixBold(data.content);
    return data;
  }, 9); // 早于 backtick_code_block（10），此时围栏代码块仍是原文
} else {
  // 自检：bun scripts/fix-bold.js
  const assert = require('assert');
  assert.strictEqual(fixBold('按**连接用户数（会话数）**算'), '按<strong>连接用户数（会话数）</strong>算');
  assert.strictEqual(fixBold('`a**（b）**c` 不动'), '`a**（b）**c` 不动');
  assert.strictEqual(fixBold('| **`W2S` (手写)** |'), '| <strong>`W2S` (手写)</strong> |');
  assert.strictEqual(fixBold('***Tracker 是什么？\\***'), '***Tracker 是什么？\\***');
  assert.strictEqual(fixBold('\\**x**'), '\\**x**');
  assert.strictEqual(fixBold('```\nx**（y）**z\n```'), '```\nx**（y）**z\n```');
  assert.strictEqual(fixBold('1. **注册接口：**注册全部'), '1. <strong>注册接口：</strong>注册全部');
  assert.strictEqual(fixBold('基于**工程学（SE）**视角，严密的**“筛选”（熵）和“架构”**（防崩溃）'),
    '基于<strong>工程学（SE）</strong>视角，严密的<strong>“筛选”（熵）和“架构”</strong>（防崩溃）');
  console.log('ok');
}
