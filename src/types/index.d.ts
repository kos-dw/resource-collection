/** ResourceCollection内で使用するプロパティの型定義 */
export interface Props {
  /** サイトURL */
  base_url: string;
  /** 索敵ページのurl */
  surveyUrls: string[];
  /** 索敵ページに存在する、ターゲットページ特定するためのアンカー要素のセレクタ */
  surveyAnchor: string;
  /** リソースを取得するページのセレクタ */
  target: { title: string; items: string };
  /** 許可するダウンロードするファイルの拡張子 */
  allowedFilePattern: RegExp;
  /** サムネイルを作成するかどうか */
  thumbnail: string | boolean;
}

/* レシピの型定義 */
export interface Recipe {
  /** サイトURL */
  base_url: string;
  /** 索敵ページの情報 */
  survey: {
    /** 索敵ページのリスト */
    subdir: string[];
    /** 索敵ページに存在する、ターゲットページ特定するためのアンカー要素のセレクタ */
    anchor: string;
  };
  /** 索敵ページで収集したアンカー要素で遷移した先の情報 */
  target: {
    /** 収集するページタイトルの要素のセレクタ(querySelectorに対応) */
    title: string;
    /** 収集する画像のの要素のセレクタ(querySelectorAllに対応) */
    items: string;
  };
}
