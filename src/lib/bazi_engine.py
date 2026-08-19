"""
八字 · 大师版排盘引擎
完整四柱：年柱/月柱/日柱/时柱 + 十神 + 五行旺衰 + 用神 + 大运 + 流年
"""

import math
from datetime import datetime, timezone, timedelta

# ========= 基础常数 =========

TIANGAN = ["甲", "乙", "丙", "丁", "戊", "己", "庚", "辛", "壬", "癸"]
DIZHI   = ["子", "丑", "寅", "卯", "辰", "巳", "午", "未", "申", "酉", "戌", "亥"]

TG_IDX = {g: i for i, g in enumerate(TIANGAN)}
DZ_IDX = {z: i for i, z in enumerate(DIZHI)}

YIN_YANG = {"甲": "阳", "乙": "阴", "丙": "阳", "丁": "阴", "戊": "阳",
            "己": "阴", "庚": "阳", "辛": "阴", "壬": "阳", "癸": "阴"}

# 五虎遁（年干定月干）：甲己丙为首，乙庚戊为头，丙辛庚起，丁壬壬位，戊癸甲
WUHU = {
    "甲": "丙", "乙": "戊", "丙": "庚", "丁": "壬", "戊": "甲",
    "己": "丙", "庚": "戊", "辛": "庚", "壬": "壬", "癸": "甲",
}

# 五鼠遁（日干定时干）：甲己还加甲，乙庚丙作初，丙辛从戊起，丁壬庚子居，戊癸何方发，壬子是真途
WUSHU = {
    "甲": "甲", "乙": "丙", "丙": "戊", "丁": "庚", "戊": "壬",
    "己": "甲", "庚": "丙", "辛": "戊", "壬": "庚", "癸": "壬",
}

# 十神
SHI_SHEN = {
    ("比肩", "阳"): "比肩", ("比肩", "阴"): "劫财",
    ("劫财", "阳"): "劫财", ("劫财", "阴"): "比肩",
    ("食神", "阳"): "食神", ("食神", "阴"): "伤官",
    ("伤官", "阳"): "伤官", ("伤官", "阴"): "食神",
    ("正财", "阳"): "正财", ("正财", "阴"): "偏财",
    ("偏财", "阳"): "偏财", ("偏财", "阴"): "正财",
    ("正官", "阳"): "正官", ("正官", "阴"): "七杀",
    ("七杀", "阳"): "七杀", ("七杀", "阴"): "正官",
    ("正印", "阳"): "正印", ("正印", "阴"): "偏印",
    ("偏印", "阳"): "偏印", ("偏印", "阴"): "正印",
}

# 五行关系
WUXING = {
    "甲": "木", "乙": "木", "丙": "火", "丁": "火", "戊": "土",
    "己": "土", "庚": "金", "辛": "金", "壬": "水", "癸": "水",
}

WUXING_SHENG = {"木": "火", "火": "土", "土": "金", "金": "水", "水": "木"}
WUXING_KE   = {"木": "土", "土": "水", "水": "火", "火": "金", "金": "木"}

# 地支藏干
DIZHI_CANG = {
    "子": ["癸"],
    "丑": ["己", "癸", "辛"],
    "寅": ["甲", "丙", "戊"],
    "卯": ["乙"],
    "辰": ["戊", "乙", "癸"],
    "巳": ["丙", "庚", "戊"],
    "午": ["丁", "己"],
    "未": ["己", "丁", "乙"],
    "申": ["庚", "壬", "戊"],
    "酉": ["辛"],
    "戌": ["戊", "辛", "丁"],
    "亥": ["壬", "甲"],
}

# ========= 排盘核心 =========

def get_ganzhi_for_date(year, month, day):
    """已知2026年1月1日为乙卯日，推算任意日干支"""
    base = datetime(2026, 1, 1)
    target = datetime(year, month, day)
    delta = (target - base).days
    tg_idx = (1 + delta) % 10
    dz_idx = (3 + delta) % 12
    return TIANGAN[tg_idx], DIZHI[dz_idx], tg_idx, dz_idx

def get_lunar_year(year):
    """农历年份对应的干支（取立春为年柱分界）"""
    # 简化：直接以公历年对应干支
    stem = (year - 4) % 10
    branch = (year - 4) % 12
    return TIANGAN[stem], DIZHI[branch]

def lunar_month_for_date(year, month, day):
    """公历转农历月（节气定月，立春为正月起点）"""
    # 2026年立春：2月4日10:59
    # 简化版：直接按节气月
    jieqi = [
        (2026, 1, 5, 11, 24),   # 小寒
        (2026, 2, 4, 10, 59),   # 立春
        (2026, 3, 6, 5, 7),     # 惊蛰
        (2026, 4, 5, 9, 47),    # 清明
        (2026, 5, 6, 2, 51),    # 立夏
        (2026, 6, 6, 7, 7),     # 芒种
        (2026, 7, 7, 16, 59),   # 小暑
        (2026, 8, 7, 20, 40),   # 立秋
        (2026, 9, 7, 22, 55),   # 白露
        (2026, 10, 8, 14, 29),  # 寒露
        (2026, 11, 7, 17, 8),   # 立冬
        (2026, 12, 7, 9, 51),   # 大雪
    ]
    
    dt = datetime(year, month, day)
    
    for i, (jq_y, jq_m, jq_d, jq_h, jq_min) in enumerate(jieqi):
        jq_dt = datetime(jq_y, jq_m, jq_d, jq_h, jq_min)
        if dt < jq_dt:
            # 返回上一个月（节气前属于上一月）
            # 节气对应的农历月：小寒=12月，立春=1月，惊蛰=2月，清明=3月，立夏=4月，芒种=5月
            # 小暑=6月，立秋=7月，白露=8月，寒露=9月，立冬=10月，大雪=11月
            month_map = [12, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]
            if i == 0:
                return 11  # 小寒前属于农历十一月
            return month_map[i]
    
    return 11  # 大雪后为十一月

def get_month_gan(tg_year):
    """年干定正月天干（五虎遁）"""
    first = WUHU[tg_year]
    first_idx = TG_IDX[first]
    return [(first_idx + i) % 10 for i in range(12)]

def get_shi_gan(day_tg, shichen_idx):
    """日干定时干（五鼠遁）"""
    first = WUSHU[day_tg]
    first_idx = TG_IDX[first]
    return TIANGAN[(first_idx + shichen_idx) % 10]

def get_shichen(hour):
    """时支索引"""
    if 23 <= hour or hour < 1:
        return 0
    elif 1 <= hour < 3:
        return 1
    elif 3 <= hour < 5:
        return 2
    elif 5 <= hour < 7:
        return 3
    elif 7 <= hour < 9:
        return 4
    elif 9 <= hour < 11:
        return 5
    elif 11 <= hour < 13:
        return 6
    elif 13 <= hour < 15:
        return 7
    elif 15 <= hour < 17:
        return 8
    elif 17 <= hour < 19:
        return 9
    elif 19 <= hour < 21:
        return 10
    else:
        return 11

def get_shi_shen(day_tg, other_tg):
    """十神判断"""
    day_wx = WUXING[day_tg]
    other_wx = WUXING[other_tg]
    day_yinyang = YIN_YANG[day_tg]
    other_yinyang = YIN_YANG[other_tg]
    
    # 五行生克关系
    if day_wx == other_wx:
        relation = "比肩"
    elif WUXING_SHENG[day_wx] == other_wx:
        relation = "食神"  # 日主生
    elif WUXING_SHENG[other_wx] == day_wx:
        relation = "正印"  # 生日主
    elif WUXING_KE[day_wx] == other_wx:
        relation = "正财"  # 日主克
    elif WUXING_KE[other_wx] == day_wx:
        relation = "正官"  # 克日主
    else:
        relation = "比肩"
    
    # 阴阳定偏正
    key = (relation, other_yinyang)
    return SHI_SHEN.get(key, relation)

# ========= 主排盘函数 =========

def build_bazi(year, month, day, hour, gender=1):
    """
    完整八字排盘
    """
    # 1. 年柱
    year_tg = TIANGAN[(year - 4) % 10]
    year_dz = DIZHI[(year - 4) % 12]
    
    # 2. 日柱
    day_tg, day_dz, day_tg_idx, day_dz_idx = get_ganzhi_for_date(year, month, day)
    
    # 3. 月柱
    # 五虎遁定月干
    month_gan_list = get_month_gan(year_tg)
    month_dz_idx = (month + 1) % 12  # 寅月=2, 卯月=3...子月=0
    monthly_gans = list(map(lambda idx: TIANGAN[idx], month_gan_list))
    month_tg = monthly_gans[month_dz_idx]
    month_dz = DIZHI[(month_dz_idx) % 12]
    
    # 4. 时柱
    shichen_idx = get_shichen(hour)
    shi_tg = get_shi_gan(day_tg, shichen_idx)
    shi_dz = DIZHI[shichen_idx]
    
    # 四柱
    bazi = {
        "年柱": f"{year_tg}{year_dz}",
        "月柱": f"{month_tg}{month_dz}",
        "日柱": f"{day_tg}{day_dz}",
        "时柱": f"{shi_tg}{shi_dz}",
    }
    
    bazi_raw = {
        "年": (year_tg, year_dz),
        "月": (month_tg, month_dz),
        "日": (day_tg, day_dz),
        "时": (shi_tg, shi_dz),
    }
    
    # 5. 十神
    shi_shen_results = {}
    for pos, (tg, dz) in bazi_raw.items():
        # 天干十神
        tg_ss = get_shi_shen(day_tg, tg)
        shi_shen_results[f"{pos}干"] = (tg, tg_ss)
        
        # 地支藏干十神
        cangs = DIZHI_CANG.get(dz, [])
        cang_info = []
        for c in cangs:
            ss = get_shi_shen(day_tg, c)
            cang_info.append(f"{c}{ss}")
        shi_shen_results[f"{pos}支"] = (dz, cang_info)
    
    # 6. 五行旺衰统计
    all_gan = [year_tg, month_tg, day_tg, shi_tg]
    all_zhi_cang = []
    for dz in [year_dz, month_dz, day_dz, shi_dz]:
        all_zhi_cang.extend(DIZHI_CANG.get(dz, []))
    
    wx_count = {"木": 0, "火": 0, "土": 0, "金": 0, "水": 0}
    for g in all_gan:
        wx_count[WUXING[g]] += 1
    for g in all_zhi_cang:
        wx_count[WUXING[g]] += 0.5  # 藏干权重减半
    
    # 7. 日主
    rizhu = f"{day_tg} {day_dz}"
    
    # 8. 用神
    day_wx = WUXING[day_tg]
    
    # 找到最旺和最弱的五行
    sorted_wx = sorted(wx_count.items(), key=lambda x: x[1], reverse=True)
    strongest = sorted_wx[0][0]
    weakest = sorted_wx[-1][0]
    
    # 简单用神判断
    # 身强需克泄耗（官杀/食伤/财），身弱需生扶（印/比劫）
    rizhu_count = wx_count.get(day_wx, 0) + 0.5 * sum(1 for g in all_zhi_cang if WUXING[g] == day_wx)
    
    is_strong = rizhu_count >= 3.5  # 日主力量阈值
    
    if is_strong:
        # 身强：用克泄耗
        yongshen_actions = [WUXING_KE[day_wx],  # 官杀
                           [wx for wx, w in wx_count.items() if w < 2 and wx != day_wx]]
        # 简单取：用官杀或食伤
        yongshen_candidates = WUXING_KE[day_wx]
        xishen = WUXING_SHENG[day_wx]  # 喜食伤泄
        jishen = day_wx  # 忌比劫增势
    else:
        # 身弱：用生扶
        yongshen_candidates = WUXING_SHENG[day_wx]  # 印星生
        xishen = day_wx  # 喜比劫
        jishen = WUXING_KE[day_wx]  # 忌官杀
    
    # 9. 大运
    year_yinyang = YIN_YANG[year_tg]
    is_yang = year_yinyang == "阳"
    is_man = gender == 1
    forward = (is_yang and is_man) or (not is_yang and not is_man)
    
    # 起运年龄
    # 简化：取3岁起运
    start_age = 3
    
    dayun = []
    for i in range(8):  # 8大运
        if forward:
            yun_tg_idx = (TG_IDX[month_tg] + i + 1) % 10
            yun_dz_idx = (DZ_IDX[month_dz] + i + 1) % 12
        else:
            yun_tg_idx = (TG_IDX[month_tg] - i - 1 + 10) % 10
            yun_dz_idx = (DZ_IDX[month_dz] - i - 1 + 12) % 12
        
        yun_start = start_age + i * 10
        yun_end = yun_start + 9
        
        dayun.append({
            "大运": f"{TIANGAN[yun_tg_idx]}{DIZHI[yun_dz_idx]}",
            "年龄": f"{yun_start}-{yun_end}岁",
        })
    
    # 10. 流年
    cy = 2026
    liunian_tg = TIANGAN[(cy - 4) % 10]
    liunian_dz = DIZHI[(cy - 4) % 12]
    liunian = f"{liunian_tg}{liunian_dz}"
    
    # 11. 交易解读
    # 财星情况
    cai_count = sum(1 for pos, (tg, _) in bazi_raw.items() 
                    if get_shi_shen(day_tg, tg) in ["正财", "偏财"])
    cai_count += sum(0.3 for g in all_zhi_cang 
                     if get_shi_shen(day_tg, g) in ["正财", "偏财"])
    
    has_cai = cai_count >= 1.5
    
    # 官杀情况
    guansha_count = sum(1 for pos, (tg, _) in bazi_raw.items()
                        if get_shi_shen(day_tg, tg) in ["正官", "七杀"])
    has_guansha = guansha_count >= 1
    
    # 食伤
    shishang_count = sum(1 for pos, (tg, _) in bazi_raw.items()
                         if get_shi_shen(day_tg, tg) in ["食神", "伤官"])
    has_shishang = shishang_count >= 1
    
    # 命格等级
    # 富贵格：财官印食俱全且日主有根
    mingge_level = "中等"
    if has_cai and has_guansha:
        mingge_level = "上等（财官双美）"
    if has_cai and has_shishang:
        mingge_level = "上等（伤官生财）"
    if not has_cai and not has_guansha:
        mingge_level = "下等（财官缺位）"
    
    return {
        "四柱": bazi,
        "日主": rizhu,
        "日主五行": day_wx,
        "日主阴阳": YIN_YANG[day_tg],
        "十神": shi_shen_results,
        "五行旺衰": dict(sorted(wx_count.items(), key=lambda x: x[1], reverse=True)),
        "日主力量": "偏强" if is_strong else "偏弱",
        "用神": yongshen_candidates,
        "喜神": xishen,
        "忌神": jishen,
        "是否身强": is_strong,
        "大运": dayun,
        "流年": liunian,
        "交易解读": {
            "命格": mingge_level,
            "财星": f"{'旺' if has_cai else '弱'} ({cai_count:.1f})",
            "官杀": f"{'旺' if has_guansha else '弱'} ({guansha_count:.0f})",
            "食伤": f"{'旺' if has_shishang else '弱'} ({shishang_count:.0f})",
        },
    }


def format_bazi(bazi):
    """格式化八字输出"""
    lines = []
    lines.append("═" * 44)
    lines.append(f"  八字 · 大师版命盘")
    lines.append("═" * 44)
    lines.append("")
    
    # 四柱
    lines.append("【八字四柱】")
    cols = bazi["四柱"]
    lines.append(f"  {cols['年柱']:>4}  {cols['月柱']:>4}  {cols['日柱']:>4}  {cols['时柱']:>4}")
    lines.append("")
    
    # 日主
    lines.append(f"【日主】{bazi['日主']}（{bazi['日主五行']}，{bazi['日主阴阳']}）")
    lines.append(f"  身{bazi['日主力量']}")
    lines.append("")
    
    # 十神
    lines.append("【十神分布】")
    for pos_key in ["年干", "年支", "月干", "月支", "日干", "日支", "时干", "时支"]:
        info = bazi["十神"].get(pos_key)
        if info:
            if isinstance(info[1], list):
                cang_str = ", ".join(info[1])
                lines.append(f"  {pos_key}：{info[0]}[{cang_str}]")
            else:
                lines.append(f"  {pos_key}：{info[0]}")
    lines.append("")
    
    # 五行旺衰
    lines.append("【五行旺衰】")
    for wx, count in bazi["五行旺衰"].items():
        bar = "█" * int(count * 4) + "░" * (20 - int(count * 4))
        lines.append(f"  {wx}：{count:.1f} {bar}")
    lines.append("")
    
    # 用神喜忌
    lines.append("【用神喜忌】")
    lines.append(f"  日主{'偏强' if bazi['是否身强'] else '偏弱'}，{'宜克泄耗' if bazi['是否身强'] else '宜生扶'}")
    lines.append(f"  用神：{bazi['用神']}（最重要的五行）")
    lines.append(f"  喜神：{bazi['喜神']}")
    lines.append(f"  忌神：{bazi['忌神']}（避免过度操作）")
    lines.append("")
    
    # 交易解读
    lines.append("【交易命格解读】")
    td = bazi["交易解读"]
    lines.append(f"  命格等级：{td['命格']}")
    lines.append(f"  财星：{td['财星']}（{'' if '旺' in td['财星'] else '需后天培养现金流能力'}）")
    lines.append(f"  官杀：{td['官杀']}（{'纪律性强' if '旺' in td['官杀'] else '风控需加强'}）")
    lines.append(f"  食伤：{td['食伤']}（{'策略创新能力强' if '旺' in td['食伤'] else '需加强策略研究'}）")
    lines.append("")
    
    # 适配市场
    adapt = []
    wx_for_market = {
        "金": "贵金属/外汇/硬资产交易",
        "木": "成长股/科技股/新兴市场",
        "水": "加密货币/高流动性市场",
        "火": "高频交易/动量策略",
        "土": "价值投资/蓝筹股/房地产",
    }
    best_wx = list(bazi["五行旺衰"].keys())[0]
    worst_wx = list(bazi["五行旺衰"].keys())[-1]
    adapt.append(f"  天然优势市场：{wx_for_market.get(best_wx, '待分析')}")
    adapt.append(f"  需要注意的市场：{wx_for_market.get(worst_wx, '待分析')}")
    lines.extend(adapt)
    lines.append("")
    
    # 大运
    lines.append("【大运走势】")
    for i, dy in enumerate(bazi["大运"][:5]):  # 前5大运
        lines.append(f"  {dy['大运']}  {dy['年龄']}")
    lines.append("  ...")
    lines.append("")
    
    # 流年
    lines.append(f"【当前流年】{bazi['流年']}")
    lines.append("")
    
    lines.append("═" * 44)
    
    return "\n".join(lines)


if __name__ == "__main__":
    bazi = build_bazi(2000, 1, 1, 12, gender=1)
    print(format_bazi(bazi))
    print()
    bazi2 = build_bazi(1990, 6, 15, 14, gender=1)
    print(format_bazi(bazi2))