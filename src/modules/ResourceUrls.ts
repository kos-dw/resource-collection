import type { Page } from "puppeteer";
import type { GotoPageWithWait } from "./GotoPageWithWait";

type Props = {
  /** アンカーを収集するページのurl */
  urls: string[];
  /** PuppeteerのPageオブジェクト */
  page: Page;
  /** スクレイピングページでの要素取得用セレクタ */
  selector: string;
  /** ページ遷移用の関数 */
  router: GotoPageWithWait;
};

export class ResourceUrls {
  /**
   * 指定したページのurlを取得する
   * @param {Props}
   * @return {Promise<string[]>}
   * @memberof ResourceUrls
   */
  async get({ urls, page, selector, router }: Props): Promise<string[]> {
    let integratedUrl: string[] | null = [];

    for (let url of urls) {
      await router.transion(url, page);
      const articles = await page.evaluate((selector) => {
        const anchors = [
          ...document.querySelectorAll(selector),
        ] as HTMLAnchorElement[];
        return anchors.map((a) => a.href);
      }, selector);
      integratedUrl = [...new Set([...integratedUrl, ...articles])];

      console.log(`[getting url]: ${url}`);
      console.log(integratedUrl.join("\n"), "\n");
    }
    return integratedUrl;
  }
}
