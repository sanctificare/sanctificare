import { useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "../lib/trpc";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AlertTriangle, ArrowLeft, Trash2 } from "lucide-react";
import { Link, useLocation } from "wouter";
import { isMobileApp } from "@/const";

const LOGO_IMG = "/assets/sanctificare-logo-v2.webp";

export default function DangerZone() {
  const { user, isAuthenticated, loading, logout } = useAuth();
  const [, setLocation] = useLocation();
  const deleteAccountMutation = trpc.account.deleteMe.useMutation();

  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteConfirmationText, setDeleteConfirmationText] = useState("");

  const canConfirmDelete = deleteConfirmationText.trim().toUpperCase() === "EXCLUIR";

  const handleDeleteAccount = async () => {
    setIsDeleting(true);
    try {
      const result = await deleteAccountMutation.mutateAsync();
      if (result.deleted) {
        toast.success("Conta excluída com sucesso.", {
          description: "Seus dados foram removidos e sua sessão foi encerrada.",
        });
      } else {
        toast.success("Conta já havia sido removida.", {
          description: "Sua sessão será encerrada para concluir o processo.",
        });
      }
      await logout();
      setLocation("/");
    } catch (err) {
      toast.error("Erro ao excluir conta. Tente novamente.");
    } finally {
      setIsDeleting(false);
    }
  };


  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <div className="text-center">
          <img src={LOGO_IMG} alt="Sanctificare" className="w-16 h-16 object-contain mx-auto mb-4" />
          <h2 className="font-display text-2xl font-bold mb-2">Acesso Restrito</h2>
          <p className="text-muted-foreground mb-6">Você precisa estar logado para acessar esta página.</p>
          <Link href="/login">
            <Button>Entrar</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cream dark:bg-background">
      <main className="container py-6 sm:py-8">
        <div className="max-w-md mx-auto">
          {/* Back button */}
          <div className="mb-6">
            <Link href="/perfil" className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground font-medium transition-colors">
              <ArrowLeft size={14} />
              Voltar ao Perfil
            </Link>
          </div>

          {/* Danger Zone Main Box */}
          <div className="prayer-card p-6 border-red-500/30 bg-red-50/10 rounded-3xl shadow-xl flex flex-col items-center">
            <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-950/50 flex items-center justify-center text-red-600 mb-4 animate-bounce">
              <AlertTriangle size={24} />
            </div>

            <h1 className="font-display text-xl font-bold text-red-700 dark:text-red-500 uppercase tracking-wider mb-2">
              Excluir Conta Permanentemente
            </h1>
            <p className="text-xs text-muted-foreground text-center mb-6 leading-relaxed">
              Esta ação é definitiva, irreversível e apagará todos os seus registros de oração, histórico espiritual e preferências de nossos servidores.
            </p>

            <div className="w-full bg-white dark:bg-stone-900 border border-red-200/50 rounded-2xl p-4 mb-6">
              <p className="text-xs font-semibold text-red-700 dark:text-red-400 mb-3 text-center">
                Para confirmar a exclusão, digite EXCLUIR no campo abaixo:
              </p>
              <Input
                value={deleteConfirmationText}
                onChange={(event) => setDeleteConfirmationText(event.target.value)}
                placeholder="Digite EXCLUIR"
                aria-label="Confirmação de exclusão"
                disabled={isDeleting}
                className="w-full text-center border-red-200 focus:border-red-500 focus:ring-red-500 text-sm font-bold uppercase placeholder:normal-case placeholder:font-normal"
              />
              <p className="text-[10px] text-muted-foreground/80 text-center mt-2">
                Esta confirmação manual impede que a conta seja excluída por cliques acidentais.
              </p>
            </div>

            <div className="w-full flex flex-col gap-2">
              <Button
                variant="destructive"
                onClick={handleDeleteAccount}
                disabled={isDeleting || !canConfirmDelete}
                className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-2.5 rounded-xl shadow-md transition-all flex items-center justify-center gap-1.5"
              >
                {isDeleting ? (
                  <>
                    <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Excluindo...
                  </>
                ) : (
                  <>
                    <Trash2 size={16} />
                    Confirmar Exclusão Definitiva
                  </>
                )}
              </Button>
              
              <Link href="/perfil" className="w-full">
                <Button
                  variant="outline"
                  disabled={isDeleting}
                  className="w-full border-slate-200 dark:border-stone-800 hover:bg-black/5 dark:hover:bg-white/5 text-xs py-2 rounded-xl"
                >
                  Cancelar e Voltar
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
