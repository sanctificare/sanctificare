import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { AlertCircle, Home } from "lucide-react";
import { useLocation } from "wouter";

export default function NotFound() {
  const [, setLocation] = useLocation();

  const handleGoHome = () => {
    setLocation("/dashboard");
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[oklch(0.98_0.005_85)] px-4 py-12">
      <Card className="w-full max-w-lg shadow-lg border border-[oklch(0.75_0.12_75/0.18)] bg-white/90 backdrop-blur-sm">
        <CardContent className="pt-8 pb-8 text-center">
          <div className="flex justify-center mb-6">
            <div className="relative">
              <div className="absolute inset-0 bg-[oklch(0.75_0.12_75/0.16)] rounded-full animate-pulse" />
              <AlertCircle className="relative h-16 w-16 text-[oklch(0.55_0.12_70)]" />
            </div>
          </div>

          <h1 className="font-display text-4xl font-bold text-navy mb-2">404</h1>

          <h2 className="font-display text-xl font-semibold text-slate-800 mb-4">
            Página não encontrada
          </h2>

          <p className="text-slate-600 mb-8 leading-relaxed">
            O caminho que você tentou acessar não existe ou foi movido.
            <br />
            Volte ao início do app para continuar sua jornada.
          </p>

          <div
            id="not-found-button-group"
            className="flex flex-col sm:flex-row gap-3 justify-center"
          >
            <Button
              onClick={handleGoHome}
              className="bg-navy hover:bg-navy-light text-white px-6 py-2.5 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg"
            >
              <Home className="w-4 h-4 mr-2" />
              Ir para o início
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
