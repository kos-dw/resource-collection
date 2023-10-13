import fs from "fs";
import path from "path";
import type { Page } from "puppeteer";

import ENV from "~/constants/environment";
import type { Props } from "~/types";
import { escapeFileName } from "~/utils";
import type { GotoPageWithWait } from "./GotoPageWithWait";
import type { Salvage } from "./Salvage";

type PullResourcesProps = {
  /** 対象ページのURL */
  targetUrl: string;
  /** ページ遷移用の関数 */
  router: GotoPageWithWait;
  /** リソース収集の設定 */
  propsForCollection: Props;
  /** リソースを保存するクラス */
  salvage: Salvage;
};

export class PullResources {
  // 定数を取得
  env: ENV = new ENV();

  /**
   * 指定したページのリソースをダウンロードする
   * @public
   * @param {PullResourcesProps} props
   * @return {Promise<void>}
   * @memberof PullResources
   */
  public async exec(props: PullResourcesProps): Promise<void> {
    const {
      targetUrl,
      router,
      propsForCollection,
      salvage,
    } = props;
    const baseDir = this.env.DATA_DIR;
    const dirForBaseUrl = escapeFileName(propsForCollection.base_url);
    const dirForleaf = escapeFileName(targetUrl);
    const saveDir = path.join(baseDir, dirForBaseUrl, dirForleaf);

    // 保存先のディレクトリを作成
    try {
      fs.mkdirSync(saveDir, { recursive: true });
    } catch (e: any) {
      console.error(e.message);
    }

    // PuppeteerのPageオブジェクトがnullの場合はエラーを投げる
    if (router.page == null) throw new Error("puppeteerPage is null");

    // ページを開く
    await router.transion(
      targetUrl,
      this.env.PUPPETEER.TRANSION_DELAY,
    );
    console.log(`[moved]: ${targetUrl}`);

    // 非同期読み込みリソース対策として、ページ最下部まで移動する
    console.log(`[waiting]: now scrolling to the bottom of the page...`);
    await this.scrollDown(router.page);

    // ページのタイトルを取得して保存
    await salvage.storeText({
      router,
      selector: propsForCollection.target.title,
      filePath: path.join(saveDir, "title.txt"),
    });

    // ページ内の画像のurlを取得後、画像ページに遷移してからダウンロード
    await salvage.storeImages({
      selector: propsForCollection.target.items,
      router: router,
      saveDir,
      thumbnail: propsForCollection.thumbnail,
    });
  }

  /**
   * 非同期読み込みリソース対策として、ページ最下部まで移動する
   * @param {Page} page
   * @return {Promise<void>}
   * @memberof PullResources
   */
  public async scrollDown(page: Page): Promise<void> {
    await page.evaluate(async (waitTimeForScroll) => {
      const waitingTimeForLoading = waitTimeForScroll;
      const documentHeight = document.body.scrollHeight;
      const viewHeight = window.innerHeight;
      const numberOfDescents = Math.ceil(documentHeight / viewHeight);
      for (let i = 1; i <= numberOfDescents; i++) {
        window.scrollBy(0, viewHeight);
        await new Promise((resolve) =>
          setTimeout(resolve, waitingTimeForLoading)
        );
      }
    }, this.env.PUPPETEER.WAIT_TIME_FOR_SCROLL);
  }
}
