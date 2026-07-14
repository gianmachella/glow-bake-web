import nextConfig from "eslint-config-next";

const eslintConfig = [
  ...nextConfig,
  {
    rules: {
      // Flags the common, valid "load initial state on mount" pattern used
      // throughout this app's dashboard pages; keep visible but non-blocking.
      "react-hooks/set-state-in-effect": "warn",
    },
  },
];

export default eslintConfig;
