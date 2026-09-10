import Link from "next/link";

const YINYANG = [
  { name: "阳", symbol: "☀️", desc: "刚健、主动、明亮、向上、向外。天、日、男、君、热、动皆属阳。" },
  { name: "阴", symbol: "🌙", desc: "柔顺、被动、暗晦、向下、向内。地、月、女、臣、寒、静皆属阴。" },
];

const WUXING = [
  { name: "金", icon: "⚔️", color: "text-yellow-300", desc: "收敛、肃杀、变革。肺、大肠、西方、秋季。", relation: "金生水 · 金克木" },
  { name: "木", icon: "🌳", color: "text-green-300", desc: "生发、条达、生长。肝、胆、东方、春季。", relation: "木生火 · 木克土" },
  { name: "水", icon: "💧", color: "text-blue-300", desc: "滋润、下行、寒凉。肾、膀胱、北方、冬季。", relation: "水生木 · 水克火" },
  { name: "火", icon: "🔥", color: "text-red-300", desc: "炎热、向上、光明。心、小肠、南方、夏季。", relation: "火生土 · 火克金" },
  { name: "土", icon: "🏔️", color: "text-amber-300", desc: "承载、生化、受纳。脾、胃、中央、长夏。", relation: "土生金 · 土克水" },
];

const SHENGKE = [
  { from: "木", to: "火", arrow: "→", why: "木燃生火" },
  { from: "火", to: "土", arrow: "→", why: "火烬成土" },
  { from: "土", to: "金", arrow: "→", why: "土中藏金" },
  { from: "金", to: "水", arrow: "→", why: "金熔为水" },
  { from: "水", to: "木", arrow: "→", why: "水润生木" },
];

const KE = [
  { from: "金", to: "木", why: "金伐木" },
  { from: "木", to: "土", why: "木破土" },
  { from: "土", to: "水", why: "土挡水" },
  { from: "水", to: "火", why: "水灭火" },
  { from: "火", to: "金", why: "火熔金" },
];

const TIAN_GAN = [
  { g: "甲", y: "阳", w: "木", d: "参天大树，栋梁之材" },
  { g: "乙", y: "阴", w: "木", d: "花草藤蔓，柔韧生长" },
  { g: "丙", y: "阳", w: "火", d: "太阳之光，光明热烈" },
  { g: "丁", y: "阴", w: "火", d: "灯烛之火，温和明亮" },
  { g: "戊", y: "阳", w: "土", d: "城墙厚土，稳重包容" },
  { g: "己", y: "阴", w: "土", d: "田园湿土，滋养万物" },
  { g: "庚", y: "阳", w: "金", d: "刀剑钢铁，肃杀刚硬" },
  { g: "辛", y: "阴", w: "金", d: "珠宝首饰，细腻精致" },
  { g: "壬", y: "阳", w: "水", d: "江海之水，奔流不息" },
  { g: "癸", y: "阴", w: "水", d: "雨露之水，滋润无声" },
];

const DI_ZHI = [
  { z: "子", y: "阳", w: "水", sx: "鼠", hs: "23-1时", d: "藏癸水，一阳初生" },
  { z: "丑", y: "阴", w: "土", sx: "牛", hs: "1-3时", d: "藏己癸辛，湿土蓄水" },
  { z: "寅", y: "阳", w: "木", sx: "虎", hs: "3-5时", d: "藏甲丙戊，初生之木" },
  { z: "卯", y: "阴", w: "木", sx: "兔", hs: "5-7时", d: "藏乙木，花草之木" },
  { z: "辰", y: "阳", w: "土", sx: "龙", hs: "7-9时", d: "藏戊乙癸，水库含木" },
  { z: "巳", y: "阴", w: "火", sx: "蛇", hs: "9-11时", d: "藏丙戊庚，盛夏之火" },
  { z: "午", y: "阳", w: "火", sx: "马", hs: "11-13时", d: "藏丁己，鼎盛之火" },
  { z: "未", y: "阴", w: "土", sx: "羊", hs: "13-15时", d: "藏己丁乙，木库含火" },
  { z: "申", y: "阳", w: "金", sx: "猴", hs: "15-17时", d: "藏庚壬戊，肃杀之金" },
  { z: "酉", y: "阴", w: "金", sx: "鸡", hs: "17-19时", d: "藏辛金，成器之金" },
  { z: "戌", y: "阳", w: "土", sx: "狗", hs: "19-21时", d: "藏戊辛丁，火库含金" },
  { z: "亥", y: "阴", w: "水", sx: "猪", hs: "21-23时", d: "藏壬甲，江海之水" },
];

const SHI_ER_CHANGSHENG = [
  { stage: "长生", d: "新生命诞生，生机初现，如婴孩落地。" },
  { stage: "沐浴", d: "如婴孩洗浴，带桃花之气，性情开放。" },
  { stage: "冠带", d: "弱冠加冠，初入社会，渐渐自立。" },
  { stage: "临官", d: "出仕为官，事业得位，最旺之机。" },
  { stage: "帝旺", d: "如日中天，极盛之时，物极将反。" },
  { stage: "衰", d: "盛极而衰，气数减退，需守成。" },
  { stage: "病", d: "如人染病，气弱力衰，宜静养。" },
  { stage: "死", d: "如人亡故，气尽归寂，静待来复。" },
  { stage: "墓", d: "如入墓藏，收蓄储存，为将来蓄力。" },
  { stage: "绝", d: "气绝而止，如无根之木，待新生。" },
  { stage: "胎", d: "如受胎成形，气方孕育，萌芽将出。" },
  { stage: "养", d: "如养胎成长，培元固本，蓄势待发。" },
];

const NAYIN = [
  { wu: "甲子乙丑", name: "海中金" },
  { wu: "丙寅丁卯", name: "炉中火" },
  { wu: "戊辰己巳", name: "大林木" },
  { wu: "庚午辛未", name: "路旁土" },
  { wu: "壬申癸酉", name: "剑锋金" },
  { wu: "甲戌乙亥", name: "山头火" },
  { wu: "丙子丁丑", name: "涧下水" },
  { wu: "戊寅己卯", name: "城头土" },
  { wu: "庚辰辛巳", name: "白蜡金" },
  { wu: "壬午癸未", name: "杨柳木" },
  { wu: "甲申乙酉", name: "泉中水" },
  { wu: "丙戌丁亥", name: "屋上土" },
  { wu: "戊子己丑", name: "霹雳火" },
  { wu: "庚寅辛卯", name: "松柏木" },
  { wu: "壬辰癸巳", name: "长流水" },
  { wu: "甲午乙未", name: "沙中金" },
  { wu: "丙申丁酉", name: "山下火" },
  { wu: "戊戌己亥", name: "平地木" },
  { wu: "庚子辛丑", name: "壁上土" },
  { wu: "壬寅癸卯", name: "金箔金" },
  { wu: "甲辰乙巳", name: "覆灯火" },
  { wu: "丙午丁未", name: "天河水" },
  { wu: "戊申己酉", name: "大驿土" },
  { wu: "庚戌辛亥", name: "钗钏金" },
  { wu: "壬子癸丑", name: "桑柘木" },
  { wu: "甲寅乙卯", name: "大溪水" },
  { wu: "丙辰丁巳", name: "沙中土" },
  { wu: "戊午己未", name: "天上火" },
  { wu: "庚申辛酉", name: "石榴木" },
  { wu: "壬戌癸亥", name: "大海水" },
];

export default function JichuPage() {
  return (
    <main className="min-h-screen bg-[#0d0d0d] text-white/80 relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute top-[-10%] left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-gold/10 rounded-full blur-[120px]" />
      </div>

      <div className="relative z-10 max-w-5xl mx-auto px-6 py-16">
        {/* 面包屑 + 标题 */}
        <div className="mb-10">
          <Link href="/baodian" className="text-xs text-white/40 hover:text-gold transition-colors mb-4 inline-block">
            ← 术数宝典
          </Link>
          <span className="inline-block px-4 py-1.5 text-xs text-gold bg-gold/8 rounded-full border border-gold/15 tracking-wider mb-4">
            ☯️ 基础入门
          </span>
          <h1 className="text-4xl md:text-5xl font-serif font-bold text-gold-400 mb-3">
            阴阳五行 · 天干地支
          </h1>
          <p className="text-white/70 max-w-2xl">
            一切术数（八字、紫微、六爻、奇门）的共同根基。理解阴阳消长、五行生克、
            干支纪时，是读懂任何排盘的第一步。
          </p>
        </div>

        {/* 一、阴阳 */}
        <section className="mb-16">
          <h2 className="text-2xl font-serif text-gold mb-6">一、阴阳</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {YINYANG.map((y) => (
              <div key={y.name} className="glass rounded-2xl p-6 border border-white/10">
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-3xl">{y.symbol}</span>
                  <span className="font-serif text-xl text-gold">{y.name}</span>
                </div>
                <p className="text-sm text-white/70 leading-relaxed">{y.desc}</p>
              </div>
            ))}
          </div>
          <p className="mt-4 text-sm text-white/50 leading-relaxed">
            阴阳互根、消长、转化：孤阴不生、独阳不长，物极必反。八字论命，
            先分日主阴阳刚柔，再看全局寒暖燥湿之平衡。
          </p>
        </section>

        {/* 二、五行 */}
        <section className="mb-16">
          <h2 className="text-2xl font-serif text-gold mb-2">二、五行</h2>
          <p className="text-sm text-white/50 mb-4">金木水火土，相生相克，循环不已。</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
            {WUXING.map((w) => (
              <div key={w.name} className="glass rounded-2xl p-5 border border-white/10 text-center">
                <div className="text-3xl mb-2">{w.icon}</div>
                <div className={`font-serif text-xl font-bold ${w.color}`}>{w.name}</div>
                <p className="text-xs text-white/60 mt-2 leading-relaxed">{w.desc}</p>
                <div className="mt-3 text-[11px] text-gold/80">{w.relation}</div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="glass rounded-2xl p-6 border border-white/10">
              <h3 className="font-serif text-gold mb-4">相生（滋养递进）</h3>
              <div className="space-y-2">
                {SHENGKE.map((s) => (
                  <div key={s.from} className="flex items-center gap-2 text-sm">
                    <span className="font-bold text-gold">{s.from}</span>
                    <span className="text-white/40">{s.arrow}</span>
                    <span className="font-bold">{s.to}</span>
                    <span className="text-white/40">· {s.why}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="glass rounded-2xl p-6 border border-white/10">
              <h3 className="font-serif text-gold mb-4">相克（制约约束）</h3>
              <div className="space-y-2">
                {KE.map((k) => (
                  <div key={k.from} className="flex items-center gap-2 text-sm">
                    <span className="font-bold text-gold">{k.from}</span>
                    <span className="text-white/40">克</span>
                    <span className="font-bold">{k.to}</span>
                    <span className="text-white/40">· {k.why}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* 三、天干 */}
        <section className="mb-16">
          <h2 className="text-2xl font-serif text-gold mb-6">三、十天干</h2>
          <div className="glass rounded-2xl border border-white/10 overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gold/10 text-gold">
                  <th className="py-3 px-4 text-left">天干</th>
                  <th className="py-3 px-4 text-left">阴阳</th>
                  <th className="py-3 px-4 text-left">五行</th>
                  <th className="py-3 px-4 text-left hidden md:table-cell">意象</th>
                </tr>
              </thead>
              <tbody>
                {TIAN_GAN.map((t) => (
                  <tr key={t.g} className="border-t border-white/5 hover:bg-gold/5">
                    <td className="py-2.5 px-4 font-serif text-gold text-lg">{t.g}</td>
                    <td className="py-2.5 px-4 text-white/60">{t.y}</td>
                    <td className="py-2.5 px-4 font-bold">{t.w}</td>
                    <td className="py-2.5 px-4 text-white/60 hidden md:table-cell">{t.d}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* 四、地支 */}
        <section className="mb-16">
          <h2 className="text-2xl font-serif text-gold mb-6">四、十二地支</h2>
          <div className="glass rounded-2xl border border-white/10 overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gold/10 text-gold">
                  <th className="py-3 px-4 text-left">地支</th>
                  <th className="py-3 px-4 text-left">生肖</th>
                  <th className="py-3 px-4 text-left">阴阳</th>
                  <th className="py-3 px-4 text-left">五行</th>
                  <th className="py-3 px-4 text-left hidden md:table-cell">时辰</th>
                  <th className="py-3 px-4 text-left hidden lg:table-cell">藏干</th>
                </tr>
              </thead>
              <tbody>
                {DI_ZHI.map((d) => (
                  <tr key={d.z} className="border-t border-white/5 hover:bg-gold/5">
                    <td className="py-2.5 px-4 font-serif text-gold text-lg">{d.z}</td>
                    <td className="py-2.5 px-4">{d.sx}</td>
                    <td className="py-2.5 px-4 text-white/60">{d.y}</td>
                    <td className="py-2.5 px-4 font-bold">{d.w}</td>
                    <td className="py-2.5 px-4 text-white/60 hidden md:table-cell">{d.hs}</td>
                    <td className="py-2.5 px-4 text-white/60 hidden lg:table-cell">{d.d}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* 五、十二长生 */}
        <section className="mb-16">
          <h2 className="text-2xl font-serif text-gold mb-6">五、十二长生</h2>
          <p className="text-sm text-white/50 mb-4">五行在十二宫位的旺衰状态，论十天干在各支的强弱。</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {SHI_ER_CHANGSHENG.map((s) => (
              <div key={s.stage} className="glass rounded-xl p-4 border border-white/10">
                <div className="font-serif text-gold mb-1">{s.stage}</div>
                <p className="text-xs text-white/60 leading-relaxed">{s.d}</p>
              </div>
            ))}
          </div>
        </section>

        {/* 六、纳音 */}
        <section className="mb-16">
          <h2 className="text-2xl font-serif text-gold mb-6">六、纳音五行</h2>
          <p className="text-sm text-white/50 mb-4">六十甲子每两年一组，各配一种纳音（如「海中金」），用于年命五行。</p>
          <div className="glass rounded-2xl border border-white/10 overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gold/10 text-gold">
                  <th className="py-3 px-4 text-left">干支</th>
                  <th className="py-3 px-4 text-left">纳音</th>
                </tr>
              </thead>
              <tbody>
                {NAYIN.map((n) => (
                  <tr key={n.wu} className="border-t border-white/5 hover:bg-gold/5">
                    <td className="py-2 px-4">{n.wu}</td>
                    <td className="py-2 px-4 font-serif text-gold">{n.name}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* 底部 CTA */}
        <div className="mt-12 text-center">
          <Link href="/bazi" className="btn-gold px-8 py-3.5 rounded-xl text-base font-semibold inline-flex items-center gap-2 shadow-lg shadow-gold/15">
            🔮 用排盘工具实战
          </Link>
          <p className="text-xs text-white/40 mt-4">
            理论懂了，去八字排盘看看属于你的天干地支吧
          </p>
        </div>
      </div>
    </main>
  );
}
