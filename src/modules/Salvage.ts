import fs from "fs";
import path from "path";
import ENV from "~/constants/environment";
import type { GotoPageWithWait } from "./GotoPageWithWait";

type StoreTextProps = {
  /** スクレイピングページでの要素取得用セレクタ */
  selector: string;
  /** ファイルの保存先 */
  filePath: string;
};

type StoreImagesProps = {
  /** スクレイピングページでの要素取得用セレクタ */
  selector: string;
  /** ファイルの保存先 */
  saveDir: string;
  /** サムネイルを作成するかどうか */
  thumbnail: string | boolean;
};

export class Salvage {
  // 定数を取得
  env: ENV = new ENV();
  router: GotoPageWithWait | null = null;

  constructor({ router }: { router: GotoPageWithWait }) {
    this.router = router;
  }

  /**
   * ページ内のテキストを取得して保存する
   * @param {StoreTextProps}
   * @memberof Salvage
   */
  async storeText({ selector, filePath }: StoreTextProps) {
    // PuppeteerのPageオブジェクトがnullの場合はエラーを投げる
    if (this.router?.page == null) throw new Error("puppeteerPage is null");

    const title = await this.router.page.evaluate((selector) => {
      const title = document.querySelector(selector);
      return title?.textContent;
    }, selector);
    try {
      fs.writeFileSync(filePath, title ?? "no title");
    } catch (e: unknown) {
      if (e instanceof Error) {
        console.error(e.message);
      }
    }
  }

  /**
   * ページ内の画像を取得して保存する
   * @param {StoreImagesProps}
   * @memberof Salvage
   */
  async storeImages({ selector, saveDir, thumbnail }: StoreImagesProps) {
    // PuppeteerのPageオブジェクトがnullの場合はエラーを投げる
    if (this.router?.page == null) throw new Error("puppeteerPage is null");

    // ページ内の画像のurlを取得
    const imageUrls = await this.router.page.evaluate((selector) => {
      const images = [
        ...document.querySelectorAll(selector),
      ] as HTMLImageElement[];
      return images.map((img) => img.src);
    }, selector);

    // 画像urlをダウンロード可能な形式に変換
    const resolvedUrls = this.resolveFileUrl(imageUrls);

    // 画像ページに遷移してからダウンロード
    for (const imageUrl of resolvedUrls) {
      const res = await this.router.transion(
        imageUrl,
        this.env.PUPPETEER.TRANSION_DELAY
      );
      if (res?.ok() == null) continue;
      const buffer = await res.buffer();

      try {
        const timestamp = Date.now().toString();
        const extension = path.extname(imageUrl);
        const filename = `image_${timestamp}${extension}`;

        // 保存開始
        fs.writeFileSync(path.join(saveDir, filename), buffer);
        console.log(`[downloaded]: ${imageUrl} -> ${filename}`);

        // 取得画像の最後の画像をメイン画像サムネイル用として保存
        const imageUrlOfLast = imageUrls.slice(-1)[0];
        if (thumbnail !== false && imageUrl === imageUrlOfLast) {
          const prefix =
            typeof thumbnail === "string" ? thumbnail : "000thumb_";
          fs.writeFileSync(path.join(saveDir, `${prefix}${filename}`), buffer);
          console.log(`[downloaded]: save thumbnail:${prefix}_${filename}`);
        }
      } catch (e: unknown) {
        if (e instanceof Error) {
          console.error(e.message);
        }
      }
    }
  }

  /**
   * 画像のurlをダウンロード可能な形式に変換する
   * @param {string[]} imageUrls 画像のurl
   * @return {string[]} 解決積みの画像url
   * @memberof Salvage
   */
  resolveFileUrl(imageUrls: string[]): string[] {
    // Next.jsの画像のurlを判定するための文字列
    const stringForDicideToNextls = "_next/image?url=";

    let urls: string[] = imageUrls;

    // 重複を削除
    urls = [...new Set(urls)];

    // base64形式の画像は除外
    urls = urls.filter((url) => !/base64/.test(url));

    // 特定のURLを成形
    urls = urls.map((url) => {
      // Next.jsのnext/imageモジュール画像のurlを成形
      if (url.includes(stringForDicideToNextls)) {
        const [imageFromNextjs] = url
          .split(stringForDicideToNextls)[1]
          .split("&");
        const decodedUrl = decodeURIComponent(imageFromNextjs);
        return new URL(decodedUrl, this.env.RECIPE.base_url).href;
      }

      return url;
    });

    return urls;
  }
}
