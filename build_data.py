import os
import json
import re
import yaml
from pathlib import Path

CONTENT_DIR = Path("content")
OUTPUT_FILE = Path("data.json")

def parse_markdown_file(file_path):
    with open(file_path, "r", encoding="utf-8") as f:
        content = f.read()
    
    # 解析 YAML Frontmatter (被 --- 包裹的區塊)
    yaml_pattern = r"^---\s*\n(.*?)\n---\s*\n"
    match = re.search(yaml_pattern, content, re.DOTALL)
    
    if not match:
        return None
        
    frontmatter_str = match.group(1)
    data = yaml.safe_load(frontmatter_str)
    
    # 關鍵！一定要有這行：
    data["content"] = content[match.end():].strip()
    
    # 抓取 Frontmatter 之後的「完整 Markdown 內文」
    # match.end() 是 Frontmatter 結束的位置，切片後即為後續所有文字
    data["content"] = content[match.end():].strip()
    
    # 抓取第一句 Blockquote 引述 > ...
    quote_match = re.search(r"^>\s*「?(.*?)」?\s*$", content, re.MULTILINE)
    data["quote"] = quote_match.group(1) if quote_match else ""
    
    # 抓取核心摘要 (## 核心摘要 之後到下一個標題前的內容)
    summary_match = re.search(r"## 核心摘要\n(.*?)(?=\n##|$)", content, re.DOTALL)
    data["summary"] = summary_match.group(1).strip() if summary_match else ""
    
    # 抓取觀後心得與推薦 (## 觀後心得與推薦 之後的內容)
    thoughts_match = re.search(r"## 觀後心得與推薦\n(.*)", content, re.DOTALL)
    data["thoughts"] = thoughts_match.group(1).strip() if thoughts_match else ""
        
    return data

def build_all_data():
    all_data = []
    for md_file in CONTENT_DIR.glob("**/*.md"):
        item_data = parse_markdown_file(md_file)
        if item_data:
            all_data.append(item_data)
            
    with open(OUTPUT_FILE, "w", encoding="utf-8") as f:
        json.dump(all_data, f, ensure_ascii=False, indent=2)
    print(f"成功處理 {len(all_data)} 筆筆記，匯出至 {OUTPUT_FILE}")

if __name__ == "__main__":
    build_all_data()