import fs from "fs";
import path from "path";
import { Recipe } from "~/types";

/**
 * 環境変数を管理する
 * @class ENV
 */
export default class ENV {
  /** アプリケーションのルートディレクトリ */
  APP_ROOT = path.resolve("~/../");
  /** リソースの保存ディレクトリ */
  DATA_DIR = path.join(this.APP_ROOT, ".temp");
  /** ログファイルの保存ディレクトリ */
  ACCESS_LOG_DIR = path.join(this.DATA_DIR, ".logs");
  /** ログファイルの保存先 */
  ACCESS_LOG_FILE = path.join(this.ACCESS_LOG_DIR, "access.log");
  /** puppeteerの設定 */
  PUPPETEER = {
    /** 初期化時のconfig */
    CONFIG: {
      headless: (() => {
        switch (process.env.PUPPETEER_ISHEADLESS) {
          case "true":
            return true;
          case "false":
            return false;
          case "new":
            return "new";
          default:
            return undefined;
        }
      })(),
      slowMo: 50,
    } as const,
    /** ページ遷移時の待機時間 */
    TRANSION_DELAY: 1500,
    /** ユーザーエージェント */
    USER_AGENT: process.env.USER_AGENT || "",
  };
  /** レシピ */
  get RECIPE() {
    const recipePath = path.join(this.APP_ROOT, "recipe.config.js");
    if (!fs.existsSync(recipePath)) {
      console.error(`[error]: recipe.config.js is not found.`);
      process.exit(1);
    }
    const recipe: Recipe = require(recipePath);
    return recipe;
  }
}
