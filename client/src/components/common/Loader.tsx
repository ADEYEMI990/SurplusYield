// src/components/commom/Loader.tsx
import { ClipLoader } from "react-spinners";

export default function Loader({ size = 30 }: { size?: number }) {
  return (
    <div className="flex justify-center items-center py-6">
      <ClipLoader size={size} color="#2563eb" />
    </div>
  );
}
