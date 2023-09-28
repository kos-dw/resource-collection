# Resource-collection

コーポレートサイト等の制作依頼を受けたとき、実績などの画像を既存サイトから引っ張ってくるよう依頼されることが多々あります。それら素材の数が膨大だと逝ってしまいます。そんなときは、スクレイピングで収集して、浮いた時間で他の作業をしましょう。

## Get started

当ライブラリは、Nodejs のランタイム下で動作しますので、まずはそちらの環境設定を済ませてください。インストール方法は色々ありますが、詳細は割愛。

[ダウンロード | Node.js](https://nodejs.org/ja/download)

Node.js の設定が完了したら、依存関係をインストール。

```Bash
pnpm i
# or
npm i
# or
yarn i
```

## 設定と実行

/src/recipe.config.ts に必要な情報を記入します。

```typescript
// 以下の例だと、「https://exsample.com/about」と
// 「https://exsample.com/recruit」にある、
// document.queryselectorAll("header a")で
// 収集されるアンカー要素で遷移するページにある
// document.queryselector("h1").textContentと
// document.queryselectorAll("main img")がスクレイピングされます。
export default class recipe {
  /** 索敵ページのベースURL */
  static base_url = "https://exsample.com/";
  /** 索敵ページのディレクトリ名 */
  static search_url = ["about", "recruit"];
  /** リソースを収集するページの各要素のセレクタ */
  static selector = {
    /** 索敵ページで遷移先を特定するアンカー要素 */
    anchor: "header a",
    /** 遷移先でのタイトルを取得する要素 */
    title: "h1",
    /** 遷移先でのリソースを収集する要素 */
    items: "main img",
  };
}
```

設定完了後、ターミナルで以下を実行するとデフォルトで「/.temp フォルダ」にリソースが保存されます。

```Bash
pnpm  start
```

## その他

- スクレイピングを行ったページ URL は「/.log/access.log」に登録されます。
- 「/.log/access.log」に記載されている URL は、スクレイピングを再度実行しても、相手先サーバーに負荷をかけないためにスキップされます。
- 再度収集したいときは「/.log/access.log」の該当 URL を削除してから実行してください。
