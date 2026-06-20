import { useEffect, useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { Button } from "@/components/ui/button";
import AppNav from "@/components/AppNav";
import { Sun, Heart } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import LiturgyReadings from "@/components/LiturgyReadings";
import AudioPlayer from "@/components/AudioPlayer";
import { getLiturgyAudioByDate, type LiturgyDailyAudioTrack } from "@/data/liturgy-audio";

const LOGO_IMG = "/assets/sanctificare-logo.webp";

export default function Liturgy() {
  const { isAuthenticated, loading } = useAuth();
  const logPrayer = trpc.prayers.logPrayer.useMutation();
  const { data: liturgy, isLoading: isFetchingLiturgy, error } = trpc.liturgy.getByDate.useQuery(
    { date: undefined }
  );
  const [liturgyAudio, setLiturgyAudio] = useState<LiturgyDailyAudioTrack | null>(null);

  useEffect(() => {
    let canceled = false;

    async function checkAudioAvailability() {
      const candidate = getLiturgyAudioByDate(liturgy?.liturgyDate);
      if (!candidate) {
        setLiturgyAudio(null);
        return;
      }

      try {
        const res = await fetch(candidate.audioUrl, { method: "HEAD" });
        if (!canceled) {
          setLiturgyAudio(res.ok ? candidate : null);
        }
      } catch {
        if (!canceled) {
          setLiturgyAudio(null);
        }
      }
    }

    checkAudioAvailability();
    return () => {
      canceled = true;
    };
  }, [liturgy?.liturgyDate]);

  const today = new Date().toLocaleDateString("pt-BR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const handleLogLiturgy = async () => {
    if (!isAuthenticated) return;
    try {
      await logPrayer.mutateAsync({
        prayerType: "liturgia",
        prayerName: `Liturgia do Dia — ${liturgy?.celebration || "—"}`,
      });
      toast.success("Liturgia registrada!", {
        description: "Você rezou hoje em comunhão com a Igreja.",
      });
    } catch {
      toast.error("Não foi possível registrar sua leitura agora.");
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
          <p className="text-muted-foreground mb-6">Entre para rezar a Liturgia do Dia.</p>
          <a href={getLoginUrl()}>
            <Button>Entrar</Button>
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <AppNav />
      <div className="max-w-3xl mx-auto px-4 py-6 space-y-6">
        {/* Header */}
        <div className="text-center space-y-2 mb-8">
          <div className="flex items-center justify-center gap-2 text-primary mb-2">
            <Sun className="w-5 h-5" />
            <span className="text-sm font-semibold">LITURGIA DIÁRIA</span>
          </div>
          <h1 className="font-display text-3xl font-bold">{today}</h1>
        </div>

        {/* Error state */}
        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-sm text-red-800">
            <p className="font-semibold">Erro ao carregar a liturgia</p>
            <p className="text-xs mt-1">{error.message}</p>
          </div>
        )}

        {/* Loading state */}
        {isFetchingLiturgy && (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-24 bg-muted rounded-lg animate-pulse" />
            ))}
          </div>
        )}

        {/* Content */}
        {liturgy && !isFetchingLiturgy && (
          <>
            {liturgyAudio && (
              <AudioPlayer
                audioUrl={liturgyAudio.audioUrl}
                title={liturgyAudio.title}
                description={liturgyAudio.description}
                supportTitle="Texto da liturgia"
                supportDescription="Acompanhe a leitura enquanto escuta"
                supportText={[
                  liturgy.firstReading?.texto,
                  liturgy.psalm?.texto,
                  liturgy.secondReading?.texto,
                  liturgy.gospel?.texto,
                ]
                  .filter(Boolean)
                  .join("\n\n")}
              />
            )}

            <LiturgyReadings liturgy={liturgy} />

            {/* Log button */}
            <div className="pt-6 border-t border-border">
              <Button
                onClick={handleLogLiturgy}
                disabled={logPrayer.isPending}
                className="w-full"
              >
                <Heart className="w-4 h-4 mr-2" />
                {logPrayer.isPending ? "Registrando..." : "Registrar que rezei hoje"}
              </Button>
              <p className="text-xs text-muted-foreground text-center mt-2">
                Compartilhe sua fé e celebre com a comunidade.
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
