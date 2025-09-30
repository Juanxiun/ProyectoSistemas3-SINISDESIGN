export const file64 = async (file: File):Promise<string> => {
    const buffer = await file.arrayBuffer();
    const bytes = new Uint8Array(buffer);
    const base64 = btoa(String.fromCharCode(...bytes));
    const mime = file.type;
    return `data:${mime};base64,${base64}`;
}