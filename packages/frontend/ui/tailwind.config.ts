import type { Config } from "tailwindcss";
import sharedConfig from "@com.synergy/frontend-shared-tailwind-config";

const config: Pick<Config, "prefix" | "presets" | "content" | "darkMode"> = {
  content: ["./src/**/*.tsx"],
  // prefix: "ui-",
  darkMode: ['selector'],
  presets: [sharedConfig],
};

export default config;
