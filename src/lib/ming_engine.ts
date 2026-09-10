// ============ 起名 / 姓名学 引擎 ============
// 核心路线：八字用神起名 —— 日主缺什么五行补什么，配五格数理 + 寓意 + 声韵
// 复用 bazi_engine.buildBazi 取用神/忌神/五行分布

import { buildBazi } from "./bazi_engine";

// ---------- 五行定义 ----------
export type Element = "金" | "木" | "水" | "火" | "土";

const ELEMENT_PROPERTY: Record<Element, string> = {
  金: "刚毅果断 · 义气 · 掌控力，易显严肃",
  木: "仁德生长 · 进取 · 条理，易显温和",
  水: "智慧流动 · 沟通 · 应变，易显圆融",
  火: "热情礼信 · 行动 · 感染力，易显张扬",
  土: "诚信稳重 · 包容 · 承载，易显厚实",
};

// 五行相生相克说明（用于补益解释）
const ELEMENT_BIYI: Record<Element, string> = {
  金: "金能生水，喜金者得坚强决断之力",
  木: "木能生火，喜木者得生长进取之势",
  水: "水能生木，喜水者得智慧圆融之性",
  火: "火能生土，喜火者得热情行动之能",
  土: "土能生金，喜土者得稳重承载之德",
};

// 五格数理吉凶表（1-81，传统姓名学用之，这里给常见值）
// 吉数 / 半吉 / 凶数 三段式
const JIXIONG: Record<number, { grade: string; note: string }> = {
  1: { grade: "大吉", note: "太极之数，万物开泰" },
  2: { grade: "凶", note: "两仪之数，混沌未开" },
  3: { grade: "大吉", note: "三才之数，天地人和" },
  4: { grade: "凶", note: "四象之数，待于生发" },
  5: { grade: "大吉", note: "五行之数，循环相生" },
  6: { grade: "吉", note: "六爻之数，发展变化" },
  7: { grade: "大吉", note: "七政之数，精悍严谨" },
  8: { grade: "大吉", note: "八卦之数，意志坚刚" },
  9: { grade: "凶", note: "大成之数，吉尽凶始" },
  10: { grade: "凶", note: "终结之数，万事终局" },
  11: { grade: "吉", note: "旱苗逢雨，枯木逢春" },
  12: { grade: "凶", note: "掘井无泉，意志薄弱" },
  13: { grade: "大吉", note: "春日牡丹，才艺多能" },
  14: { grade: "凶", note: "破兆之数，家庭缘薄" },
  15: { grade: "大吉", note: "福寿之数，涵养雅量" },
  16: { grade: "大吉", note: "厚重之数，贵人相助" },
  17: { grade: "半吉", note: "刚强之数，突破万难" },
  18: { grade: "半吉", note: "有志竟成，内外有运" },
  19: { grade: "凶", note: "风云蔽月，苦难不绝" },
  20: { grade: "凶", note: "非业破运，灾祸相接" },
  21: { grade: "大吉", note: "明月光照，独立权威" },
  22: { grade: "凶", note: "秋草逢霜，怀才不遇" },
  23: { grade: "大吉", note: "旭日东升，壮丽壮观" },
  24: { grade: "大吉", note: "掘藏得金，家门余庆" },
  25: { grade: "大吉", note: "荣俊之数，资性英敏" },
  26: { grade: "半吉", note: "变怪之数，英雄豪杰" },
  27: { grade: "半吉", note: "增长之数，欲望无止" },
  28: { grade: "凶", note: "阔水浮萍，豪杰气概" },
  29: { grade: "大吉", note: "智谋之数，财力归集" },
  30: { grade: "半吉", note: "非运之数，沉浮不定" },
  31: { grade: "大吉", note: "智勇得志，博得名利" },
  32: { grade: "大吉", note: "侥幸之数，贵人多助" },
  33: { grade: "大吉", note: "旭日升天，鸾凤相会" },
  34: { grade: "凶", note: "破家之数，灾难不绝" },
  35: { grade: "吉", note: "温和平静，优雅发展" },
  36: { grade: "半吉", note: "波澜重叠，沉浮万状" },
  37: { grade: "大吉", note: "猛虎出林，权威显达" },
  38: { grade: "半吉", note: "磨铁成针，刻意经营" },
  39: { grade: "大吉", note: "富贵荣华，财帛丰盈" },
  40: { grade: "半吉", note: "退安谨慎，智谋胆略" },
  41: { grade: "大吉", note: "德望高重，事事如意" },
  42: { grade: "半吉", note: "博识多能，精通世情" },
  43: { grade: "凶", note: "散财破产，须防不测" },
  44: { grade: "凶", note: "烦闷之数，破家亡身" },
  45: { grade: "大吉", note: "顺风扬帆，经纬深智" },
  46: { grade: "凶", note: "浪里淘金，载宝沉舟" },
  47: { grade: "大吉", note: "点石成金，开花结果" },
  48: { grade: "大吉", note: "古松立鹤，德智兼备" },
  49: { grade: "半吉", note: "吉凶难分，不断辛苦" },
  50: { grade: "半吉", note: "一成一败，吉凶参半" },
  51: { grade: "半吉", note: "盛衰交加，先苦后甜" },
  52: { grade: "大吉", note: "先见之明，理想实现" },
  53: { grade: "半吉", note: "忧愁困苦，先苦后甘" },
  54: { grade: "凶", note: "多难悲运，难望成功" },
  55: { grade: "半吉", note: "外观昌隆，内隐祸患" },
  56: { grade: "凶", note: "浪里行舟，历尽艰辛" },
  57: { grade: "大吉", note: "日照春松，寒雪青松" },
  58: { grade: "半吉", note: "先苦后甘，遇难呈祥" },
  59: { grade: "凶", note: "遇事犹疑，难望成事" },
  60: { grade: "凶", note: "黑暗无光，摆动不安" },
  61: { grade: "大吉", note: "牡丹芙蓉，名利双收" },
  62: { grade: "凶", note: "衰败之数，内外不和" },
  63: { grade: "大吉", note: "舟归平海，富贵荣华" },
  64: { grade: "凶", note: "骨肉分离，孤独悲愁" },
  65: { grade: "大吉", note: "富贵长寿，四方有成" },
  66: { grade: "凶", note: "进退维谷，内外不和" },
  67: { grade: "大吉", note: "顺风通达，家门兴隆" },
  68: { grade: "大吉", note: "顺风吹帆，智虑周密" },
  69: { grade: "凶", note: "非业之数，动摇不安" },
  70: { grade: "凶", note: "残菊经霜，家运衰退" },
  71: { grade: "半吉", note: "石上金花，内心劳苦" },
  72: { grade: "半吉", note: "先甜后苦，万宝难集" },
  73: { grade: "半吉", note: "志高力微，努力可成" },
  74: { grade: "凶", note: "残花经霜，秋叶落寞" },
  75: { grade: "半吉", note: "退守保吉，进取失权" },
  76: { grade: "凶", note: "离散之数，凶多吉少" },
  77: { grade: "半吉", note: "先苦后甘，半吉半凶" },
  78: { grade: "半吉", note: "晚景凄凉，功名有运" },
  79: { grade: "半吉", note: "云头望月，身疲力尽" },
  80: { grade: "凶", note: "尽数之终，一世劳苦" },
  81: { grade: "大吉", note: "万物回春，还本归元" },
};

// ---------- 五行字库 ----------
// 每个五行一组适合起名的吉利字（含常见姓名用字，寓意好、笔画适中）
const MINGZIKU: Record<Element, string[]> = {
  金: [
    "铭", "钧", "锐", "锋", "鑫", "铮", "钢", "铠", "晨", "星",
    "辰", "思", "锦", "银", "铄", "珩", "璟", "瑞", "璨", "臻",
    "曦", "清", "洁", "静", "素", "纯", "真", "慎", "聪", "宁",
    "睿", "言", "诗", "书", "玉", "宝", "珊", "瑶", "琪", "琳",
  ],
  木: [
    "沐", "森", "林", "楷", "桓", "桐", "楠", "柏", "松", "桦",
    "艺", "芳", "荣", "慧", "蕾", "蓉", "萱", "苒", "苏", "若",
    "蓝", "菁", "芷", "芊", "芃", "茁", "颖", "毅", "杰", "栋",
    "嘉", "琪", "榆", "桢", "彬", "桦", "权", "桥", "榕", "栩",
  ],
  水: [
    "浩", "泓", "泽", "涵", "润", "清", "漫", "澄", "淼", "沐",
    "涛", "浚", "渊", "沛", "澜", "潇", "沁", "沂", "泊",
    "溪", "洋", "海", "波", "泉", "江", "河", "流", "渺", "淳",
    "鸿", "霖", "雯", "雪", "雨", "露", "霜", "灵", "慧", "敏",
  ],
  火: [
    "炎", "煜", "炜", "烨", "炳", "燃", "焕", "烁", "光", "辉",
    "旭", "昊", "曜", "朋", "明", "星", "昶", "晞", "晴", "曜",
    "阳", "晟", "曦", "煦", "恬", "烨", "炽", "炅", "灿", "靓",
    "南", "映", "智", "知", "朗", "俊", "亮", "丹", "彤", "晴",
  ],
  土: [
    "坤", "垚", "培", "基", "坚", "岳", "峦", "峥", "峰", "峻",
    "安", "宇", "容", "嘉", "圣", "坊", "坪", "坦",
    "懿", "恩", "宸", "宥", "宜", "宛", "婉", "岚", "嵛", "岽",
    "维", "均", "垚", "圭", "培", "壤", "坦", "墨",
  ],
};

// 汉字五行（用于"测名字"时单字定五行）—— 精选映射，未收录字归中性(土暂缺→返回 null)
const CHAR_ELEMENT: Record<string, Element> = {};
for (const el of (["金", "木", "水", "火", "土"] as Element[])) {
  for (const c of MINGZIKU[el]) CHAR_ELEMENT[c] = el;
}

// ---------- 单字属性 ----------
interface MingChar {
  char: string;
  element: Element;
  meaning: string;
  score: number; // 寓意分 0-10
}

const MEANING: Record<string, string> = {
  // 常用字寓意
  铭: "铭记 · 铭心，喻才华出众", 钧: "千钧 · 重器，喻承重担当", 锐: "锐意 · 进取之锋", 锋: "锋芒 · 才华外显",
  鑫: "金多兴旺 · 财源广进", 铮: "铮铮铁骨 · 刚正不阿", 晨: "晨曦 · 朝气蓬勃", 星: "繁星 · 光彩照人",
  辰: "星辰 · 时运亨通", 锦: "锦绣 · 前程似锦", 银: "银辉 · 温润贵重", 珩: "玉佩 · 温雅有德",
  璟: "玉光 · 光彩夺目", 瑞: "祥瑞 · 吉庆之兆", 璨: "璀璨 · 光华闪耀", 曦: "晨曦 · 光明希望",
  睿: "睿智 · 通达明理", 聪: "聪慧 · 敏而好学", 宁: "安宁 · 平和从容", 玉: "美玉 · 温润纯良",
  宝: "珍宝 · 贵气天成", 瑶: "美玉 · 名贵雅致", 琪: "美玉 · 珍奇灵动", 琳: "美玉 · 清雅脱俗",
  沐: "沐浴 · 沐光而生", 森: "森林 · 生机盎然", 林: "林木 · 挺拔成长", 楷: "楷模 · 端正典范",
  桐: "梧桐 · 引凤来仪", 楠: "楠木 · 栋梁之材", 柏: "松柏 · 常青坚韧", 松: "青松 · 高洁不屈",
  艺: "才艺 · 多才多艺", 芳: "芬芳 · 品性高洁", 荣: "荣耀 · 欣欣向荣", 慧: "智慧 · 聪颖灵秀",
  若: "若水 · 上善柔韧", 蓝: "蓝天 · 开阔明朗", 菁: "菁华 · 精华出众", 芷: "白芷 · 淡雅高洁",
  芊: "芊蔚 · 草木茂盛", 茁: "茁壮 · 健康成长", 毅: "坚毅 · 果敢不屈", 杰: "俊杰 · 出类拔萃",
  栋: "栋梁 · 堪当大任", 嘉: "嘉美 · 善美出众", 权: "权衡 · 稳重有度", 桥: "桥梁 · 连通成事",
  栩: "栩栩 · 生动灵气", 浩: "浩大 · 胸怀宽广", 泓: "泓深 · 渊深有容", 泽: "恩泽 · 润泽苍生",
  涵: "涵养 · 包容雅量", 润: "温润 · 泽润万物", 漫: "烂漫 · 舒展自在", 澄: "澄澈 · 清明通透",
  淼: "淼淼 · 水势浩渺", 涛: "波涛 · 胸怀壮阔", 渊: "渊博 · 学识深厚", 沛: "充沛 · 生机蓬勃",
  澜: "波澜 · 大气从容", 潇: "潇洒 · 俊逸洒脱", 沁: "沁润 · 润泽入心", 沂: "沂水 · 清澈灵动",
  溪: "溪流 · 灵动清澈", 洋: "海洋 · 气度宽广", 海: "海纳 · 有容乃大", 波: "波澜 · 广阔向前",
  泉: "源泉 · 生生不息", 江: "长江 · 气势奔涌", 鸿: "鸿鹄 · 志向高远", 霖: "甘霖 · 恩泽祥瑞",
  雯: "云雯 · 文采斐然", 雪: "白雪 · 纯洁高洁", 雨: "春雨 · 润物无声", 露: "甘露 · 晶莹纯净",
  灵: "灵秀 · 机敏聪慧", 敏: "敏捷 · 才思敏锐", 炎: "炎炎 · 热烈向上", 煜: "煜煜 · 光明闪耀",
  炜: "炜烨 · 光彩夺目", 烨: "烨然 · 火光炽盛", 炳: "炳焕 · 光彩照人", 燃: "燃烧 · 热情奔放",
  焕: "焕发 · 神采奕奕", 烁: "烁烁 · 光华闪动", 光: "光明 · 前程光明", 辉: "辉耀 · 光耀门楣",
  旭: "旭日 · 朝气初升", 昊: "昊天 · 广阔浩大", 曜: "曜日 · 光芒四射", 朋: "朋挚 · 真诚热忱",
  明: "明达 · 光明磊落", 晞: "日晞 · 晨光初照", 晴: "晴朗 · 明媚开朗", 阳: "阳光 · 温暖积极",
  晟: "晟光 · 光明兴盛", 煦: "和煦 · 温暖如春", 恬: "恬静 · 恬淡安然", 炽: "炽热 · 赤诚热烈",
  灿: "灿烂 · 光彩闪耀", 南: "南方 · 光明之位", 映: "映照 · 清澈明亮", 智: "智慧 · 明理通达",
  知: "知慧 · 博学明理", 朗: "开朗 · 明朗大方", 俊: "俊朗 · 才貌出众", 亮: "明亮 · 光彩照人",
  丹: "丹心 · 赤诚之心", 彤: "彤云 · 朝气红润", 坤: "乾坤 · 厚德载物", 垚: "垚垚 · 山高土厚",
  培: "培植 · 根基深厚", 基: "基础 · 根基稳固", 坚: "坚毅 · 意志坚定", 岳: "山岳 · 稳重崇高",
  峦: "层峦 · 气势磅礴", 峥: "峥嵘 · 不凡出众", 峰: "高峰 · 卓越登顶", 峻: "峻岭 · 高峻挺拔",
  安: "安宁 · 平安顺遂", 宇: "寰宇 · 心胸宽广", 容: "宽容 · 有容乃大", 圣: "圣明 · 德高望重",
  懿: "懿德 · 美好德行", 恩: "恩泽 · 心存感恩", 宸: "宸宇 · 尊贵大气", 宥: "宥和 · 宽厚仁德",
  宜: "适宜 · 安稳和顺", 宛: "宛然 · 温婉典雅", 婉: "婉约 · 温柔雅致", 岚: "山岚 · 清新灵动",
  维: "维纲 · 稳重有序", 均: "均衡 · 中正平和", 圭: "圭璧 · 高贵典雅", 墨: "文墨 · 书香翰墨",
  榕: "榕荫 · 包容庇护", 栎: "栎木 · 挺拔坚实", 桓: "桓武 · 威武栋梁",
};

// ---------- 笔画数（用于五格） ----------
const CHAR_STROKE: Record<string, number> = {
  铭: 14, 钧: 12, 锐: 12, 锋: 15, 鑫: 24, 铮: 14, 晨: 11, 星: 9,
  辰: 7, 锦: 16, 银: 14, 珩: 11, 璟: 17, 瑞: 14, 璨: 17, 曦: 20,
  睿: 14, 聪: 15, 宁: 5, 玉: 5, 宝: 20, 瑶: 15, 琪: 13, 琳: 13,
  沐: 8, 森: 12, 林: 8, 楷: 13, 桐: 10, 楠: 13, 柏: 9, 松: 8,
  艺: 4, 芳: 10, 荣: 14, 慧: 15, 若: 11, 蓝: 13, 菁: 14, 芷: 10,
  芊: 9, 茁: 8, 毅: 15, 杰: 12, 栋: 12, 嘉: 14, 权: 6, 桥: 16,
  栩: 10, 浩: 11, 泓: 9, 泽: 17, 涵: 12, 润: 16, 漫: 14, 澄: 15,
  淼: 12, 涛: 18, 渊: 12, 沛: 8, 澜: 20, 潇: 19, 沁: 8, 沂: 7,
  溪: 14, 洋: 10, 海: 11, 波: 9, 泉: 9, 江: 7, 鸿: 17, 霖: 16,
  雯: 12, 雪: 11, 雨: 8, 露: 21, 灵: 7, 敏: 11, 炎: 8, 煜: 13,
  炜: 13, 烨: 14, 炳: 9, 燃: 16, 焕: 11, 烁: 9, 光: 6, 辉: 15,
  旭: 6, 昊: 8, 曜: 18, 朋: 8, 明: 8, 晞: 13, 晴: 12, 阳: 17,
  晟: 10, 煦: 13, 恬: 10, 炽: 9, 灿: 17, 南: 9, 映: 9, 智: 12,
  知: 8, 朗: 10, 俊: 9, 亮: 9, 丹: 4, 彤: 7, 坤: 8, 垚: 9,
  培: 11, 基: 11, 坚: 11, 岳: 8, 峦: 11, 峥: 12, 峰: 10, 峻: 10,
  安: 6, 宇: 6, 容: 10, 圣: 5, 懿: 22, 恩: 10, 宸: 10, 宥: 9,
  宜: 8, 宛: 8, 婉: 11, 岚: 12, 维: 14, 均: 7, 圭: 6, 墨: 15,
  榕: 14, 栎: 9, 桓: 10,
};
const DEFAULT_STROKE = 10;

// ---------- 姓氏笔画数（常见姓氏） ----------
const SURNAME_STROKE: Record<string, number> = {
  赵: 14, 钱: 16, 孙: 10, 李: 7, 周: 8, 吴: 7, 郑: 19, 王: 4,
  冯: 12, 陈: 16, 褚: 15, 卫: 15, 蒋: 17, 沈: 8, 韩: 17, 杨: 13,
  朱: 6, 秦: 10, 尤: 4, 许: 11, 何: 7, 吕: 7, 施: 9, 张: 11,
  孔: 4, 曹: 11, 严: 20, 华: 14, 金: 8, 魏: 17, 陶: 16, 姜: 9,
  谢: 17, 邹: 12, 窦: 20, 章: 11, 苏: 22, 潘: 16, 葛: 15, 范: 15,
  彭: 12, 鲁: 15, 韦: 9, 马: 10, 龙: 16, 柳: 9, 史: 5, 唐: 10,
  费: 12, 薛: 19, 罗: 20, 毕: 11, 郝: 14, 邬: 14, 安: 6,
  白: 5, 常: 11, 康: 11, 伍: 6, 林: 8, 黄: 12, 陆: 16, 刘: 15,
  徐: 10, 蔡: 17, 卢: 16, 江: 7, 丁: 2, 叶: 15, 董: 15, 姚: 9,
  梁: 11, 宋: 7, 高: 10, 郭: 15, 邱: 12,
  武: 8, 汪: 8, 曾: 12, 萧: 17, 程: 12, 袁: 10, 邓: 19,
  傅: 12, 廖: 14, 熊: 14, 石: 5,
};
const DEFAULT_SURNAME_STROKE = 10;

// ---------- 用神提取 ----------
export interface WuXingTarget {
  yongshen: Element | null;   // 用神五行
  jishen: Element | null;     // 忌神五行
  dayMaster: string;
  strong: boolean;
  distribution: Record<Element, number>; // 四柱五行计数
}

export function getWuXingTarget(
  year: number, month: number, day: number, hour: number, gender: number = 1
): WuXingTarget {
  const b = buildBazi(year, month, day, hour, gender);
  // 用神/忌神从排盘取（bazi_engine 中文字段）
  const ys = b.用神;
  const js = b.忌神;
  const dist: Record<Element, number> = { 金: 0, 木: 0, 水: 0, 火: 0, 土: 0 };
  // 五行分布直接用排盘的五柱旺衰（更准）
  for (const [el, n] of Object.entries(b.五行旺衰)) {
    const k = el as Element;
    if (k in dist) dist[k] = (dist[k] || 0) + (typeof n === "number" ? n : 1);
  }
  return {
    yongshen: (["金", "木", "水", "火", "土"] as Element[]).find((e) => e === ys) || null,
    jishen: (["金", "木", "水", "火", "土"] as Element[]).find((e) => e === js) || null,
    dayMaster: b.日主 || "",
    strong: b.是否身强,
    distribution: dist,
  };
}

// ---------- 五格数理 ----------
// 天格 = 姓+1；人格 = 姓+名1；地格 = 名1+名2；外格 = 名2+1；总格 = 姓+名1+名2
export interface WuGe {
  tian: number; ren: number; di: number; wai: number; zong: number;
  tianJ: string; renJ: string; diJ: string; waiJ: string; zongJ: string;
}

function numToJx(n: number): { grade: string; note: string } {
  const v = n > 81 ? n % 80 || 81 : n;
  return JIXIONG[v] || { grade: "平", note: "归中之数" };
}

export function calcWuGe(surname: string, given1: string, given2?: string): WuGe {
  const ss = SURNAME_STROKE[surname] || surname.length * 2 + 2 || DEFAULT_SURNAME_STROKE;
  const g1 = CHAR_STROKE[given1] || DEFAULT_STROKE;
  const g2 = given2 ? CHAR_STROKE[given2] || DEFAULT_STROKE : 0;
  const tian = ss + 1;
  const ren = ss + g1;
  const di = g2 ? g1 + g2 : g1 + 1;
  const wai = g2 ? g2 + 1 : 2;
  const zong = ss + g1 + g2;
  const t = numToJx(tian), r = numToJx(ren), d = numToJx(di), w = numToJx(wai), z = numToJx(zong);
  return {
    tian, ren, di, wai, zong,
    tianJ: t.grade, renJ: r.grade, diJ: d.grade, waiJ: w.grade, zongJ: z.grade,
  };
}

// ---------- 候选名字生成 ----------
export interface MingSuggestion {
  full: string;       // 全名（姓+名）
  given: string;      // 名字（不含姓）
  element: Element;   // 主要补益五行
  meaning: string;    // 寓意解析
  wuge: WuGe;
  score: number;      // 综合评分 0-100
  tag: string;        // 单字/双字
}

function pickGood(given1: string, surname: string, el: Element): MingSuggestion[] {
  const out: MingSuggestion[] = [];
  const pool = MINGZIKU[el];
  // 单字名
  for (const c of pool.slice(0, 22)) {
    const full = surname + c;
    const wu = calcWuGe(surname, c);
    const score = scoreName(wu, el, true, c);
    out.push({
      full, given: c, element: el,
      meaning: MEANING[c] || `${c}·${el}属性，利${el}补益`,
      wuge: wu, score, tag: "单字",
    });
  }
  return out.sort((a, b) => b.score - a.score);
}

function pickDouble(given1: string, surname: string, el: Element): MingSuggestion[] {
  const out: MingSuggestion[] = [];
  const pool = MINGZIKU[el];
  const pool2 = MINGZIKU[el].slice().reverse();
  for (let i = 0; i < pool.length; i++) {
    const c1 = pool[i];
    const c2 = pool2[Math.min(i, pool2.length - 1)];
    const full = surname + c1 + c2;
    const wu = calcWuGe(surname, c1, c2);
    const score = scoreName(wu, el, false, c1 + c2);
    out.push({
      full, given: c1 + c2, element: el,
      meaning: `${MEANING[c1] || c1}；${MEANING[c2] || c2}`,
      wuge: wu, score, tag: "双字",
    });
  }
  return out.sort((a, b) => b.score - a.score);
}

// 综合评分：五格吉凶为主，五行补益加分为辅
function scoreName(wu: WuGe, el: Element, isSingle: boolean, given: string): number {
  let s = 0;
  const grades: string[] = [wu.tianJ, wu.renJ, wu.diJ, wu.waiJ, wu.zongJ];
  for (const g of grades) {
    if (g === "大吉") s += 22;
    else if (g === "吉") s += 15;
    else if (g === "半吉") s += 8;
    else s += 2;
  }
  // 人格(主运)、总格(完运) 权重更高
  if (wu.renJ === "大吉") s += 6;
  if (wu.zongJ === "大吉") s += 6;
  if (wu.renJ === "凶") s -= 10;
  if (wu.zongJ === "凶") s -= 10;
  // 五行补益加分
  s += 8;
  // 寓意分
  for (const c of given) if (MEANING[c]) s += 4;
  return Math.min(98, Math.max(40, Math.round(s)));
}

// ---------- 测名字 ----------
export interface NameScore {
  full: string;
  chars: { char: string; element: Element | null; meaning: string }[];
  elements: Element[];
  wuge: WuGe;
  score: number;
  verdict: string;
}

export function scoreNameEx(full: string): NameScore {
  const surname = full.charAt(0);
  const rest = full.slice(1);
  const g1 = rest.charAt(0);
  const g2 = rest.length > 1 ? rest.charAt(1) : undefined;
  const chars = rest.split("").map((c) => ({
    char: c,
    element: CHAR_ELEMENT[c] || null,
    meaning: MEANING[c] || "（字库外，未收录寓意）",
  }));
  const elements = rest.split("").filter((c) => CHAR_ELEMENT[c]).map((c) => CHAR_ELEMENT[c]);
  const wu = calcWuGe(surname, g1, g2);
  const score = scoreName(wu, elements[0] || "土", !g2, rest);
  const grades = [wu.tianJ, wu.renJ, wu.diJ, wu.waiJ, wu.zongJ];
  let verdict: string;
  if (score >= 85) verdict = "上等佳名，数理大吉，五行补益，名如其人";
  else if (score >= 70) verdict = "中上之名，数理多吉，五行尚可";
  else if (score >= 55) verdict = "中平之名，数理平顺，可作参考";
  else verdict = "数理多凶，建议换字以求补益";
  return { full, chars, elements, wuge: wu, score, verdict };
}

// ---------- 主入口：八字起名 ----------
export interface MingResult {
  target: WuXingTarget;
  yongshenNote: string;
  single: MingSuggestion[];
  double: MingSuggestion[];
}

export function mingDivination(
  surname: string, year: number, month: number, day: number, hour: number, gender: number = 1
): MingResult {
  const target = getWuXingTarget(year, month, day, hour, gender);
  const el = target.yongshen || "土";
  const single = pickGood(target.yongshen || "", surname, el);
  const double = pickDouble("", surname, el);
  const yongshenNote = target.yongshen
    ? `日主「${target.dayMaster}」身${target.strong ? "强" : "弱"}，${target.yongshen}为用神。姓名宜补「${target.yongshen}」五行，${ELEMENT_BIYI[el]}。${target.jishen ? `忌「${target.jishen}」。` : ""}`
    : `日主「${target.dayMaster}」，五行较均衡，取「${el}」字补益稳妥。`;
  return { target, yongshenNote, single, double };
}

// 纯属相/喜好起名（不输入时辰时的轻量入口）
export function mingByElement(surname: string, el: Element): MingResult {
  const single = pickGood("", surname, el);
  const double = pickDouble("", surname, el);
  return {
    target: { yongshen: el, jishen: null, dayMaster: "", strong: false, distribution: { 金: 0, 木: 0, 水: 0, 火: 0, 土: 0 } },
    yongshenNote: `按「${el}」五行选字起名，${ELEMENT_PROPERTY[el]}。`,
    single, double,
  };
}
