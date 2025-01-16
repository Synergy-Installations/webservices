import Image from "next/image";
import HeatPumpOrange from "../../../shared/images/heat-pump-orange.jpg";

/* eslint-disable-next-line */
export interface ProductsPreviewSmallProps {}

export const ProductsPreviewSmall = (props: ProductsPreviewSmallProps) => {
  return (
    <div className="p-1 pr-6 flex items-center justify-center w-fit rounded-3xl gap-4 bg-synergy-light-blue/[42%] backdrop-blur-sm">
      <div className="w-[74px] h-[63px] relative">
        <Image
          src={HeatPumpOrange}
          width={undefined}
          height={undefined}
          className="object-cover rounded-l-[20px]"
          fill
          alt="Heat Pump Orange"
        />
      </div>
      <h2 className="text-2xl font-semibold text-white">Warmepumpe</h2>
    </div>
  );
};

export default ProductsPreviewSmall;
