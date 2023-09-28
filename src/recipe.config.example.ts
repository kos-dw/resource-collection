/**
 * リソースを収集するページのレシピの型情報
 * @export
 * @interface Recipe
 */
export interface Recipe {
  base_url: string;
  search_url: string[];
  selector: { [key: string]: string };
}

/**
 * リソースを収集するページのレシピ
 * @export
 * @class recipe
 * @implements {Recipe}
 */
export default class recipe {
  /** 索敵ページのベースURL */
  static base_url = "https://exsample.com/";
  /** 索敵ページのディレクトリ名 */
  static search_url = ["about", "recruit"];
  /** リソースを収集するページの各要素のセレクタ */
  static selector = {
    /** 索敵ページのタイトルを取得する要素 */
    title: "h1",
    /** 遷移先でのタイトルを取得する要素 */
    anchor: "header a",
    /** 遷移先でのリソースを収集する要素 */
    items: "main img",
  };
}
