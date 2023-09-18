import fs from "fs";
import path from "path";
import type { Page } from "puppeteer";
import type { GotoPageWithWait } from "./GotoPageWithWait";

type StoreTextProps = {
  /** PuppeteerのPageオブジェクト */
  page: Page;
  /** スクレイピングページでの要素取得用セレクタ */
  selector: string;
  /** ファイルの保存先 */
  filePath: string;
};

type StoreImagesProps = {
  /** PuppeteerのPageオブジェクト */
  page: Page;
  /** スクレイピングページでの要素取得用セレクタ */
  selector: string;
  /** ページ遷移用の関数 */
  router: GotoPageWithWait;
  /** ファイルの保存先 */
  saveDir: string;
  /** サムネイルを作成するかどうか */
  thumbnail: string | boolean;
};

export class Salvage {
  /**
   * ページ内のテキストを取得して保存する
   * @param {StoreTextProps}
   * @memberof Salvage
   */
  async storeText({ page, selector, filePath }: StoreTextProps) {
    const title = await page.evaluate((selector) => {
      const title = document.querySelector(selector);
      return title?.textContent;
    }, selector);
    try {
      fs.writeFileSync(filePath, title ?? "no title");
    } catch (e: any) {
      console.error(e.message);
    }
  }

  /**
   * ページ内の画像を取得して保存する
   * @param {StoreImagesProps}
   * @memberof Salvage
   */
  async storeImages({
    page,
    selector,
    router,
    saveDir,
    thumbnail,
  }: StoreImagesProps) {
    // ページ内の画像のurlを取得
    const imageUrls = await page.evaluate((selector) => {
      const images = [
        ...document.querySelectorAll(selector),
      ] as HTMLImageElement[];
      return images.map((img) => img.src);
    }, selector);
    // 重複を削除
    const filteringUrls = [...new Set(imageUrls)];
    // 画像ページに遷移してからダウンロード
    for (let imageUrl of filteringUrls) {
      const res = await router.transion(imageUrl, page);
      if (res?.ok() == null) continue;
      const buffer = await res.buffer();
      try {
        fs.writeFileSync(path.join(saveDir, path.basename(imageUrl)), buffer);
        console.log(`[downloaded]: ${imageUrl}`);

        // メイン画像をサムネイル用として保存
        if (thumbnail !== false && imageUrl === imageUrls.slice(-1)[0]) {
          console.log(imageUrl, imageUrls.slice(-1)[0]);
          const prefix = typeof thumbnail === "string" ? thumbnail : "_thumb_";
          fs.writeFileSync(
            path.join(saveDir, `${prefix}${path.basename(imageUrl)}`),
            buffer
          );
          console.log(`[downloaded]: save thumbnail:${prefix}...`);
        }
      } catch (e: any) {
        console.error(e.message);
      }
    }
  }
}
