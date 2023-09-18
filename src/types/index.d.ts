/** ResourceCollection内で使用するプロパティの型定義 */
export interface Props {
  /** リソースを取得するページのurl */
  resourceUrls: string[];
  /** リソースを取得するページのセレクタ */
  selector: { items: string; title: string; anchor: string };
  /** 許可するダウンロードするファイルの拡張子 */
  allowedFilePattern: RegExp;
  /** サムネイルを作成するかどうか */
  thumbnail: string | boolean;
}
