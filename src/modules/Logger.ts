import fs from "fs";

export class Logger {
  /**
   * 訪問済みのページのURLを保存する
   * @private
   * @param {string[]} list - 訪問済みのページのURL
   * @param {string} filePath - 保存先のファイルパス
   * @memberof Logger
   */
  storeVisitedLink(list: string[], filePath: string) {
    try {
      fs.appendFileSync(filePath, list.join("\n").concat("\n"));
    } catch (e) {
      console.error(e);
    }
  }
}
