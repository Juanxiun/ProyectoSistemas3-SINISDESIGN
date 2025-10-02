export const fileBlob = async (file: File): Promise<Uint8Array> => {
  const buffer = await file.arrayBuffer();
  const bytes = new Uint8Array(buffer);
  return bytes;
};
