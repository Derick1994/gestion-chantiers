"use client";

import { useFormStatus } from "react-dom";

export default function PendingButton({ children, pendingLabel = "…", className }) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} className={`${className} disabled:opacity-50`}>
      {pending ? pendingLabel : children}
    </button>
  );
}
