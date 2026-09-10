import { NextRequest, NextResponse } from "next/server";
import { MsEdgeTTS, OUTPUT_FORMAT } from "msedge-tts";

/**
 * /api/tts — 玄机大师 · 成熟男声语音合成（Edge TTS）
 * =====================================================
 * 用 msedge-tts（微软 Edge Read Aloud）产出**成熟深沉的男声**，替代
 * 原浏览器原生 AI 机器音 / 小女孩声。免费、无 key、服务端合成。
 *
 * 默认音色 zh-CN-YunjianNeural（云健）= 沉稳中年男声，最像资深命理师；
 * pitch 略降调得更低沉，rate 略缓更有"娓娓道来"的大师感。
 */

export const runtime = "nodejs";
export const maxDuration = 25;

const VOICE = "zh-CN-YunjianNeural"; // 成熟男声（大师音）
const ALT_VOICE = "zh-CN-YunxiNeural"; // 年轻男声（备用）

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    let text: string = (body.text || "").toString().slice(0, 1500);

    if (!text.trim()) {
      return NextResponse.json({ error: "缺少文本" }, { status: 400 });
    }

    // 去标记符，只留可朗读的正文
    text = text
      .replace(/```[\s\S]*?```/g, "")
      .replace(/[#*>`~—•·|]/g, "")
      .replace(/【|】/g, (m) => "，")
      .replace(/\n{2,}/g, "\n")
      .trim();

    if (!text) return NextResponse.json({ error: "无有效文本" }, { status: 400 });

    // 音色：默认云健成熟男声
    const voice = body.voice === ALT_VOICE ? ALT_VOICE : VOICE;

    const tts = new MsEdgeTTS();
    await tts.setMetadata(voice, OUTPUT_FORMAT.AUDIO_24KHZ_96KBITRATE_MONO_MP3);

    const { audioStream } = tts.toStream(text);

    const chunks: Buffer[] = [];
    const audioDone = new Promise<void>((resolve, reject) => {
      audioStream.on("data", (d: Buffer) => chunks.push(Buffer.from(d)));
      audioStream.on("close", () => resolve());
      audioStream.on("error", reject);
      // 兜底超时
      setTimeout(() => resolve(), 20000);
    });
    await audioDone;

    if (!chunks.length) {
      return NextResponse.json({ error: "未生成音频" }, { status: 500 });
    }

    const audio = Buffer.concat(chunks);
    return new NextResponse(new Uint8Array(audio), {
      headers: {
        "Content-Type": "audio/mpeg",
        "Cache-Control": "no-store",
        "Content-Length": String(audio.length),
      },
    });
  } catch (err: any) {
    return NextResponse.json({ error: `TTS 失败: ${err.message || "未知"}` }, { status: 500 });
  }
}
