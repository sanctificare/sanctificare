import React from "react";
import { Spinner } from "@/components/ui/spinner";

interface LoadingOverlayProps {
  message?: string;
  className?: string;
}

export default function LoadingOverlay({ message = "Carregando...", className = "" }: LoadingOverlayProps) {
  return (
    <div className={"fixed inset-0 z-[9999] flex items-center justify-center bg-black/30 backdrop-blur-sm " + className}>
      <div className="flex flex-col items-center gap-3 bg-[#071028]/80 border border-amber-500/10 p-4 rounded-lg shadow-lg">
        <Spinner className="h-10 w-10 text-amber-200" />
        <div className="text-amber-100 text-sm">{message}</div>
      </div>
    </div>
  );
}
