import { useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import AppNav from "@/components/AppNav";
import { trpc } from "@/lib/trpc";
import { Users, Heart, Plus, Clock, HandHeart } from "lucide-react";
import { toast } from "sonner";

const LOGO_IMG = "/assets/sanctificare-logo.webp";

export default function Intentions() {
  const { isAuthenticated, loading, user } = useAuth();
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  const utils = trpc.useUtils();
  const { data: intentions, isLoading } = trpc.intentions.list.useQuery();
  const { data: myPrayed } = trpc.intentions.myPrayed.useQuery(undefined, { enabled: isAuthenticated });

  const createIntention = trpc.intentions.create.useMutation({
    onSuccess: () => {
      utils.intentions.list.invalidate();
      setShowForm(false);
      setTitle("");
      setDescription("");
      toast.success("Intenção publicada!", { description: "Que o Senhor atenda à sua oração." });
    },
    onError: () => toast.error("Não foi possível publicar sua intenção agora."),
  });

  const prayMutation = trpc.intentions.pray.useMutation({
    onSuccess: (data) => {
      utils.intentions.list.invalidate();
      utils.intentions.myPrayed.invalidate();
      if (data.alreadyPrayed) {
        toast.info("Você já orou por esta intenção.");
      } else {
        toast.success("Oração oferecida!", { description: "Que Deus acolha a sua intercessão." });
      }
    },
    onError: () => toast.error("Não foi possível registrar sua intercessão agora."),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) return;
    createIntention.mutate({ title, description });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <img src={LOGO_IMG} alt="Sanctificare" className="w-16 h-16 rounded-full animate-pulse" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <img src={LOGO_IMG} alt="Sanctificare" className="w-16 h-16 rounded-full mx-auto mb-4" />
          <h2 className="font-display text-2xl font-bold mb-2">Acesso Restrito</h2>
          <p className="text-muted-foreground mb-6">Entre para confiar suas intenções e rezar pelas intenções dos irmãos.</p>
          <a href={getLoginUrl()}><Button>Entrar</Button></a>
        </div>
      </div>
    );
  }

  const prayedSet = new Set(myPrayed || []);

  return (
    <div className="min-h-screen bg-[oklch(0.97_0.01_85)]">
      <AppNav />

      <main className="container py-8">
        {/* Header */}
        <div className="mb-8 animate-fade-in">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Users size={20} className="text-[oklch(0.45_0.12_200)]" />
                <span className="text-sm text-muted-foreground font-medium">Comunidade</span>
              </div>
              <h1 className="font-display text-3xl font-bold text-[oklch(0.22_0.07_260)] mb-1">
                Mural de Intenções
              </h1>
              <p className="font-serif text-muted-foreground">
                Confie suas intenções e una-se em oração pelas necessidades dos irmãos.
              </p>
            </div>
            <Button
              className="bg-[oklch(0.22_0.07_260)] hover:bg-[oklch(0.28_0.08_260)] text-white font-semibold gap-2"
              onClick={() => setShowForm(true)}
            >
              <Plus size={15} />
              Nova intenção
            </Button>
          </div>
        </div>

        {/* Banner de oração */}
        <div className="mb-6 rounded-2xl bg-[oklch(0.22_0.07_260)] p-5 relative overflow-hidden">
          <div className="absolute inset-0 bg-pattern-cross opacity-20" />
          <div className="relative text-center">
            <p className="font-serif text-base italic text-[oklch(0.88_0.06_82)]">
              "Onde dois ou três estiverem reunidos em meu nome, ali estou no meio deles."
            </p>
            <p className="text-sm text-[oklch(0.65_0.12_70)] mt-1 font-semibold">Mateus 18:20</p>
          </div>
        </div>

        {/* Lista de intenções */}
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="prayer-card p-5 animate-pulse">
                <div className="h-4 bg-muted rounded w-3/4 mb-2" />
                <div className="h-3 bg-muted rounded w-full mb-1" />
                <div className="h-3 bg-muted rounded w-2/3" />
              </div>
            ))}
          </div>
        ) : intentions && intentions.length > 0 ? (
          <div className="space-y-4">
            {intentions.map((intention: any) => {
              const hasPrayed = prayedSet.has(intention.id);
              return (
                <div key={intention.id} className="prayer-card p-5 animate-fade-in">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <div className="w-7 h-7 rounded-full bg-[oklch(0.22_0.07_260/0.1)] flex items-center justify-center flex-shrink-0">
                          <span className="text-xs font-bold text-[oklch(0.22_0.07_260)]">
                            {intention.authorName?.charAt(0)?.toUpperCase() || "F"}
                          </span>
                        </div>
                        <span className="text-xs font-semibold text-[oklch(0.40_0.08_260)]">
                          {intention.authorName}
                        </span>
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <Clock size={10} />
                          {new Date(intention.createdAt).toLocaleDateString("pt-BR")}
                        </span>
                      </div>
                      <h3 className="font-display text-base font-semibold text-[oklch(0.22_0.07_260)] mb-1">
                        {intention.title}
                      </h3>
                      <p className="font-serif text-sm text-muted-foreground leading-relaxed">
                        {intention.description}
                      </p>
                    </div>
                    <div className="flex flex-col items-center gap-1 flex-shrink-0">
                      <button
                        onClick={() => prayMutation.mutate({ intentionId: intention.id })}
                        disabled={prayMutation.isPending}
                        className={`flex flex-col items-center gap-1 p-3 rounded-xl transition-all ${
                          hasPrayed
                            ? "bg-[oklch(0.55_0.14_15/0.1)] text-[oklch(0.55_0.14_15)]"
                            : "bg-[oklch(0.22_0.07_260/0.06)] text-[oklch(0.22_0.07_260)] hover:bg-[oklch(0.22_0.07_260/0.12)]"
                        }`}
                      >
                        <HandHeart size={18} className={hasPrayed ? "fill-[oklch(0.55_0.14_15/0.3)]" : ""} />
                        <span className="text-xs font-bold">{intention.prayerCount}</span>
                      </button>
                      <span className="text-xs text-muted-foreground">preces</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-16">
            <Users size={40} className="text-muted-foreground mx-auto mb-4 opacity-30" />
            <h3 className="font-display text-lg font-semibold text-[oklch(0.22_0.07_260)] mb-2">
              Nenhuma intenção ainda
            </h3>
            <p className="text-muted-foreground mb-6">Seja o primeiro a confiar aqui uma intenção de oração.</p>
            <Button
              className="bg-[oklch(0.22_0.07_260)] text-white font-semibold"
              onClick={() => setShowForm(true)}
            >
              <Plus size={14} className="mr-2" />
              Publicar intenção
            </Button>
          </div>
        )}
      </main>

      {/* Modal de nova intenção */}
      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="font-display text-xl text-[oklch(0.22_0.07_260)]">
              Nova Intenção de Oração
            </DialogTitle>
          </DialogHeader>
          <div className="divider-gold mb-4" />
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-sm font-medium text-foreground mb-1.5 block">
                Título da Intenção
              </label>
              <Input
                placeholder="Ex.: Saúde de um familiar"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                maxLength={200}
                required
              />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground mb-1.5 block">
                Descrição
              </label>
              <Textarea
                placeholder="Escreva brevemente a intenção que deseja confiar à oração da comunidade..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
                required
              />
            </div>
            <div className="flex gap-3 pt-2">
              <Button
                type="submit"
                className="flex-1 bg-[oklch(0.22_0.07_260)] hover:bg-[oklch(0.28_0.08_260)] text-white font-semibold"
                disabled={createIntention.isPending}
              >
                <Heart size={14} className="mr-2" />
                {createIntention.isPending ? "Publicando..." : "Confiar intenção"}
              </Button>
              <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
                Cancelar
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
