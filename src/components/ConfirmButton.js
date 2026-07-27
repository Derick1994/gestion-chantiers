"use client";

import { useFormStatus } from "react-dom";

export default function ConfirmButton({ children, confirmMessage, className }) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className={`${className} disabled:opacity-50`}
      onClick={(e) => {
        if (!confirm(confirmMessage)) {
          e.preventDefault();
        }
      }}
    >
      {pending ? "…" : children}
    </button>
  );
}
