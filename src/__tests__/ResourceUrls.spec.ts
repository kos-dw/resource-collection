import puppeteer, { Browser, Page } from "puppeteer";
import ENV from "~/constants/environment";
import { GotoPageWithWait } from "~/modules/GotoPageWithWait";
import { ResourceUrls } from "~/modules/ResourceUrls";
import { toBeArrayOfStrings } from "./matcher";

beforeAll(() => {
  expect.extend({ toBeArrayOfStrings });
});

describe("URLを正しく取得できるか検証", async () => {
  const rurlsTest = new RurlsTest();
  const urls = await rurlsTest.main();

  test("テキストの配列で取得できる", () => {
    expect(urls).toHaveLength(3);
  });

  test("URLの配列で取得できる", () => {
    expect(urls).toBeArrayOfStrings();
  });
}, 10000);

/**
 * URLを取得するテストクラス
 *
 * テストを実行する前に、以下のコマンドを実行して簡易サーバーを起動しておくこと
 * npm run serve:start
 * サーバーの停止は以下のコマンドで行う
 * npm run serve:stop
 *
 * @class RurlsTest
 */
export class RurlsTest {
  // フィールドの設定
  private env: ENV = new ENV();
  private router = new GotoPageWithWait();
  private puppeteerBrowser: Browser | undefined;
  private puppeteerPage: Page | undefined;
  private propsForVisittingPage = {
    urls: ["http://localhost:8000/"],
    selector: "main nav a",
  };

  /**
   * 初期化
   * @private
   * @memberof RurlsTest
   */
  private async init() {
    // Puppeteerの初期化
    this.puppeteerBrowser = await puppeteer.launch(this.env.PUPPETEER.CONFIG);
    this.puppeteerPage = await this.puppeteerBrowser.newPage();
    this.router.setPage = this.puppeteerPage;
    console.log("pupeeteerの初期化完了");
  }

  /**
   * メイン処理
   * @memberof RurlsTest
   */
  async main() {
    try {
      // 初期化
      await this.init();

      // URLを取得
      const rurls = new ResourceUrls({ router: this.router });
      const urls = await rurls.get(this.propsForVisittingPage);

      return urls;
    } catch (err) {
      console.error("getting urls is failed.");
    } finally {
      await this.puppeteerBrowser!.close();
    }
  }
}
