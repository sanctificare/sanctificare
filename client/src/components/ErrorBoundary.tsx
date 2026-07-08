import { cn } from "@/lib/utils";
import { AlertTriangle, RotateCcw } from "lucide-react";
import { Component, ReactNode } from "react";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error) {
    const errorStr = error.toString().toLowerCase();
    const isChunkError = 
      errorStr.includes("failed to fetch dynamically imported module") || 
      errorStr.includes("chunkloaderror") ||
      errorStr.includes("loading chunk") ||
      errorStr.includes("failed to fetch");

    if (isChunkError) {
      const hasReloaded = sessionStorage.getItem("app-chunk-reloaded");
      if (!hasReloaded) {
        sessionStorage.setItem("app-chunk-reloaded", "1");
        window.location.reload();
      }
    }
  }

  componentDidMount() {
    sessionStorage.removeItem("app-chunk-reloaded");
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex items-center justify-center min-h-screen p-8 bg-background">
          <div className="flex flex-col items-center w-full max-w-2xl p-8">
            <AlertTriangle
              size={48}
              className="text-destructive mb-6 flex-shrink-0"
            />

            <h2 className="font-display text-xl text-center mb-3">Algo não carregou como deveria.</h2>

            <p className="text-sm text-muted-foreground text-center max-w-md mb-6">
              Encontramos uma falha temporária nesta tela. Recarregue a página para tentar novamente.
            </p>

            <button
              onClick={() => window.location.reload()}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-lg",
                "bg-primary text-primary-foreground",
                "hover:opacity-90 cursor-pointer"
              )}
            >
              <RotateCcw size={16} />
              Recarregar página
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;

        <div className="flex items-center justify-center min-h-screen p-8 bg-background">
          <div className="flex flex-col items-center w-full max-w-2xl p-8">
            <AlertTriangle
              size={48}
              className="text-destructive mb-6 flex-shrink-0"
            />

            <h2 className="font-display text-xl text-center mb-3">Algo não carregou como deveria.</h2>

            <p className="text-sm text-muted-foreground text-center max-w-md mb-6">
              Encontramos uma falha temporária nesta tela. Recarregue a página para tentar novamente.
            </p>

            <button
              onClick={() => window.location.reload()}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-lg",
                "bg-primary text-primary-foreground",
                "hover:opacity-90 cursor-pointer"
              )}
            >
              <RotateCcw size={16} />
              Recarregar página
            </button>
          </div>
        </div>
