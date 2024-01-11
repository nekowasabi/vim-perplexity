import { Denops } from "https://deno.land/x/denops_std@v5.0.0/mod.ts";

export async function main(denops: Denops): Promise<void> {
  denops.dispatcher = {
    hello() {
      return Promise.resolve("HelloWorld");
    },

    async world(text: unknown) {
      await denops.cmd("echomsg text", {
        text,
      });
    },
  };

  const n = denops.name;
  await denops.cmd(
    `command! DenopsTest call denops#notify("${n}", "world", [denops#request("${n}", "hello", [])])`,
  );
}
