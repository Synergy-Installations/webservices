"use client";

import { useEffect, useState } from "react";

export default function Page(): JSX.Element {
  const [items, setItems] = useState<
    { _id: string; name: string; description: string }[]
  >([]);
  const [form, setForm] = useState({ name: "", description: "" });

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    const res = await fetch("/api/dashboard/items");
    const data = await res.json();
    setItems(data.data);
  };

  const handleChange = (e: any) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    try {
      await fetch("/api/dashboard/items", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });
      fetchItems();
      setForm({ name: "", description: "" });
    } catch (error) {
      console.log(error);
    }
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
        <button type="submit">Add Item</button>
      </form>

      <ul>
        {items.map((item) => (
          <li key={item._id}>
            {item.name} - {item.description}
          </li>
        ))}
      </ul>
    </div>
  );
}
