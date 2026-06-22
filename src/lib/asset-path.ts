export function assetPath(path: string) {
  const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

  if (!path) return path;
  if (path.startsWith("http://")) return path;
  if (path.startsWith("https://")) return path;
  if (path.startsWith("data:")) return path;
  if (!basePath) return path;
  if (path.startsWith(basePath)) return path;

  return path.startsWith("/") ? `${basePath}${path}` : `${basePath}/${path}`;
}