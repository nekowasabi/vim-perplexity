import { Denops } from "https://deno.land/x/denops_std@v5.0.0/mod.ts";

export async function main(denops: Denops): Promise<void> {
  denops.dispatcher = {
    async completion() {
      // perplexityのトークンセット
      const token = await denops.eval("g:perplexity_token");
      // perplexityのモデルセット
      const model = await denops.eval("g:perplexity_model");

      // input
      const prompt = await denops.call("input", "Prompt > ");

      // API叩く

      const response = await fetch(
        "https://api.perplexity.ai/chat/completions",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`,
          },
          body: JSON.stringify({
            model: model,
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
        const data = await response.json();
        await denops.call("setline", 1, data.choices[0].message.content);
      } else {
        console.error("Error:", response.statusText);
      }
    },
  };

  const n = denops.name;
  await denops.cmd(
    `command! ChatPerplexity call denops#notify("${n}", "completion", [])`,
  );
}
