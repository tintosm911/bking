#!/usr/bin/env python3
"""天机桥接脚本：将 fortune_calc.py 输出转为 reading.json v8.0，生成 HTML 报告。"""
import json
import sys
import subprocess
import os
import datetime

TIANJI_DIR = os.path.expanduser("~/.agents/skills/tianji")

def convert_to_v8(calc_result):
    members_v8 = []

    for m in calc_result.get("members", []):
        bazi_section = {}
        if m.get("bazi") and len(m["bazi"]) == 4:
            pillars = ["年柱", "月柱", "日柱", "时柱"]
            bazi_section["four_pillars"] = {p: m["bazi"][i] for i, p in enumerate(pillars)}
            bazi_section["nayins"] = {}
            if m.get("nayins") and len(m["nayins"]) == 4:
                for i, p in enumerate(pillars):
                    bazi_section["nayins"][p] = m["nayins"][i]
        if m.get("day_gan"):
            bazi_section["day_master"] = m["day_gan"]

        wuxing_v8 = {}
        if m.get("wx"):
            wx_map = {"木": "wood", "火": "fire", "土": "earth", "金": "metal", "水": "water"}
            for cn, en in wx_map.items():
                if cn in m["wx"]:
                    wuxing_v8[en] = m["wx"][cn]

        chenggu_v8 = {}
        if m.get("chenggu"):
            chenggu_v8["total"] = m["chenggu"].get("总重", "")
            chenggu_v8["weight_breakdown"] = {
                "year": m["chenggu"].get("年", ""),
                "month": m["chenggu"].get("月", ""),
                "day": m["chenggu"].get("日", ""),
                "hour": m["chenggu"].get("时", ""),
            }
            chenggu_v8["grade"] = m["chenggu"].get("等级", "")
            chenggu_v8["song"] = m["chenggu"].get("歌诀", "")

        ziwei_v8 = {}
        if m.get("ziwei"):
            z = m["ziwei"]
            for key in ["life_palace", "body_palace", "wuxing_ju", "life_master", "body_master",
                         "life_palace_stars", "dayun_direction"]:
                ziwei_v8[key] = z.get(key, "")
            ziwei_v8["palaces"] = z.get("twelve_palaces_stars", {})
            ziwei_v8["sihua"] = z.get("sihua_detail", {})

        western_v8 = {
            "sun": m.get("zodiac", "") or m.get("sun_sign", ""),
            "moon": m.get("moon_sign", ""),
            "rising": m.get("rising_sign", ""),
        }

        wuge_v8 = {}
        if m.get("wuge"):
            for ge in ["天格", "人格", "地格", "外格", "总格"]:
                if ge in m["wuge"]:
                    wuge_v8[ge] = m["wuge"][ge]
            if "综合评分" in m.get("wuge", {}):
                wuge_v8["综合评分"] = m["wuge"]["综合评分"]
            if "综合评级" in m.get("wuge", {}):
                wuge_v8["综合评级"] = m["wuge"]["综合评级"]

        person_v8 = {
            "name": m.get("name", ""),
            "gender": m.get("gender", ""),
            "solar_date": m.get("solar_date", ""),
            "birth_time": m.get("birth_time", ""),
            "bazi": bazi_section,
            "wuxing": wuxing_v8,
            "chenggu": chenggu_v8,
            "ziwei": ziwei_v8,
            "western": western_v8,
            "wuge": wuge_v8,
        }
        members_v8.append(person_v8)

    synastry_v8 = {}
    if calc_result.get("synastry"):
        s = calc_result["synastry"]
        scores = {}
        for key in ["wuxing_balance", "wuxing_all", "shengxiao", "rizhu", "chenggu", "zodiac", "wuge"]:
            if key in s:
                scores[key] = s[key]
        synastry_v8 = {
            "scores": scores,
            "total": s.get("total", 0),
            "max_possible": s.get("max_possible", 100),
            "rating": s.get("rating", ""),
        }

    reading = {
        "meta": {
            "version": "8.0",
            "generated_at": datetime.datetime.now().isoformat(),
            "mode": "synastry" if len(members_v8) > 1 else "personal",
        },
        "persons": members_v8,
        "synastry": synastry_v8 if synastry_v8 else {},
    }
    return reading


def convert_to_frontend(calc_result):
    """将 fortune_calc.py 原生输出转为前端 tianji/page.tsx 期望的读取结构。

    前端契约（src/app/tianji/page.tsx）：
      persons[].bazi / nayins / day_gan / shengxiao / wx / missing_wx
      persons[].chenggu.{年,月,日,时,总重,等级,歌诀}
      persons[].ziwei.{life_palace, body_palace, wuxing_ju, life_master, body_master,
                        dayun_direction, life_palace_stars, 格局}
      persons[].zodiac.{sun_sign, moon_sign, rising_sign}
      persons[].name_wuge.{天格,人格,地格,外格,总格} -> {数理,吉凶}, 综合评分, 综合评级
      synastry.scores.{wuxing_balance, shengxiao, rizhu, zodiac}
      synastry.{total, max_possible, rating}
    """
    members = []
    for m in calc_result.get("members", []):
        ziwei_raw = m.get("ziwei") or {}
        ziwei = {
            "life_palace": ziwei_raw.get("命宫", ""),
            "body_palace": ziwei_raw.get("身宫", ""),
            "wuxing_ju": ziwei_raw.get("五行局", ""),
            "life_master": ziwei_raw.get("命主", ""),
            "body_master": ziwei_raw.get("身主", ""),
            "dayun_direction": ziwei_raw.get("大运方向", ""),
            "life_palace_stars": ",".join(ziwei_raw.get("命宫主星", []) or []),
            "格局": ziwei_raw.get("格局识别", []) or [],
        }

        # 星座：原生 zodiac 是字符串，moon_sign/rising_sign 是独立字段
        zodiac = {
            "sun_sign": m.get("zodiac", "") or "",
            "moon_sign": m.get("moon_sign", "") or "",
            "rising_sign": m.get("rising_sign", "") or "",
        }

        # 三才五格：原生 wuge.五格，前端读 name_wuge.{天格...}.{数理,吉凶}
        name_wuge = {}
        wuge_raw = m.get("wuge") or {}
        ge_list = ["天格", "人格", "地格", "外格", "总格"]
        five = wuge_raw.get("五格", {}) if isinstance(wuge_raw.get("五格"), dict) else {}
        for ge in ge_list:
            item = five.get(ge, {})
            name_wuge[ge] = {"数理": item.get("数理", ""), "吉凶": item.get("吉凶", "")}
        v = wuge_raw.get("五格", {}).get("综合评分") if isinstance(wuge_raw.get("五格"), dict) else None
        name_wuge["综合评分"] = wuge_raw.get("综合评分", v or "")
        name_wuge["综合评级"] = wuge_raw.get("综合评级", "")

        person = {
            "name": m.get("name", ""),
            "gender": m.get("gender", ""),
            "solar_date": m.get("solar_date", ""),
            "birth_time": m.get("birth_time", ""),
            "bazi": m.get("bazi", []),
            "nayins": m.get("nayins", []),
            "day_gan": m.get("day_gan", ""),
            "shengxiao": m.get("shengxiao", ""),
            "wx": m.get("wx", {}),
            "missing_wx": m.get("missing_wx", []),
            "chenggu": m.get("chenggu", {}),
            "ziwei": ziwei,
            "zodiac": zodiac,
            "name_wuge": name_wuge,
        }
        members.append(person)

    synastry = {}
    s = calc_result.get("synastry")
    if s:
        cs = s.get("composite_scores", {})
        synastry = {
            "scores": {
                "wuxing_balance": _num(cs.get("wuxing_balance", {}).get("score")) if isinstance(cs.get("wuxing_balance"), dict) else None,
                "wuxing_complete": _num(cs.get("wuxing_complete", {}).get("score")) if isinstance(cs.get("wuxing_complete"), dict) else None,
                "shengxiao": _num(cs.get("shengxiao", {}).get("score")) if isinstance(cs.get("shengxiao"), dict) else None,
                "rizhu": _num(cs.get("riZhu", {}).get("score")) if isinstance(cs.get("riZhu"), dict) else None,
                "zodiac": _num(cs.get("xingzuo", {}).get("score")) if isinstance(cs.get("xingzuo"), dict) else None,
                "chenggu": _num(cs.get("chenggu", {}).get("score")) if isinstance(cs.get("chenggu"), dict) else None,
                "wuge": _num(cs.get("xingming", {}).get("score")) if isinstance(cs.get("xingming"), dict) else None,
            },
            "total": _num(s.get("score", cs.get("total"))),
            "max_possible": _num(s.get("max_possible", 100)),
            "rating": s.get("rating", ""),
    }

    return {
        "meta": {
            "version": calc_result.get("version", "v8.2"),
            "mode": "synastry" if len(members) > 1 else "personal",
        },
        "members": members,
        "synastry": synastry if synastry else {},
    }


def _num(v):
    try:
        if v is None:
            return None
        return round(float(v), 1)
    except (TypeError, ValueError):
        return v


if __name__ == "__main__":
    # 用法:
    #   tianji_bridge.py <input.json> <output.html>          -> 转 v8 + 生成 HTML
    #   tianji_bridge.py --frontend <input.json> <output.json> -> 只转前端结构 (供 API JSON 返回)
    if len(sys.argv) < 2:
        print("Usage: tianji_bridge.py <input.json> [output.html]")
        print("       tianji_bridge.py --frontend <input.json> <output.json>")
        sys.exit(1)

    if sys.argv[1] == "--frontend":
        in_path = sys.argv[2]
        out_path = sys.argv[3] if len(sys.argv) > 3 else "/tmp/tianji_frontend.json"
        with open(in_path) as f:
            calc_result = json.load(f)
        frontend = convert_to_frontend(calc_result)
        with open(out_path, "w") as f:
            json.dump(frontend, f, ensure_ascii=False, indent=2)
        print(f"✅ 前端结构已生成: {out_path}")
        sys.exit(0)

    input_path = sys.argv[1]
    output_path = sys.argv[2] if len(sys.argv) > 2 else "/tmp/tianji_report.html"

    with open(input_path) as f:
        calc_result = json.load(f)

    reading_v8 = convert_to_v8(calc_result)

    tmp_reading = "/tmp/reading_v8_temp.json"
    with open(tmp_reading, "w") as f:
        json.dump(reading_v8, f, ensure_ascii=False, indent=2)

    script = os.path.join(TIANJI_DIR, "scripts/generate_html.py")
    result = subprocess.run(
        ["python3", script, "--reading", tmp_reading, "--output", output_path],
        capture_output=True, text=True
    )

    if result.returncode == 0:
        print(f"✅ HTML 报告已生成: {output_path}")
        print(f"   大小: {os.path.getsize(output_path)} bytes")
    else:
        print(f"❌ HTML 生成失败")
        print(result.stderr[:500])
        sys.exit(1)