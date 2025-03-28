"use client";

import { useEffect, useState } from "react";
import {
  useAppDispatch,
  useAppSelector,
} from "@com.synergy/frontend-backend-dashboard/hooks";
import {
  decrement,
  increment,
  incrementAsync,
  incrementByAmount,
  incrementIfOdd,
  selectCount,
  selectStatus,
} from "@com.synergy/frontend-backend-dashboard/counterSlice";
import {
  useGetItemsQuery,
  useAddItemMutation,
} from "@com.synergy/frontend-backend-dashboard/items";

export default function Page(): JSX.Element {
  // const [items, setItems] = useState<
  //   { _id: string; name: string; description: string }[]
  // >([]);
  const [form, setForm] = useState({ name: "", description: "" });

  const dispatch = useAppDispatch();
  const count = useAppSelector(selectCount);
  const status = useAppSelector(selectStatus);
  const [incrementAmount, setIncrementAmount] = useState("2");

  const incrementValue = Number(incrementAmount) || 0;

  const { data: items = { success: false, data: [] }, isLoading } =
    useGetItemsQuery();

  const [addItem, { isLoading: isAddItemLoading }] = useAddItemMutation();

  // useEffect(() => {
  //   fetchItems();
  // }, []);

  // const fetchItems = async () => {
  //   const res = await fetch("/api/dashboard/items");
  //   const data = await res.json();
  //   setItems(data.data);
  // };

  const handleChange = (e: any) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    addItem(form);
    // try {
    //   await fetch("/api/dashboard/items", {
    //     method: "POST",
    //     headers: {
    //       "Content-Type": "application/json",
    //     },
    //     body: JSON.stringify(form),
    //   });
    //   // fetchItems();
    //   setForm({ name: "", description: "" });
    // } catch (error) {
    //   console.log(error);
    // }
  };

  return (
    <div>
      <h1>Items</h1>
      <form onSubmit={handleSubmit}>
        <input
          name="name"
          placeholder="Item name"
          value={form.name}
          onChange={handleChange}
        />
        <input
          name="description"
          placeholder="Item description"
          value={form.description}
          onChange={handleChange}
        />
        <button type="submit">
          Add Item {isAddItemLoading && "Loading..."}
        </button>
      </form>

      <ul>
        {items.data.map((item) => (
          <li key={item._id}>
            {item.name} - {item.description}
          </li>
        ))}
      </ul>
      <div>
        <div>
          <button
            aria-label="Decrement value"
            onClick={() => {
              dispatch(decrement());
            }}
          >
            -
          </button>
          <span aria-label="Count">{count}</span>
          <button
            aria-label="Increment value"
            onClick={() => {
              dispatch(increment());
            }}
          >
            +
          </button>
          {/* omit additional rendering output here */}
        </div>
      </div>
    </div>
  );
}
