import { useEffect, useMemo, useRef, useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { Button } from "@/components/ui/button";
import AppNav from "@/components/AppNav";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import {
  Award,
  PlayCircle,
  BookOpen,
  RotateCcw,
} from "lucide-react";
import {
  LECTIO_PASSAGES,
  getDailyLectio,
  type LectioPassage,
} from "@/data/lectio";
import {
  getGuidedLectioAudioTracks,
} from "@/data/lectio-audio";
import AudioPlayer from "@/components/AudioPlayer";

const LOGO_IMG = "/assets/sanctificare-logo.webp";
const COVER_IMG = "/assets/lectio-cover.png";
const DAILY_GOSPEL_PASSAGE_ID = "daily-gospel";

const getPassageImageUrl = (passageId: string) => {
  const supportedIds = [
    "daily-gospel",
    "mt-5-1-12",
    "lc-10-38-42",
    "jo-15-1-8",
    "sl-23",
    "lc-15-11-32",
  ];
  if (supportedIds.includes(passageId)) {
    return `/assets/lectio/${passageId}.png`;
  }
  return COVER_IMG;
};

export default function LectioDivina() {
  const { isAuthenticated, loading } = useAuth();
  const logPrayer = trpc.prayers.logPrayer.useMutation();

  const daily = useMemo(() => getDailyLectio(), []);
  const [selectedId, setSelectedId] = useState<string>(daily.id);

  // Guided Mode Audio Player states
  const [currentAudioTrack, setCurrentAudioTrack] = useState<number>(0);
  const [autoGuidedActive, setAutoGuidedActive] = useState<boolean>(false);
  const [showGuidedAudio, setShowGuidedAudio] = useState<boolean>(false);
  const [completed, setCompleted] = useState<boolean>(false);
  const [replayingReading, setReplayingReading] = useState<boolean>(false);

  // Background Music states
  const [bgMusic, setBgMusic] = useState<"none" | "instrumental">("none");
  const [bgVolume, setBgVolume] = useState<number>(0.15);
  const [sessionIsPlaying, setSessionIsPlaying] = useState<boolean>(false);
  const bgAudioRef = useRef<HTMLAudioElement | null>(null);

  // Sync background music with session play state
  useEffect(() => {
    const bgAudio = bgAudioRef.current;
    if (!bgAudio) return;

    if (bgMusic === "instrumental" && sessionIsPlaying && showGuidedAudio) {
      bgAudio.volume = bgVolume;
      bgAudio.play().catch(() => {});
    } else {
      const timer = setTimeout(() => {
        if (!sessionIsPlaying || !showGuidedAudio) {
          bgAudio.pause();
        }
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [bgMusic, sessionIsPlaying, showGuidedAudio]);

  // Handle volume changes dynamically
  useEffect(() => {
    if (bgAudioRef.current) {
      bgAudioRef.current.volume = bgVolume;
    }
  }, [bgVolume]);


  const { data: liturgyToday } = trpc.liturgy.getByDate.useQuery({ date: undefined });

  const dailyGospelPassage = useMemo<LectioPassage | null>(() => {
    if (!liturgyToday?.gospel?.texto || !liturgyToday?.gospel?.referencia) {
      return null;
    }

    return {
      id: DAILY_GOSPEL_PASSAGE_ID,
      reference: liturgyToday.gospel.referencia,
      title: "Evangelho do Dia",
      theme: liturgyToday.celebration ?? "Liturgia diária",
      context: "Reze hoje a Lectio Divina em sintonia com o Evangelho proclamado na liturgia da Igreja.",
      text: liturgyToday.gospel.texto,
      steps: {
        lectio: {
          prompt: "O que o texto diz?",
          helper: "Leia devagar duas vezes e destaque a frase que mais toca o seu coração.",
        },
        meditatio: {
          prompt: "O que o texto diz a mim hoje?",
          helper: "Pergunte-se: onde esta Palavra encontra minha vida concreta neste dia?",
        },
        oratio: {
          prompt: "O que respondo ao Senhor?",
          helper: "Transforme em oração: louvor, súplica, pedido de perdão ou entrega.",
        },
        contemplatio: {
          prompt: "Como Deus me transforma no silêncio?",
          helper: "Permaneça em silêncio na presença de Cristo, repetindo interiormente a Palavra guardada.",
        },
        actio: {
          prompt: "Qual gesto concreto viverei hoje?",
          helper: "Escolha um ato simples de caridade que traduza a Palavra em vida.",
        },
      },
    };
  }, [liturgyToday]);

  const availablePassages = useMemo(() => {
    if (!dailyGospelPassage) return LECTIO_PASSAGES;
    return [dailyGospelPassage, ...LECTIO_PASSAGES];
  }, [dailyGospelPassage]);

  const passage: LectioPassage =
    availablePassages.find((p) => p.id === selectedId) ?? daily;

  // Auto-select daily-gospel once it is loaded (only if no active session is running)
  useEffect(() => {
    if (dailyGospelPassage && !showGuidedAudio) {
      setSelectedId(DAILY_GOSPEL_PASSAGE_ID);
    }
  }, [dailyGospelPassage, showGuidedAudio]);

  // Date formatted in America/Sao_Paulo timezone
  const todaySaoPaulo = useMemo(() => {
    return new Intl.DateTimeFormat("en-CA", {
      timeZone: "America/Sao_Paulo",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).format(new Date());
  }, []);

  // Guided tracks generation
  const guidedTracks = useMemo(() => {
    return getGuidedLectioAudioTracks(passage.id, todaySaoPaulo);
  }, [passage.id, todaySaoPaulo]);

  const readingTrack = useMemo(() => {
    return guidedTracks.find(
      (t) => t.id === "leitura-evangelho-meditacao" || t.id === "leitura-passagem"
    );
  }, [guidedTracks]);

  const readingTrackIndex = useMemo(() => {
    return guidedTracks.findIndex(
      (t) => t.id === "leitura-evangelho-meditacao" || t.id === "leitura-passagem"
    );
  }, [guidedTracks]);

  const handleComplete = async () => {
    if (!isAuthenticated) return;
    try {
      await logPrayer.mutateAsync({
        prayerType: "lectio_divina",
        prayerName: `Lectio Divina — ${passage.reference}`,
      });
      setCompleted(true);
      toast.success("Lectio Divina registrada!", {
        description: "Que a Palavra permaneça no seu coração e dê fruto ao longo do dia.",
      });
    } catch {
      toast.error("Não foi possível registrar sua lectio agora.");
    }
  };

  // Guided Mode Handlers
  const handleStartGuidedSession = () => {
    setCurrentAudioTrack(0);
    setReplayingReading(false);
    setCompleted(false); // Reset completion state for the new session
    setShowGuidedAudio(true);
    setAutoGuidedActive(true);
  };

  const handleStopGuidedSession = () => {
    setAutoGuidedActive(false);
    setReplayingReading(false);
    setShowGuidedAudio(false);
  };

  const handleReadingReplayEnd = () => {
    setReplayingReading(false);
    toast.info("Leitura concluída. Retornando ao passo atual.");
  };

  const handleReadingReplayError = () => {
    setReplayingReading(false);
    toast.error("Não foi possível reproduzir a leitura.");
  };

  const handleGuidedTrackEnd = () => {
    if (currentAudioTrack < guidedTracks.length - 1) {
      setCurrentAudioTrack((prev) => prev + 1);
    } else {
      setAutoGuidedActive(false);
      setShowGuidedAudio(false);
      handleComplete();
    }
  };

  const handleGuidedTrackError = () => {
    if (autoGuidedActive) {
      if (currentAudioTrack < guidedTracks.length - 1) {
        setCurrentAudioTrack((prev) => prev + 1);
        toast.warning("Faixa indisponível", {
          description: "Uma faixa não pôde ser carregada e a oração avançou automaticamente.",
        });
      } else {
        setAutoGuidedActive(false);
        setShowGuidedAudio(false);
        toast.error("Fim da sessão", {
          description: "A última faixa do áudio não pôde ser carregada.",
        });
      }
      return;
    }
    setAutoGuidedActive(false);
    setShowGuidedAudio(false);
    toast.error("Áudio indisponível", {
      description: "Esta faixa não pôde ser carregada do Cloudflare.",
    });
  };

  const guidedSupport = useMemo(() => {
    const trackIndex = replayingReading && readingTrackIndex !== -1 ? readingTrackIndex : currentAudioTrack;
    const track = guidedTracks[trackIndex];
    if (!track) return { supportTitle: "", supportDescription: "", supportText: "" };

    if (track.id === "intro-lectio") {
      return {
        supportTitle: "Introdução",
        supportDescription: "Preparação para a Lectio Divina",
        supportText: `[00:00.0 - 00:09.4] Vamos começar fazendo silêncio. Feche os olhos, se preferir, e respire devagar.
[00:09.4 - 00:16.0] Inspire e expire devagar.
[00:16.8 - 00:22.1] Solte os pensamentos que carregou até aqui.
[00:22.1 - 00:29.8] O trabalho, as preocupações, as pressas do dia.
[00:30.0 - 00:38.3] Coloque-se na presença de Deus como você é, sem pressa.
[00:45.7 - 00:53.5] Agora, vamos invocar o Espírito Santo.
[00:53.5 - 01:03.3] Vem, Espírito Santo, dispõe nosso coração para escutar a Palavra de Deus.
[01:03.3 - 01:12.1] Senhor, abre nossos ouvidos e nosso coração para a Tua Palavra.`,
      };
    }

    if (track.id === "sinal-cruz") {
      return {
        supportTitle: "Sinal da Cruz",
        supportDescription: "Abertura da oração",
        supportText: "Em nome do Pai, do Filho, do Espírito Santo, amém!",
      };
    }

    const stepKey = track.stepKey;
    if (stepKey === "conclusion") {
      return {
        supportTitle: "Pai Nosso",
        supportDescription: "Encerramento da Lectio Divina",
        supportText: `Pai Nosso que estais nos Céus, 
santificado seja o vosso Nome, 
venha a nós o vosso Reino, 
seja feita a vossa vontade 
assim na terra como no Céu. 
O pão nosso de cada dia nos dai hoje, 
perdoai-nos as nossas ofensas 
assim como nós perdoamos 
a quem nos tem ofendido, 
e não nos deixeis cair em tentação, 
mas livrai-nos do Mal. Amém!`,
      };
    }

    if (track.id === "passo-lectio") {
      return {
        supportTitle: "Passo 1: Leitura (Lectio)",
        supportDescription: "Introdução à Leitura",
        supportText: `[00:00.0 - 00:07.5] Agora, ouça com muita atenção e reverência a leitura do texto sagrado.
[00:07.5 - 00:18.5] Preste muita atenção no que está sendo dito, nos personagens, nos lugares, nas ações, nos diálogos.
[00:18.5 - 00:24.9] Ouça com muita atenção também aquelas palavras que se repetem.
[00:24.9 - 00:28.4] Evite interpretações.
[00:28.4 - 00:33.2] Apenas ouça e sinta o que Deus está falando para você.`,
      };
    }

    if (track.id === "leitura-evangelho-meditacao" && passage.id === "daily-gospel") {
      const isJune20 = todaySaoPaulo.endsWith("-06-20");
      if (isJune20) {
        return {
          supportTitle: "Leitura do Evangelho",
          supportDescription: passage.reference,
          supportText: `[00:00.0 - 00:05.8] Proclamação do Evangelho de Jesus Cristo segundo Mateus
[00:05.8 - 00:13.5] Ninguém pode servir a dois senhores, porque ou há de odiar um e amar o outro,
[00:13.5 - 00:18.0] ou há de afeiçoar-se a um e desprezar o outro.
[00:18.0 - 00:21.7] Não podeis servir a Deus e à riqueza.
[00:21.7 - 00:27.1] Portanto, vos digo, não vos preocupeis demasiadamente
[00:27.1 - 00:31.0] nem com a vossa vida acerca do que haveis de comer,
[00:31.0 - 00:35.8] nem com o vosso corpo acerca do que haveis de vestir.
[00:35.8 - 00:43.1] Porventura, não vale mais a vida que o alimento, e o corpo mais que o vestido?
[00:43.1 - 00:48.4] Olhai para as aves do céu, que não semeiam nem ceifam,
[00:48.4 - 00:56.3] nem fazem provisões nos celeiros, e contudo o vosso Pai Celeste as sustenta.
[00:56.3 - 01:02.4] Porventura, não valeis vós muito mais que elas?
[01:02.4 - 01:12.2] Qual de vós, por mais que se afadigue, pode acrescentar um só côvado à duração da sua vida?
[01:12.2 - 01:15.2] E por que vos inquietais com o vestido?
[01:15.2 - 01:22.4] Considerai como crescem os lírios do campo, não trabalham nem fiam.
[01:22.4 - 01:30.4] Digo-vos, todavia, que nem Salomão, em toda a sua glória, se vestiu como um deles.
[01:30.4 - 01:40.4] Se, pois, Deus veste assim uma erva no campo, que hoje existe e amanhã é lançada no forno,
[01:40.4 - 01:44.5] quanto mais a vós, homens de pouca fé.
[01:44.5 - 01:53.5] Não vos afligais, pois, dizendo: que comeremos, que beberemos, com que nos vestiremos?
[01:53.5 - 02:00.5] Os gentios é que procuram, com excessivo cuidado, todas essas coisas.
[02:00.5 - 02:05.5] O vosso Pai sabe que tendes necessidade delas.
[02:05.5 - 02:11.6] Buscai, pois, em primeiro lugar o Reino de Deus e a sua justiça,
[02:11.6 - 02:16.6] e todas essas coisas vos serão dadas por acréscimo.
[02:16.6 - 02:22.6] Não vos preocupeis, pois, demasiadamente pelo dia de amanhã.
[02:22.6 - 02:27.6] O dia de amanhã terá suas preocupações próprias.
[02:27.6 - 02:31.6] A cada dia basta o seu cuidado.
[02:31.6 - 02:34.6] Palavra da Salvação`,
        };
      }

      return {
        supportTitle: "Leitura do Evangelho",
        supportDescription: passage.reference,
        supportText: `[00:00.0 - 00:04.9] Proclamação do Evangelho de Jesus Cristo segundo Mateus.
[00:04.9 - 00:12.3] Parem de acumular para vocês tesouro na terra, onde a traça e a ferrugem consomem,
[00:12.3 - 00:16.4] e onde ladrões arrombam e furtam.
[00:16.4 - 00:21.3] Em vez disso, acumulem para vocês tesouros no céu,
[00:21.3 - 00:25.2] onde nem a traça nem a ferrugem consomem,
[00:25.2 - 00:29.9] e onde ladrões não arrombam nem furtam.
[00:30.3 - 00:36.5] Pois, onde estiver o seu tesouro, ali estará também o seu coração.
[00:36.5 - 00:39.5] A lâmpada do corpo é o olho.
[00:39.5 - 00:45.3] Então, se o olho for focado, todo o seu corpo será luminoso.
[00:45.3 - 00:51.3] Mas se o seu olho for invejoso, todo o seu corpo será escuro.
[00:51.3 - 00:58.5] Se a luz que há em você na realidade é escuridão, como é grande essa escuridão?
[00:58.5 - 01:00.5] Palavra da Salvação`,
      };
    }

    if (track.id === "leitura-passagem" || track.id === "leitura-evangelho-meditacao") {
      return {
        supportTitle: "Leitura do Evangelho",
        supportDescription: passage.reference,
        supportText: `${passage.reference}\n\n${passage.text}`,
      };
    }

    if (track.id === "passo-meditatio") {
      return {
        supportTitle: "Passo 2: Meditação (Meditatio)",
        supportDescription: "Introdução à Meditação",
        supportText: `[00:00.0 - 00:05.4] Reflita por alguns instantes a palavra de Deus que acabou de ouvir.
[00:05.4 - 00:08.7] Se necessário, ouça novamente,
[00:08.7 - 00:15.6] observando quais palavras, frases ou imagens mais tocaram o seu coração.
[00:15.6 - 00:17.0] Pergunte-se,
[00:17.0 - 00:22.0] o que o Senhor deseja me dizer através deste texto?
[00:22.0 - 00:28.6] Você pode repetir uma frase bíblica do texto que ouviu várias vezes.
[00:28.7 - 00:33.8] Refletir como esta passagem se aplica à sua vida hoje
[00:33.8 - 00:35.3] e perguntar,
[00:35.3 - 00:38.4] o que Deus quer mudar em mim?
[00:38.4 - 00:40.4] A que Ele está me chamando?`,
      };
    }

    if (track.id === "passo-oratio") {
      return {
        supportTitle: "Passo 3: Oração (Oratio)",
        supportDescription: "Fale com Deus",
        supportText: `[00:00.0 - 00:11.8] Agora responde a Deus a partir do que meditou, não faça análise ou esforço intelectual, apenas abra o seu coração a Deus.
[00:11.8 - 00:28.9] Fale com simplicidade como um filho fala ao pai, agradeça, peça, adore, lamente, descanse em silêncio, deixando que o próprio espírito ore em ti.
[00:28.9 - 00:37.1] E se as palavras não vierem, não te inquietes, fica apenas em silêncio diante de Deus.`,
      };
    }

    if (track.id === "passo-contemplatio") {
      return {
        supportTitle: "Passo 4: Contemplação (Contemplatio)",
        supportDescription: "Silencie na presença de Deus",
        supportText: `[00:00.0 - 00:07.0] Agora, deixe de lado as palavras e descanse na presença do Senhor.
[00:07.0 - 00:14.5] Permaneça em silêncio amoroso, contemplando aquele que falou ao seu coração.
[00:14.5 - 00:18.5] Não procure fazer ou dizer nada.
[00:18.5 - 00:28.0] Apenas esteja com Deus, acolhendo sua paz, seu amor e sua presença transformadora.`,
      };
    }

    if (track.id === "passo-actio") {
      return {
        supportTitle: "Passo 5: Ação (Actio)",
        supportDescription: "Escolha um gesto concreto",
        supportText: `[00:00.0 - 00:06.8] Para fecharmos este momento de oração, escolha um gesto concreto para hoje.
[00:06.8 - 00:14.6] Pode ser um gesto de perdão, de paz, uma renúncia, um ato de misericórdia.
[00:14.6 - 00:22.8] Leva contigo ao longo do dia uma palavra ou frase, só uma, que tenha recebido na oração de hoje.`,
      };
    }

    const stepGuide = passage.steps[stepKey as keyof typeof passage.steps];
    const stepName = stepKey.charAt(0).toUpperCase() + stepKey.slice(1);

    return {
      supportTitle: `Passo da ${stepName}`,
      supportDescription: stepGuide?.prompt || "",
      supportText: `${stepGuide?.prompt || ""}\n\nDiretriz:\n${stepGuide?.helper || ""}`,
    };
  }, [guidedTracks, currentAudioTrack, passage]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <img
          src={LOGO_IMG}
          alt="Sanctificare"
          className="w-16 h-16 rounded-full animate-pulse"
        />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <img
            src={LOGO_IMG}
            alt="Sanctificare"
            className="w-16 h-16 rounded-full mx-auto mb-4"
          />
          <h2 className="font-display text-2xl font-bold mb-2">
            Acesso Restrito
          </h2>
          <p className="text-muted-foreground mb-6">
            Entre para praticar a Lectio Divina.
          </p>
          <a href={getLoginUrl()}>
            <Button className="bg-[oklch(0.22_0.07_260)] text-white">
              Entrar
            </Button>
          </a>
        </div>
      </div>
    );
  }

  const currentTrack = guidedTracks[currentAudioTrack];
  const currentStepKey = currentTrack?.stepKey;
  const stepsSeq = ["intro", "lectio", "meditatio", "oratio", "contemplatio", "actio", "conclusion"] as const;
  const currentStepIndex = stepsSeq.indexOf(currentStepKey as any);
  const guidedProgress = guidedTracks.length > 1 ? Math.round((currentAudioTrack / (guidedTracks.length - 1)) * 100) : 0;

  return (
    <div className="min-h-screen bg-gradient-to-b from-[oklch(0.18_0.03_180)] to-[oklch(0.08_0.01_180)] text-white flex flex-col">
      <AppNav />

      {/* Background Music Audio Element */}
      <audio
        ref={bgAudioRef}
        src="/assets/vela-virtual/musica-ambiente.mp3"
        loop
        preload="auto"
        aria-hidden="true"
        style={{ display: "none" }}
      />

      {/* Pre-loads next track in Guided Mode */}
      {autoGuidedActive && currentAudioTrack + 1 < guidedTracks.length && (
        <audio
          key={`preload-guided-${currentAudioTrack + 1}`}
          src={guidedTracks[currentAudioTrack + 1].audioUrl}
          preload="auto"
          aria-hidden="true"
          style={{ display: "none" }}
        />
      )}

      <main className="flex-1 flex flex-col items-center justify-center p-6 md:py-12">
        <div className="w-full max-w-md flex flex-col items-center">
          {!showGuidedAudio ? (
            /* Guided Setup / Start Screen */
            <div className="w-full text-center bg-white/5 border border-white/10 rounded-3xl p-6 shadow-xl">
              <div className="relative w-full h-56 md:h-64 rounded-2xl overflow-hidden shadow-lg mb-6">
                <img
                  src={getPassageImageUrl(passage.id)}
                  alt="Lectio Divina Cover"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/10" />
              </div>

              {completed && (
                <div className="mb-4 bg-[oklch(0.55_0.14_70/0.1)] border border-[oklch(0.55_0.14_70/0.3)] rounded-2xl py-3 text-center text-xs text-[oklch(0.72_0.10_75)] font-semibold flex items-center justify-center gap-2 animate-fade-in">
                  <Award size={14} />
                  Lectio Divina concluída com sucesso!
                </div>
              )}

              <p className="text-xs font-semibold uppercase tracking-widest text-[oklch(0.75_0.12_75)] mb-2">
                Sessão Guiada por Áudio
              </p>
              <h2 className="font-display text-2xl font-bold text-white mb-2">
                {passage.title}
              </h2>
              <p className="text-xs text-white/50 mb-4 font-serif italic">
                {passage.reference}
              </p>
              <p className="text-sm text-white/60 mb-6 leading-relaxed">
                Sessão interativa passo a passo. Os áudios guiarão você nos momentos da Lectio Divina (Leitura, Meditação, Oração, Contemplação e Ação) intercalados com pausas de reflexão.
              </p>

              {/* Background Music Selector */}
              <div className="mb-6 text-left w-full">
                <label className="text-xs font-semibold text-white/70 mb-2 block">
                  Música de Fundo (Instrumental)
                </label>
                <div className="grid grid-cols-2 gap-2 bg-white/5 p-1 rounded-xl border border-white/5">
                  <button
                    type="button"
                    onClick={() => setBgMusic("none")}
                    className={`py-2 text-xs font-medium rounded-lg transition-all cursor-pointer ${
                      bgMusic === "none"
                        ? "bg-white/10 text-white shadow-sm"
                        : "text-white/60 hover:text-white"
                    }`}
                  >
                    Sem música (Silêncio)
                  </button>
                  <button
                    type="button"
                    onClick={() => setBgMusic("instrumental")}
                    className={`py-2 text-xs font-medium rounded-lg transition-all cursor-pointer ${
                      bgMusic === "instrumental"
                        ? "bg-[oklch(0.75_0.12_75)]/20 text-[oklch(0.75_0.12_75)] border border-[oklch(0.75_0.12_75)]/30"
                        : "text-white/60 hover:text-white"
                    }`}
                  >
                    Instrumental Suave
                  </button>
                </div>
              </div>

              <Button
                onClick={handleStartGuidedSession}
                className="w-full h-12 bg-[oklch(0.75_0.12_75)] hover:bg-[oklch(0.70_0.13_73)] text-[oklch(0.15_0.02_260)] font-semibold rounded-2xl shadow-lg"
              >
                <PlayCircle size={18} className="mr-2" />
                Iniciar Meditação Guiada
              </Button>

            </div>
          ) : (
            /* Active Guided Session Player */
            <div className="w-full text-center bg-white/5 border border-white/10 rounded-3xl p-6 shadow-xl flex flex-col items-center">
              <div className="relative w-full h-56 md:h-64 rounded-2xl overflow-hidden shadow-lg mb-6">
                <img
                  src={getPassageImageUrl(passage.id)}
                  alt="Lectio Divina Cover"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/10" />
              </div>



              {/* Active Step Guide info */}
              <div className="w-full mb-6 min-h-[120px] flex flex-col justify-center animate-scale-in">
                {replayingReading ? (
                  <div className="animate-fade-in">
                    <span className="text-xs uppercase font-bold tracking-widest text-[oklch(0.75_0.12_75)] mb-2 block">
                      Reouvindo a Leitura
                    </span>
                    <h3 className="font-display text-xl font-bold mb-2">
                      {passage.title}
                    </h3>
                    <p className="text-xs text-white/60 leading-relaxed">
                      Você está reouvindo a leitura bíblica. Ao terminar, a meditação guiada será automaticamente retomada do ponto onde você estava.
                    </p>
                  </div>
                ) : (
                  <>
                    <span className="text-xs uppercase font-bold tracking-widest text-[oklch(0.75_0.12_75)] mb-2 block">
                      {currentTrack?.description}
                    </span>

                    {currentStepKey === "intro" && (
                      <div className="animate-fade-in">
                        <h3 className="font-display text-xl font-bold mb-2">Aquietando o Coração</h3>
                        <p className="text-sm text-white/70 leading-relaxed font-serif">
                          Coloque-se em uma postura confortável, feche os olhos e respire fundo. Deixe de lado as preocupações do dia.
                        </p>
                      </div>
                    )}

                    {currentStepKey === "conclusion" && (
                      <div className="animate-fade-in">
                        <h3 className="font-display text-xl font-bold mb-2">Lectio Concluída</h3>
                        <p className="text-sm text-white/70 leading-relaxed font-serif">
                          Agradeça a Deus pela Palavra semeada no seu coração. Que ela dê frutos ao longo do seu dia. Amém.
                        </p>
                      </div>
                    )}

                    {currentStepKey !== "intro" && currentStepKey !== "conclusion" && (
                      <div className="animate-fade-in">
                        <h3 className="font-display text-xl font-bold mb-2">
                          {currentTrack?.title}
                        </h3>
                        <p className="text-sm text-[oklch(0.75_0.12_75)] italic font-semibold mb-3">
                          "{passage.steps[currentStepKey as keyof typeof passage.steps]?.prompt}"
                        </p>
                        <p className="text-xs text-white/60 leading-relaxed">
                          {passage.steps[currentStepKey as keyof typeof passage.steps]?.helper}
                        </p>
                      </div>
                    )}
                  </>
                )}
              </div>

              {/* Guided Player */}
              {currentTrack && (
                <div className="w-full animate-fade-in mb-6">
                  <AudioPlayer
                    audioUrl={replayingReading && readingTrack ? readingTrack.audioUrl : currentTrack.audioUrl}
                    title={replayingReading && readingTrack ? readingTrack.title : currentTrack.title}
                    description={replayingReading && readingTrack ? "Reouvindo a leitura" : currentTrack.description}
                    artworkUrl={getPassageImageUrl(passage.id)}
                    supportTitle={guidedSupport.supportTitle}
                    supportDescription={guidedSupport.supportDescription}
                    supportText={guidedSupport.supportText}
                    autoPlay={autoGuidedActive || replayingReading}
                    onTrackEnd={replayingReading ? handleReadingReplayEnd : handleGuidedTrackEnd}
                    onTrackError={replayingReading ? handleReadingReplayError : handleGuidedTrackError}
                    onPlayStateChange={setSessionIsPlaying}
                  />
                </div>
              )}

              {/* Background Music Volume Slider during Active Session */}
              {bgMusic === "instrumental" && (
                <div className="bg-white/5 border border-white/10 rounded-2xl p-3 flex items-center justify-between w-full mb-3 animate-fade-in">
                  <span className="text-xs text-white/60 font-medium">Trilha de Fundo</span>
                  <div className="flex items-center gap-2 w-32">
                    <span className="text-[10px] text-white/40">Vol</span>
                    <input
                      type="range"
                      min={0.05}
                      max={0.3}
                      step={0.01}
                      value={bgVolume}
                      onChange={(e) => setBgVolume(Number(e.target.value))}
                      className="w-full accent-[oklch(0.75_0.12_75)] h-1 rounded-lg cursor-pointer bg-white/10"
                      aria-label="Volume da trilha de fundo"
                    />
                  </div>
                </div>
              )}

              <div className="flex flex-col gap-2 w-full">
                {readingTrackIndex !== -1 && currentAudioTrack > readingTrackIndex && (
                  <Button
                    variant="outline"
                    onClick={() => setReplayingReading((prev) => !prev)}
                    className="w-full border-white/20 hover:bg-white/10 text-white font-medium rounded-xl text-xs flex items-center justify-center gap-2 cursor-pointer h-10 mb-1"
                  >
                    <RotateCcw size={14} className={replayingReading ? "animate-spin" : ""} />
                    {replayingReading ? "Voltar ao Passo Atual" : "Ouvir Leitura Novamente"}
                  </Button>
                )}

                <Button
                  variant="ghost"
                  onClick={handleStopGuidedSession}
                  className="text-xs text-white/40 hover:text-white"
                >
                  Encerrar Sessão Guiada
                </Button>

                {completed && (
                  <div className="bg-[oklch(0.55_0.14_70/0.1)] border border-[oklch(0.55_0.14_70/0.3)] rounded-2xl py-3 text-center text-xs text-[oklch(0.72_0.10_75)] font-semibold flex items-center justify-center gap-2">
                    <Award size={14} />
                    Oração Concluída e Registrada!
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
