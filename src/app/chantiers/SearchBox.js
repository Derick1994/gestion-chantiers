"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useState, useTransition } from "react";

export default function SearchBox() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [value, setValue] = useState(searchParams.get("q") || "");
  const [, startTransition] = useTransition();

  function onChange(e) {
    const v = e.target.value;
    setValue(v);
    const params = new URLSearchParams(searchParams);
    if (v) {
      params.set("q", v);
    } else {
      params.delete("q");
    }
    startTransition(() => {
      router.replace(`${pathname}?${params.toString()}`);
    });
  }

  return (
    <input
      type="search"
      value={value}
      onChange={onChange}
      placeholder="Rechercher (nom, lieu)…"
      className="w-full sm:w-64 rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none"
    />
  );
}
