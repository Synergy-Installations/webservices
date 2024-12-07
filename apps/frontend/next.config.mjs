import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin(
  "../../packages/frontend/shared/internationalization/src/i18n/request.ts"
);

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ["@com.synergy/frontend-ui"],
};

export default withNextIntl(nextConfig);
