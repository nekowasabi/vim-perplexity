# vim-perplexity

Simple client for [Perplexity](https://docs.perplexity.ai/) API.

# Requirements

- [deno](https://deno.land/)
- [denops](https://github.com/vim-denops/denops.vim)

# Installation

```
Plug 'nekowasabi/vim-perplexity'
```

# Setting

Add settings in vimrc or init.vim

```
let g:perplexity_token = 'xxxxxxxxxxxxxxxxx'
let g:perplexity_model = 'llama-2-70b-chat or other LLM'
```

# Usage

```
:CompletionPerplexity
```
