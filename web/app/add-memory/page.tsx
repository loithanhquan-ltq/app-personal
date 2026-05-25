import { Suspense } from "react";
import { AddMemoryForm } from "./AddMemoryForm";

export default function AddMemoryPage() {
  return (
    <Suspense fallback={null}>
      <AddMemoryForm />
    </Suspense>
  );
}
