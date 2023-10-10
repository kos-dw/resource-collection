import type { Page } from "puppeteer";
import ENV from "~/constants/environment";
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
  // 定数を取得
  env: ENV = new ENV();

  /**
   * 指定したページのurlを取得する
   * @param {Props}
   * @return {Promise<string[]>}
   * @memberof ResourceUrls
   */
  async get({ urls, page, selector, router }: Props): Promise<string[]> {
    let integratedUrl: string[] | null = [];

    for (let url of urls) {
      try {
        await router.transion(url, page, this.env.PUPPETEER.TRANSION_DELAY);
      } catch (e: any) {
        throw new Error(e.message);
      }
      const articles = await page.evaluate((selector) => {
        let anchors = [
          ...document.querySelectorAll(selector),
        ] as HTMLAnchorElement[];

        // 特定のURLを除外
        anchors = anchors.filter((a) => {
          // 除外条件
          // 1. target属性にblankが含まれる
          // 2. href属性にjavascriptが含まれる
          // 3. href属性がtel:またはmailto:で始まる
          const ignoreCase = [
            a.getAttribute("target")?.includes("blank"),
            a.href.includes("javascript"),
            /^[tel:|mailto:]/.test(a.href),
          ];

          return !ignoreCase.some((bool) => bool);
        });

        return anchors.map((a) => a.href);
      }, selector);
      integratedUrl = [...new Set([...integratedUrl, ...articles])];

      console.log(`[getting url]: from ${url}`);
      console.log(integratedUrl.join("\n"), "\n");
    }
    return integratedUrl;
  }
}
