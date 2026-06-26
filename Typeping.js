//by Copilot.
/**
 * タイピング風に文字を出力する Node.js スクリプト
 * - 複数文対応
 * - 速度調整
 * - ループ可
 */

const messages = [
  "こんにちは、Node.jsの世界へようこそ！",
  "タイピング風に文字を出力しています…",
  "これはCLIアプリでも使えます。"
];

// 設定
const typeSpeed = 30;   // 1文字あたりのミリ秒
const delayBetween = 1000; // 文章間の待機時間(ms)
const loop = false;     // trueにすると繰り返す

/**
 * 指定した文字列をタイピング風に出力
 */
async function typeLine(line) {
  for (const char of line) {
    process.stdout.write(char);
    await new Promise(res => setTimeout(res, typeSpeed));
  }
  process.stdout.write("\n");
}

/**
 * メイン処理
 */
async function main() {
  do {
    for (const msg of messages) {
      await typeLine(msg);
      await new Promise(res => setTimeout(res, delayBetween));
    }
  } while (loop);
}

main().catch(err => {
  console.error("エラー:", err);
});
