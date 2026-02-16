import OpenAI from "openai";

export async function rewriteScript(params: {
  transcript: string;
  outputFormat: "9:16" | "16:9";
  language: string;
  lengthSeconds: number;
  apiKey: string;
}): Promise<{ script: string; title: string }> {
  const openai = new OpenAI({ apiKey: params.apiKey });
  const formatDesc = params.outputFormat === "9:16" ? "vertical short (9:16, e.g. YouTube Shorts)" : "horizontal (16:9, standard YouTube)";
  const lengthDesc =
    params.lengthSeconds <= 60 ? "about 60 seconds" :
    params.lengthSeconds <= 180 ? "about 3 minutes" :
    "about 5–8 minutes";

  const systemPrompt = `You are a script writer. Rewrite the given transcript into a clear, engaging script suitable for an AI avatar video.
- Output format: ${formatDesc}.
- Target length: ${lengthDesc}.
- Language: ${params.language}.
- Output ONLY the script text, no titles or labels. Then on a new line write "TITLE:" followed by a short title (a few words) for the video.`;

  const completion = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: params.transcript.slice(0, 30000) },
    ],
    max_tokens: 4000,
  });

  const content = completion.choices[0]?.message?.content?.trim() ?? "";
  const titleMatch = content.match(/\nTITLE:\s*(.+)$/m);
  const title = titleMatch ? titleMatch[1].trim() : "Generated Video";
  const script = titleMatch ? content.replace(/\nTITLE:.*$/m, "").trim() : content;
  return { script, title };
}
