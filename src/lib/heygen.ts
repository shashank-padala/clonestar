export async function createVideo(params: {
  talkingPhotoId: string;
  audioUrl: string;
  dimension: { width: number; height: number };
  callbackId: string;
  apiKey: string;
  title?: string;
}): Promise<{ videoId: string }> {
  const res = await fetch("https://api.heygen.com/v2/video/generate", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": params.apiKey,
    },
    body: JSON.stringify({
      title: params.title ?? "Generated Video",
      callback_id: params.callbackId,
      dimension: params.dimension,
      video_inputs: [
        {
          character: {
            type: "talking_photo",
            talking_photo_id: params.talkingPhotoId,
          },
          voice: {
            type: "audio",
            audio_url: params.audioUrl,
          },
          background: {
            type: "color",
            value: "#FFFFFF",
          },
        },
      ],
    }),
  });

  const json = (await res.json()) as { error?: string; data?: { video_id: string } };
  if (!res.ok || json.error) {
    throw new Error(json.error ?? `HeyGen API error: ${res.status}`);
  }
  if (!json.data?.video_id) {
    throw new Error("HeyGen did not return a video ID");
  }
  return { videoId: json.data.video_id };
}
