import { useMessages, useTranslations } from "next-intl";
import DefaultProductCard from "./DefaultProductCard";

/* eslint-disable-next-line */
export interface ProductCardsProps {}

export const ProductCards = (props: ProductCardsProps) => {
  const t = useTranslations("LandingPage.Products.ProductCards");

  const messages: any = useMessages();
  const productCardKeys = Object.keys(
    messages.LandingPage.Products.ProductCards
  );

  const getBoxItems = (key: string): string[] => {
    return Object.keys(messages.LandingPage.Products.ProductCards[key]) || [];
  };

  return (
    <>
      {productCardKeys.map((productKey, index) => (
        <>
          <DefaultProductCard key={index} productKey={productKey} />
        </>
      ))}
    </>
  );
};

export default ProductCards;
