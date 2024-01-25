import { Denops } from "https://deno.land/x/denops_std@v5.0.0/mod.ts";
import * as fn from "https://deno.land/x/denops_std@v5.0.0/function/mod.ts";
import * as v from "https://deno.land/x/denops_std@v5.2.0/variable/mod.ts";
import { is } from "https://deno.land/x/unknownutil@v3.14.0/mod.ts";

// main関数はプラグインを初期化し、ディスパッチャとコマンドを設定します
export async function main(denops: Denops): Promise<void> {
  // プラグインの設定値を取得
  const TOKEN = await denops.eval("g:perplexity_token");
  const MODEL = await denops.eval("g:perplexity_model");
  const LOG_DIRECTORY = await v.g.get(denops, "perplexity_log_directory") ??
    undefined;

  denops.dispatcher = {
    async chat() {
      await denops.cmd("new split");
      const logCmd = LOG_DIRECTORY
        ? "edit ~/chat_log.md"
        : "setlocal buftype=nofile";

      await denops.cmd(logCmd);

      // 新しいウィンドウを開き、チャット用のバッファを設定する
      await denops.cmd("setlocal noswapfile");
      await denops.cmd("setlocal bufhidden=wipe");
      await denops.cmd("setlocal filetype=markdown");

      const prompt = await denops.call("input", "Prompt > ");
      await this.request(prompt);

      // for testing
      console.log(LOG_DIRECTORY);
    },
    // レスポンスを現在の行に出力します
    async completion() {
      // ユーザーからのプロンプトを入力してもらう
      const prompt = await denops.call("input", "Prompt > ");

      await this.request(prompt);
    },

    async request(prompt: unknown) {
      is.String(prompt);
      // Perplexity APIにリクエストを送信し、結果を取得する
      const response = await fetch(
        "https://api.perplexity.ai/chat/completions",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${TOKEN}`,
          },
          body: JSON.stringify({
            model: MODEL,
            "messages": [
              {
                "role": "user",
                "content": prompt,
              },
            ],
          }),
        },
      );

      // レスポンスが正常な場合、取得した内容をバッファに追加する
      if (response.ok) {
        const line_num = await fn.line(denops, ".");
        const data = await response.json();
        await fn.append(
          denops,
          line_num,
          data.choices[0].message.content.split(/\r?\n/g),
        );
      } else {
        // エラーが発生した場合、コンソールにエラーメッセージを出力する
        console.error("Error:", response.statusText);
      }
    },
  };

  // Vimコマンドを登録する
  const n = denops.name;
  await denops.cmd(
    `command! CompletionPerplexity call denops#notify("${n}", "completion", [])`,
  );
  await denops.cmd(
    `command! ChatPerplexity call denops#notify("${n}", "chat", [])`,
  );
}
