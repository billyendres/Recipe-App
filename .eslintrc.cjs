/** @type {import('eslint').Linter.Config} */
module.exports = {
  root: true,
  parserOptions: {
    ecmaVersion: "latest",
    sourceType: "module",
    ecmaFeatures: {
      jsx: true,
    },
  },
  env: {
    browser: true,
    commonjs: true,
    es6: true,
  },
  ignorePatterns: ["!**/.server", "!**/.client"],

  // Base config
  extends: ["eslint:recommended"],

  overrides: [
    // React and JSX
    {
      files: ["**/*.{js,jsx}"],
      plugins: ["react", "jsx-a11y", "import"],
      extends: [
        "plugin:react/recommended",
        "plugin:react/jsx-runtime",
        "plugin:react-hooks/recommended",
        "plugin:jsx-a11y/recommended",
        "plugin:import/recommended",
      ],
      settings: {
        react: {
          version: "detect",
        },
        formComponents: ["Form"],
        linkComponents: [
          { name: "Link", linkAttribute: "to" },
          { name: "NavLink", linkAttribute: "to" },
        ],
      },
      rules: {
        // Example rules for React/JSX (modify as needed)
        "react/prop-types": "off", // Disable prop-types since you're not using them
        "jsx-a11y/anchor-is-valid": "off", // Disable for non-anchor Link components
      },
    },

    // Node configuration (optional)
    {
      files: [".eslintrc.js"],
      env: {
        node: true,
      },
    },
  ],
};
