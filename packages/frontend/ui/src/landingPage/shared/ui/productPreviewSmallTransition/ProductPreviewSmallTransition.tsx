"use client";
import { ProductPreviewSmall } from "@com.synergy/frontend-ui/ProductPreviewSmall";
import { Transition } from "@headlessui/react";
import { useState, useEffect } from "react";

/* eslint-disable-next-line */
export interface ProductPreviewSmallTransitionProps {
  products: {
    title: string;
    image: {
      src: string;
      alt: string;
    };
  }[];
}

export const ProductPreviewSmallTransition = (
  props: ProductPreviewSmallTransitionProps
) => {
  const [tab, setTab] = useState(1);
  console.log(props.products)

  useEffect(() => {
    // create a interval and get the id
    const myInterval = setInterval(() => {
      setTab((tab) => tab == 1 ? 2 : 1);
    }, 2500);
    // clear out the interval using the id when unmounting the component
    return () => clearInterval(myInterval);
  }, []);

  return (
    <>
      {props.products.map((product, index) => (
        <Transition show={tab === index + 1} key={index}>
          <div className="transition ease-in-out data-[closed]:opacity-0 data-[enter]:duration-700 data-[enter]:data-[closed]:translate-x-8 data-[closed]:absolute data-[leave]:duration-300 data-[leave]:data-[closed]:-translate-x-8">
            <ProductPreviewSmall name={product.title} />
          </div>
          {/* <div className="transition ease-in-out data-[closed]:opacity-0 data-[enter]:duration-700 data-[enter]:data-[closed]:-translate-y-8 data-[closed]:absolute data-[leave]:duration-300 data-[leave]:data-[closed]:translate-y-8">
            <ProductPreviewSmall name={product.title} />
          </div> */}
        </Transition>
      ))}
    </>
  );
};

export default ProductPreviewSmallTransition;
