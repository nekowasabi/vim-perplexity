import { Denops } from "https://deno.land/x/denops_std@v5.0.0/mod.ts";

export async function main(denops: Denops): Promise<void> {
  denops.dispatcher = {
    message() {
      return Promise.resolve("HelloWorld");
    },

    async chat(text: unknown) {
      // perplexityのトークンセット
      const aaa = await denops.eval("g:neosolarized_contrast");
      // API叩く
      await denops.cmd("echomsg text", {
        text,
      });
      await denops.cmd("echomsg aaa", {
        aaa,
      });
    },
  };

  const n = denops.name;
  await denops.cmd(
    `command! ChatPerplexity call denops#notify("${n}", "chat", [denops#request("${n}", "message", [])])`,
  );
}
