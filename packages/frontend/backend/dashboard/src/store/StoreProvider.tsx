"use client";

import { useRef } from "react";
import { Provider } from "react-redux";
import { makeStore, MakeAppStore } from "./store";
import React from "react";

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const storeRef = useRef<MakeAppStore | null>(null);
  if (!storeRef.current) {
    // Create the store instance the first time this renders
    storeRef.current = makeStore();
  }

  return <Provider store={storeRef.current}>{children}</Provider>;
}

export default StoreProvider;
