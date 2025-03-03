declare module "tailwindcss/lib/util/flattenColorPalette" {
  export default function flattenColorPalette(
    pallette: Record<string, string>
  ): Record<string, string>;
}

declare module "flowbite-react/tailwind" {
  import { Config } from "flowbite-react/tailwind";
  const config: Config;
  export default config;
}
