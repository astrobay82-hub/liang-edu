# 梁雅淳醫師｜婦兒中醫衛教專欄

靜態網站，推送到 `main` 後由 Cloudflare Worker（liang-edu-github）自動部署到 https://liang.ialdsm.com

## 結構
- `index.html` 首頁（分類、搜尋、收藏；只載入約 60KB 的文章索引）
- `a/<ID>.html` 每篇文章的獨立網址，例如 `/a/S01-01`
- `doctor.html` 醫師介紹、門診、連結；`notes.html` 看診手記 50 篇
- `cards/<ID>.jpg` 自動產生的衛教圖卡（1080×1350）
- `cards/nlm/<ID>.png` 放 NotebookLM 資訊圖表，重新產生後該篇自動改用這張
- `sitemap.xml`、`robots.txt`

## 修改內容
1. 編輯 `_build/themes_final.json`（文章）或 `_build/refs.py`（參考資料）
2. `cd _build && python3 build_site.py && python3 build_cards.py`（需 Playwright）
3. commit + push
