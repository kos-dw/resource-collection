// 環境変数の型を定義する
declare namespace NodeJS {
  interface ProcessEnv {
    BASE_URL: string;
    USER_AGENT: string;
  }
}
