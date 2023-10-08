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
      // base64形式の画像は保存しない
      if (/base64/.test(imageUrl)) continue;

      const res = await router.transion(imageUrl, page);
      if (res?.ok() == null) continue;
      const buffer = await res.buffer();

      try {
        let timestamp = Date.now().toString().padStart(3, "0");
        let extension = path.extname(imageUrl);
        let filename = `image_${timestamp}${extension}`;

        // 保存開始
        fs.writeFileSync(path.join(saveDir, filename), buffer);
        console.log(`[downloaded]: ${imageUrl} -> ${filename}`);

        // 取得画像の最後の画像をメイン画像サムネイル用として保存
        let imageUrlOfLast = imageUrls.slice(-1)[0];
        if (thumbnail !== false && imageUrl === imageUrlOfLast) {
          const prefix = typeof thumbnail === "string"
            ? thumbnail
            : "000thumb_";
          fs.writeFileSync(
            path.join(saveDir, `${prefix}${filename}`),
            buffer,
          );
          console.log(`[downloaded]: save thumbnail:${prefix}_${filename}`);
        }
      } catch (e: any) {
        console.error(e.message);
      }
    }
  }
}
