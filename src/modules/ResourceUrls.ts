import ENV from "~/constants/environment";
import type { GotoPageWithWait } from "./GotoPageWithWait";

type Props = {
  /** アンカーを収集するページのurl */
  urls: string[];
  /** スクレイピングページでの要素取得用セレクタ */
  selector: string;
};

export class ResourceUrls {
  // 定数を取得
  env: ENV = new ENV();
  router: GotoPageWithWait | null = null;

  constructor({ router }: { router: GotoPageWithWait }) {
    this.router = router;
  }

  /**
   * 指定したページのurlを取得する
   * @param {Props}
   * @return {Promise<string[]>}
   * @memberof ResourceUrls
   */
  async get({ urls, selector }: Props): Promise<string[]> {
    let integratedUrl: string[] | null = [];

    // PuppeteerのPageオブジェクトがnullの場合はエラーを投げる
    if (this.router?.page == null) throw new Error("puppeteerPage is null");

    for (let url of urls) {
      // ページ遷移
      await this.router.transion(url, this.env.PUPPETEER.TRANSION_DELAY);

      const articles = await this.router.page.evaluate((selector) => {
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
