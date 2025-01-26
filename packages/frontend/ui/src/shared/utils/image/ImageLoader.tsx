'use client';
import { ImageLoaderProps } from "next/image";

export const ImageLoader = ({src, width, quality} : ImageLoaderProps) => {
  return `https://synergy-webservices-assets.b-cdn.net${src}?w=${width}&q=${quality || 75}`;
};

export default ImageLoader;
