export default {
  '*.+(js|jsx|json|yml|yaml|css|less|scss|ts|tsx|mdx|md|graphql|mdx|vue)': [
    () => `npm run clean --silent`,
    `npm run test --silent -- --watch=false`,
    () => `npm run lint --silent`,
    () => `npm run typecheck --silent`,
    () => `npm run format --silent`,
  ],
}
