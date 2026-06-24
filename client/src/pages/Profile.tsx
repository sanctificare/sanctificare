import { useState, useEffect } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { Button } from "@/components/ui/button";
import AppNav from "@/components/AppNav";
import { trpc } from "@/lib/trpc";
import { User, Heart, Crown, Calendar, Clock, ChevronRight, BookMarked, Bell } from "lucide-react";
import { Link } from "wouter";
import { getPrayerArt } from "@/lib/cardArt";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";

const LOGO_IMG = "/assets/sanctificare-logo.webp";

const PRAYER_IMAGE_BY_TYPE: Record<string, string> = {
  rosario: "/assets/sanctificare-rosary.webp",
  liturgia: getPrayerArt("liturgia").image,
  pai_nosso: getPrayerArt("pai_nosso").image,
  ave_maria: getPrayerArt("ave_maria").image,
  gloria: getPrayerArt("gloria").image,
  credo: getPrayerArt("credo").image,
  angelus: getPrayerArt("angelus").image,
  salve_rainha: getPrayerArt("salve_rainha").image,
  novena: getPrayerArt("novena").image,
  meditacao: getPrayerArt("meditacao").image,
  lectio_divina: getPrayerArt("lectio_divina").image,
};

export default function Profile() {
  const { user, isAuthenticated, loading } = useAuth();
  const { data: logs } = trpc.prayers.getAllLogs.useQuery(undefined, { enabled: isAuthenticated });
  const { data: subscription } = trpc.subscriptions.getActive.useQuery(undefined, { enabled: isAuthenticated });
  const { data: journalEntries } = trpc.lectioJournal.listRecent.useQuery({ limit: 10 }, { enabled: isAuthenticated });

  const [remindersEnabled, setRemindersEnabled] = useState<boolean>(() => {
    return localStorage.getItem("sanctificare.reminders.enabled") === "true";
  });
  const [reminderTime, setReminderTime] = useState<string>(() => {
    return localStorage.getItem("sanctificare.reminders.time") || "18:00";
  });

  const handleToggleReminders = async () => {
    if (!remindersEnabled) {
      if (!("Notification" in window)) {
        toast.error("Seu navegador não suporta notificações de área de trabalho.");
        return;
      }
      const permission = await Notification.requestPermission();
      if (permission === "granted") {
        localStorage.setItem("sanctificare.reminders.enabled", "true");
        setRemindersEnabled(true);
        toast.success("Lembretes diários ativados com sucesso!");
        new Notification("Sanctificare", {
          body: `Lembrete configurado para as ${reminderTime}! Que Deus abençoe sua jornada espiritual.`,
          icon: LOGO_IMG
        });
      } else {
        localStorage.setItem("sanctificare.reminders.enabled", "false");
        setRemindersEnabled(false);
        toast.warning("Permissão de notificação negada. Ative as notificações nas configurações do seu navegador.");
      }
    } else {
      localStorage.setItem("sanctificare.reminders.enabled", "false");
      setRemindersEnabled(false);
      toast.info("Lembretes desativados.");
    }
  };

  const handleTimeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newTime = e.target.value;
    setReminderTime(newTime);
    localStorage.setItem("sanctificare.reminders.time", newTime);
    if (remindersEnabled) {
      toast.success(`Horário do lembrete atualizado para as ${newTime}!`);
    }
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
          <p className="text-muted-foreground mb-6">Entre para ver seu caminho de oração e seu histórico espiritual.</p>
          <a href={getLoginUrl()}><Button>Entrar</Button></a>
        </div>
      </div>
    );
  }

  const initials = user?.name
    ? user.name.split(" ").map((n: string) => n[0]).slice(0, 2).join("").toUpperCase()
    : "FC";

  const totalPrayers = logs?.length || 0;
  const uniqueTypes = new Set(logs?.map((l: any) => l.prayerType) || []).size;

  // Agrupar por tipo
  const prayerCounts: Record<string, number> = {};
  logs?.forEach((l: any) => {
    prayerCounts[l.prayerName] = (prayerCounts[l.prayerName] || 0) + 1;
  });
  const topPrayers = Object.entries(prayerCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5);

  return (
    <div className="min-h-screen bg-[oklch(0.97_0.01_85)]">
      <AppNav />

      <main className="container py-8">
        <div className="max-w-3xl mx-auto">
          {/* Header perfil */}
          <div className="prayer-card p-6 mb-6 animate-fade-in">
            <div className="flex items-center gap-5">
              <div className="w-16 h-16 rounded-full bg-[oklch(0.22_0.07_260)] flex items-center justify-center border-2 border-[oklch(0.75_0.12_75/0.4)] flex-shrink-0">
                <span className="font-display text-xl font-bold text-[oklch(0.88_0.08_80)]">{initials}</span>
              </div>
              <div className="flex-1 min-w-0">
                <h1 className="font-display text-2xl font-bold text-[oklch(0.22_0.07_260)] truncate">
                  {user?.name || "Fiel Católico"}
                </h1>
                <p className="text-sm text-muted-foreground truncate">{user?.email || ""}</p>
                <div className="flex items-center gap-2 mt-2">
                  {subscription ? (
                    <span className="badge-premium flex items-center gap-1">
                      <Crown size={10} /> Premium {subscription.plan === "annual" ? "Anual" : "Mensal"}
                    </span>
                  ) : (
                    <span className="text-xs bg-muted text-muted-foreground px-2 py-0.5 rounded-full font-medium">
                      Caminho gratuito
                    </span>
                  )}
                </div>
              </div>
              {!subscription && (
                <Link href="/premium">
                  <Button size="sm" className="bg-[oklch(0.75_0.12_75)] hover:bg-[oklch(0.70_0.13_73)] text-[oklch(0.15_0.02_260)] font-semibold text-xs whitespace-nowrap">
                    <Crown size={12} className="mr-1" />
                    Conhecer Premium
                  </Button>
                </Link>
              )}
            </div>
          </div>

          {/* Estatísticas */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            {[
              { label: "Orações registradas", value: totalPrayers, icon: Heart, color: "text-[oklch(0.55_0.14_15)]" },
              { label: "Práticas diferentes", value: uniqueTypes, icon: User, color: "text-[oklch(0.40_0.10_260)]" },
              { label: "Dias de oração", value: new Set(logs?.map((l: any) => new Date(l.completedAt).toDateString()) || []).size, icon: Calendar, color: "text-[oklch(0.40_0.12_150)]" },
            ].map((stat) => (
              <div key={stat.label} className="prayer-card p-4 text-center">
                <stat.icon size={20} className={`${stat.color} mx-auto mb-2`} />
                <p className="font-display text-2xl font-bold text-[oklch(0.22_0.07_260)]">{stat.value}</p>
                <p className="text-xs text-muted-foreground">{stat.label}</p>
              </div>
            ))}
          </div>

          {/* Orações mais rezadas */}
          {topPrayers.length > 0 && (
            <div className="prayer-card p-5 mb-6">
              <h2 className="font-display text-base font-bold text-[oklch(0.22_0.07_260)] mb-4 uppercase tracking-wide">
                Orações mais rezadas
              </h2>
              <div className="space-y-3">
                {topPrayers.map(([name, count]) => (
                  <div key={name} className="flex items-center gap-3">
                    <img
                      src={PRAYER_IMAGE_BY_TYPE[name.toLowerCase().replace(/ /g, "_")] || "/assets/sanctificare-hero.webp"}
                      alt={name}
                      className="w-8 h-8 rounded-md object-cover border border-[oklch(0.72_0.10_75/0.35)]"
                      loading="lazy"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-sm font-medium text-foreground truncate">{name}</span>
                        <span className="text-xs font-bold text-[oklch(0.65_0.12_70)] ml-2">{count}x</span>
                      </div>
                      <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-[oklch(0.22_0.07_260)] to-[oklch(0.75_0.12_75)] rounded-full"
                          style={{ width: `${Math.min(100, (count / (topPrayers[0]?.[1] || 1)) * 100)}%` }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Diário Espiritual (Versículos Salvos) */}
          <div className="prayer-card p-5 mb-6">
            <div className="flex items-center gap-2 mb-4">
              <BookMarked size={16} className="text-[oklch(0.65_0.14_70)]" />
              <h2 className="font-display text-base font-bold text-[oklch(0.22_0.07_260)] uppercase tracking-wide">
                Diário Espiritual & Versículos Salvos
              </h2>
            </div>
            <div className="divider-gold mb-4" />

            {journalEntries && journalEntries.length > 0 ? (
              <div className="space-y-4 max-h-[350px] overflow-y-auto pr-1">
                {journalEntries.map((entry) => {
                  const displayDate = new Date(entry.journalDate + "T12:00:00").toLocaleDateString("pt-BR", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  });
                  
                  return (
                    <div key={entry.id} className="p-4 rounded-xl border border-border/40 bg-white/30 dark:bg-stone-900/10 space-y-2 last:mb-0">
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span className="font-medium">{displayDate}</span>
                        <span className="font-semibold text-[oklch(0.65_0.14_70)]">
                          {entry.passageReference}
                        </span>
                      </div>
                      {entry.anchoredPhrase && (
                        <blockquote className="font-serif italic text-sm text-foreground/80 pl-3 border-l-2 border-[oklch(0.75_0.12_75)] py-0.5 leading-relaxed">
                          "{entry.anchoredPhrase}"
                        </blockquote>
                      )}
                      {entry.personalNote && (
                        <p className="text-xs text-foreground/70 pt-1 leading-relaxed border-t border-border/20 mt-1">
                          <strong>Meditação:</strong> {entry.personalNote}
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-6">
                <BookMarked size={28} className="text-muted-foreground mx-auto mb-2 opacity-35" />
                <p className="text-sm text-muted-foreground">
                  Nenhum versículo foi salvo no seu diário espiritual ainda.
                </p>
              </div>
            )}
          </div>

          {/* Histórico completo */}
          <div className="prayer-card p-5">
            <div className="flex items-center gap-2 mb-4">
              <Clock size={16} className="text-[oklch(0.40_0.10_260)]" />
              <h2 className="font-display text-base font-bold text-[oklch(0.22_0.07_260)] uppercase tracking-wide">
                Histórico de oração
              </h2>
            </div>
            <div className="divider-gold mb-4" />

            {logs && logs.length > 0 ? (
              <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
                {logs.map((log: any) => (
                  <div key={log.id} className="flex items-center gap-3 py-2 border-b border-border last:border-0">
                    <div className="w-9 h-9 rounded-full bg-[oklch(0.22_0.07_260/0.08)] flex items-center justify-center flex-shrink-0">
                      <img
                        src={PRAYER_IMAGE_BY_TYPE[log.prayerType] || "/assets/sanctificare-hero.webp"}
                        alt={log.prayerName}
                        className="w-8 h-8 rounded-full object-cover"
                        loading="lazy"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">{log.prayerName}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(log.completedAt).toLocaleDateString("pt-BR", {
                          day: "numeric", month: "long", year: "numeric",
                        })} às {new Date(log.completedAt).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Heart size={28} className="text-muted-foreground mx-auto mb-3 opacity-30" />
                <p className="text-sm text-muted-foreground mb-4">Nenhuma oração foi registrada ainda.</p>
                <Link href="/oracoes">
                  <Button size="sm" className="bg-[oklch(0.22_0.07_260)] text-white">
                    Começar a rezar
                    <ChevronRight size={14} className="ml-1" />
                  </Button>
                </Link>
              </div>
            )}
          </div>

          {/* Lembretes Diários */}
          <div className="mt-6 prayer-card p-5">
            <div className="flex items-center gap-2 mb-4">
              <Bell size={16} className="text-[oklch(0.65_0.14_70)]" />
              <h2 className="font-display text-base font-bold text-[oklch(0.22_0.07_260)] uppercase tracking-wide">
                Lembretes Diários
              </h2>
            </div>
            <div className="divider-gold mb-4" />
            
            <div className="flex flex-col gap-4">
              <p className="text-xs text-muted-foreground">
                Ative notificações no seu navegador para receber um lembrete diário de oração no horário selecionado e manter sua ofensiva ativa.
              </p>

              <div className="flex items-center justify-between p-3 rounded-lg border border-border/40 bg-white/20 dark:bg-stone-900/5">
                <div className="flex flex-col pr-4">
                  <span className="text-sm font-semibold text-foreground">Habilitar Lembretes</span>
                  <span className="text-xs text-muted-foreground mt-0.5">Notificar-me no horário agendado</span>
                </div>
                <Switch 
                  checked={remindersEnabled}
                  onCheckedChange={handleToggleReminders}
                />
              </div>

              {remindersEnabled && (
                <div className="flex items-center justify-between p-3 rounded-lg border border-border/40 bg-white/20 dark:bg-stone-900/5 animate-fade-in">
                  <div className="flex flex-col pr-4">
                    <span className="text-sm font-semibold text-foreground">Horário do Lembrete</span>
                    <span className="text-xs text-muted-foreground mt-0.5">Defina quando prefere rezar</span>
                  </div>
                  <select
                    value={reminderTime}
                    onChange={handleTimeChange}
                    className="rounded-lg border border-border/60 bg-white dark:bg-background px-3 py-1.5 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-[oklch(0.75_0.12_75)] font-semibold shadow-sm cursor-pointer"
                  >
                    <option value="06:00">06:00 (Manhã)</option>
                    <option value="08:00">08:00 (Início do dia)</option>
                    <option value="12:00">12:00 (Angelus)</option>
                    <option value="18:00">18:00 (Angelus da Tarde)</option>
                    <option value="20:00">20:00 (Noite)</option>
                    <option value="22:00">22:00 (Fim do dia)</option>
                  </select>
                </div>
              )}
            </div>
          </div>

          {/* Assinatura */}
          {subscription && (
            <div className="mt-6 prayer-card p-5">
              <div className="flex items-center gap-2 mb-4">
                <Crown size={16} className="text-[oklch(0.65_0.12_70)]" />
                <h2 className="font-display text-base font-bold text-[oklch(0.22_0.07_260)] uppercase tracking-wide">
                  Minha assinatura
                </h2>
              </div>
              <div className="divider-gold mb-4" />
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold text-sm text-foreground">
                    Premium {subscription.plan === "annual" ? "Anual" : "Mensal"}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Válido até {new Date(subscription.expiresAt).toLocaleDateString("pt-BR", { day: "numeric", month: "long", year: "numeric" })}
                  </p>
                </div>
                <Link href="/premium">
                  <Button variant="outline" size="sm" className="text-xs">
                    Gerenciar
                  </Button>
                </Link>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
