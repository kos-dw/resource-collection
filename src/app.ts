import fs from "fs";
import type { Browser, Page } from "puppeteer";
import puppeteer from "puppeteer";

import ENV from "~/constants/environment";
import {
  GotoPageWithWait,
  Logger,
  PullResources,
  ResourceUrls,
  Salvage,
} from "~/modules";
import { Props } from "~/types";

const dipendecies: [
  ENV,
  GotoPageWithWait,
  ResourceUrls,
  Salvage,
  Logger,
  PullResources,
] = [
  new ENV(),
  new GotoPageWithWait(),
  new ResourceUrls(),
  new Salvage(),
  new Logger(),
  new PullResources(),
];
/**
 * リソースを収集する
 * @class ResourceCollection
 */
class ResourceCollection {
  // プロパティ
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
    private readonly pullResources: PullResources,
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
   * 初期化
   * @private
   * @return {Promise<{ browser: Browser; page: Page }>}
   * @memberof ResourceCollection
   */
  private async init(): Promise<{ browser: Browser; page: Page }> {
    // Puppeteerの初期化
    const browser = await puppeteer.launch(this.ENV.PUPPETEER.CONFIG);
    const page = await browser.newPage();
    if (this.ENV.PUPPETEER.USER_AGENT != null) {
      page.setUserAgent(this.ENV.PUPPETEER.USER_AGENT);
    }

    // GotoPageWithWaitにPuppeteerのPageオブジェクトをセット
    this.router.setPage = page;

    // 必要なディレクトリやファイルが存在しない場合は作成
    try {
      if (!fs.existsSync(this.ENV.DATA_DIR)) {
        fs.mkdirSync(this.ENV.DATA_DIR, { recursive: true });
      }

      if (!fs.existsSync(this.ENV.ACCESS_LOG_DIR)) {
        fs.mkdirSync(this.ENV.ACCESS_LOG_DIR, { recursive: true });
      }

      if (!fs.existsSync(this.ENV.ACCESS_LOG_FILE)) {
        fs.writeFileSync(this.ENV.ACCESS_LOG_FILE, "", "utf-8");
      }
    } catch (e: any) {
      console.error(e.message);
    }

    // 訪問済みのページを読み込む
    this.visitedPages = fs
      .readFileSync(this.ENV.ACCESS_LOG_FILE, "utf-8")
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
        await this.pullResources.exec({
          targetUrl: url,
          router: this.router,
          propsForCollection: this.props,
          salvage: this.salvage,
        });
        console.log("[completed]: downloading is done.\n");

        // 今回訪問したページをstackに追加
        this.addLoggedPages.push(`${new Date().toString()}:[visited] ${url}`);
      }
    } catch (e: any) {
      console.error(e.message);
    } finally {
      await browser.close();
      // 訪問済みのページを保存
      if (this.addLoggedPages.length > 0) {
        this.logger.storeVisitedLink(
          this.addLoggedPages,
          this.ENV.ACCESS_LOG_FILE,
        );
      }
    }
  }
}

const collecter = new ResourceCollection(...dipendecies);

collecter.main();
