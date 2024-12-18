from fpdf import FPDF

# Initialize PDF
pdf = FPDF()
pdf.set_auto_page_break(auto=True, margin=15)
pdf.add_page()
pdf.set_font("Arial", size=12)

# Title
pdf.set_font("Arial", style="B", size=16)
pdf.cell(200, 10, txt="模擬手臂血管與肌肉收縮的材料與電力需求", ln=True, align="C")
pdf.ln(10)

# Introduction
pdf.set_font("Arial", size=12)
introduction = """
為了模擬手臂血管或肌肉的收縮行為，需要選用適合的材料與電力驅動方式。
以下內容將比較不同材料的特性、需求，以及它們的適用場景。
"""
pdf.multi_cell(0, 10, introduction)
pdf.ln(5)

# Section 1: 電活性聚合物
section_1 = """
1. 電活性聚合物（EAP）
電活性聚合物能在施加電場時發生形變，模仿生物組織的彈性行為。

類型與應用：
- 離子型 EAP：適合低功率需求（如血管收縮）。
- 電致伸縮型 EAP：適合模仿骨骼肌的快速收縮。

需求：
- 電流：1-100 mA
- 電壓：1-300 V
- 功率：0.005-5 W
"""
pdf.set_font("Arial", style="B", size=14)
pdf.cell(0, 10, "1. 電活性聚合物（EAP）", ln=True)
pdf.set_font("Arial", size=12)
pdf.multi_cell(0, 10, section_1)
pdf.ln(5)

# Section 2: 形狀記憶合金
section_2 = """
2. 形狀記憶合金（SMA）
形狀記憶合金在加熱（通電）時會恢復預設形狀，適合模仿肌肉的縮短與放鬆。

需求：
- 電流：100-300 mA
- 電壓：3-12 V
- 功率：1-3 W
"""
pdf.set_font("Arial", style="B", size=14)
pdf.cell(0, 10, "2. 形狀記憶合金（SMA）", ln=True)
pdf.set_font("Arial", size=12)
pdf.multi_cell(0, 10, section_2)
pdf.ln(5)

# Section 3: 液壓式人工肌肉
section_3 = """
3. 液壓式人工肌肉（HAMs）
通過電壓驅動內部液體壓力變化，實現管狀結構的收縮，模仿血管或肌肉。

需求：
- 電流：50-200 mA
- 電壓：3-12 V
- 功率：0.5-2 W
"""
pdf.set_font("Arial", style="B", size=14)
pdf.cell(0, 10, "3. 液壓式人工肌肉（HAMs）", ln=True)
pdf.set_font("Arial", size=12)
pdf.multi_cell(0, 10, section_3)
pdf.ln(5)

# Section 4: 人工氣動肌肉
section_4 = """
4. 人工氣動肌肉（PAMs）
氣動肌肉內部充氣或排氣時會收縮，模仿生物肌肉的行為。

需求：
- 電流：100-500 mA
- 電壓：12-24 V
- 功率：1-5 W
"""
pdf.set_font("Arial", style="B", size=14)
pdf.cell(0, 10, "4. 人工氣動肌肉（PAMs）", ln=True)
pdf.set_font("Arial", size=12)
pdf.multi_cell(0, 10, section_4)
pdf.ln(5)

# Table: Comparison of Materials
table_header = """
不同材質的電量需求與適用場景：
"""
pdf.set_font("Arial", style="B", size=14)
pdf.cell(0, 10, "比較不同材質的電量需求與應用", ln=True)
pdf.set_font("Arial", size=12)
pdf.multi_cell(0, 10, table_header)

pdf.set_font("Arial", size=12)
table_content = """
| 材質                 | 電流需求 (mA) | 電壓需求 (V) | 功率需求 (W) | 適用模仿       |
|-----------------------|---------------|---------------|---------------|----------------|
| 離子型 EAP           | 1-10          | 1-5           | 0.005-0.05    | 血管收縮       |
| 介電彈性體 EAP       | 10-100        | 100-300       | 1-5           | 骨骼肌         |
| 形狀記憶合金（SMA）  | 100-300       | 3-12          | 1-3           | 骨骼肌、血管   |
| 液壓式人工肌肉（HAMs)| 50-200        | 3-12          | 0.5-2         | 血管收縮       |
| 人工氣動肌肉（PAMs） | 100-500       | 12-24         | 1-5           | 骨骼肌         |
"""
pdf.multi_cell(0, 10, table_content)
pdf.ln(10)

# Conclusion
conclusion = """
建議：
- 血管收縮模擬：選用離子型 EAP 或液壓式人工肌肉，因其低功耗且靈活。
- 骨骼肌收縮模擬：使用介電彈性體或形狀記憶合金，能提供較大力量。
- 若需大範圍模仿，可結合多種材料實現不同層次的動作。
"""
pdf.set_font("Arial", style="B", size=14)
pdf.cell(0, 10, "結論與建議", ln=True)
pdf.set_font("Arial", size=12)
pdf.multi_cell(0, 10, conclusion)

# Save PDF
output_path = "/mnt/data/血管與肌肉模擬材料與需求.pdf"
pdf.output(output_path)

output_path
