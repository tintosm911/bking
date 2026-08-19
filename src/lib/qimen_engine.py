"""
奇门遁甲 · 大师版排盘引擎
时家转盘奇门 — 完整体系：节气定局 / 九星八门八神 / 用神体系 / 格局分析 / 交易判断
"""

import math
from datetime import datetime, timezone, timedelta

# ========= 基础常数 =========

TIANGAN = ["甲", "乙", "丙", "丁", "戊", "己", "庚", "辛", "壬", "癸"]
DIZHI   = ["子", "丑", "寅", "卯", "辰", "巳", "午", "未", "申", "酉", "戌", "亥"]
SHICHEN = [("子", 23, 1), ("丑", 1, 3), ("寅", 3, 5), ("卯", 5, 7),
           ("辰", 7, 9), ("巳", 9, 11), ("午", 11, 13), ("未", 13, 15),
           ("申", 15, 17), ("酉", 17, 19), ("戌", 19, 21), ("亥", 21, 23)]

SHICHEN_MAP = {i: name for i, (name, _, _) in enumerate(SHICHEN)}
SHICHEN_REV = {}
for i, (name, s, e) in enumerate(SHICHEN):
    for h in range(s, e + (1 if e > s else 25)):
        SHICHEN_REV[h % 24] = i

# 九宫配卦 / 五行 / 方位
GONG_INFO = {
    0: {"gua": "坎", "wuxing": "水", "fangwei": "北", "yinyang": "阳"},
    1: {"gua": "坤", "wuxing": "土", "fangwei": "西南", "yinyang": "阴"},
    2: {"gua": "震", "wuxing": "木", "fangwei": "东", "yinyang": "阳"},
    3: {"gua": "巽", "wuxing": "木", "fangwei": "东南", "yinyang": "阴"},
    4: {"gua": "中", "wuxing": "土", "fangwei": "中", "yinyang": "阳"},
    5: {"gua": "乾", "wuxing": "金", "fangwei": "西北", "yinyang": "阳"},
    6: {"gua": "兑", "wuxing": "金", "fangwei": "西", "yinyang": "阴"},
    7: {"gua": "艮", "wuxing": "土", "fangwei": "东北", "yinyang": "阳"},
    8: {"gua": "离", "wuxing": "火", "fangwei": "南", "yinyang": "阴"},
}

GONG_NAMES = [GONG_INFO[i]["gua"] for i in range(9)]

# ========= 节气数据（2026年精准） =========
# (名称, 月, 日, 时, 分)
JIEQI_2026 = [
    ("小寒", 1, 5, 11, 24), ("大寒", 1, 20, 4, 30),
    ("立春", 2, 4, 10, 59), ("雨水", 2, 19, 6, 46),
    ("惊蛰", 3, 6, 5, 7),  ("春分", 3, 21, 5, 59),
    ("清明", 4, 5, 9, 47), ("谷雨", 4, 20, 16, 38),
    ("立夏", 5, 6, 2, 51), ("小满", 5, 21, 15, 56),
    ("芒种", 6, 6, 7, 7),  ("夏至", 6, 21, 23, 23),
    ("小暑", 7, 7, 16, 59),("大暑", 7, 23, 10, 19),
    ("立秋", 8, 7, 20, 40),("处暑", 8, 23, 11, 35),
    ("白露", 9, 7, 22, 55),("秋分", 9, 23, 8, 3),
    ("寒露", 10, 8, 14, 29),("霜降", 10, 23, 17, 20),
    ("立冬", 11, 7, 17, 8),("小雪", 11, 22, 14, 38),
    ("大雪", 12, 7, 9, 51),("冬至", 12, 22, 3, 49),
]

# 阳遁局数表（冬至起阳）
YANG_DUN = {"冬至": 7, "小寒": 8, "大寒": 3,
            "立春": 8, "雨水": 7, "惊蛰": 6,
            "春分": 3, "清明": 4, "谷雨": 3,
            "立夏": 4, "小满": 5, "芒种": 6}

# 阴遁局数表（夏至起阴）
YIN_DUN = {"夏至": 9, "小暑": 4, "大暑": 8,
            "立秋": 2, "处暑": 7, "白露": 9,
            "秋分": 7, "寒露": 6, "霜降": 4,
            "立冬": 3, "小雪": 2, "大雪": 1}

# 三奇六仪（顺逆飞布用）
SANQI_LIUYI = ["戊", "己", "庚", "辛", "壬", "癸", "丁", "丙", "乙"]

# 八门（原始宫位：休-坎1，生-艮8，伤-震3，杜-巽4，
#              景-离9，死-坤2，惊-兑7，开-乾6）
BA_MEN = ["休", "生", "伤", "杜", "景", "死", "惊", "开"]
BA_MEN_YUAN_GONG = [0, 7, 2, 3, 8, 1, 6, 5]  # 八门原始宫位

# 九星（原始宫位：蓬-坎1，芮-坤2，冲-震3，辅-巽4，
#              禽-中5，心-乾6，柱-兑7，任-艮8，英-离9）
JIU_XING = ["天蓬", "天芮", "天冲", "天辅", "天禽", "天心", "天柱", "天任", "天英"]
JIU_XING_YUAN_GONG = [0, 1, 2, 3, 4, 5, 6, 7, 8]

# 八神（阳遁顺排，阴遁逆排）
BA_SHEN = ["值符", "腾蛇", "太阴", "六合", "白虎", "玄武", "九地", "九天"]

# ========= 工具函数 =========

def get_shichen_index(hour):
    """小时转时辰索引（0=子, 11=亥）"""
    return SHICHEN_REV.get(hour % 24, 0)

def get_jieqi_for_date(dt):
    """根据日期确定当前节气"""
    for i, (name, m, d, h, minute) in enumerate(JIEQI_2026):
        jq_dt = datetime(dt.year, m, d, h, minute, tzinfo=timezone(timedelta(hours=8)))
        if dt < jq_dt:
            if i == 0:
                prev = JIEQI_2026[-1]
                return prev[0], prev[1], prev[2], prev[3], prev[4]
            prev = JIEQI_2026[i - 1]
            return prev[0], prev[1], prev[2], prev[3], prev[4]
    # 过了冬至
    return JIEQI_2026[-1][0], JIEQI_2026[-1][1], JIEQI_2026[-1][2], JIEQI_2026[-1][3], JIEQI_2026[-1][4]

def get_ju_number(jieqi_name):
    """获取局数"""
    if "冬至" in jieqi_name or ("小寒" in [n for n,_,_,_,_ in JIEQI_2026 if n==jieqi_name]):
        pass
    yj = ["冬至", "小寒", "大寒", "立春", "雨水", "惊蛰", "春分", "清明", "谷雨", "立夏", "小满", "芒种"]
    if jieqi_name in yj:
        return YANG_DUN.get(jieqi_name, 7), "阳遁"
    return YIN_DUN.get(jieqi_name, 9), "阴遁"

def is_yang(jieqi_name):
    yj = ["冬至", "小寒", "大寒", "立春", "雨水", "惊蛰", "春分", "清明", "谷雨", "立夏", "小满", "芒种"]
    return jieqi_name in yj

def get_ganzhi_for_date(year, month, day):
    """已知2026年1月1日为乙卯日，推算任意日干支"""
    base = datetime(2026, 1, 1)
    target = datetime(year, month, day)
    delta = (target - base).days
    tg_idx = (1 + delta) % 10
    dz_idx = (3 + delta) % 12
    return TIANGAN[tg_idx], DIZHI[dz_idx], tg_idx, dz_idx

def get_shi_ganzhi(day_tg_idx, shichen_idx):
    """五鼠遁：根据日干和时辰推算时干"""
    # 甲己还加甲，乙庚丙作初，丙辛从戊起，丁壬庚子居，戊癸何方发，壬子是真途
    wushu_map = {0: 0, 1: 2, 2: 4, 3: 6, 4: 8, 5: 0, 6: 2, 7: 4, 8: 6, 9: 8}
    base_tg = wushu_map.get(day_tg_idx % 10, 0)
    shi_tg = (base_tg + shichen_idx) % 10
    shi_dz = shichen_idx
    return TIANGAN[shi_tg], DIZHI[shi_dz], shi_tg, shi_dz

# ========= 排盘核心 =========

def qimen_master_pan(dt=None):
    """
    完整奇门遁甲排盘
    返回: dict 包含所有排盘要素
    """
    dt = dt or datetime.now(timezone(timedelta(hours=8)))
    
    year, month, day = dt.year, dt.month, dt.day
    hour = dt.hour
    
    # 1. 节气与局
    jieqi_name, jq_m, jq_d, jq_h, jq_min = get_jieqi_for_date(dt)
    yang = is_yang(jieqi_name)
    ju = get_ju_number(jieqi_name)[0]
    direction_text = "阳遁" if yang else "阴遁"
    
    # 2. 干支
    day_tg, day_dz, day_tg_idx, day_dz_idx = get_ganzhi_for_date(year, month, day)
    shichen_idx = get_shichen_index(hour)
    shi_tg, shi_dz, shi_tg_idx, shi_dz_idx = get_shi_ganzhi(day_tg_idx, shichen_idx)
    shichen_name = SHICHEN_MAP.get(shi_dz_idx, "子")
    
    # 3. 地盘三奇六仪（阳遁戊起顺飞，阴遁戊起逆飞）
    di_pan = {}  # gong -> 天干
    if yang:
        # 戊起于局数宫，顺飞九宫
        start = ju - 1  # 0-indexed
        for i, gan in enumerate(SANQI_LIUYI):
            gong = (start + i) % 9
            di_pan[gong] = gan
    else:
        # 戊起于局数宫，逆飞九宫
        start = ju - 1
        for i, gan in enumerate(SANQI_LIUYI):
            gong = (start - i) % 9
            di_pan[gong] = gan
    
    # 4. 找值符和值使
    # 值符 = 地盘时干所在宫对应的九星
    # 值使 = 地盘时干所在宫对应的八门
    
    # 时干在地盘哪个宫？
    shigan_gong = None
    for g, gan in di_pan.items():
        if gan == shi_tg:
            shigan_gong = g
            break
    if shigan_gong is None:
        # fallback: 旬首（甲所在宫）
        shigan_gong = 0
    
    # 值符（九星）：地盘时干宫的星
    zhifu = JIU_XING[shigan_gong]
    
    # 值使（八门）：地盘时干宫的门
    zhishi_idx = shigan_gong
    # 阳遁顺转，阴遁逆转
    if yang:
        zhishi = BA_MEN[zhishi_idx % 8]
    else:
        zhishi = BA_MEN[(8 - zhishi_idx) % 8]
    
    # 5. 天盘九星（值符加时干，其它星随值符顺/逆转）
    tian_pan = {}  # gong -> 九星名
    # 值符落时干宫
    tian_pan[shigan_gong] = zhifu
    
    if yang:
        for i in range(9):
            if i != shigan_gong:
                # 从值符原始宫到当前宫的偏移
                offset = (i - shigan_gong) % 9
                src_gong = (JIU_XING_YUAN_GONG[shigan_gong] + offset) % 9
                tian_pan[i] = JIU_XING[src_gong]
    else:
        for i in range(9):
            if i != shigan_gong:
                offset = (shigan_gong - i) % 9
                src_gong = (JIU_XING_YUAN_GONG[shigan_gong] - offset) % 9
                tian_pan[i] = JIU_XING[src_gong]
    
    # 6. 人盘八门（值使随时宫）
    ren_pan = {}  # gong -> 八门名
    
    # 值使原始宫位
    zhishi_yuan_gong = BA_MEN_YUAN_GONG[BA_MEN.index(zhishi)]
    
    if yang:
        for i in range(8):
            gong = [0, 1, 2, 3, 5, 6, 7, 8][i]  # 跳过中宫
            offset = (gong - zhishi_yuan_gong) % 8
            men_idx = (zhishi_idx + offset) % 8
            ren_pan[gong] = BA_MEN[men_idx]
    else:
        for i in range(8):
            gong = [0, 1, 2, 3, 5, 6, 7, 8][i]
            offset = (zhishi_yuan_gong - gong) % 8
            men_idx = (zhishi_idx - offset) % 8
            ren_pan[gong] = BA_MEN[men_idx]
    
    # 7. 神盘八神（小值符大值符，阳遁顺/阴遁逆）
    shen_pan = {}  # gong -> 八神名
    
    # 小值符（值符所在宫起）
    if yang:
        for i in range(8):
            gong = [0, 1, 2, 3, 5, 6, 7, 8][i]
            idx = (shigan_gong + i) % 8  # 从值符宫顺排
            # 但要映射到实际八神顺序
            shen_idx_map = {0: 0, 1: 1, 2: 2, 3: 3, 5: 4, 6: 5, 7: 6, 8: 7}
            actual_gong = gong
            actual_idx = shen_idx_map.get(actual_gong, 0)
            shen_pan[actual_gong] = BA_SHEN[(actual_idx + i) % 8] if i == 0 else BA_SHEN[(actual_idx + i) % 8]
    else:
        for i in range(8):
            gong = [0, 1, 2, 3, 5, 6, 7, 8][i]
            shen_idx_map = {0: 0, 1: 1, 2: 2, 3: 3, 5: 4, 6: 5, 7: 6, 8: 7}
            actual_gong = gong
            actual_idx = shen_idx_map.get(actual_gong, 0)
            shen_pan[actual_gong] = BA_SHEN[(3 - actual_idx) % 8] if i == 0 else BA_SHEN[(3 - actual_idx) % 8]
    
    # 简化版神盘
    shen_pan_simple = {}
    if yang:
        shen_order = BA_SHEN
    else:
        shen_order = list(reversed(BA_SHEN))
    
    gong_8 = [0, 1, 2, 3, 5, 6, 7, 8]
    # 找值符宫在gong_8中的索引
    try:
        zf_idx_in_8 = gong_8.index(shigan_gong)
    except ValueError:
        zf_idx_in_8 = 0
    
    for i, g in enumerate(gong_8):
        shen_pan_simple[g] = shen_order[(zf_idx_in_8 + i) % 8]
    
    # ========= 格局分析 =========
    
    # 九宫完整数据
    gong_data = {}
    for g in range(9):
        if g == 4:  # 中宫
            gong_data[g] = {
                "gua": GONG_INFO[g]["gua"],
                "wuxing": GONG_INFO[g]["wuxing"],
                "fangwei": GONG_INFO[g]["fangwei"],
                "di": di_pan.get(g, ""),
                "tian": tian_pan.get(g, ""),
                "ren": ren_pan.get(4, "死"),  # 中宫寄坤，用死门
                "shen": shen_pan_simple.get(4, "值符"),
            }
        else:
            gong_data[g] = {
                "gua": GONG_INFO[g]["gua"],
                "wuxing": GONG_INFO[g]["wuxing"],
                "fangwei": GONG_INFO[g]["fangwei"],
                "di": di_pan.get(g, ""),
                "tian": tian_pan.get(g, ""),
                "ren": ren_pan.get(g, "杜"),
                "shen": shen_pan_simple.get(g, "值符"),
            }
    
    # 用神提取
    # 时干宫 = 值符宫
    shigan_gong_idx = shigan_gong
    # 日干宫 = 日干在地盘所在宫
    rigan_gong_idx = None
    for g, gan in di_pan.items():
        if gan == day_tg:
            rigan_gong_idx = g
            break
    if rigan_gong_idx is None:
        rigan_gong_idx = 0
    
    # 值符宫信息
    zhifu_gong_info = gong_data.get(shigan_gong_idx, gong_data[0])
    # 日干宫信息
    rigan_gong_info = gong_data.get(rigan_gong_idx, gong_data[0])
    
    # ========= 格判定 =========
    
    patterns = []
    
    # 龙回首：戊+丙（地盘戊，天盘丙）
    for g in range(9):
        if g == 4: continue
        if gong_data[g]["di"] == "戊" and gong_data[g]["ren"] == "丙" if False else False:
            pass
    
    # 简化：判断一些经典格局
    for g in range(9):
        if g == 4: continue
        d = gong_data[g]["di"]
        t = gong_data[g]["tian"]
        m = gong_data[g]["ren"]
        s = gong_data[g]["shen"]
        
        # 龙回首
        if d == "戊" and t == "天芮" and m == "生":
            pass
        
        # 主要格局简化判断
        if d == "戊" and "丙" in str(t):
            patterns.append({"宫": gong_data[g]["gua"], "格": "龙回首（青龙返首）", "吉凶": "吉"})
        if d == "丙" and "戊" in str(t):
            patterns.append({"宫": gong_data[g]["gua"], "格": "飞鸟跌穴（丙+戊）", "吉凶": "吉"})
        if d == "丁" and "乙" in str(t):
            patterns.append({"宫": gong_data[g]["gua"], "格": "玉女守门", "吉凶": "吉"})
        if s == "白虎":
            patterns.append({"宫": gong_data[g]["gua"], "格": f"白虎+{d}+{m}", "吉凶": "凶"})
        if s == "玄武":
            patterns.append({"宫": gong_data[g]["gua"], "格": f"玄武+{d}+{m}", "吉凶": "凶（防假信号）"})
        if m == "死":
            patterns.append({"宫": gong_data[g]["gua"], "格": f"死门+{d}", "吉凶": "凶"})
        if m == "开" and s in ["值符", "九天"]:
            patterns.append({"宫": gong_data[g]["gua"], "格": f"开门+{s}", "吉凶": "大吉"})
        if m == "生" and s == "九天":
            patterns.append({"宫": gong_data[g]["gua"], "格": "生门+九天", "吉凶": "大吉（暴涨）"})
        if s == "九地" and m in ["死", "惊"]:
            patterns.append({"宫": gong_data[g]["gua"], "格": f"九地+{m}", "吉凶": "凶（阴跌）"})
    
    # ========= 交易综合判定 =========
    
    # 主要看时干宫（值符宫）
    zhifu_men = zhifu_gong_info["ren"]
    zhifu_shen = zhifu_gong_info["shen"]
    zhifu_xing = zhifu
    zhifu_digan = zhifu_gong_info["di"]
    
    # 门评分
    MEN_SCORE = {"开": 80, "休": 60, "生": 90, "伤": 30,
                 "杜": 40, "景": 50, "死": 5, "惊": 20}
    # 神评分修正
    SHEN_MOD = {"值符": +15, "腾蛇": -15, "太阴": -5, "六合": +5,
                "白虎": -20, "玄武": -25, "九地": -10, "九天": +20}
    
    base_score = MEN_SCORE.get(zhifu_men, 40)
    shen_mod = SHEN_MOD.get(zhifu_shen, 0)
    
    # 九星力度修正
    XING_MOD = {"天蓬": -10, "天芮": -5, "天冲": +10, "天辅": +5,
                "天禽": 0, "天心": +10, "天柱": -5, "天任": 0, "天英": +5}
    xing_mod = XING_MOD.get(zhifu_xing, 0)
    
    # 节气修正
    jieqi_mod = 5 if yang else -5  # 阳遁偏多，阴遁偏空
    
    score = base_score + shen_mod + xing_mod + jieqi_mod
    score = max(0, min(100, score))
    
    # 方向判定
    if score >= 70:
        trade_advice = "🟢 开仓信号强"
        direction = "偏多"
    elif score >= 50:
        trade_advice = "🟡 谨慎参与，轻仓试单"
        direction = "谨慎偏多" if score >= 55 else "震荡偏空"
    elif score >= 30:
        trade_advice = "🟠 观望为宜，不宜重仓"
        direction = "偏空"
    else:
        trade_advice = "🔴 不宜交易，休息等待"
        direction = "大凶"
    
    # 详细建议
    detail_notes = []
    if zhifu_men in ["死", "惊"]:
        detail_notes.append(f"值使{zhifu_men}门，主凶，不宜冲动操作")
    if zhifu_shen in ["白虎", "玄武"]:
        detail_notes.append(f"{zhifu_shen}临宫，注意假突破或暴跌风险")
    if zhifu_shen == "九天":
        detail_notes.append("九天临宫，有大波动，注意加速行情")
    if zhifu_shen == "值符":
        detail_notes.append("值符临宫，趋势有支撑")
    if zhifu_xing == "天蓬":
        detail_notes.append("天蓬星主大波动，高风险高收益")
    if zhifu_men in ["开", "生"] and zhifu_shen in ["值符", "九天", "六合"]:
        detail_notes.append("吉门吉神相会，利于操作")
    
    # ========= 输出 =========
    
    result = {
        "timestamp": dt.strftime("%Y-%m-%d %H:%M"),
        "节气": jieqi_name,
        "阴阳": direction_text,
        "局数": ju,
        "日干支": day_tg + day_dz,
        "日干": day_tg,
        "时干支": shi_tg + shi_dz,
        "时干": shi_tg,
        "时辰": shichen_name,
        "旬首": f"甲{shi_dz}" if shi_tg == "甲" else f"甲{['子','丑','寅','卯','辰','巳','午','未','申','酉','戌','亥'][(shi_dz_idx - shi_tg_idx) % 12]}",
        "值符": zhifu,
        "值符落宫": GONG_NAMES[shigan_gong_idx],
        "值使": zhishi,
        "值使落宫": GONG_NAMES[shigan_gong_idx],
        "用神": {
            "时干宫": {"宫位": GONG_NAMES[shigan_gong_idx], "八门": zhifu_men, "九星": zhifu, "八神": zhifu_shen, "地盘干": zhifu_digan},
            "日干宫": {"宫位": GONG_NAMES[rigan_gong_idx], "八门": rigan_gong_info["ren"], "九星": gong_data[rigan_gong_idx]["tian"], "八神": gong_data[rigan_gong_idx]["shen"], "地盘干": rigan_gong_info["di"]},
            "值符宫": {"宫位": GONG_NAMES[shigan_gong_idx], "八门": zhifu_men, "九星": zhifu, "八神": zhifu_shen, "地盘干": zhifu_digan},
        },
        "格局": patterns[:5],  # 最多5个
        "评分": score,
        "方向": direction,
        "建议": trade_advice,
        "细节": detail_notes,
        "九宫": {GONG_NAMES[g]: gong_data[g] for g in range(9)},
        "完整": True,
    }
    
    return result


def format_master_output(pan):
    """大师版格式化输出"""
    lines = []
    lines.append("━" * 40)
    lines.append(f"  奇门遁甲 · 大师版排盘")
    lines.append(f"  {pan['timestamp']}")
    lines.append("━" * 40)
    lines.append("")
    
    # 基本信息
    lines.append(f"【基本信息】")
    lines.append(f"  节气：{pan['节气']}　{pan['阴阳']}{pan['局数']}局")
    lines.append(f"  日干支：{pan['日干支']}　时干支：{pan['时干支']}（{pan['时辰']}时）")
    lines.append(f"  旬首：{pan['旬首']}")
    lines.append(f"  值符：{pan['值符']}（落{pan['值符落宫']}宫）")
    lines.append(f"  值使：{pan['值使']}（落{pan['值使落宫']}宫）")
    lines.append("")
    
    # 九宫
    lines.append(f"【九宫详盘】")
    lines.append(f"  {'宫位':<6} {'地盘':<6} {'天盘':<8} {'人盘':<6} {'神盘':<6} {'五行':<4} {'方位':<6}")
    lines.append(f"  {'-'*42}")
    for g_name, g_data in pan['九宫'].items():
        if g_name == "中":
            lines.append(f"  {g_name:<6} {g_data['di']:<6} {g_data['tian']:<8} {'─':<6} {g_data['shen']:<6} {g_data['wuxing']:<4} {g_data['fangwei']:<6}")
        else:
            lines.append(f"  {g_name:<6} {g_data['di']:<6} {g_data['tian']:<8} {g_data['ren']:<6} {g_data['shen']:<6} {g_data['wuxing']:<4} {g_data['fangwei']:<6}")
    lines.append("")
    
    # 用神
    lines.append(f"【用神分析 · 交易版】")
    for key, info in pan['用神'].items():
        lines.append(f"  {key}：{info['宫位']}宫")
        lines.append(f"    八门：{info['八门']}　九星：{info['九星']}　八神：{info['八神']}　地盘：{info['地盘干']}")
    lines.append("")
    
    # 格局
    if pan['格局']:
        lines.append(f"【格局显现】")
        for p in pan['格局']:
            emoji = "🟢" if p['吉凶'] in ["吉", "大吉"] else ("🔴" if p['吉凶'] == "凶" else "🟡")
            lines.append(f"  {emoji} {p['宫']}宫：{p['格']}（{p['吉凶']}）")
        lines.append("")
    
    # 综合
    lines.append(f"【交易综合判断】")
    lines.append(f"  评分：{pan['评分']}/100　方向：{pan['方向']}")
    lines.append(f"  → {pan['建议']}")
    for note in pan['细节']:
        lines.append(f"  · {note}")
    lines.append("")
    lines.append("━" * 40)
    
    return "\n".join(lines)


if __name__ == "__main__":
    # 直接运行输出当前排盘
    pan = qimen_master_pan()
    print(format_master_output(pan))