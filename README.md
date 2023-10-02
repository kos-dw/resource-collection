# Resource-collection

コーポレートサイト等の制作依頼を受けたとき、実績などの画像を既存サイトから引っ張ってくるよう依頼されることが多々あります。

WordPress 等で作られたサイトで、素材が掲載されているページが 100 ページとかあった場合泣けてきます。「データを送ってください」とお願いできれば助かりますが、そうも行かないときもあります。

そんなときは、スクレイピングで収集して、浮いた時間でコーヒーでも飲みながら効率よく他の作業をしましょう。☕️

## What's this?

[puppeteer](https://pptr.dev/)を利用した、スクレイピングライブラリです。

設定ファイルに指定した URL や html 要素のタイトルや画像を収集します。ランタイム環境として node.js を利用しています。
※収集する際は、収集するサイトの/robots.txt 等を確認して収集に問題ないことを確認してから実行しましょう。

## Getting started

### Installation

当ライブラリは、Nodejs のランタイム下で動作しますので、まずはそちらの環境設定を済ませてください。インストール方法は色々ありますが、詳細は割愛。

[ダウンロード | Node.js](https://nodejs.org/ja/download)

Node.js の設定が完了したら、依存関係をインストール。

```Bash
npm i
# or using yarn
yarn
# or using pnpm
pnpm i
```

### Usage

`/recipe.config.js`ファイルを作成して、スクレイピングのためのレシピを設定します。

```bash
touch recipe.config.js
```

```js
// recipe.config.js
module.exports = {
  base_url: "https://example.com/",
  search_url: ["about", "recruit"],
  selector: {
    anchor: "header a",
    title: "h1",
    items: "main img",
  },
};
```

上の例だと、

- **[ base_url(ベース URL) ]**:`https://example.com/`が収集するサイト URL
- **[ search_url(索敵ページ URL) ]**:`/about`と`/recruit`にあるアンカー要素でリソースを収集するページのリストを作成
- **[ selector.anchor(queryselectorAll) ]**:`search_url`で収集するアンカー要素`header a`
- **[ selector.title(queryselector) ]**:アンカー要素で遷移した先の`h1`の textContent(スクレイピング対象)
- **[ selector.items(queryselectorAll) ]**:アンカー要素で遷移した先の`main img`(スクレイピング対象)

となります。

設定完了後、ターミナルで以下を実行するとデフォルトで`/.temp`フォルダにリソースが保存されます。

```Bash
npm start
# or using yarn
yarn start
# or using pnpm
pnpm start
```

## Others

- スクレイピングを行ったページ URL は`/.log/access.log`に登録されます。
- `/.log/access.log`に記載されている URL は、スクレイピングを再度実行しても、相手先サーバーに負荷をかけないためにスキップされます。
- 再度収集したいときは`/.log/access.log`の該当 URL の行を削除してから実行してください。
- どうしてもスタンドアロンで実行したいときは、`npm run build` or `yarn run build` or `pnpm run build`でビルドしたあとに、`node dist/app.js`で同じ動作を得られます。(ただしファイルはでかいです。)
