import fs from "fs";
import path from "path";
import { PuppeteerConfig, Recipe } from "~/types";

/**
 * 定数を管理する
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
  get PUPPETEER() {
    const puppeteerConfigPath = path.join(this.APP_ROOT, "puppeteer.config.js");
    if (!fs.existsSync(puppeteerConfigPath)) {
      console.error(`[error]: puppeteerConfigPath is not found.`);
      process.exit(1);
    }
    const puppeteerConfig: PuppeteerConfig = require(puppeteerConfigPath);
    return puppeteerConfig;
  }
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
