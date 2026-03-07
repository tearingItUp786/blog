-- Per-project Neovim config for new-blog
-- Overrides Tailwind LSP to use the v4 CSS-first config entry point.
-- Required because v4 uses app/tailwind.css instead of tailwind.config.js.
vim.lsp.config("tailwindcss", {
  settings = {
    tailwindCSS = {
      experimental = {
        configFile = {
          ["app/tailwind.css"] = "**",
        },
      },
    },
  },
})
