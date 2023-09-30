/** ResourceCollection内で使用するプロパティの型定義 */
export interface Props {
  /** リソースを取得するページのurl */
  resourceUrls: string[];
  /** リソースを取得するページのセレクタ */
  selector: { anchor: string; title: string; items: string };
  /** 許可するダウンロードするファイルの拡張子 */
  allowedFilePattern: RegExp;
  /** サムネイルを作成するかどうか */
  thumbnail: string | boolean;
}

/* レシピの型定義 */
export interface Recipe {
  /** 索敵ページのベースURL */
  base_url: string;
  /** 索敵ページのディレクトリ名 */
  search_url: string[];
  /** リソースを収集するページの各要素のセレクタ */
  selector: { anchor: string; title: string; items: string };
}
