"use client";
import { YandexMetricaProvider } from "next-yandex-metrica";

/* eslint-disable-next-line */
export interface YandexTagProps {
  children: React.ReactNode;
}

export const YandexTag = (props: YandexTagProps) => {
  return (
    <YandexMetricaProvider
      tagID={102480536}
      initParameters={{
        clickmap: true,
        trackLinks: true,
        accurateTrackBounce: true,
      }}
    >
      {props.children}
    </YandexMetricaProvider>
  );
};

export default YandexTag;
