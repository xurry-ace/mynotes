/* MathJax 3 配置：配合 pymdownx.arithmatex 的 generic 模式使用，仅在页面含公式时按需加载。 */
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

function renderOrLoadMathJax() {
  if (!document.querySelector(".arithmatex")) return;

  if (window.MathJax && MathJax.startup && MathJax.typesetPromise) {
    MathJax.startup.output.clearCache();
    MathJax.typesetClear();
    MathJax.texReset();
    MathJax.typesetPromise();
    return;
  }

  if (document.getElementById("mathjax-script")) return;
  const script = document.createElement("script");
  script.id = "mathjax-script";
  script.src = "https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-mml-chtml.js";
  script.async = true;
  document.head.appendChild(script);
}

/* Material 的 document$ 在每次页面内容就绪后触发。 */
if (typeof document$ !== "undefined") {
  document$.subscribe(renderOrLoadMathJax);
} else if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", renderOrLoadMathJax);
} else {
  renderOrLoadMathJax();
}
