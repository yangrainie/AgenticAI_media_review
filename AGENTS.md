# AGENTS.md - Personal Media & Reading Vault 專案開發與維護指引

## 1. 專案目的 (Project Purpose)
旨在建置一個個人專屬的「數位影音與閱讀筆記庫」網站。
主要用於個人日常紀錄、日後快速檢索與主題展示。收錄內容涵蓋各種領域與主題的書籍筆記（非小說、文學、技術新知、生活隨筆等種類），以及影視作品與 Podcast 劇集的觀後心得、經典金句、內容精華與重點筆記。

---

## 2. 網頁整體風格 (UI / UX Style) - 初版
- **初版基調與元件配置**:
  * 採用簡約乾淨的展示介面，確保文字與卡片的可讀性。
  * 卡片式佈局（Card-based Grid）展示不同作品。
  * 點選卡片時以彈窗（Modal）展示筆記細節。
  * 提供基本的標籤（Tags）篩選與關鍵字搜尋功能，方便日後檢索。

---

## 3. 頁面結構與專案檔案架構 (Page & Project Structure)

### 頁面區塊設計
1. **頂部導覽與檢索欄**: 網站標題、類別篩選（全部 / 書籍 / 影視 / Podcast）、關鍵字搜尋框。
2. **主要展示區**: 展示符合條件的作品卡片（含封面/主題色背景、標題、作者/導演/講者、評分、標籤）。
3. **筆記詳情頁/彈窗**: 展示完整 YAML 資訊、經典金句、核心摘要與詳細觀後感；Podcast 類別則渲染完整 Markdown 筆記。

### 檔案目錄架構
media-vault/
├── .gitignore              # Git 忽略檔案設定
├── AGENTS.md               # 專案 AI 協作與規範指引
├── index.html              # 網站主頁面（HTML，已引入 marked.js）
├── data.json               # 轉檔輸出檔（由 build_data.py 自動生成）
├── assets/
│   ├── css/
│   │   └── style.css       # 網頁視覺樣式（包含 Podcast 子類別主題配色）
│   ├── js/
│   │   └── main.js         # 互動邏輯（卡片渲染、標籤篩選、彈窗分流控制）
│   └── covers/             # 書籍與影視封面圖片
├── content/                # 筆記資料庫 (Markdown 檔)
│   ├── books/
│   ├── movies/
│   └── podcasts/
└── scripts/
    └── build_data.py       # Python 腳本（將 Markdown 轉成 data.json，含內文 content 抓取）

---

## 4. 新增內容時要遵守的格式 (Content Standard)

所有新增的 Markdown 筆記皆需包含 YAML Frontmatter 資訊與統一的內文結構。

### 欄位詳細說明
- `title`: (string) 作品或書籍名稱
- `category`: (string) 可選值: `book` | `movie` | `podcast`
- `author_or_director`: (string) 作者、導演或 Podcast 節目名稱/講者
- `rating`: (number) 評分範圍 1 - 5
- `tags`: (array) 主題標籤陣列（建議優先選用現有標籤，如 `["科技", "文學", "心理學", "個人成長", "動漫", "影視", "理財", "運動", "旅遊"]`）
- `cover_image`: (string) 封面圖片路徑
  - `book` / `movie`: 必須指定為 `assets/covers/圖片檔名.jpg`
  - `podcast`: 預設填寫空字串 `""`
- `color`: (string, 選用) 僅 Podcast 使用，標記主題 Hex Code (如 `#3B82F6` 科技藍、`#10B981` 隨筆綠)
- `date_added`: (string) 建檔日期，格式為 `YYYY-MM-DD`

### 邊界與限制 (Constraints)
- **檔名限制**：圖片與 Markdown 檔名一律使用小寫英文與連字號/底線（例如 `switch.md`），**嚴禁使用中文或空白**。
- **欄位邊界**：禁止 AI 自創非標準 YAML 欄位，若有缺失欄位一律給予標準預設值。

### 內文結構規範
1. **首行**：使用引用語法 `> 「經典金句或印象最深刻的一句話」`
2. **區塊**：必須包含 `## 核心摘要` 與 `## 觀後心得與推薦` 兩個 H2 標題區塊（Podcast 類別可彈性替換為 `## 重點筆記與觀點`）

### 範例：書籍與影視 (`book` / `movie`)

---
title: "作品名稱"
category: "book"
author_or_director: "作者名稱"
rating: 5
tags: ["心理學", "個人成長"]
cover_image: "assets/covers/example.jpg"
date_added: "2026-11-06"
---

> 「經典金句或最印象深刻的一句話。」

## 核心摘要
簡述本書或作品的核心觀點、故事主線或主要概念。

## 觀後心得與推薦
個人閱讀/觀賞後的詳細心得、啟發，以及適合回顧或推薦的對象。

---

## 5. 新增內容的工作流程與 AI 協作規範 (Workflow SOP)

### 步驟 A：Gemini 內容生成 SOP
1. **輸入**：使用者提供原始影視、書籍或 Podcast 資訊（名稱、作者/頻道、評分、心得、金句重點）。
2. **生成**：Gemini 依據 **「第 4 節格式規範」** 將內容格式化為標準 Markdown 程式碼區塊。
3. **檔名建議**：Gemini 需於輸出末尾提供建議檔名（使用小寫英文與底線，如 `the_namiya_store.md`，不可包含中文）。

### 步驟 B：圖片資產放置 (Asset Management)
1. **放置資料夾**：若為 `book` 或 `movie`，將下載好的封面圖片放置於 `assets/covers/` 資料夾內。
2. **檔名對齊**：確認圖片檔名與 `.md` 檔內 `cover_image` 的路徑完全一致（例如 `assets/covers/barbie.jpg`）。
3. **規格建議**：建議採用 2:3 直式比例圖片檔，防止前台卡片顯示變形。

### 步驟 C：本地檔案建立與轉檔
1. 在 VS Code 的 `content/books/`、`content/movies/` 或 `content/podcasts/` 下建立對應 `.md` 檔案並貼上內容。
2. 開啟終端機執行 `python scripts/build_data.py` 更新 `data.json`。
3. 使用 Live Server 預覽 `index.html` 驗證卡片與彈窗顯示。

---

## 6. 部署與版本控制指引 (Deployment & Version Control)

本專案透過 GitHub Pages 進行公開 Hosting 自動發布。

### 內容更新與上線三連指令
每次新增或修改筆記、並執行 `python scripts/build_data.py` 生成最新 `data.json` 後，請在終端機依序執行以下命令完成同步與線上發布：

```bash
git add .
git commit -m "content: Document your changes"
git push