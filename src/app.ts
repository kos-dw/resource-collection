import fs from "fs";
import path from "path";
import type { Browser, Page } from "puppeteer";
import puppeteer from "puppeteer";

import ENV from "~/constants/environment";
import { GotoPageWithWait, Logger, ResourceUrls, Salvage } from "~/modules";
import { Props } from "~/types";
import { escapeFileName } from "~/utils";

const dipendecies: [ENV, GotoPageWithWait, ResourceUrls, Salvage, Logger] = [
  new ENV(),
  new GotoPageWithWait(),
  new ResourceUrls(),
  new Salvage(),
  new Logger(),
];
/**
 * リソースを収集する
 * @class ResourceCollection
 */
class ResourceCollection {
  props: Props;

  /**
   * インスタンス初期化
   * @param {ENV} ENV
   * @memberof ResourceCollection
   */
  constructor(
    private readonly ENV: ENV,
    private readonly router: GotoPageWithWait,
    private readonly Rurls: ResourceUrls,
    private readonly salvage: Salvage,
    private readonly logger: Logger,
  ) {
    this.props = {
      base_url: ENV.RECIPE.base_url,
      surveyUrls: ENV.RECIPE.survey.subdir.map(
        (leaf) => new URL(leaf, ENV.RECIPE.base_url).href,
      ),
      surveyAnchor: ENV.RECIPE.survey.anchor,
      target: ENV.RECIPE.target,
      allowedFilePattern: /.*\.(jpg|jpeg|png|svg|webp)$/i,
      thumbnail: true,
    };
  }

  private visitedPages: string[] = [];
  private addLoggedPages: string[] = [];

  /**
   * 指定したページのリソースをダウンロードする
   * @private
   * @param {string} pageUrl
   * @param {Page} page
   * @return {Promise<void>}
   * @memberof ResourceCollection
   */
  private async resourcesDownload(pageUrl: string, page: Page): Promise<void> {
    const baseDir = this.ENV.DATA_DIR;
    const dirForBaseUrl = escapeFileName(this.props.base_url);
    const dirForleaf = escapeFileName(pageUrl);
    const saveDir = path.join(baseDir, dirForBaseUrl, dirForleaf);

    // 保存先のディレクトリを作成
    try {
      fs.mkdirSync(saveDir, { recursive: true });
    } catch (e: any) {
      console.error(e.message);
    }

    // ページを開く
    await this.router.transion(pageUrl, page);
    console.log(`[moved]: ${pageUrl}`);
    // ページのタイトルを取得して保存
    await this.salvage.storeText({
      page,
      selector: this.props.target.title,
      filePath: path.join(saveDir, "title.txt"),
    });

    // ページ内の画像のurlを取得後、画像ページに遷移してからダウンロード
    await this.salvage.storeImages({
      page,
      selector: this.props.target.items,
      router: this.router,
      saveDir,
      thumbnail: this.props.thumbnail,
    });

    console.log("[completed]: downloading is done.\n");
  }

  /**
   * 初期化
   * @private
   * @return {Promise<{ browser: Browser; page: Page }>}
   * @memberof ResourceCollection
   */
  private async init(): Promise<{ browser: Browser; page: Page }> {
    // Puppeteerの初期化
    const browser = await puppeteer.launch(this.ENV.PUPPETEER.CONFIG);
    const page = await browser.newPage();
    page.setUserAgent(this.ENV.PUPPETEER.USER_AGENT);

    // アクセスログのディレクトリが存在しない場合は作成してログファイルを作成
    const logDir = path.dirname(this.ENV.ACCESS_LOG);
    if (!fs.existsSync(logDir)) fs.mkdirSync(logDir, { recursive: true });
    if (!fs.existsSync(this.ENV.ACCESS_LOG)) {
      fs.writeFileSync(this.ENV.ACCESS_LOG, "", "utf-8");
    }

    // 訪問済みのページを読み込む
    this.visitedPages = fs
      .readFileSync(this.ENV.ACCESS_LOG, "utf-8")
      .trim()
      .split("\n")
      .map((row) => {
        const text = row.split("[visited]").pop() ?? "";
        const url = text.replace(" ", "");
        return url;
      })
      .filter((url) => url !== "");
    // 重複を削除
    this.visitedPages = [...new Set(this.visitedPages)];
    return { browser, page };
  }

  /**
   * メイン処理
   * @return {Promise<void>}
   * @memberof ResourceCollection
   */
  public async main(): Promise<void> {
    const { browser, page } = await this.init();

    try {
      // リソースを収集するページのurlを取得
      const articles = await this.Rurls.get({
        urls: this.props.surveyUrls,
        page: page,
        selector: this.props.surveyAnchor,
        router: this.router,
      });
      for (let url of articles) {
        // 訪問済みのページはスキップ
        if (this.visitedPages.includes(url)) {
          console.log(`[skipped]: ${url}\n`);
          continue;
        }
        // リソースをダウンロード
        await this.resourcesDownload(url, page);
        // 今回訪問したページをstackに追加
        this.addLoggedPages.push(`${new Date().toString()}:[visited] ${url}`);
      }
    } catch (e: any) {
      console.error(e.message);
    } finally {
      await browser.close();
      // 訪問済みのページを保存
      if (this.addLoggedPages.length > 0) {
        this.logger.storeVisitedLink(this.addLoggedPages, this.ENV.ACCESS_LOG);
      }
    }
  }
}

const collecter = new ResourceCollection(...dipendecies);

collecter.main();
