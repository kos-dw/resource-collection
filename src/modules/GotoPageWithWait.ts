import type { HTTPResponse, Page } from "puppeteer";
import { coffeeBreak } from "~/utils";

export class GotoPageWithWait {
  // PuppeteerのPageオブジェクト
  public page: Page | undefined;

  /**
   * ページ遷移を待機する
   * @param {string} url - 遷移先のURL
   * @param {number} [delay=1000] - 遷移後の待機時間
   * @return {Promise<HTTPResponse | null>} - ページ遷移後のレスポンス
   * @memberof GotoPageWithWait
   */
  async transion(
    url: string,
    delay: number = 1000,
  ): Promise<HTTPResponse | null> {
    if (this.page == null) throw new Error("puppeteerPage is null");
    const [resFromGoto, resFromNav] = await Promise.all([
      this.page.goto(url),
      this.page.waitForNavigation(),
    ]);
    await coffeeBreak(delay);
    return resFromNav ?? resFromGoto;
  }

  /**
   * PuppeteerのPageオブジェクトをセットする
   * @param {Page} page
   * @memberof GotoPageWithWait
   */
  set setPage(page: Page) {
    this.page = page;
  }
}
