import type {
  Action,
  ThunkAction,
  ConfigureStoreOptions,
} from "@reduxjs/toolkit";
import { configureStore } from "@reduxjs/toolkit";
import counterReducer from "./slices/counter/counterSlice";
import { api } from "./slices/api/api";

export const store = configureStore({
  reducer: {
    counter: counterReducer,
  },
});

export const makeStore = (
  options?: ConfigureStoreOptions["preloadedState"] | undefined
) => {
  return configureStore({
    reducer: {
      [api.reducerPath]: api.reducer,
      counter: counterReducer,
    },
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware().concat(api.middleware),
    ...options,
  });
};

// Infer the type of makeStore
export type MakeAppStore = ReturnType<typeof makeStore>;
// Infer the type of `store`
export type AppStore = typeof store;
export type RootState = ReturnType<AppStore["getState"]>;
// Infer the `AppDispatch` type from the store itself
export type AppDispatch = AppStore["dispatch"];
// Define a reusable type describing thunk functions
export type AppThunk<ThunkReturnType = void> = ThunkAction<
  ThunkReturnType,
  RootState,
  unknown,
  Action
>;
