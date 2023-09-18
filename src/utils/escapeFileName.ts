/**
 * ファイル名に使えない文字を置き換える
 * @param {string} url
 * @return {string}
 */
export function escapeFileName(url: string): string {
  return url.replace(/[\.\/:*?"<>|]/g, "_");
}
