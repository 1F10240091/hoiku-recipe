/** Prepare a small upload without retaining EXIF/GPS metadata. */
export async function prepareRecipeImage(file: File): Promise<string> {
  if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
    throw new Error("JPEG・PNG・WebPの写真を選んでください。");
  }
  if (file.size > 4 * 1024 * 1024) throw new Error("写真は4MB以下にしてください。");
  const url = URL.createObjectURL(file);
  try {
    const image = new Image();
    image.src = url;
    try { await image.decode(); } catch { throw new Error("写真を読み込めませんでした。別のJPEG・PNG・WebPを選んでください。"); }
    if (image.naturalWidth * image.naturalHeight > 20_000_000) {
      throw new Error("写真の解像度が大きすぎます。縮小してから選び直してください。");
    }
    const scale = Math.min(1, 1200 / Math.max(image.naturalWidth, image.naturalHeight));
    const canvas = document.createElement("canvas");
    canvas.width = Math.max(1, Math.round(image.naturalWidth * scale));
    canvas.height = Math.max(1, Math.round(image.naturalHeight * scale));
    const context = canvas.getContext("2d");
    if (!context) throw new Error("写真を処理できませんでした。");
    context.fillStyle = "#fff";
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.drawImage(image, 0, 0, canvas.width, canvas.height);
    const data = canvas.toDataURL("image/jpeg", 0.8);
    if (data.length > 700_000) throw new Error("写真を十分に縮小できませんでした。小さい写真を選んでください。");
    return data;
  } finally { URL.revokeObjectURL(url); }
}
