/**
 * 周公解梦引擎（词典匹配版）
 *
 * 原理：内置「梦境意象词典」，对用户输入的梦境内容做关键词匹配，
 *       命中的意象各自给出解读与吉凶，再汇总为综合吉凶与总解读。
 *
 * 说明：解梦为传统文化参考，非科学预测；解读按《周公解梦》约定及民间通说整理。
 * 覆盖高频类目：自然、动物、人体、器物、活动、社会、吉凶预兆。
 */

/** 梦境意象条目 */
export interface MengYi {
  keys: string[];      // 关键词（含近义词/别名）
  cat: string;         // 类目
  text: string;        // 解读
  good: "吉" | "凶" | "中";  // 吉凶
  weight: number;      // 权重（重要意象高）
}

/** 梦意象词典（高频+传统约定） */
export const MENG_DICT: MengYi[] = [
  // —— 自然 ——
  { keys: ["大水", "洪水", "涨水", "汪洋"], cat: "自然", text: "水主财，洪水如潮则财源滚滚，但泛滥过甚宜防盛极而衰、物极必反。", good: "吉", weight: 3 },
  { keys: ["水", "河流", "江河", "溪流", "泉水"], cat: "自然", text: "清水为吉，主顺遂通达、财源流动；浊水则心境烦扰。", good: "中", weight: 2 },
  { keys: ["火", "大火", "起火", "火光"], cat: "自然", text: "火主财与名，小火主旺，大火燎原有损，宜防躁动失财。", good: "中", weight: 2 },
  { keys: ["雨", "下雨", "雨水", "暴雨", "大雨"], cat: "自然", text: "雨润万物，主恩泽与人气；久旱逢甘雨为大吉，暴雨则防波折。", good: "吉", weight: 2 },
  { keys: ["雷", "打雷", "雷电", "雷声"], cat: "自然", text: "雷为惊变之声，主震动与转机，有贵人相助而事业将有大动静。", good: "吉", weight: 2 },
  { keys: ["风", "大风", "刮风", "狂风"], cat: "自然", text: "风主消息与变动，和风主顺利，疾风则防口舌与意外。", good: "中", weight: 1 },
  { keys: ["雪", "大雪", "下雪", "飘雪"], cat: "自然", text: "白雪兆丰年，主清白与吉祥，但久雪不化则防压抑迟滞。", good: "吉", weight: 2 },
  { keys: ["月亮", "月", "圆月", "月光"], cat: "自然", text: "明月主团圆与贵人，高悬明亮为大吉，月色朦胧则心事未明。", good: "吉", weight: 2 },
  { keys: ["太阳", "日", "日出", "阳光", "红日"], cat: "自然", text: "旭日东升主前程光明、运势上扬，是大吉之兆。", good: "吉", weight: 3 },
  { keys: ["星星", "繁星", "星空"], cat: "自然", text: "众星拱月主名利双收、贵人多助；孤星则主清静独立。", good: "吉", weight: 2 },
  { keys: ["山", "高山", "大山", "上山", "爬山"], cat: "自然", text: "山主稳固与进取，登山望远主事业登上高峰，攀之用力则需耐劳。", good: "吉", weight: 2 },
  { keys: ["海", "大海", "海洋"], cat: "自然", text: "海纳百川主心胸与机遇，平静为吉，波涛汹涌则防大起大落。", good: "中", weight: 2 },
  { keys: ["地震", "地动", "山崩"], cat: "自然", text: "地震主根基动摇，防家宅或事业有变，宜静守慎行。", good: "凶", weight: 3 },
  { keys: ["刮风下雨", "风雨"], cat: "自然", text: "风雨交加主波折阻隔，出行宜缓，凡事多思。", good: "凶", weight: 2 },

  // —— 动物 ——
  { keys: ["蛇", "长虫", "蟒蛇"], cat: "动物", text: "蛇主财与隐情。蛇追不咬主得财，见蛇主警惕口舌小人是非。", good: "中", weight: 3 },
  { keys: ["龙", "真龙", "龙的", "龙身"], cat: "动物", text: "龙为至尊，梦见升龙主大贵显达、有贵人提携，是大吉之兆。", good: "吉", weight: 3 },
  { keys: ["虎", "老虎", "猛虎"], cat: "动物", text: "虎主威权与挑战，虎不入身主有望升迁掌权，避虎则避险。", good: "吉", weight: 3 },
  { keys: ["鱼", "大鱼", "锦鲤", "钓鱼", "捕鱼", "游泳"], cat: "动物", text: "鱼主财与余，梦见鱼跃吉祥，捕鱼得鱼主财源丰盈。", good: "吉", weight: 3 },
  { keys: ["马", "骑马", "骏马", "奔马"], cat: "动物", text: "马主奔走与进步，骑马疾行主事业快进、有远行之喜。", good: "吉", weight: 2 },
  { keys: ["牛", "耕牛", "老牛"], cat: "动物", text: "牛主勤劳与稳健，主事业根基扎实、有实利。", good: "吉", weight: 2 },
  { keys: ["猪", "肥猪"], cat: "动物", text: "猪主财帛，肥猪入户主进财，是财运之兆。", good: "吉", weight: 2 },
  { keys: ["猫", "小猫", "猫咪"], cat: "动物", text: "猫主阴柔与灵变，主防小人近身，亦主家中平和。", good: "中", weight: 2 },
  { keys: ["狗", "小狗", "犬", "猎狗"], cat: "动物", text: "狗主忠义与守护，犬吠示警主防小人，见狗主有友人相护。", good: "中", weight: 2 },
  { keys: ["鸟", "飞鸟", "小鸟", "喜鹊", "乌鸦"], cat: "动物", text: "喜鹊报喜主喜事临门；乌鸦则主忧扰；群鸟飞翔主有远信佳音。", good: "中", weight: 2 },
  { keys: ["鸡", "公鸡", "母鸡", "鸡叫"], cat: "动物", text: "雄鸡报晓主时来运转、有起色；鸡斗则防口舌。", good: "吉", weight: 1 },
  { keys: ["狮子", "雄狮"], cat: "动物", text: "狮主权威荣耀，主有望掌权或得贵人重赏。", good: "吉", weight: 2 },
  { keys: ["大象", "大象"], cat: "动物", text: "象主吉祥稳重，主事业根基深厚、平安有靠。", good: "吉", weight: 1 },
  { keys: ["蜘蛛", "蜘蛛网"], cat: "动物", text: "蜘蛛结网主有客至或姻缘生，亦主辛勤得报。", good: "中", weight: 1 },
  { keys: ["蜜蜂", "蜂", "蝴蝶"], cat: "动物", text: "蜜蜂蝴蝶主喜气与丰获，主有喜讯与贵人往来。", good: "吉", weight: 1 },
  { keys: ["老鼠", "耗子"], cat: "动物", text: "鼠主小耗与奸邪，防小人作祟与琐碎破财。", good: "凶", weight: 2 },
  { keys: ["蛇咬", "被蛇咬", "蛇咬人"], cat: "动物", text: "蛇咬主有口舌是非或健康之忧，但蛇咬不伤则化险为夷。", good: "凶", weight: 3 },

  // —— 人体 ——
  { keys: ["牙齿", "牙", "掉牙", "掉牙齿", "拔牙"], cat: "人体", text: "掉牙主骨肉之变或长辈之忧，亦主旧我更新；松动则防变故。", good: "中", weight: 3 },
  { keys: ["头发", "掉发", "掉头发", "白发"], cat: "人体", text: "发主思绪与情缘，掉发主烦忧放下，白发主操心渐增。", good: "中", weight: 2 },
  { keys: ["血", "流血", "出血", "见血"], cat: "人体", text: "血主精力与吉凶交关。自己见血主破财或伤病，他人见血防凶事，亦有化险之机。", good: "凶", weight: 3 },
  { keys: ["死亡", "死人", "去世", "棺材", "尸体"], cat: "人体", text: "梦见棺材或人死亡，主官财双至、有意外之财或重任，多主吉。", good: "吉", weight: 3 },
  { keys: ["怀孕", "孕妇", "生子", "生孩子", "宝宝"], cat: "人体", text: "孕与生子主新机与喜事将近，是吉兆；主有新项目或新成员。", good: "吉", weight: 2 },
  { keys: ["哭", "哭泣", "流泪", "嚎啕"], cat: "人体", text: "梦哭主心事得泄、反主转吉，忧愁将散而喜事将至。", good: "吉", weight: 2 },
  { keys: ["笑", "大笑", "微笑"], cat: "人体", text: "梦笑主人际和乐，但大笑过甚防乐极生悲。", good: "中", weight: 1 },

  // —— 器物 ——
  { keys: ["钱", "金钱", "钞票", "元宝", "金银"], cat: "器物", text: "金银财帛主财气，纳财进库为吉，丢失散财则防破耗。", good: "中", weight: 3 },
  { keys: ["刀", "刀刃", "刀剑", "匕首"], cat: "器物", text: "刀主争端与决断，持刀主有主张，见血光则防是非。", good: "中", weight: 2 },
  { keys: ["衣服", "衣裳", "新衣", "换衣服"], cat: "器物", text: "新衣主新气象与身份之变，换衣主时运转新。", good: "吉", weight: 2 },
  { keys: ["房子", "房屋", "新房子", "盖房子", "别墅"], cat: "器物", text: "房主家业与根基，新宅主家运上升，修房主安宅兴家。", good: "吉", weight: 2 },
  { keys: ["车", "汽车", "开车", "驾车", "买车"], cat: "器物", text: "车主行程与进展，开车顺利主事业顺遂，撞车则防口舌事故。", good: "中", weight: 2 },
  { keys: ["船", "坐船", "轮船", "帆船"], cat: "器物", text: "船主渡河与机缘，乘风破浪主事业有成，翻船则防波折。", good: "中", weight: 2 },
  { keys: ["掉进", "坠落", "跌落", "摔倒", "跌到"], cat: "器物", text: "高处坠落主有所失或地位之虑，但落地无损则化凶为吉。", good: "凶", weight: 3 },
  { keys: ["飞", "飞起来", "飞翔", "天上飞"], cat: "器物", text: "梦飞主凌云壮志与突破，主有意想不到的发展与自由。", good: "吉", weight: 3 },
  { keys: ["考试", "考试", "答卷", "答题"], cat: "活动", text: "梦考试主受审视与考验，担忧则当下有压力待跨过，是进益之机。", good: "中", weight: 2 },
  { keys: ["鬼", "鬼怪", "鬼神", "妖魔鬼怪"], cat: "活动", text: "鬼魅主心有所惧或旧事缠扰，驱鬼则主排除心障、身心转清。", good: "凶", weight: 3 },
  { keys: ["逃跑", "追赶", "被追", "躲避", "逃跑"], cat: "活动", text: "被人追赶主现实压力暗藏，脱身则主心结解开。", good: "凶", weight: 2 },

  // —— 吉凶预兆 ——
  { keys: ["捡到钱", "捡钱", "拾金", "拾到"], cat: "吉兆", text: "拾金主意外之喜与隐形收入，是大吉之财兆。", good: "吉", weight: 3 },
  { keys: ["结婚", "婚礼", "嫁娶", "新郎", "新娘"], cat: "吉兆", text: "梦婚礼主喜庆与结合，主好事将近、关系上升。", good: "吉", weight: 2 },
  { keys: ["中奖", "中彩票", "获奖", "得奖"], cat: "吉兆", text: "中奖主惊喜之财与好运眷顾，主近期有意料之喜。", good: "吉", weight: 2 },
];

export interface JieMengResult {
  text: string;          // 用户输入
  hits: {
    keys: string;
    cat: string;
    text: string;
    good: "吉" | "凶" | "中";
  }[];                   // 命中意象
  good: "吉" | "凶" | "中";               // 综合吉凶
  summary: string;       // 大师口吻整合解读
}

/** 综合吉凶：按权重累加吉/凶/中 */
function overall(hits: MengYi[]): "吉" | "凶" | "中" {
  let g = 0, b = 0;
  for (const h of hits) {
    if (h.good === "吉") g += h.weight;
    else if (h.good === "凶") b += h.weight;
  }
  if (g === 0 && b === 0) return "中";
  if (g > b * 1.5) return "吉";
  if (b > g * 1.5) return "凶";
  return "中";
}

/** 解梦主入口：输入梦境文本，匹配意象并给出解读 */
export function jieMeng(text: string): JieMengResult {
  const input = text.trim();
  const matched: MengYi[] = [];
  for (const item of MENG_DICT) {
    for (const key of item.keys) {
      if (input.includes(key)) {
        if (!matched.some((m) => m === item)) matched.push(item);
        break;
      }
    }
  }
  // 排序：权重高在前
  matched.sort((a, b) => b.weight - a.weight);

  const good = overall(matched);
  const hits = matched.map((m) => ({ keys: m.keys[0], cat: m.cat, text: m.text, good: m.good }));

  let summary: string;
  if (matched.length === 0) {
    summary = "此梦意象较为特别，未入传统解梦之典。然梦由心生，日间所虑、心中所念皆可成形。且放宽心，静观其变，大事化小、小事化了，顺其自然即是福。";
  } else {
    const goodCount = matched.filter((m) => m.good === "吉").length;
    const badCount = matched.filter((m) => m.good === "凶").length;
    if (good === "吉") {
      summary = `此梦以${matched[0].keys}为眼，主吉。${matched.map((m) => m.text).slice(0, 2).join("")}总体气运上扬，宜乘势而为，把握近期之机会，可望顺遂得偿。`;
    } else if (good === "凶") {
      summary = `此梦以${matched[0].keys}为警，防有波折口舌。${matched.map((m) => m.text).slice(0, 2).join("")}近日宜静守慎行，凡事多思而后动，则凶兆自可化解大半。`;
    } else {
      summary = `此梦意象相间、吉凶参半，${matched.map((m) => m.text).slice(0, 2).join("")}主近期有得有失、喜忧各半，宜平心处之，宠辱不惊，自能趋吉避凶。`;
    }
  }

  return { text: input, hits, good, summary };
}
