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

/* recipe.config.jsの型定義 */
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

/* puppeteer.config.jsの型定義 */
export interface PuppeteerConfig {
  /** 初期化時のconfig */
  CONFIG: PuppeteerLaunchOptions;
  /** 画像の非同期読み込み対策スクロールの待機時間 */
  WAIT_TIME_FOR_SCROLL?: number;
  /** ページ遷移時の待機時間 */
  TRANSION_DELAY?: number;
  /** ユーザーエージェント */
  USER_AGENT?: string;
}
