/**
 * リソースを収集するページのレシピ
 * @export
 * @class recipe
 * @implements {Recipe}
 */
export default class recipe {
  /** 索敵ページのディレクトリ名 */
  static search_url = ["about", "recruit"];
  /** リソースを収集するページの各要素のセレクタ */
  static selector = {
    /** 索敵ページのタイトルを取得する要素 */
    title: "h1",
    /** 索敵ページで遷移先を特定するアンカー要素 */
    anchor: "header a",
    /** 遷移先でのリソースを収集する要素 */
    items: "main img",
  };
}
