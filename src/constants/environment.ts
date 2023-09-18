import path from "path";

/**
 * 環境変数を管理する
 * @class ENV
 */
export class ENV {
  /** アプリケーションのルートディレクトリ */
  APP_ROOT = path.resolve("~/../");
  /** スクレイピング対象ページのURL */
  BASE_URL = process.env.BASE_URL || "https://example.com";
  /** ログファイルの保存先 */
  ACCESS_LOG = path.join(this.APP_ROOT, ".log/access.log");
  /** リソースの保存先 */
  DATA_DIR = path.join(this.APP_ROOT, ".temp");
  /** puppeteerの設定 */
  PUPPETEER = {
    /** 初期化時のconfig */
    CONFIG: {
      headless: "new",
      slowMo: 50,
    } as const,
    /** ページ遷移時の待機時間 */
    TRANSION_DELAY: 1500,
    /** ユーザーエージェント */
    USER_AGENT: process.env.USER_AGENT || "",
  };
}
