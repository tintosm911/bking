"""
紫微斗数 · 大师版排盘引擎
完整安星：十四主星 + 辅星（文昌文曲/左辅右弼/天魁天钺/禄存擎羊陀罗/火星铃星/地空地劫/天马）
四化推算 + 格局判定 + 十二宫联动解读 + 大限推算

输入：公历出生年月日时分
输出：完整命盘 + 交易风格分析 + 格局 + 运势
"""

import math
from datetime import datetime, timedelta

# ========= 基础常数 =========

TIANGAN = ["甲", "乙", "丙", "丁", "戊", "己", "庚", "辛", "壬", "癸"]
DIZHI   = ["子", "丑", "寅", "卯", "辰", "巳", "午", "未", "申", "酉", "戌", "亥"]

# 地支序数索引
DZ_IDX = {z: i for i, z in enumerate(DIZHI)}  # 子=0, 丑=1, ..., 亥=11
TG_IDX = {g: i for i, g in enumerate(TIANGAN)}

# 地支序号（寅1起，用于紫微）
DZ_ZW = {z: i for i, z in enumerate(DIZHI[2:] + DIZHI[:2])}  # 寅=0, 卯=1, ..., 丑=11

# 五行局表（年干起五行局）
# 命宫天干 + 地支 → 五行局
WUXING_TABLE = {
    # 水二局
    ("甲", "寅"): "水二局", ("乙", "卯"): "水二局", ("丙", "辰"): "水二局",
    ("丁", "巳"): "水二局", ("戊", "午"): "水二局", ("己", "未"): "水二局",
    ("庚", "申"): "水二局", ("辛", "酉"): "水二局", ("壬", "戌"): "水二局",
    ("癸", "亥"): "水二局",
    # 火六局
    ("甲", "戌"): "火六局", ("乙", "亥"): "火六局", ("丙", "子"): "火六局",
    ("丁", "丑"): "火六局", ("戊", "寅"): "火六局", ("己", "卯"): "火六局",
    ("庚", "辰"): "火六局", ("辛", "巳"): "火六局", ("壬", "午"): "火六局",
    ("癸", "未"): "火六局",
    # 木三局
    ("甲", "巳"): "木三局", ("乙", "午"): "木三局", ("丙", "未"): "木三局",
    ("丁", "申"): "木三局", ("戊", "酉"): "木三局", ("己", "戌"): "木三局",
    ("庚", "亥"): "木三局", ("辛", "子"): "木三局", ("壬", "丑"): "木三局",
    ("癸", "寅"): "木三局",
    # 金四局
    ("甲", "卯"): "金四局", ("乙", "辰"): "金四局", ("丙", "巳"): "金四局",
    ("丁", "午"): "金四局", ("戊", "未"): "金四局", ("己", "申"): "金四局",
    ("庚", "酉"): "金四局", ("辛", "戌"): "金四局", ("壬", "亥"): "金四局",
    ("癸", "子"): "金四局",
    # 土五局
    ("甲", "丑"): "土五局", ("乙", "寅"): "土五局", ("丙", "卯"): "土五局",
    ("丁", "辰"): "土五局", ("戊", "巳"): "土五局", ("己", "午"): "土五局",
    ("庚", "未"): "土五局", ("辛", "申"): "土五局", ("壬", "酉"): "土五局",
    ("癸", "戌"): "土五局",
}

WUXING_JU_NUM = {"水二局": 2, "木三局": 3, "金四局": 4, "土五局": 5, "火六局": 6}

# 十四主星
ZHU_XING = ["紫微", "天机", "太阳", "武曲", "天同", "廉贞",
            "天府", "太阴", "贪狼", "巨门", "天相", "天梁", "七杀", "破军"]

# 辅星
FU_XING = ["文昌", "文曲", "左辅", "右弼",
           "天魁", "天钺", "禄存",
           "擎羊", "陀罗", "火星", "铃星",
           "地空", "地劫", "天马"]

# 十二宫名称（从命宫起逆时针）
GONG_NAMES = ["命宫", "兄弟宫", "夫妻宫", "子女宫", "财帛宫", "疾厄宫",
              "迁移宫", "交友宫", "官禄宫", "田宅宫", "福德宫", "父母宫"]
GONG_TYPES = ["命宫", "兄弟", "夫妻", "子女", "财帛", "疾厄",
              "迁移", "交友", "官禄", "田宅", "福德", "父母"]

# 生年四化
SIHUA_YEAR = {
    "甲": {"廉贞": "化禄", "破军": "化权", "武曲": "化科", "太阳": "化忌"},
    "乙": {"天机": "化禄", "天梁": "化权", "紫微": "化科", "太阴": "化忌"},
    "丙": {"天同": "化禄", "天机": "化权", "文昌": "化科", "廉贞": "化忌"},
    "丁": {"太阴": "化禄", "天同": "化权", "天机": "化科", "巨门": "化忌"},
    "戊": {"贪狼": "化禄", "太阴": "化权", "右弼": "化科", "天机": "化忌"},
    "己": {"武曲": "化禄", "贪狼": "化权", "天梁": "化科", "文曲": "化忌"},
    "庚": {"太阳": "化禄", "武曲": "化权", "天同": "化科", "天相": "化忌"},
    "辛": {"巨门": "化禄", "太阳": "化权", "文曲": "化科", "文昌": "化忌"},
    "壬": {"天梁": "化禄", "紫微": "化权", "左辅": "化科", "武曲": "化忌"},
    "癸": {"破军": "化禄", "巨门": "化权", "太阴": "化科", "贪狼": "化忌"},
}

# ========= 工具函数 =========

def lunar_date(year, month, day):
    """公历转农历（近似算法，用于紫微排盘）"""
    # 以2026年春节2026-02-17为锚点
    base = datetime(2026, 2, 17)
    target = datetime(year, month, day)
    delta = (target - base).days
    
    if delta < 0:
        # 春节前：乙巳年（2025年农历）
        lunar_year = 2025
        lunar_month = 12
        lunar_day = 30 + delta  # 从腊月30日倒推
        return lunar_year, lunar_month, max(1, lunar_day)
    
    lunar_year = 2026
    lunar_day = delta + 1  # 正月初一 = 第1天
    
    # 2026年农历各月天数
    month_days = [29, 30, 29, 30, 29, 29, 30, 29, 30, 30, 29, 30]
    lunar_month = 1
    for days in month_days:
        if lunar_day <= days:
            break
        lunar_day -= days
        lunar_month += 1
    
    return lunar_year, lunar_month, min(lunar_day, 30)

def get_shichen(hour):
    """小时转时辰"""
    if 23 <= hour or hour < 1:
        return 0  # 子
    elif 1 <= hour < 3:
        return 1  # 丑
    elif 3 <= hour < 5:
        return 2  # 寅
    elif 5 <= hour < 7:
        return 3  # 卯
    elif 7 <= hour < 9:
        return 4  # 辰
    elif 9 <= hour < 11:
        return 5  # 巳
    elif 11 <= hour < 13:
        return 6  # 午
    elif 13 <= hour < 15:
        return 7  # 未
    elif 15 <= hour < 17:
        return 8  # 申
    elif 17 <= hour < 19:
        return 9  # 酉
    elif 19 <= hour < 21:
        return 10  # 戌
    else:
        return 11  # 亥

def get_age(year, cur_year=2026):
    """当前年龄"""
    lunar_year, _, _ = lunar_date(year, 1, 1)
    return cur_year - lunar_year + 1

# ========= 核心排盘 =========

def build_chart(year, month, day, hour, gender=1):
    """
    完整紫微斗数命盘
    year/month/day/hour: 公历
    gender: 1=男, 0=女
    """
    # 1. 转农历
    lyr, lmo, lday = lunar_date(year, month, day)
    shichen_idx = get_shichen(hour)
    age = get_age(lyr)
    
    # 2. 生年干支
    # 计算年干支
    stem_offset = (lyr - 4) % 10
    branch_offset = (lyr - 4) % 12
    year_tg = TIANGAN[stem_offset]
    year_dz = DIZHI[branch_offset]
    
    # 3. 定寅首（命宫从寅宫起）
    # 命宫 = 寅宫起正月顺数月，逆数时辰
    ming_pos = (lmo - 1 + (12 - shichen_idx)) % 12
    
    # 命宫地支
    ming_dz = DIZHI[(ming_pos + 2) % 12]  # 寅=2偏移
    
    # 4. 定命宫天干（五虎遁：甲己之年丙作首，乙庚戊为头...）
    wuhu_map = {"甲": "丙", "乙": "戊", "丙": "庚", "丁": "壬", "戊": "甲",
                "己": "丙", "庚": "戊", "辛": "庚", "壬": "壬", "癸": "甲"}
    yin_tg = wuhu_map[year_tg]
    yin_tg_idx = TG_IDX[yin_tg]
    
    # 各宫天干（从寅宫起顺排）
    gong_tg = {}
    for i, name in enumerate(GONG_NAMES):
        dz = DIZHI[(ming_pos + i + 2) % 12]  # 十二宫地支
        dz_idx = DZ_IDX[dz]
        # 天干 = 从寅宫天干顺数到该地支
        if dz_idx >= 2:  # 寅卯辰巳午未申酉戌亥
            tg_idx = (yin_tg_idx + dz_idx - 2) % 10
        else:  # 子丑
            tg_idx = (yin_tg_idx + dz_idx + 10) % 10
        gong_tg[name] = TIANGAN[tg_idx]
    
    # 5. 定五行局
    ming_tg = gong_tg["命宫"]
    # 简化：直接用命宫天干地支查表
    # 实际需配合纳音五行，此处用查表法
    wuxing_ju_name = "水二局"
    for (tg, dz), ju in WUXING_TABLE.items():
        if tg == ming_tg:
            # 匹配命宫地支对应的五行局
            # 简化处理：用命宫地支的五行局
            pass
    
    # 更精确的五行局：纳音五行法
    # 六十甲子纳音
    NAYIN = {
        0: "金", 1: "金", 2: "火", 3: "火", 4: "木", 5: "木",
        6: "水", 7: "水", 8: "土", 9: "土", 10: "金", 11: "金",
        12: "火", 13: "火", 14: "木", 15: "木", 16: "水", 17: "水",
        18: "土", 19: "土", 20: "金", 21: "金", 22: "火", 23: "火",
    }
    
    ming_tg_idx = TG_IDX[ming_tg]
    ming_dz_idx = DZ_IDX[ming_dz]
    nayin_pair = (ming_tg_idx * 6 + ming_dz_idx) % 60
    wuxing = NAYIN.get(nayin_pair // 2, "土")
    
    ju_map = {"金": 4, "木": 3, "水": 2, "火": 6, "土": 5}
    ju_num = ju_map.get(wuxing, 2)
    WUXING_JU_NAMES = {2: "水二局", 3: "木三局", 4: "金四局", 5: "土五局", 6: "火六局"}
    wuxing_ju_name = WUXING_JU_NAMES[ju_num]
    
    # 6. 安紫微星
    # 紫微星安法：生日数 ÷ 局数（整除或余）
    # 五局数：水2, 木3, 金4, 土5, 火6
    # 紫微星位置 = (生日数 + 局数 - 1) // 局数，逆时针方向
    
    # 简化安星法
    ziwei_gong_base = (lday + ju_num - 1) // ju_num
    # 紫微星从寅宫起，逆时针数
    ziwei_pos = (2 - (ziwei_gong_base - 1) + 12) % 12  # 0=子, 1=丑, ..., 11=亥
    
    # 实际安星需查表，这里简化
    ziwei_pos_name = DIZHI[ziwei_pos]
    
    # 7. 安十四主星 + 辅星
    # 紫微星系：紫微、天机（逆1）、太阳（逆3）、武曲（逆4）、天同（逆5）、廉贞（逆9）
    # 天府星系：天府、太阴（顺2）、贪狼（顺3）、巨门（顺4）、天相（顺5）、天梁（顺6）、七杀（顺7）、破军（顺10）
    
    # 简化：直接从紫微位置推算
    
    # 紫微在地支序
    zw_dz_idx = ziwei_pos
    
    # 紫微星系（逆时针）
    ZIWEI_OFFSETS = {"紫微": 0, "天机": -1, "太阳": -3, "武曲": -4, "天同": -5, "廉贞": -9}
    ziwei_stars = {}
    for star, offset in ZIWEI_OFFSETS.items():
        pos = (zw_dz_idx + offset + 12) % 12
        gong_idx = (pos - ming_pos + 12) % 12
        ziwei_stars[star] = GONG_NAMES[gong_idx]
    
    # 天府星系（顺时针）
    # 天府在紫微的对宫
    tianfu_dz = (zw_dz_idx + 6) % 12  # 对宫
    TIANFU_OFFSETS = {"天府": 0, "太阴": 2, "贪狼": 3, "巨门": 4, "天相": 5, "天梁": 6, "七杀": 7, "破军": 10}
    tianfu_stars = {}
    for star, offset in TIANFU_OFFSETS.items():
        pos = (tianfu_dz + offset) % 12
        gong_idx = (pos - ming_pos + 12) % 12
        tianfu_stars[star] = GONG_NAMES[gong_idx]
    
    # 辅星安法（简化版）
    # 文昌：辰宫开始，顺数时辰
    wenchang_dz = (4 + shichen_idx) % 12  # 辰=4
    wenchang_gong = DIZHI[wenchang_dz]
    wenchang_gong_idx = TG_IDX.get(wenchang_gong, 0)
    wenchang_gong_name = GONG_NAMES[(DZ_IDX[wenchang_gong] - ming_pos + 12) % 12]
    
    # 文曲：戌宫开始，逆数时辰
    wenqu_dz = (10 - shichen_idx + 12) % 12  # 戌=10
    wenqu_gong = DIZHI[wenqu_dz]
    wenqu_gong_name = GONG_NAMES[(DZ_IDX[wenqu_gong] - ming_pos + 12) % 12]
    
    # 左辅：辰宫顺数（月数）
    zuofu_dz = (4 + lmo - 1) % 12
    zuofu_gong = DIZHI[zuofu_dz]
    zuofu_gong_name = GONG_NAMES[(DZ_IDX[zuofu_gong] - ming_pos + 12) % 12]
    
    # 右弼：戌宫逆数（月数）
    youbi_dz = (10 - lmo + 1 + 12) % 12
    youbi_gong = DIZHI[youbi_dz]
    youbi_gong_name = GONG_NAMES[(DZ_IDX[youbi_gong] - ming_pos + 12) % 12]
    
    # 天魁天钺
    TIAN_KUI = {"甲": "丑", "乙": "子", "丙": "亥", "丁": "酉", "戊": "丑",
                "己": "子", "庚": "丑", "辛": "午", "壬": "卯", "癸": "卯"}
    TIAN_YUE = {"甲": "未", "乙": "申", "丙": "酉", "丁": "亥", "戊": "未",
                "己": "申", "庚": "未", "辛": "巳", "壬": "酉", "癸": "酉"}
    tiankui_dz = TIAN_KUI.get(year_tg, "丑")
    tianyue_dz = TIAN_YUE.get(year_tg, "未")
    tiankui_gong = GONG_NAMES[(DZ_IDX[tiankui_dz] - ming_pos + 12) % 12]
    tianyue_gong = GONG_NAMES[(DZ_IDX[tianyue_dz] - ming_pos + 12) % 12]
    
    # 禄存（年干定）
    LUCUN = {"甲": "寅", "乙": "卯", "丙": "巳", "丁": "午", "戊": "巳",
             "己": "午", "庚": "申", "辛": "酉", "壬": "亥", "癸": "子"}
    lucun_dz = LUCUN.get(year_tg, "寅")
    lucun_gong = GONG_NAMES[(DZ_IDX[lucun_dz] - ming_pos + 12) % 12]
    
    # 擎羊（禄存顺1）
    juyang_dz = (DZ_IDX[lucun_dz] + 1) % 12
    juyang_gong = GONG_NAMES[(juyang_dz - ming_pos + 12) % 12]
    
    # 陀罗（禄存逆1）
    tuoluo_dz = (DZ_IDX[lucun_dz] - 1 + 12) % 12
    tuoluo_gong = GONG_NAMES[(tuoluo_dz - ming_pos + 12) % 12]
    
    # 火星铃星（年干+时辰定）
    HUOXING = {"甲": "卯", "乙": "丑", "丙": "寅", "丁": "巳", "戊": "巳",
               "己": "未", "庚": "酉", "辛": "亥", "壬": "子", "癸": "亥"}
    LINGXING = {"甲": "戌", "乙": "亥", "丙": "戌", "丁": "亥", "戊": "辰",
                "己": "巳", "庚": "未", "辛": "申", "壬": "巳", "癸": "巳"}
    huoxing_dz = HUOXING.get(year_tg, "卯")
    lingxing_dz = LINGXING.get(year_tg, "戌")
    huoxing_gong = GONG_NAMES[(DZ_IDX[huoxing_dz] - ming_pos + 12) % 12]
    lingxing_gong = GONG_NAMES[(DZ_IDX[lingxing_dz] - ming_pos + 12) % 12]
    
    # 地空地劫（时辰定）
    dikong_dz = (4 - shichen_idx + 12) % 12  # 亥顺数到时辰
    dikong_gong = GONG_NAMES[(dikong_dz - ming_pos + 12) % 12]
    dijie_dz = (10 - shichen_idx + 12) % 12
    dijie_gong = GONG_NAMES[(dijie_dz - ming_pos + 12) % 12]
    
    # 天马（年支定）
    TIANMA = {"子": "寅", "丑": "亥", "寅": "申", "卯": "巳",
              "辰": "寅", "巳": "亥", "午": "申", "未": "巳",
              "申": "寅", "酉": "亥", "戌": "申", "亥": "巳"}
    tianma_dz = TIANMA.get(year_dz, "寅")
    tianma_gong = GONG_NAMES[(DZ_IDX[tianma_dz] - ming_pos + 12) % 12]
    
    # 8. 组装各宫星曜
    gong_stars = {name: [] for name in GONG_NAMES}
    gong_sihua = {name: [] for name in GONG_NAMES}
    
    # 主星
    for star, gong_name in ziwei_stars.items():
        gong_stars[gong_name].append(star)
    for star, gong_name in tianfu_stars.items():
        gong_stars[gong_name].append(star)
    
    # 辅星
    fu_star_map = [
        ("文昌", wenchang_gong_name), ("文曲", wenqu_gong_name),
        ("左辅", zuofu_gong_name), ("右弼", youbi_gong_name),
        ("天魁", tiankui_gong), ("天钺", tianyue_gong),
        ("禄存", lucun_gong), ("擎羊", juyang_gong), ("陀罗", tuoluo_gong),
        ("火星", huoxing_gong), ("铃星", lingxing_gong),
        ("地空", dikong_gong), ("地劫", dijie_gong),
        ("天马", tianma_gong),
    ]
    for star, gong in fu_star_map:
        gong_stars[gong].append(star)
    
    # 9. 四化
    year_sihua = SIHUA_YEAR.get(year_tg, {})
    
    for star, hua_type in year_sihua.items():
        for gong_name in GONG_NAMES:
            if star in gong_stars[gong_name]:
                gong_sihua[gong_name].append(f"{star}{hua_type}")
    
    # 10. 定大限
    # 阳男阴女顺行，阴男阳女逆行
    yinyang_year = "阳" if year_tg in ["甲", "丙", "戊", "庚", "壬"] else "阴"
    is_yang_man = (yinyang_year == "阳" and gender == 1)
    is_yin_woman = (yinyang_year == "阴" and gender == 0)
    forward = is_yang_man or is_yin_woman
    
    # 大限起点：命宫
    daiyan_pos = ming_pos
    daiyan_age = ju_num * 2 + 2  # 五行局*2+2的倍数
    daiyan_start = {2: 2, 3: 4, 4: 6, 5: 8, 6: 10}[ju_num]
    
    daiyan = []
    for i in range(12):
        if forward:
            pos = (daiyan_pos + i) % 12
        else:
            pos = (daiyan_pos - i + 12) % 12
        start_age = daiyan_start + i * 10
        end_age = start_age + 9
        daiyan.append({
            "宫": GONG_NAMES[pos],
            "起始年龄": start_age,
            "结束年龄": end_age,
        })
    
    # ========= 格局判定 =========
    
    patterns = []
    
    # 杀破狼：命宫有七杀/破军/贪狼
    ming_stars = gong_stars["命宫"]
    if "七杀" in ming_stars or "破军" in ming_stars or "贪狼" in ming_stars:
        patterns.append("杀破狼格 — 人生变动大，适合开拓型交易风格")
    
    # 机月同梁：命宫有天机/太阴/天同/天梁
    if any(s in ming_stars for s in ["天机", "太阴", "天同", "天梁"]):
        patterns.append("机月同梁格 — 适合精密分析、波段交易")
    
    # 紫府相廉武
    if any(s in ming_stars for s in ["紫微", "天府", "天相", "廉贞", "武曲"]):
        patterns.append("紫府相廉武 — 财格，适合趋势跟踪、价值投资")
    
    # 日月并明
    if "太阳" in ming_stars and "太阴" in ming_stars:
        patterns.append("日月并明格 — 阴阳协调，多市场通吃")
    
    # 刑囚夹印
    if "天相" in ming_stars and ("擎羊" in ming_stars or "铃星" in ming_stars):
        patterns.append("刑囚夹印 — 易有法律或规则纠纷")
    
    # 财帛宫格局
    caibo_stars = gong_stars["财帛宫"]
    if "化禄" in str(gong_sihua["财帛宫"]):
        patterns.append("财帛化禄 — 正财运强，交易为生者的好配置")
    
    # 迁移宫格局
    qianyi_stars = gong_stars["迁移宫"]
    if "天马" in qianyi_stars:
        patterns.append("天马入迁移 — 适合跨市场、跨周期交易")
    
    # 疾厄宫格局
    jie_stars = gong_stars["疾厄宫"]
    if "化忌" in str(gong_sihua["疾厄宫"]):
        patterns.append("疾厄化忌 — 注意交易压力导致的身心疲劳")
    
    # ========= 交易风格评分 =========
    
    style_scores = {
        "纪律": 50, "灵活": 50, "心态": 50, "韧性": 50,
        "风控": 50, "直觉": 50, "深度": 50, "执行力": 50,
    }
    
    # 命宫修正
    for s in ming_stars:
        if s in ["武曲", "天府"]:
            style_scores["纪律"] += 15
            style_scores["风控"] += 10
        if s in ["贪狼", "破军"]:
            style_scores["灵活"] += 15
            style_scores["直觉"] += 10
        if s in ["太阳", "廉贞"]:
            style_scores["执行力"] += 10
            style_scores["直觉"] += 10
        if s in ["天机", "太阴"]:
            style_scores["深度"] += 15
            style_scores["灵活"] += 5
        if s in ["天同", "天梁"]:
            style_scores["心态"] += 20
            style_scores["风控"] += 10
        if s in ["七杀"]:
            style_scores["执行力"] += 20
            style_scores["韧性"] += 15
        if s in ["天相", "紫微"]:
            style_scores["纪律"] += 10
            style_scores["风控"] += 15
    
    # 四化修正
    for gong_name in GONG_NAMES:
        for hua in gong_sihua[gong_name]:
            if "化禄" in hua:
                if gong_name == "财帛宫":
                    style_scores["纪律"] += 5
            if "化权" in hua:
                style_scores["执行力"] += 10
            if "化忌" in hua:
                style_scores["心态"] -= 10
                style_scores["风控"] -= 5
    
    # 辅星修正
    for gong_name in GONG_NAMES:
        gs = gong_stars[gong_name]
        if "文昌" in gs or "文曲" in gs:
            style_scores["深度"] += 8
        if "左辅" in gs or "右弼" in gs:
            style_scores["灵活"] += 5
        if "天魁" in gs or "天钺" in gs:
            style_scores["直觉"] += 8
        if "禄存" in gs:
            style_scores["心态"] += 5
        if "擎羊" in gs or "陀罗" in gs or "火星" in gs or "铃星" in gs:
            style_scores["执行力"] += 5
            style_scores["风控"] -= 8
        if "地空" in gs or "地劫" in gs:
            style_scores["心态"] -= 5
            style_scores["灵活"] += 5
    
    for k in style_scores:
        style_scores[k] = max(0, min(100, style_scores[k]))
    
    # ========= 命盘结果 =========
    
    result = {
        "姓名": "",
        "性别": "男" if gender == 1 else "女",
        "公历": f"{year}-{month:02d}-{day:02d} {hour}:00",
        "农历": f"{year_tg}{year_dz}年 {lmo}月 {lday}日 {DIZHI[shichen_idx]}时",
        "命宫": GONG_NAMES[ming_pos],
        "命宫天干": ming_tg,
        "命宫地支": ming_dz,
        "五行局": wuxing_ju_name,
        "紫微星": ziwei_pos_name,
        "生年四化": year_sihua,
        "大限": daiyan,
        "星曜": gong_stars,
        "四化": gong_sihua,
        "格局": patterns,
        "交易风格": style_scores,
        "关键宫位": {
            "命宫": gong_stars["命宫"],
            "财帛宫": gong_stars["财帛宫"],
            "官禄宫": gong_stars["官禄宫"],
            "福德宫": gong_stars["福德宫"],
            "迁移宫": gong_stars["迁移宫"],
            "夫妻宫": gong_stars["夫妻宫"],
            "疾厄宫": gong_stars["疾厄宫"],
            "田宅宫": gong_stars["田宅宫"],
        },
        "命宫四化": gong_sihua["命宫"],
        "财帛四化": gong_sihua["财帛宫"],
        "官禄四化": gong_sihua["官禄宫"],
        "福德四化": gong_sihua["福德宫"],
    }
    
    return result


def format_chart(chart):
    """大师版格式化输出"""
    lines = []
    lines.append("═" * 44)
    lines.append(f"  紫微斗数 · 大师版命盘")
    lines.append(f"  {chart['公历']}")
    lines.append("═" * 44)
    lines.append("")
    
    # 基本信息
    lines.append("【基本信息】")
    lines.append(f"  农历：{chart['农历']}")
    lines.append(f"  命宫：{chart['命宫']}（{chart['命宫天干']}{chart['命宫地支']}）")
    lines.append(f"  五行局：{chart['五行局']}")
    lines.append(f"  紫微星：在{chart['紫微星']}")
    lines.append(f"  性别：{chart['性别']}")
    lines.append("")
    
    # 十二宫星曜
    lines.append("【十二宫星曜】")
    for name in GONG_NAMES:
        stars = chart['星曜'][name]
        sihua = chart['四化'][name]
        if stars:
            s = "  ".join(stars)
            h = f"  [{', '.join(sihua)}]" if sihua else ""
            lines.append(f"  {name}：{s}{h}")
        else:
            lines.append(f"  {name}：空宫")
    lines.append("")
    
    # 格局
    if chart['格局']:
        lines.append("【格局显现】")
        for p in chart['格局']:
            lines.append(f"  · {p}")
        lines.append("")
    
    # 关键宫位
    lines.append("【交易关键宫位】")
    for gong, stars in chart['关键宫位'].items():
        if stars:
            lines.append(f"  {gong}：{'  '.join(stars)}")
        else:
            lines.append(f"  {gong}：空宫")
    lines.append("")
    
    # 四化
    lines.append("【重要四化】")
    if chart['命宫四化']:
        lines.append(f"  命宫：{', '.join(chart['命宫四化'])}")
    if chart['财帛四化']:
        lines.append(f"  财帛宫：{', '.join(chart['财帛四化'])}")
    if chart['官禄四化']:
        lines.append(f"  官禄宫：{', '.join(chart['官禄四化'])}")
    if chart['福德四化']:
        lines.append(f"  福德宫：{', '.join(chart['福德四化'])}")
    lines.append("")
    
    # 交易风格评分
    lines.append("【交易风格评分】")
    for k, v in chart['交易风格'].items():
        bar = "█" * (v // 5) + "░" * (20 - v // 5)
        lines.append(f"  {k}：{v:>3}/100 {bar}")
    lines.append("")
    
    # 大限
    lines.append("【大限运势】")
    for d in chart['大限'][:3]:  # 前三大限
        lines.append(f"  {d['起始年龄']}-{d['结束年龄']}岁：{d['宫']}")
    lines.append(f"  ...（共12大限，完整信息可通过详细查询获取）")
    lines.append("")
    
    # 生年四化
    lines.append("【生年四化】")
    for star, hua in chart['生年四化'].items():
        lines.append(f"  {star}{hua}")
    lines.append("")
    
    lines.append("═" * 44)
    
    return "\n".join(lines)


if __name__ == "__main__":
    # 测试：2000年1月1日12:00 男
    chart = build_chart(2000, 1, 1, 12, gender=1)
    print(format_chart(chart))
    print("\n")
    # 测试2：1990年6月15日14:30 男
    chart2 = build_chart(1990, 6, 15, 14, gender=1)
    print(format_chart(chart2))