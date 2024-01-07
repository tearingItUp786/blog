module.exports = {
  '*.+(js|jsx|json|yml|yaml|css|less|scss|ts|tsx|md|graphql|mdx|vue)': [
    () => `npm run clean --silent`,
    `npm run test --silent -- --watch=false`,
    () => `npm run lint --silent`,
    () => `npm run typecheck --silent`,
    () => `npm run build --silent`,
    () => `npm run clean --silent`,
  ],
}
