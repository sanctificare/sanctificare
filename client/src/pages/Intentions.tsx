import { useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import AppNav from "@/components/AppNav";
import { trpc } from "@/lib/trpc";
import {
  Users, Heart, Plus, Clock, HandHeart, Sparkles,
  MessageCircle, EyeOff, Send, ChevronDown, ChevronUp, Filter,
  Pencil, Trash2,
} from "lucide-react";
import { toast } from "sonner";

const LOGO_IMG = "/assets/logo-sanctificare.webp";

const CATEGORIES = [
  { value: "cura",      label: "Cura e Saúde",        emoji: "🙏", color: "oklch(0.55 0.18 15)" },
  { value: "familia",   label: "Família",              emoji: "👨‍👩‍👧", color: "oklch(0.50 0.15 200)" },
  { value: "conversao", label: "Conversão",            emoji: "✝️",  color: "oklch(0.45 0.12 260)" },
  { value: "trabalho",  label: "Trabalho e Provisão",  emoji: "💼", color: "oklch(0.48 0.14 150)" },
  { value: "defuntos",  label: "Pelos Defuntos",       emoji: "⚰️", color: "oklch(0.35 0.05 260)" },
  { value: "paz",       label: "Paz e Reconciliação",  emoji: "🕊️", color: "oklch(0.50 0.16 240)" },
] as const;

type Category = typeof CATEGORIES[number]["value"];

function getCategoryInfo(value: string | null | undefined) {
  return CATEGORIES.find((c) => c.value === value) ?? null;
}

function getDaysLeft(expiresAt: Date | string | null | undefined): number | null {
  if (!expiresAt) return null;
  const diff = new Date(expiresAt).getTime() - Date.now();
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
}

// ─── Encouragement Thread ─────────────────────────────────────────────────────
function EncouragementThread({
  intentionId,
  isAuthenticated,
  user,
}: {
  intentionId: number;
  isAuthenticated: boolean;
  user: { name?: string | null } | null;
}) {
  const [open, setOpen] = useState(false);
  const [msgText, setMsgText] = useState("");
  const [msgAnon, setMsgAnon] = useState(false);

  const { data: messages, refetch } = trpc.intentions.listMessages.useQuery(
    { intentionId },
    { enabled: open }
  );

  const addMessage = trpc.intentions.addMessage.useMutation({
    onSuccess: () => {
      setMsgText("");
      refetch();
      toast.success("Mensagem enviada!", { description: "Que seu encorajamento fortaleça o irmão." });
    },
    onError: () => toast.error("Não foi possível enviar a mensagem agora."),
  });

  const count = messages?.length ?? 0;

  return (
    <div className="mt-3 pt-3 border-t border-[oklch(0.22_0.07_260/0.08)]">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-1.5 text-xs text-[oklch(0.45_0.10_260)] hover:text-[oklch(0.22_0.07_260)] transition-colors font-medium"
        aria-label="Abrir mensagens de encorajamento"
      >
        <MessageCircle size={13} />
        {open ? (
          <>Fechar mensagens {ChevronUp && <ChevronUp size={12} />}</>
        ) : (
          <>{count > 0 ? `${count} encorajamento${count > 1 ? "s" : ""}` : "Enviar encorajamento"} <ChevronDown size={12} /></>
        )}
      </button>

      {open && (
        <div className="mt-3 space-y-3 animate-fade-in">
          {messages && messages.length > 0 ? (
            <div className="space-y-2">
              {messages.map((msg: any) => (
                <div
                  key={msg.id}
                  className="flex items-start gap-2 bg-[oklch(0.96_0.02_85)] rounded-lg px-3 py-2"
                >
                  <div className="w-6 h-6 rounded-full bg-[oklch(0.22_0.07_260/0.12)] flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-[10px] font-bold text-[oklch(0.22_0.07_260)]">
                      {msg.isAnonymous ? "?" : msg.authorName?.charAt(0)?.toUpperCase() || "F"}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="text-[11px] font-semibold text-[oklch(0.40_0.08_260)]">
                      {msg.isAnonymous ? "Fiel Anônimo" : msg.authorName}
                    </span>
                    <p className="text-xs text-muted-foreground font-serif leading-relaxed mt-0.5">
                      {msg.message}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-muted-foreground font-serif italic text-center py-2">
              Seja o primeiro a enviar uma palavra de encorajamento.
            </p>
          )}

          {isAuthenticated && (
            <div className="flex flex-col gap-2">
              <Textarea
                placeholder="Escreva uma mensagem de conforto ou um versículo bíblico..."
                value={msgText}
                onChange={(e) => setMsgText(e.target.value)}
                rows={2}
                maxLength={300}
                className="text-sm resize-none"
              />
              <div className="flex items-center justify-between gap-2">
                <label className="flex items-center gap-1.5 cursor-pointer select-none text-xs text-muted-foreground">
                  <input
                    type="checkbox"
                    checked={msgAnon}
                    onChange={(e) => setMsgAnon(e.target.checked)}
                    className="w-3.5 h-3.5 accent-[oklch(0.22_0.07_260)]"
                  />
                  <EyeOff size={11} />
                  Enviar anonimamente
                </label>
                <Button
                  size="sm"
                  disabled={msgText.trim().length < 3 || addMessage.isPending}
                  onClick={() =>
                    addMessage.mutate({
                      intentionId,
                      message: msgText.trim(),
                      isAnonymous: msgAnon,
                    })
                  }
                  className="bg-[oklch(0.22_0.07_260)] hover:bg-[oklch(0.28_0.08_260)] text-white text-xs h-8 gap-1.5"
                >
                  <Send size={12} />
                  {addMessage.isPending ? "Enviando..." : "Enviar"}
                </Button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function Intentions() {
  const { isAuthenticated, loading, user } = useAuth();
  const [showForm, setShowForm] = useState(false);
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<Category | null>(null);
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [filterCategory, setFilterCategory] = useState<Category | "all">("all");

  // Estado de edição
  const [editingIntention, setEditingIntention] = useState<{
    id: number;
    description: string;
    category: Category | null;
    isAnonymous: boolean;
  } | null>(null);
  const [editDesc, setEditDesc] = useState("");
  const [editCategory, setEditCategory] = useState<Category | null>(null);
  const [editAnonymous, setEditAnonymous] = useState(false);

  const utils = trpc.useUtils();
  const { data: intentions, isLoading } = trpc.intentions.list.useQuery();
  const { data: myPrayed } = trpc.intentions.myPrayed.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  const createIntention = trpc.intentions.create.useMutation({
    onSuccess: () => {
      utils.intentions.list.invalidate();
      setShowForm(false);
      setDescription("");
      setCategory(null);
      setIsAnonymous(false);
      toast.success("Intenção publicada!", {
        description: "Que o Senhor atenda à sua oração.",
      });
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
        toast.success("Oração oferecida!", {
          description: "Que Deus acolha a sua intercessão.",
        });
      }
    },
    onError: () => toast.error("Não foi possível registrar sua intercessão agora."),
  });

  const graceMarkMutation = trpc.intentions.markGrace.useMutation({
    onSuccess: () => {
      utils.intentions.list.invalidate();
      toast.success("Graça alcançada! ✨", {
        description: "Que sua gratidão inspire os irmãos a perseverar em oração.",
      });
    },
    onError: () => toast.error("Não foi possível registrar a graça agora."),
  });

  const deleteMutation = trpc.intentions.delete.useMutation({
    onSuccess: () => {
      utils.intentions.list.invalidate();
      toast.success("Intenção removida.");
    },
    onError: () => toast.error("Não foi possível remover a intenção agora."),
  });

  const updateMutation = trpc.intentions.update.useMutation({
    onSuccess: () => {
      utils.intentions.list.invalidate();
      setEditingIntention(null);
      toast.success("Intenção atualizada!");
    },
    onError: () => toast.error("Não foi possível atualizar a intenção agora."),
  });

  const openEdit = (intention: any) => {
    setEditingIntention({ id: intention.id, description: intention.description, category: intention.category, isAnonymous: !!intention.isAnonymous });
    setEditDesc(intention.description);
    setEditCategory(intention.category ?? null);
    setEditAnonymous(!!intention.isAnonymous);
  };

  const handleDelete = (intentionId: number) => {
    if (!window.confirm("Deseja remover esta intenção de oração?")) return;
    deleteMutation.mutate({ intentionId });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedDesc = description.trim();

    if (trimmedDesc.length < 10) {
      toast.error("A descrição deve conter pelo menos 10 caracteres.");
      return;
    }

    // Gera o título automaticamente a partir dos primeiros 80 caracteres da descrição
    const autoTitle = trimmedDesc.length > 80
      ? trimmedDesc.slice(0, 77).trimEnd() + "..."
      : trimmedDesc;

    createIntention.mutate({
      title: autoTitle,
      description: trimmedDesc,
      category: category ?? null,
      isAnonymous,
    });
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
          <p className="text-muted-foreground mb-6">
            Entre para confiar suas intenções e rezar pelas intenções dos irmãos.
          </p>
          <a href={getLoginUrl()}>
            <Button>Entrar</Button>
          </a>
        </div>
      </div>
    );
  }

  const prayedSet = new Set(myPrayed || []);

  const filteredIntentions =
    filterCategory === "all"
      ? intentions
      : intentions?.filter((i: any) => i.category === filterCategory);

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
              id="btn-nova-intencao"
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

        {/* Filtro por categoria */}
        <div className="mb-6 flex flex-wrap gap-2 items-center">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground mr-1">
            <Filter size={13} />
            <span className="font-medium">Filtrar:</span>
          </div>
          <button
            onClick={() => setFilterCategory("all")}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${
              filterCategory === "all"
                ? "bg-[oklch(0.22_0.07_260)] text-white border-[oklch(0.22_0.07_260)]"
                : "bg-white text-[oklch(0.40_0.08_260)] border-[oklch(0.22_0.07_260/0.2)] hover:border-[oklch(0.22_0.07_260/0.5)]"
            }`}
          >
            Todas
          </button>
          {CATEGORIES.map((cat) => (
            <button
              key={cat.value}
              onClick={() => setFilterCategory(cat.value)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${
                filterCategory === cat.value
                  ? "text-white border-transparent"
                  : "bg-white text-[oklch(0.35_0.08_260)] border-[oklch(0.22_0.07_260/0.2)] hover:border-[oklch(0.22_0.07_260/0.5)]"
              }`}
              style={filterCategory === cat.value ? { backgroundColor: cat.color, borderColor: cat.color } : {}}
            >
              {cat.emoji} {cat.label}
            </button>
          ))}
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
        ) : filteredIntentions && filteredIntentions.length > 0 ? (
          <div className="space-y-4">
            {filteredIntentions.map((intention: any) => {
              const hasPrayed = prayedSet.has(intention.id);
              const isMyIntention = user && intention.userId === (user as any).id;
              const categoryInfo = getCategoryInfo(intention.category);
              const daysLeft = getDaysLeft(intention.expiresAt);
              const isGrace = !!intention.graceObtained;

              return (
                <div
                  key={intention.id}
                  className={`prayer-card p-5 animate-fade-in transition-all ${
                    isGrace
                      ? "border-2 border-[oklch(0.70_0.18_85)] bg-gradient-to-br from-[oklch(0.97_0.06_85)] to-[oklch(0.94_0.08_80)]"
                      : ""
                  }`}
                >
                  {/* Graça Alcançada — banner festivo */}
                  {isGrace && (
                    <div className="flex items-center gap-2 mb-3 bg-[oklch(0.70_0.18_85/0.15)] rounded-lg px-3 py-1.5">
                      <Sparkles size={14} className="text-[oklch(0.55_0.20_85)]" />
                      <span className="text-xs font-bold text-[oklch(0.45_0.18_85)]">
                        Graça Alcançada — Deus ouviu esta oração! ✨
                      </span>
                    </div>
                  )}

                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      {/* Autor + metadados */}
                      <div className="flex flex-wrap items-center gap-2 mb-2">
                        <div className="w-7 h-7 rounded-full bg-[oklch(0.22_0.07_260/0.1)] flex items-center justify-center flex-shrink-0">
                          <span className="text-xs font-bold text-[oklch(0.22_0.07_260)]">
                            {intention.isAnonymous ? "?" : intention.authorName?.charAt(0)?.toUpperCase() || "F"}
                          </span>
                        </div>
                        <span className="text-xs font-semibold text-[oklch(0.40_0.08_260)]">
                          {intention.isAnonymous ? "Fiel Anônimo" : intention.authorName}
                        </span>
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <Clock size={10} />
                          {new Date(intention.createdAt).toLocaleDateString("pt-BR")}
                        </span>
                        {/* Badge de categoria */}
                        {categoryInfo && (
                          <span
                            className="text-[10px] font-bold px-2 py-0.5 rounded-full text-white"
                            style={{ backgroundColor: categoryInfo.color }}
                          >
                            {categoryInfo.emoji} {categoryInfo.label}
                          </span>
                        )}
                        {/* Countdown novena */}
                        {daysLeft !== null && !isGrace && (
                          <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${
                            daysLeft <= 2
                              ? "text-[oklch(0.55_0.18_15)] border-[oklch(0.55_0.18_15/0.3)] bg-[oklch(0.55_0.18_15/0.05)]"
                              : "text-[oklch(0.45_0.10_260)] border-[oklch(0.45_0.10_260/0.2)] bg-[oklch(0.45_0.10_260/0.05)]"
                          }`}>
                            {daysLeft === 0 ? "Último dia" : `${daysLeft}d de novena`}
                          </span>
                        )}
                      </div>

                      <p className="font-serif text-sm text-muted-foreground leading-relaxed">
                        {intention.description}
                      </p>

                      {/* Botões de ação do autor */}
                      {isMyIntention && !isGrace && (
                        <div className="mt-3 flex items-center gap-2">
                          <button
                            onClick={() => graceMarkMutation.mutate({ intentionId: intention.id })}
                            disabled={graceMarkMutation.isPending}
                            className="flex items-center gap-1.5 text-xs font-semibold text-[oklch(0.50_0.18_85)] hover:text-[oklch(0.40_0.20_85)] transition-colors border border-[oklch(0.65_0.18_85/0.4)] hover:border-[oklch(0.65_0.18_85)] rounded-full px-3 py-1 bg-[oklch(0.70_0.18_85/0.06)] hover:bg-[oklch(0.70_0.18_85/0.12)]"
                          >
                            <Sparkles size={11} />
                            Graça Alcançada
                          </button>
                          <button
                            onClick={() => openEdit(intention)}
                            className="flex items-center gap-1.5 text-xs font-semibold text-[oklch(0.45_0.10_260)] hover:text-[oklch(0.22_0.07_260)] transition-colors border border-[oklch(0.22_0.07_260/0.2)] hover:border-[oklch(0.22_0.07_260/0.5)] rounded-full px-3 py-1 bg-[oklch(0.22_0.07_260/0.04)] hover:bg-[oklch(0.22_0.07_260/0.10)]"
                          >
                            <Pencil size={11} />
                            Editar
                          </button>
                          <button
                            onClick={() => handleDelete(intention.id)}
                            disabled={deleteMutation.isPending}
                            className="flex items-center gap-1.5 text-xs font-semibold text-[oklch(0.55_0.18_15)] hover:text-[oklch(0.45_0.20_15)] transition-colors border border-[oklch(0.55_0.18_15/0.2)] hover:border-[oklch(0.55_0.18_15/0.5)] rounded-full px-3 py-1 bg-[oklch(0.55_0.18_15/0.04)] hover:bg-[oklch(0.55_0.18_15/0.10)]"
                          >
                            <Trash2 size={11} />
                            Excluir
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Botão de prece */}
                    <div className="flex flex-col items-center gap-1 flex-shrink-0">
                      <button
                        id={`btn-pray-${intention.id}`}
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

                  {/* Thread de mensagens de encorajamento */}
                  <EncouragementThread
                    intentionId={intention.id}
                    isAuthenticated={isAuthenticated}
                    user={user}
                  />
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-16">
            <Users size={40} className="text-muted-foreground mx-auto mb-4 opacity-30" />
            <h3 className="font-display text-lg font-semibold text-[oklch(0.22_0.07_260)] mb-2">
              {filterCategory !== "all" ? "Nenhuma intenção nesta categoria" : "Nenhuma intenção ainda"}
            </h3>
            <p className="text-muted-foreground mb-6">
              {filterCategory !== "all"
                ? "Tente outro filtro ou seja o primeiro a publicar nesta categoria."
                : "Seja o primeiro a confiar aqui uma intenção de oração."}
            </p>
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
        <DialogContent className="max-w-md" aria-describedby={undefined}>
          <DialogHeader>
            <DialogTitle className="font-display text-xl text-[oklch(0.22_0.07_260)]">
              Nova Intenção de Oração
            </DialogTitle>
          </DialogHeader>
          <div className="divider-gold mb-4" />
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Categoria */}
            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">
                Categoria <span className="text-muted-foreground font-normal">(opcional)</span>
              </label>
              <div className="grid grid-cols-2 gap-2">
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat.value}
                    type="button"
                    onClick={() => setCategory(category === cat.value ? null : cat.value)}
                    className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold border transition-all text-left ${
                      category === cat.value
                        ? "text-white border-transparent"
                        : "bg-[oklch(0.97_0.01_85)] text-[oklch(0.35_0.08_260)] border-[oklch(0.22_0.07_260/0.15)] hover:border-[oklch(0.22_0.07_260/0.4)]"
                    }`}
                    style={category === cat.value ? { backgroundColor: cat.color } : {}}
                  >
                    <span>{cat.emoji}</span>
                    <span>{cat.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Descrição */}
            <div>
              <label className="text-sm font-medium text-foreground mb-1.5 block">
                Descrição
              </label>
              <Textarea
                id="textarea-intencao-descricao"
                placeholder="Escreva a intenção que deseja confiar à oração da comunidade (mínimo 10 caracteres)..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                minLength={10}
                rows={4}
                required
              />
            </div>

            {/* Publicar anonimamente */}
            <label className="flex items-center gap-2.5 cursor-pointer select-none p-3 rounded-xl bg-[oklch(0.97_0.01_85)] border border-[oklch(0.22_0.07_260/0.12)] hover:border-[oklch(0.22_0.07_260/0.3)] transition-colors">
              <input
                type="checkbox"
                id="toggle-anonimo"
                checked={isAnonymous}
                onChange={(e) => setIsAnonymous(e.target.checked)}
                className="w-4 h-4 accent-[oklch(0.22_0.07_260)]"
              />
              <EyeOff size={15} className="text-[oklch(0.45_0.10_260)]" />
              <div>
                <p className="text-sm font-medium text-foreground">Ocultar meu nome</p>
                <p className="text-xs text-muted-foreground">
                  Sua intenção aparecerá como "Fiel Anônimo" no mural
                </p>
              </div>
            </label>

            {/* Nota sobre novena */}
            <p className="text-xs text-muted-foreground font-serif italic text-center">
              ✝️ Sua intenção ficará no mural por 9 dias — uma novena de oração comunitária.
            </p>

            <div className="flex gap-3 pt-2">
              <Button
                id="btn-confirmar-intencao"
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

      {/* Modal de edição de intenção */}
      <Dialog open={!!editingIntention} onOpenChange={(open) => !open && setEditingIntention(null)}>
        <DialogContent className="max-w-md" aria-describedby={undefined}>
          <DialogHeader>
            <DialogTitle className="font-display text-xl text-[oklch(0.22_0.07_260)]">
              Editar Intenção de Oração
            </DialogTitle>
          </DialogHeader>
          <div className="divider-gold mb-4" />
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const trimmed = editDesc.trim();
              if (trimmed.length < 10) {
                toast.error("A descrição deve conter pelo menos 10 caracteres.");
                return;
              }
              updateMutation.mutate({
                intentionId: editingIntention!.id,
                description: trimmed,
                category: editCategory ?? null,
                isAnonymous: editAnonymous,
              });
            }}
            className="space-y-4"
          >
            {/* Categoria */}
            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">
                Categoria <span className="text-muted-foreground font-normal">(opcional)</span>
              </label>
              <div className="grid grid-cols-2 gap-2">
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat.value}
                    type="button"
                    onClick={() => setEditCategory(editCategory === cat.value ? null : cat.value)}
                    className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold border transition-all text-left ${
                      editCategory === cat.value
                        ? "text-white border-transparent"
                        : "bg-[oklch(0.97_0.01_85)] text-[oklch(0.35_0.08_260)] border-[oklch(0.22_0.07_260/0.15)] hover:border-[oklch(0.22_0.07_260/0.4)]"
                    }`}
                    style={editCategory === cat.value ? { backgroundColor: cat.color } : {}}
                  >
                    <span>{cat.emoji}</span>
                    <span>{cat.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Descrição */}
            <div>
              <label className="text-sm font-medium text-foreground mb-1.5 block">Descrição</label>
              <Textarea
                id="textarea-edit-descricao"
                value={editDesc}
                onChange={(e) => setEditDesc(e.target.value)}
                minLength={10}
                rows={4}
                required
              />
            </div>

            {/* Anônimo */}
            <label className="flex items-center gap-2.5 cursor-pointer select-none p-3 rounded-xl bg-[oklch(0.97_0.01_85)] border border-[oklch(0.22_0.07_260/0.12)] hover:border-[oklch(0.22_0.07_260/0.3)] transition-colors">
              <input
                type="checkbox"
                checked={editAnonymous}
                onChange={(e) => setEditAnonymous(e.target.checked)}
                className="w-4 h-4 accent-[oklch(0.22_0.07_260)]"
              />
              <EyeOff size={15} className="text-[oklch(0.45_0.10_260)]" />
              <div>
                <p className="text-sm font-medium text-foreground">Ocultar meu nome</p>
                <p className="text-xs text-muted-foreground">Aparecerá como "Fiel Anônimo" no mural</p>
              </div>
            </label>

            <div className="flex gap-3 pt-2">
              <Button
                type="submit"
                className="flex-1 bg-[oklch(0.22_0.07_260)] hover:bg-[oklch(0.28_0.08_260)] text-white font-semibold"
                disabled={updateMutation.isPending}
              >
                <Pencil size={14} className="mr-2" />
                {updateMutation.isPending ? "Salvando..." : "Salvar alterações"}
              </Button>
              <Button type="button" variant="outline" onClick={() => setEditingIntention(null)}>
                Cancelar
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
