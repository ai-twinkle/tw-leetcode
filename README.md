---
license: mit
task_categories:
- text-generation
language:
- en
- zh
tags:
- coding
- code
- leetcode
- zh-tw
- R.O.C
- Taiwan
pretty_name: Traditional Chinese High-Quality LeetCode Solution Dataset
size_categories:
- n<1K
configs:
- config_name: leetcode
  data_files:
  - split: train
    path: "data/datasets.jsonl"
---
# Dataset Card for tw-leetcode

![image/png](https://cdn-uploads.huggingface.co/production/uploads/618dc56cbc345ca7bf95f3cd/3Cwsv5Pfqo_-j5KFG-CFg.png)

<!-- Provide a quick summary of the dataset. -->
A curated Traditional Chinese LeetCode solution dataset with high-efficiency answers (Beats 100%), structured explanation in "Top Concept → Step Implement → Complexity Analysis" style, updated daily.


## Dataset Details

### Dataset Description

<!-- Provide a longer summary of what this dataset is. -->
`tw-leetcode` 是一個針對 LeetCode 題目的繁體中文資料集，內容包含高效能程式解法、完整的解題思路，以及時間與空間複雜度分析。每份題解都經由人工清洗與優化，並依循「**Top Concept → Step Implement → Complexity Explanation**」的結構撰寫，方便機器學習模型或人類讀者理解程式邏輯的推理過程。

本資料集適合作為：
- **程式學習者**參考高可讀性、高效率的程式寫法
- **研究者與開發者**進行 code reasoning、逐步邏輯拆解、auto-solver 的資料訓練來源
- **語言模型訓練**中提供繁體中文技術語境的對應資料

解法會以每日一題的方式持續更新，資料筆數雖然仍在累積中，但內容皆經人工審查與最佳化，適合對品質要求高的應用場景。

- **Curated by:** Ren-Di Wu [LinkedIn](https://www.linkedin.com/in/ren-di-wu-214676295/) & [Hugging Face](https://huggingface.co/whats2000)
- **Shared by:** [Huang Liang Hsun](https://www.linkedin.com/in/lianghsunhuang/?locale=en_US)
- **Language(s) (NLP):** English & Traditional Chinese
- **License:** MIT

### Dataset Sources

<!-- Provide the basic links for the dataset. -->
- **Repository:** [tw-leetcode](https://github.com/ai-twinkle/tw-leetcode#)

## Uses

<!-- Address questions around how the dataset is intended to be used. -->

### Direct Use

<!-- This section describes suitable use cases for the dataset. -->
本資料集適用於以下用途：
- **訓練與評估程式邏輯推理模型**：透過「Top Concept → Step Implement → Complexity Explanation」的結構化說明，有助於模型學習具可解釋性的程式邏輯。
- **用於語言模型（LLM）的微調或持續預訓練**，特別是針對程式碼與技術文本領域，並支援繁體中文語境（zh-Hant）。
- **作為程式教學或線上課程的素材**，可協助學習者以母語理解高效且高可讀性的 LeetCode 題解，並透過 question_code 欄位提供的函數框架進行練習。
- **演算法邏輯與步驟拆解能力的評測基準**：適合用於建立自動解題（auto-solver）或邏輯步驟生成任務的資料來源，question_code 欄位可作為起始程式碼模板。
- **程式碼補全與生成任務**：利用 question_code 提供的函數簽名作為輸入，訓練模型從函數框架生成完整解法。

### Out-of-Scope Use

<!-- This section addresses misuse, malicious use, and uses that the dataset will not work well for. -->
以下用途不建議使用本資料集：
- **一般聊天式語言模型訓練**：內容高度專業且語域狹窄，不適合用於開放式聊天生成任務。
- **與程式無關的一般自然語言生成**：資料皆為解題導向的技術寫作，缺乏情境多樣性。
- **抄襲偵測或學術誠信監控應用**：本資料提供的是最佳化解法，非學生原創風格，不具代表性。

## Dataset Structure

<!-- This section provides a description of the dataset fields, and additional information about the dataset structure such as criteria used to create the splits, relationships between data points, etc. -->
本資料集以 `.jsonl` 格式儲存，每一行為一筆 JSON 物件，包含以下欄位：
- **text（string）**：繁體中文撰寫的完整題解說明，依序包含「概念總覽 → 實作步驟 → 複雜度分析」，內容經人工清洗與優化，重視可讀性與效率。
- **question（string）**：有關於題目的詳細描述，包含題目背景、要求等資訊。
- **constraints（string）**：題目的限制條件說明，包含輸入範圍、邊界條件等重要資訊，有助於理解解法的適用範圍。
- **thought（string）**：對應於 ## 基礎思路 之後的內容，包含作者對解法邏輯、步驟與策略的說明。
- **answer（string）**：對應題目的實際程式碼解法，提供完整可執行的 TypeScript 解答，對應於前述 thought 的實作。
- **question_code（string）**：TypeScript 函數簽名的起始程式碼框架，提供題目的基礎函數定義與參數型別。此欄位內容來源於 HuggingFace 上的 `whiskwhite/leetcode-complete` 資料集，部分缺失則由人工收集。
- **src（string）**：原始 .md 檔案所屬資料夾的名稱，通常對應該題的 LeetCode 題號或標題，作為來源參考。
- **time_complexity（string）**：詳細的時間複雜度分析，包含演算法效率說明與大 O 表示法。
- **space_complexity（string）**：詳細的空間複雜度分析，包含記憶體使用效率說明與大 O 表示法。

目前資料集尚未提供官方的訓練／驗證／測試分割，建議使用者可依需求自訂切分策略。由於資料每日擴充、筆數相對較少，因此也適合少量學習（few-shot learning）或指令微調（instruction-tuning）場景。
每筆資料為獨立題解，無需額外關聯上下文，適合單點預測或教學用途。

## Dataset Creation

### Curation Rationale

<!-- Motivation for the creation of this dataset. -->
本資料集的建立源於貢獻者對程式解題過程可解釋性的重視。許多現有的 LeetCode 題解資料多偏重「程式碼結果」，而缺乏「程式設計背後的推理脈絡」。為此，tw-leetcode 嘗試以繁體中文整理出結構清晰、高效率且具可讀性的解題過程，方便機器與人類理解。

資料集遵循「**Top Concept → Step Implement → Complexity Explanation**」的撰寫原則，期望能支援編程推理、程式教學、語言模型理解強邏輯文本等應用。

### Source Data

<!-- This section describes the source data (e.g. news text and headlines, social media posts, translated sentences, ...). -->

#### Data Collection and Processing

<!-- This section describes the data collection and processing process such as data selection criteria, filtering and normalization methods, tools and libraries used, etc. -->
資料由 Ren-Di Wu 人工每日整理與撰寫，來源為貢獻者於 LeetCode 平台上的實作結果與心得筆記。這些解法經由人工篩選與清洗，保留高效能、清楚分步與複雜度分析等內容。

處理流程包括：
- 自動抓取每日新提交的 .md 檔案
- 檢查是否有更新，若有則轉換為 .jsonl 格式
- 轉換時保留文字與來源資料夾名稱，作為 text 與 src 欄位
- 每日同步至資料集主儲存庫

使用工具：Python、Git、自動同步腳本（如 GitHub Actions 或 cron job）

#### Who are the source data producers?

<!-- This section describes the people or systems who originally created the data. It should also include self-reported demographic or identity information for the source data creators if this information is available. -->
原始資料由使用者 Ren-Di Wu 所建立，具軟體開發背景，長期於 LeetCode 平台實作與優化演算法解法。內容皆由該作者手動撰寫與清理，並每日釋出新解題資料。

目前資料主要由單一作者提供，未涉及多人眾包、語料轉錄或機器生成等流程；無涉及敏感個資、族群資訊、或需要進一步身分揭露之需求。

## Bias, Risks, and Limitations

<!-- This section is meant to convey both technical and sociotechnical limitations. -->
雖然 tw-leetcode 資料集為手動整理且內容結構清晰，但仍存在以下幾項技術與語言層面的潛在限制：

- **資料樣本數量有限**：目前資料筆數尚未達到大規模，可能不足以涵蓋多元題型與解法變化，訓練大型模型時應搭配其他資料集使用。
- **無多元性與公平性標記**：資料不含性別、族群、年齡等社會資訊，不適合進行社會公平性分析或偏誤研究。

### Recommendations

<!-- This section is meant to convey recommendations with respect to the bias, risk, and technical limitations. -->
使用者在應用本資料集時，建議注意以下事項：

- **搭配其他資料集使用**：若應用場景為多風格或多語言邏輯推理，應加入其他來源補充樣本多樣性。
- **避免直接做為唯一訓練資料來源**：本資料適合用於補強程式邏輯說明的品質，但不宜單獨訓練語言模型，否則可能過擬合特定解題風格。
- **適用於技術領域內推理任務**：建議聚焦在與程式、演算法、邏輯分析相關的任務，避免誤用於泛語言生成或開放對話模型。
- **定期關注更新與版本控制**：資料每日更新，使用者應留意時間點與資料版本的一致性，特別是在進行 reproducible evaluation 時。

## Citation

<!-- If there is a paper or blog post introducing the dataset, the APA and Bibtex information for that should go in this section. -->
如果您有使用到本資料集，再請標註以下來源
```
@misc{twleetcode2025,
  title        = {tw-leetcode: Traditional Chinese High-Quality LeetCode Solution Dataset},
  author       = {Ren-Di Wu, Huang Liang Hsun and Twinkle AI community},
  year         = {2025},
  howpublished = {\urlhttps://huggingface.co/datasets/lianghsun/tw-leetcode}},
  note         = {Accessed May 2025}
}
```

## Glossary

<!-- If relevant, include terms and calculations in this section that can help readers understand the dataset or dataset card. -->
- **Top Concept（核心概念）**：解題的整體邏輯或演算法主軸，例如「使用雙指針」、「利用貪婪策略」、「套用 DFS / BFS」等。
- **Step Implement（步驟實作）**：針對核心概念的具體實現步驟，以程式碼邏輯拆解的方式呈現，如條件判斷、資料結構操作等。
- **Complexity Explanation（複雜度說明）**：對時間與空間複雜度進行簡要分析，並說明選擇該解法的效率考量。
- **Beats 100%** ：在 LeetCode 上的測資評比中，執行時間與記憶體使用效率優於所有提交者的結果，代表該解法為極高效版本。

## Dataset Card Authors

[Huang Liang Hsun](https://www.linkedin.com/in/lianghsunhuang/?locale=en_US)

## Dataset Card Contact

[Huang Liang Hsun](https://www.linkedin.com/in/lianghsunhuang/?locale=en_US)
