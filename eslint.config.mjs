import nextConfig from "eslint-config-next";

const eslintConfig = [
  { ignores: [".next/**", "src/generated/**", "node_modules/**"] },
  ...nextConfig,
];

export default eslintConfig;
