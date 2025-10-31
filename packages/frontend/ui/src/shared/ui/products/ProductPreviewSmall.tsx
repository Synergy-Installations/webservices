import Image from "next/image";
import { ImageLoader } from "@com.synergy/frontend-ui/ImageLoader";
import { Link } from "@com.synergy/frontend-shared-internationalization/routing";

/* eslint-disable-next-line */
export interface ProductPreviewSmallProps {
  name?: string;
  image: {
    src: string;
    alt: string;
    className?: string;
    type?: "picture" | "icon"; // New option to distinguish between picture and icon
  };
  href: string;
  className?: string;
}

export const ProductPreviewSmall = (props: ProductPreviewSmallProps) => {
  const isIcon = props.image.type === "icon";

  return (
    <Link
      href={props.href}
      className={`flex ${isIcon && "h-[63px]"} items-center text-2xl justify-left w-fit rounded-3xl ${isIcon ? "gap-2" : "gap-4"} bg-synergy-light-blue/[42%] backdrop-blur-md ${props.className}`}
    >
      <div
        className={`${isIcon ? "w-[40px] h-[40px]" : "w-[74px] h-[63px]"} relative flex items-center justify-center ${props.image.className} ${
          isIcon ? "ml-2" : "rounded-l-[20px] overflow-hidden"
        }`}
      >
        <Image
          src={props.image.src}
          loader={ImageLoader}
          width={undefined}
          height={undefined}
          className={
            isIcon
              ? "object-contain max-w-full max-h-full" // For icons: contain and center
              : "object-cover rounded-l-[20px]" // For pictures: cover with border radius
          }
          fill
          alt={props.image.alt}
        />
      </div>
      <h2 className={`font-semibold text-white truncate ${isIcon ? "mr-2" : ""}`}>{props.name}</h2>
    </Link>
  );
};

export default ProductPreviewSmall;
