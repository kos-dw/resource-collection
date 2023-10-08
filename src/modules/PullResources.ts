import fs from "fs";
import path from "path";
import type { Page } from "puppeteer";

import ENV from "~/constants/environment";
import type { Props } from "~/types";
import { escapeFileName } from "~/utils";
import type { GotoPageWithWait } from "./GotoPageWithWait";
import type { Salvage } from "./Salvage";

type PullResourcesProps = {
  targetUrl: string;
  pageForPuppeteer: Page;
  env: ENV;
  router: GotoPageWithWait;
  propsForCollection: Props;
  salvage: Salvage;
};
export class PullResources {
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
      pageForPuppeteer,
      env,
      router,
      propsForCollection,
      salvage,
    } = props;
    const baseDir = env.DATA_DIR;
    const dirForBaseUrl = escapeFileName(propsForCollection.base_url);
    const dirForleaf = escapeFileName(targetUrl);
    const saveDir = path.join(baseDir, dirForBaseUrl, dirForleaf);

    // 保存先のディレクトリを作成
    try {
      fs.mkdirSync(saveDir, { recursive: true });
    } catch (e: any) {
      console.error(e.message);
    }

    // ページを開く
    await router.transion(targetUrl, pageForPuppeteer);
    console.log(`[moved]: ${targetUrl}`);

    // ページのタイトルを取得して保存
    await salvage.storeText({
      page: pageForPuppeteer,
      selector: propsForCollection.target.title,
      filePath: path.join(saveDir, "title.txt"),
    });

    // ページ内の画像のurlを取得後、画像ページに遷移してからダウンロード
    await salvage.storeImages({
      page: pageForPuppeteer,
      selector: propsForCollection.target.items,
      router: router,
      saveDir,
      thumbnail: propsForCollection.thumbnail,
    });
  }
}
