import { GoogleAnalytics } from "@next/third-parties/google";

/* eslint-disable-next-line */
export interface GoogleTagProps {}

export const GoogleTag = (props: GoogleTagProps) => {
  return <GoogleAnalytics gaId="G-CXL91GJ1T9" />;
};

export default GoogleTag;
