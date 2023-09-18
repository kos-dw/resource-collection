/**
 * 指定した範囲の数値を配列で返す
 * @param {number} start
 * @param {number} end
 * @return {number[]}
 */
export function range(start: number, end: number): number[] {
  return [...Array(end - start + 1)].map((_, i) => start + i);
}
