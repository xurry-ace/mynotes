"""自拟二维数据的 PCA / Fisher 投影图。仅生成图片，不是站点运行依赖。

依赖 numpy、matplotlib；在项目根目录运行本文件即可重新导出 SVG。
"""
from pathlib import Path
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
from matplotlib.patches import ConnectionPatch
import numpy as np

ROOT = Path(__file__).resolve().parents[2]
OUT = ROOT / "docs/assets/diagrams/模式识别"
OUT.mkdir(parents=True, exist_ok=True)
plt.rcParams.update({"font.family": "DejaVu Sans", "font.size": 14,
                     "svg.hashsalt": "mynote-projection-example", "axes.spines.top": False,
                     "axes.spines.right": False, "axes.labelcolor": "#264745",
                     "text.color": "#264745", "xtick.color": "#526865", "ytick.color": "#526865"})
A = np.array([[-3, .8], [-1, 1.2], [1, 1.2], [3, .8]])
B = np.array([[-3, -.8], [-1, -1.2], [1, -1.2], [3, -.8]])
X = np.vstack([A, B])
cov = np.cov(X, rowvar=False, bias=True)
eigenvalues, eigenvectors = np.linalg.eigh(cov)
assert np.allclose(cov, [[5, 0], [0, 1.04]])
assert np.allclose(abs(eigenvectors[:, -1]), [1, 0])
sw = (A - A.mean(0)).T @ (A - A.mean(0)) + (B - B.mean(0)).T @ (B - B.mean(0))
fisher = np.linalg.solve(sw, A.mean(0) - B.mean(0))
assert np.allclose(fisher / np.linalg.norm(fisher), [0, 1])

COLORS = ["#b65d3a", "#096e69"]
MARKERS = ["o", "D"]

def base(ax):
    ax.set_facecolor("#fcfcf7")
    ax.set_xlim(-4, 4)
    ax.set_ylim(-1.8, 1.8)
    ax.set_xticks([-3, -1, 1, 3])
    ax.set_yticks([-1, 0, 1])
    ax.grid(alpha=.17)
    ax.set_ylabel("Feature x2")
    for data, color, marker, label in zip([A, B], COLORS, MARKERS, ["Class A", "Class B"]):
        ax.scatter(data[:, 0], data[:, 1], color=color, marker=marker, s=70, zorder=5, label=label)
    ax.legend(loc="upper center", bbox_to_anchor=(.5, 1.25), ncol=2, frameon=False)

for kind in ["pca", "fisher"]:
    fig = plt.figure(figsize=(4.6, 4.3), facecolor="#fcfcf7")
    if kind == "pca":
        ax = fig.add_axes([.16, .40, .78, .43]); base(ax)
        ax.set_xticklabels([])
        projection = fig.add_axes([.16, .17, .78, .11])
        projection.set_xlim(-4, 4); projection.set_ylim(-1, 1)
        projection.set_xticks([-3, -1, 1, 3]); projection.set_yticks([])
        projection.spines["left"].set_visible(False)
        projection.spines["bottom"].set_position("zero")
        projection.set_xlabel("Projection on x1", labelpad=14)
        for data, color, marker in zip([A, B], COLORS, MARKERS):
            projection.scatter(data[:, 0], np.zeros(4), s=85, facecolors="none" if marker == "D" else color,
                               edgecolors=color, marker=marker, zorder=5)
            for x, y in data:
                fig.add_artist(ConnectionPatch((x, y), (x, 0), coordsA=ax.transData, coordsB=projection.transData,
                                               color=color, alpha=.23, linestyle="--", linewidth=.8, zorder=1))
    else:
        ax = fig.add_axes([.16, .19, .56, .64]); base(ax)
        ax.set_xlabel("Feature x1")
        projection = fig.add_axes([.83, .19, .07, .64])
        projection.set_xlim(-1, 1); projection.set_ylim(-1.8, 1.8)
        projection.set_xticks([]); projection.set_yticks([-1, 0, 1])
        projection.spines["bottom"].set_visible(False)
        projection.yaxis.tick_right()
        projection.set_ylabel("Projection on x2", labelpad=10)
        for data, color, marker in zip([A, B], COLORS, MARKERS):
            projection.scatter(np.zeros(4), data[:, 1], color=color, marker=marker, s=70, zorder=5)
            for x, y in data:
                fig.add_artist(ConnectionPatch((x, y), (0, y), coordsA=ax.transData, coordsB=projection.transData,
                                               color=color, alpha=.23, linestyle="--", linewidth=.8, zorder=1))
    projection.set_facecolor("#fcfcf7")
    output = OUT / f"{kind}-projection.svg"
    fig.savefig(output, metadata={"Date": None}, facecolor=fig.get_facecolor())
    # Matplotlib 的路径导出常在行尾留空格；规范化空白，不改动图形数据。
    output.write_text("\n".join(line.rstrip() for line in output.read_text().splitlines()) + "\n")
    plt.close(fig)
print("Verified covariance, principal axis and Fisher direction; exported two SVG figures.")
