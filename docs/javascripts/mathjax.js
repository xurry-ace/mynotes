/* MathJax 3 配置：配合 pymdownx.arithmatex 的 generic 模式使用。 */
window.MathJax = {
  tex: {
    inlineMath: [["\\(", "\\)"]],
    displayMath: [["\\[", "\\]"]],
    processEscapes: true,
    processEnvironments: true
  },
  options: {
    ignoreHtmlClass: ".*|",
    processHtmlClass: "arithmatex"
  }
};

/* Material 的 document$ 在每次页面内容就绪后触发。 */
if (typeof document$ !== "undefined") {
  document$.subscribe(() => {
    if (!window.MathJax || !MathJax.startup) return;
    MathJax.startup.output.clearCache();
    MathJax.typesetClear();
    MathJax.texReset();
    MathJax.typesetPromise();
  });
}
