/**
 * 指定した時間待機する
 * @param {number} ms
 */
export async function coffeeBreak(ms: number): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, ms));
}
