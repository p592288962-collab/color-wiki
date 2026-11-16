# Color Wiki 配色百科

繁體中文的靜態配色知識網站，以原生 HTML、CSS、JavaScript 與單一 JSON 資料來源建立。目前收錄 15 組原創配色：自然 4 組、復古 3 組、極簡 4 組、深色 4 組，包含三組冬季靈感配色。無框架、無套件、無外部 API、無資料庫，無須建置即可部署至 GitHub Pages。

## 操作方法

1. 瀏覽配色卡片，閱讀名稱、分類、用途說明與標籤。
2. 選取「自然」「復古」「極簡」「深色」或「全部」切換分類。
3. 在搜尋框輸入名稱、說明、標籤或分類名稱。搜尋不分英文字母大小寫，忽略前後空白；分類與搜尋同時生效。
4. 點擊色塊，複製含 `#` 的大寫 HEX 色碼。若瀏覽器不允許自動複製，提示中會出現可選取的色碼，請手動複製。
5. 使用 Tab 移動焦點，Enter 或空白鍵啟動分類與色塊按鈕。複製結果以即時訊息公告。

## 本機預覽

請使用靜態 HTTP 伺服器，不要直接雙擊 `index.html`。瀏覽器在 `file://` 下可能禁止讀取 JSON。

若電腦已安裝 Python，在本專案資料夾開啟終端機並執行：

```text
python -m http.server 8000 --bind 127.0.0.1
```

然後開啟 `http://127.0.0.1:8000/`。Python 僅用於開發預覽，不是網站依賴；也可使用編輯器內建的靜態網站預覽功能。複製 API 需要 HTTPS 或瀏覽器認可的 localhost 安全環境，否則網站會提供手動複製方式。

## GitHub Pages 部署

1. 將 `index.html`、`css/`、`js/`、`data/` 與文件上傳到 GitHub 儲存庫的主分支根目錄。
2. 在儲存庫 Settings → Pages，選擇從分支部署，設定主分支與根目錄。
3. 儲存設定後，等待 GitHub 提供網站網址。網站所有檔案使用相對路徑，也適用於含儲存庫名稱的子目錄網址。

本專案已發布至 GitHub Pages。

- 公開 Repository：[p592288962-collab/color-wiki](https://github.com/p592288962-collab/color-wiki)
- 網站：[Color Wiki 配色百科](https://p592288962-collab.github.io/color-wiki/)
- 發布來源：Deploy from a branch → main → / (root)，使用 HTTPS。
- 後續更新：修改或新增檔案並提交至 main，GitHub Pages 會重新部署；請在 Actions 確認部署成功後再驗證網站。
- 部署方式依據 [GitHub 官方說明](https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site)。

## 專案檔案

```text
AGENTS.md             AI 開發規範、JSON 格式及驗證標準
README.md             用途、預覽、操作及部署說明
index.html            語意化頁面與介面骨架
css/style.css         視覺、響應式與可存取樣式
js/main.js            驗證、資料載入、卡片生成、篩選及複製
data/palettes.json    分類與配色的唯一資料來源
test-results.md       本次實際測試結果與限制
```

previews/ 存放本次瀏覽器實際截圖，不是網站執行依賴。

## 新增配色

先完整閱讀 `AGENTS.md`。只需修改 `data/palettes.json`，在 `palettes` 陣列末尾加入一筆包含 `id`、`name`、`category`、`description`、`colors`、`tags` 的資料；色碼須為 3–6 個不重複的大寫六位 HEX，分類須參照既有分類 ID。無須為新配色修改 HTML 或 JavaScript。

新增分類時，在 `categories` 末尾加入唯一英文 ID 與繁體中文名稱。欄位長度、唯一性及完整規則以 `AGENTS.md` 為準。網站會驗證整份資料；資料格式錯誤時停止顯示卡片，並在主控台指出位置。

## 響應式與無障礙

小於 640px 顯示一欄，640–1023px 顯示兩欄，1024px 以上顯示三欄。分類有 `aria-pressed` 狀態、色塊使用可聚焦按鈕，HEX 另以文字呈現，並提供跳至主要內容連結、明確焦點框及減少動態效果設定。

## 原創配色索引

- 自然：`moss-and-mist`、`tidal-postcard`、`apricot-orchard`、`frosted-pine`
- 復古：`vinyl-afternoon`、`jade-cinema`、`plum-letterpress`
- 極簡：`porcelain-notes`、`linen-studio`、`quiet-sage`、`winter-wool`
- 深色：`midnight-observatory`、`ember-workshop`、`afterhours-garden`、`polar-night-glow`

這些配色與敘述是為本作業設計，沒有引用外部配色清單。視覺用途是建議情境；配色本身不保證任意前景、背景搭配皆符合文字對比要求。
