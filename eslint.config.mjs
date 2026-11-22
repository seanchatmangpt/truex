import unjs from "eslint-config-unjs";

export default unjs({
  ignores: [
    // wasm-pack out-dirs use underscore filenames (crate_name.js)
    "crates/**/pkg/**",
    "crates/**/pkg-bundler/**",
    "packages/kernel-wasm/pkg/**",
  ],
  rules: {
    // rule overrides
  },
  markdown: {
    rules: {
      // markdown rule overrides
    },
  },
});
