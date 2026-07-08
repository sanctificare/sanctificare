import { AlertTriangle, RotateCcw } from "lucide-react";

export default function ErrorCard({ title = "Algo deu errado.", message, onRetry }: { title?: string; message?: string; onRetry?: () => void }) {
  return (
    <div className="flex items-center justify-center min-h-screen p-8 bg-background">
      <div className="flex flex-col items-center w-full max-w-2xl p-8">
        <AlertTriangle size={48} className="text-destructive mb-6 flex-shrink-0" />

        <h2 className="font-display text-xl text-center mb-3">{title}</h2>

        {message ? (
          <p className="text-sm text-muted-foreground text-center max-w-md mb-6">{message}</p>
        ) : null}

        <button
          onClick={() => onRetry?.()}
          className={"flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:opacity-90 cursor-pointer"}
        >
          <RotateCcw size={16} />
          Tentar novamente
        </button>
      </div>
    </div>
  );
}
