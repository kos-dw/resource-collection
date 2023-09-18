import { HTTPResponse, Page } from "puppeteer";
import { coffeeBreak } from "~/utils";

export class GotoPageWithWait {
  /**
   * ページ遷移を待機する
   * @param {string} url - 遷移先のURL
   * @param {Page} page - ページオブジェクト
   * @param {number} [delay=1000] - 遷移後の待機時間
   * @return {Promise<HTTPResponse | null>} - ページ遷移後のレスポンス
   * @memberof GotoPageWithWait
   */
  async transion(
    url: string,
    page: Page,
    delay: number = 1000
  ): Promise<HTTPResponse | null> {
    const [resFromGoto, resFromNav] = await Promise.all([
      page.goto(url),
      page.waitForNavigation(),
    ]);
    await coffeeBreak(delay);
    return resFromNav ?? resFromGoto;
  }
}
