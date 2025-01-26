import Image from "next/image";
import { ImageLoader } from "@com.synergy/frontend-ui/ImageLoader";

/* eslint-disable-next-line */
export interface ProductPreviewSmallProps {
  name?: string;
  image: {
    src: string;
    alt: string;
  };
  className?: string;
}

export const ProductPreviewSmall = (props: ProductPreviewSmallProps) => {
  return (
    <div
      className={`p-1 pr-6 flex items-center justify-left w-fit rounded-3xl gap-4 bg-synergy-light-blue/[42%] backdrop-blur-md ${props.className}`}
    >
      <div className="w-[74px] h-[63px] relative">
        <Image
          src={props.image.src}
          loader={ImageLoader}
          width={undefined}
          height={undefined}
          className="object-cover rounded-l-[20px]"
          fill
          alt={props.image.alt}
        />
      </div>
      <h2 className="text-2xl font-semibold text-white">{props.name}</h2>
    </div>
  );
};

export default ProductPreviewSmall;
