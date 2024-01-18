import { Denops } from "https://deno.land/x/denops_std@v5.0.0/mod.ts";
import * as fn from "https://deno.land/x/denops_std@v5.0.0/function/mod.ts";

export async function main(denops: Denops): Promise<void> {
  const TOKEN = await denops.eval("g:perplexity_token");
  const MODEL = await denops.eval("g:perplexity_model");
  const LOG_DIRECTORY = await denops.eval("g:perplexity_log_directory") ??
    undefined;

  denops.dispatcher = {
    async chat() {
      await denops.cmd("new split");
      await denops.cmd("setlocal buftype=nofile");
      await denops.cmd("setlocal noswapfile");
      await denops.cmd("setlocal bufhidden=wipe");
      await denops.cmd("setlocal filetype=markdown");

      // for testing
      console.log(LOG_DIRECTORY);
    },
    async completion() {
      const prompt = await denops.call("input", "Prompt > ");

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

      if (response.ok) {
        const line_num = await fn.line(denops, ".");
        const data = await response.json();
        await fn.append(
          denops,
          line_num,
          data.choices[0].message.content.split(/\r?\n/g),
        );
      } else {
        console.error("Error:", response.statusText);
      }
    },
  };

  const n = denops.name;
  await denops.cmd(
    `command! CompletionPerplexity call denops#notify("${n}", "completion", [])`,
  );
  await denops.cmd(
    `command! ChatPerplexity call denops#notify("${n}", "chat", [])`,
  );
}
