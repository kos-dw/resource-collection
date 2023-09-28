// 環境変数の型を定義する
declare namespace NodeJS {
  interface ProcessEnv {
    PUPPETEER_ISHEADLESS: string;
    USER_AGENT: string;
  }
}
