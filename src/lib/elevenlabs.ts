export async function textToSpeech(params: {
  text: string;
  voiceId: string;
  apiKey: string;
}): Promise<ArrayBuffer> {
  const res = await fetch(
    `https://api.elevenlabs.io/v1/text-to-speech/${encodeURIComponent(params.voiceId)}`,
    {
      method: "POST",
      headers: {
        "Accept": "audio/mpeg",
        "Content-Type": "application/json",
        "xi-api-key": params.apiKey,
      },
      body: JSON.stringify({
        text: params.text,
        model_id: "eleven_multilingual_v2",
      }),
    }
  );
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`ElevenLabs TTS failed: ${res.status} ${err}`);
  }
  return res.arrayBuffer();
}
