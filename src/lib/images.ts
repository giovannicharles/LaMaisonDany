export function optimizeImage(url: string | null | undefined, width = 800): string {
  if (!url) return "";
  if (!url.includes("res.cloudinary.com") || !url.includes("/upload/")) return url;
  if (/\/upload\/[^/]*(f_auto|q_auto|w_\d+)/.test(url)) return url;
  return url.replace("/upload/", `/upload/f_auto,q_auto,c_limit,w_${width}/`);
}
