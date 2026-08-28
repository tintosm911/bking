// 快速冒烟测试：用测试数据生成八字/塔罗 PDF，验证模板基座 + 中文字体嵌入
import { generateBaziReport, generateTarotReport } from "../src/lib/pdf/generator";
import fs from "fs";

async function main() {
  // 八字
  const bazi = await generateBaziReport({
    nickname: "测试缘主",
    birthday: "1992-08-15",
    birthHour: "14:00",
    gender: "male",
    baziResult: {
      heavenlyStems: ["壬", "戊", "甲", "辛"],
      earthlyBranches: ["申", "申", "午", "未"],
      fiveElements: "金旺 · 木相 · 火休 · 土囚 · 水死",
      dayMaster: "甲木",
      luckPillars: [
        { age: 8, stem: "己", branch: "酉", element: "金" },
        { age: 18, stem: "庚", branch: "戌", element: "金" },
        { age: 28, stem: "辛", branch: "亥", element: "水" },
        { age: 38, stem: "壬", branch: "子", element: "水" },
      ],
      summary: "甲木生于申月，七杀当令，身弱喜印比。早年奔波，中年得水木运助，渐入佳境。",
      analysis: "日主为甲木，生于申月金旺之地，七杀透干，性情刚毅果断，有领导之才。用神为水木，忌金土过旺。",
      advice: "宜补水木之运，多亲近水边。南方发展更利。情绪宜缓，戒急用忍。",
    },
  });

  // 塔罗
  const tarot = await generateTarotReport({
    nickname: "测试缘主",
    spread: "圣三角",
    cards: [
      { name: "魔术师", nameEn: "The Magician", reversed: false, meaning: "主动创造，把握当下机会。" },
      { name: "隐士", nameEn: "The Hermit", reversed: true, meaning: "过度封闭，需重新审视内心。" },
      { name: "太阳", nameEn: "The Sun", reversed: false, meaning: "光明与成功即将到来。" },
    ],
    interpretation: "整体运势向上。当下是主动出击的好时机，但需留意自我封闭的倾向。最终走向光明，值得期待。",
  });

  console.log("✅ 八字 PDF:", bazi, fs.statSync(bazi).size, "bytes");
  console.log("✅ 塔罗 PDF:", tarot, fs.statSync(tarot).size, "bytes");
}

main().catch((e) => {
  console.error("❌ 生成失败:", e);
  process.exit(1);
});