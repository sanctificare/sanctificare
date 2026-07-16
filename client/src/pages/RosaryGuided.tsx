import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl, resolveMediaUrl } from "@/const";
import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc";
import { ROSARY_MYSTERIES, getTodayMystery } from "@/data/prayers";
import { getRosaryAudioTracks, MYSTERY_AUDIO_SET_BY_KEY } from "@/data/rosary-audio";
import AudioPlayer from "@/components/AudioPlayer";
import RosaryBoard, { type RosaryStep } from "@/components/RosaryBoard";
import {
  ChevronLeft,
  ChevronRight,
  CheckCircle,
  RotateCcw,
  PlayCircle,
} from "lucide-react";
import { Heart } from "@/components/HeartIcon";
import { toast } from "sonner";
import { Link } from "wouter";
import { useOfflineSync } from "@/hooks/useOfflineSync";

const LOGO_IMG = "/assets/sanctificare-logo-v2.webp";
const ROSARY_IMG = "/assets/sanctificare-rosary.webp";
const INITIAL_MARY_IMG = "/audio/rosary/jesus-maria.webp";
const AUTO_TEXT_STEP_DELAY_MS = 6000;

const MYSTERY_IMAGE_SUFFIX: Partial<Record<keyof typeof ROSARY_MYSTERIES, string>> = {
  joyful: "gozoso",
  sorrowful: "doloroso",
  glorious: "glorioso",
  luminous: "luminoso",
};

const getMysteryImageUrl = (mysteryKey: keyof typeof ROSARY_MYSTERIES, mysteryIndex: number): string | undefined => {
  const suffix = MYSTERY_IMAGE_SUFFIX[mysteryKey];
  if (!suffix) return undefined;
  return `/assets/rosario/imagens/${mysteryIndex + 1}misterio-${suffix}.webp`;
};

const AVE_MARIA = `Ave Maria, cheia de graça,
o Senhor é convosco,
bendita sois vós entre as mulheres,
e bendito é o fruto do vosso ventre, Jesus.
Santa Maria, Mãe de Deus,
rogai por nós pecadores,
agora e na hora da nossa morte.
Amém.`;

const PAI_NOSSO = `Pai nosso que estais nos céus,
santificado seja o vosso nome,
venha a nós o vosso reino,
seja feita a vossa vontade,
assim na terra como no céu.
O pão nosso de cada dia nos dai hoje,
perdoai-nos as nossas ofensas,
assim como nós perdoamos a quem nos tem ofendido,
e não nos deixeis cair em tentação,
mas livrai-nos do mal.
Amém.`;

const GLORIA = `Glória ao Pai, ao Filho e ao Espírito Santo,
como era no princípio, agora e sempre,
pelos séculos dos séculos. Amém.`;

const FATIMA = `Ó meu Jesus, perdoai-nos os nossos pecados,
preservai-nos do fogo do inferno,
levai as almas todas para o céu,
especialmente as que mais precisarem da vossa misericórdia. Amém.`;

const SINAL_DA_CRUZ = `Em nome do Pai, do Filho e do Espírito Santo. Amém.`;

const OFERECIMENTO_E_CREDO = `Divino Jesus, nós Vos oferecemos este terço que vamos rezar,
meditando nos mistérios da nossa redenção.
Concedei-nos, por intercessão da Virgem Maria,
Mãe de Deus e nossa Mãe,
as virtudes que nos são necessárias
para bem rezá-lo e a graça de ganharmos
as indulgências desta santa devoção.

Creio em Deus Pai todo-poderoso,
criador do céu e da terra.
E em Jesus Cristo, seu único Filho, nosso Senhor,
que foi concebido pelo poder do Espírito Santo,
nasceu da Virgem Maria,
padeceu sob Pôncio Pilatos,
foi crucificado, morto e sepultado,
desceu à mansão dos mortos,
ressuscitou ao terceiro dia,
subiu aos céus,
está sentado à direita de Deus Pai todo-poderoso,
donde há de vir a julgar os vivos e os mortos.

Creio no Espírito Santo,
na Santa Igreja Católica,
na comunhão dos santos,
na remissão dos pecados,
na ressurreição da carne,
na vida eterna. Amém.`;

type Step = RosaryStep;

type PrayerDisplay = {
  title: string;
  subtitle: string;
  text: string;
  meditation?: string;
  mysteryImageUrl?: string;
};

const TOTAL_PROGRESS_UNITS = 75;

function getStepProgressRank(step: Step): number {
  if (step.type === "intro") return 0;
  if (step.type === "pai_nosso_initial") return 1;
  if (step.type === "ave_maria_initial") return 1 + step.count;
  if (step.type === "mystery") return 4 + step.mysteryIndex * 14 + 1;
  if (step.type === "pai_nosso") return 4 + step.mysteryIndex * 14 + 2;
  if (step.type === "ave_maria") return 4 + step.mysteryIndex * 14 + 2 + step.count;
  if (step.type === "gloria") return 4 + step.mysteryIndex * 14 + 13;
  if (step.type === "fatima") return 4 + step.mysteryIndex * 14 + 14;
  if (step.type === "salve") return TOTAL_PROGRESS_UNITS;
  return TOTAL_PROGRESS_UNITS;
}

export default function RosaryGuided() {
  const { isAuthenticated, loading } = useAuth();
  const [selectedKey, setSelectedKey] = useState<keyof typeof ROSARY_MYSTERIES>(getTodayMystery());
  const [step, setStep] = useState<Step>({ type: "intro" });
  const [showAudio, setShowAudio] = useState(false);
  const [currentAudioTrack, setCurrentAudioTrack] = useState(0);
  const [autoRosaryActive, setAutoRosaryActive] = useState(false);
  const [intention, setIntention] = useState("");
  const { queueOfflinePrayerLog } = useOfflineSync();
  const logPrayer = trpc.prayers.logPrayer.useMutation();

  const rosaryAudioTracks = useMemo(() => {
    return getRosaryAudioTracks(MYSTERY_AUDIO_SET_BY_KEY[selectedKey]);
  }, [selectedKey]);

  const mysteries = ROSARY_MYSTERIES[selectedKey];

  const getNextStep = (current: Step): Step => {
    if (current.type === "intro") return { type: "pai_nosso_initial" };
    if (current.type === "pai_nosso_initial") return { type: "ave_maria_initial", count: 1 };
    if (current.type === "ave_maria_initial") {
      if (current.count < 3) return { type: "ave_maria_initial", count: current.count + 1 };
      return { type: "mystery", mysteryIndex: 0 };
    }
    if (current.type === "mystery") return { type: "pai_nosso", mysteryIndex: current.mysteryIndex };
    if (current.type === "pai_nosso") return { type: "ave_maria", mysteryIndex: current.mysteryIndex, count: 1 };
    if (current.type === "ave_maria") {
      if (current.count < 10) return { type: "ave_maria", mysteryIndex: current.mysteryIndex, count: current.count + 1 };
      return { type: "gloria", mysteryIndex: current.mysteryIndex };
    }
    if (current.type === "gloria") return { type: "fatima", mysteryIndex: current.mysteryIndex };
    if (current.type === "fatima") {
      if (current.mysteryIndex < 4) return { type: "mystery", mysteryIndex: current.mysteryIndex + 1 };
      return { type: "salve" };
    }
    if (current.type === "salve") return { type: "complete" };
    return { type: "complete" };
  };

  const getPrevStep = (current: Step): Step => {
    if (current.type === "pai_nosso_initial") return { type: "intro" };
    if (current.type === "ave_maria_initial") {
      if (current.count > 1) return { type: "ave_maria_initial", count: current.count - 1 };
      return { type: "pai_nosso_initial" };
    }
    if (current.type === "mystery") {
      if (current.mysteryIndex === 0) return { type: "ave_maria_initial", count: 3 };
      return { type: "fatima", mysteryIndex: current.mysteryIndex - 1 };
    }
    if (current.type === "pai_nosso") return { type: "mystery", mysteryIndex: current.mysteryIndex };
    if (current.type === "ave_maria") {
      if (current.count > 1) return { type: "ave_maria", mysteryIndex: current.mysteryIndex, count: current.count - 1 };
      return { type: "pai_nosso", mysteryIndex: current.mysteryIndex };
    }
    if (current.type === "gloria") return { type: "ave_maria", mysteryIndex: current.mysteryIndex, count: 10 };
    if (current.type === "fatima") return { type: "gloria", mysteryIndex: current.mysteryIndex };
    if (current.type === "salve") return { type: "fatima", mysteryIndex: 4 };
    if (current.type === "complete") return { type: "salve" };
    return { type: "intro" };
  };

  const getStepForAudioTrack = (trackIndex: number): Step => {
    const track = rosaryAudioTracks[trackIndex];
    if (!track) return { type: "intro" };

    if (track.type === "mystery" && track.mysteryNumber) {
      return { type: "mystery", mysteryIndex: track.mysteryNumber - 1 };
    }
    if (track.type === "pai_nosso") {
      if (track.mysteryNumber) {
        return { type: "pai_nosso", mysteryIndex: track.mysteryNumber - 1 };
      }
      return { type: "pai_nosso_initial" };
    }
    if (track.type === "ave_maria") {
      const count = track.beadIndex ?? 1;
      if (track.mysteryNumber) {
        return { type: "ave_maria", mysteryIndex: track.mysteryNumber - 1, count };
      }
      return { type: "ave_maria_initial", count };
    }
    if (track.type === "gloria" && track.mysteryNumber) {
      return { type: "gloria", mysteryIndex: track.mysteryNumber - 1 };
    }
    if (track.type === "fatima" && track.mysteryNumber) {
      return { type: "fatima", mysteryIndex: track.mysteryNumber - 1 };
    }
    if (track.type === "salve" || track.type === "conclusion") return { type: "salve" };
    return { type: "intro" };
  };

  const getAudioArtworkUrl = (trackIndex: number): string => {
    const track = rosaryAudioTracks[trackIndex];
    if (track?.mysteryNumber) {
      return getMysteryImageUrl(selectedKey, track.mysteryNumber - 1) || ROSARY_IMG;
    }

    return ROSARY_IMG;
  };

  const getAudioTrackIndexForStep = (targetStep: Step): number => {
    return rosaryAudioTracks.findIndex((track, trackIndex) => {
      const trackStep = getStepForAudioTrack(trackIndex);
      if (trackStep.type !== targetStep.type) return false;
      if (trackStep.type === "ave_maria_initial" && targetStep.type === "ave_maria_initial") {
        return trackStep.count === targetStep.count;
      }
      if (trackStep.type === "pai_nosso" && targetStep.type === "pai_nosso") {
        return trackStep.mysteryIndex === targetStep.mysteryIndex;
      }
      if (trackStep.type === "ave_maria" && targetStep.type === "ave_maria") {
        return trackStep.mysteryIndex === targetStep.mysteryIndex && trackStep.count === targetStep.count;
      }
      if (trackStep.type === "mystery" && targetStep.type === "mystery") {
        return trackStep.mysteryIndex === targetStep.mysteryIndex;
      }
      if (trackStep.type === "gloria" && targetStep.type === "gloria") {
        return trackStep.mysteryIndex === targetStep.mysteryIndex;
      }
      if (trackStep.type === "fatima" && targetStep.type === "fatima") {
        return trackStep.mysteryIndex === targetStep.mysteryIndex;
      }
      return true;
    });
  };

  useEffect(() => {
    if (!autoRosaryActive) return;

    if (step.type === "complete") {
      setShowAudio(false);
      setAutoRosaryActive(false);
      return;
    }

    const trackIndex = getAudioTrackIndexForStep(step);
    if (trackIndex >= 0) {
      setShowAudio(true);
      if (currentAudioTrack !== trackIndex) {
        setCurrentAudioTrack(trackIndex);
      }
      return;
    }

    setShowAudio(false);
    const timer = window.setTimeout(() => {
      setStep((currentStep) => getNextStep(currentStep));
    }, AUTO_TEXT_STEP_DELAY_MS);

    return () => window.clearTimeout(timer);
  }, [autoRosaryActive, step, currentAudioTrack, rosaryAudioTracks]);

  const resetRosary = () => {
    setAutoRosaryActive(false);
    setShowAudio(false);
    setCurrentAudioTrack(0);
    setStep({ type: "intro" });
  };

  const handleStartAutomaticRosary = () => {
    setAutoRosaryActive(true);
    setCurrentAudioTrack(0);
    setStep({ type: "intro" });
  };

  const handleAudioTrackEnd = () => {
    const nextStep = getNextStep(step);
    const nextTrackIndex = getAudioTrackIndexForStep(nextStep);
    // Batch both updates so AudioPlayer receives the new URL in a single render
    setStep(nextStep);
    if (nextTrackIndex >= 0) {
      setCurrentAudioTrack(nextTrackIndex);
    }
  };

  const handleAudioTrackError = () => {
    if (autoRosaryActive) {
      setStep((currentStep) => getNextStep(currentStep));
      toast.warning("Faixa indisponível", {
        description: "Uma faixa não pôde ser carregada e a oração avançou automaticamente.",
      });
      return;
    }

    setAutoRosaryActive(false);
    setShowAudio(false);
    toast.error("Áudio indisponível", {
      description: "A reprodução foi interrompida porque esta faixa não pôde ser carregada.",
    });
  };

  const getProgress = () => {
    return Math.round((getStepProgressRank(step) / TOTAL_PROGRESS_UNITS) * 100);
  };

  const handleSelectStep = (nextStep: Step) => {
    setStep(nextStep);

    if (!showAudio) return;

    const nextAudioTrack = getAudioTrackIndexForStep(nextStep);
    if (nextAudioTrack >= 0) {
      setCurrentAudioTrack(nextAudioTrack);
      return;
    }

    setAutoRosaryActive(false);
    setShowAudio(false);
  };

  const handleComplete = async () => {
    const prayerName = `Rosário — ${mysteries.name}`;
    try {
      if (typeof navigator !== "undefined" && !navigator.onLine) {
        queueOfflinePrayerLog("rosario", prayerName);
        return;
      }
      await logPrayer.mutateAsync({
        prayerType: "rosario",
        prayerName: prayerName,
      });
      toast.success("Rosário concluído!", { description: "Que Nossa Senhora interceda por você!" });
    } catch {
      console.error("Erro ao registrar rosário:");
      queueOfflinePrayerLog("rosario", prayerName);
    }
  };

  const getPrayerDisplay = (): PrayerDisplay => {
    if (step.type === "intro") {
      return {
        title: "Oferecimento e Credo",
        subtitle: "Início do Rosário",
        text: OFERECIMENTO_E_CREDO,
      };
    }
    if (step.type === "pai_nosso_initial") return { title: "Pai Nosso", subtitle: "Início - 1 Pai Nosso", text: PAI_NOSSO };
    if (step.type === "ave_maria_initial") return { title: "Ave Maria", subtitle: `Início - ${step.count}ª de 3 Ave Marias`, text: AVE_MARIA };
    if (step.type === "mystery") {
      const mystery = mysteries.mysteries[step.mysteryIndex];
      return {
        title: `${step.mysteryIndex + 1}º Mistério`,
        subtitle: mysteries.name,
        text: mystery.title,
        meditation: mystery.meditation,
        mysteryImageUrl: getMysteryImageUrl(selectedKey, step.mysteryIndex),
      };
    }
    if (step.type === "pai_nosso") {
      const mystery = mysteries.mysteries[step.mysteryIndex];
      return { title: "Pai Nosso", subtitle: `${step.mysteryIndex + 1}º Mistério - ${mystery.title}`, text: PAI_NOSSO };
    }
    if (step.type === "ave_maria") return { title: "Ave Maria", subtitle: `${step.mysteryIndex + 1}º Mistério - ${step.count}ª de 10`, text: AVE_MARIA };
    if (step.type === "gloria") return { title: "Glória ao Pai", subtitle: `Após o ${step.mysteryIndex + 1}º Mistério`, text: GLORIA };
    if (step.type === "fatima") return { title: "Oração de Fátima", subtitle: `Após o ${step.mysteryIndex + 1}º Mistério`, text: FATIMA };
    return {
      title: "Salve Rainha",
      subtitle: "Final do Rosário",
      text: `Salve Rainha, Mãe de misericórdia,\nvida, doçura e esperança nossa, salve!\nA vós bradamos, os degredados filhos de Eva.\nA vós suspiramos, gemendo e chorando\nneste vale de lágrimas.\n\nEia, pois, advogada nossa,\nesses vossos olhos misericordiosos a nós volvei.\nE depois deste desterro,\nmostrai-nos Jesus, bendito fruto do vosso ventre.\n\nÓ clemente, ó piedosa,\nó doce sempre Virgem Maria!\n\nRogai por nós, Santa Mãe de Deus,\npara que sejamos dignos das promessas de Cristo. Amém.`,
    };
  };

  const getAudioSupportDisplay = () => {
    const display = getPrayerDisplay();
    return {
      supportTitle: display.title,
      supportDescription: display.subtitle,
      supportText: display.meditation ? `${display.text}\n\nMeditação\n${display.meditation}` : display.text,
    };
  };

  const renderPreparation = () => (
    <div className="grid grid-cols-1 lg:grid-cols-[1.05fr_0.95fr] gap-6 items-stretch animate-fade-in">
      <section className="hidden md:block rounded-2xl overflow-hidden min-h-[440px] relative bg-[oklch(0.18_0.05_260)]">
        <img src={ROSARY_IMG} alt="Terço" className="absolute inset-0 w-full h-full object-cover opacity-75" />
        <div className="absolute inset-0 bg-gradient-to-t from-[oklch(0.12_0.04_260/0.88)] via-[oklch(0.18_0.05_260/0.48)] to-transparent" />
        <div className="relative h-full p-7 flex flex-col justify-end text-white">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[oklch(0.82_0.10_80)] mb-2">Modo Capela</p>
          <h1 className="font-display text-4xl font-bold mb-3">Santo Rosário</h1>
          <p className="font-serif text-lg text-[oklch(0.92_0.03_82)] leading-relaxed max-w-md">
            Respire, faça o sinal da cruz e confie a Nossa Senhora as intenções que traz no coração.
          </p>
        </div>
      </section>

      <section className="rounded-2xl border border-[oklch(0.75_0.12_75/0.28)] bg-[oklch(0.99_0.006_85/0.94)] backdrop-blur p-5 xs:p-6 shadow-xl shadow-[oklch(0.22_0.07_260/0.08)] flex flex-col justify-between">
        <div>
          <div className="mb-4">
            <p className="text-[10px] xs:text-xs font-display font-semibold uppercase tracking-widest text-[oklch(0.65_0.12_70)] mb-1">Hoje</p>
            <h2 className="font-display text-xl xs:text-2xl font-bold text-[oklch(0.22_0.07_260)]">{mysteries.name}</h2>
            <p className="text-xs xs:text-sm text-muted-foreground">{mysteries.days}</p>
          </div>

          <div className="mb-4">
            <label className="text-[10px] xs:text-xs font-display font-semibold uppercase tracking-widest text-[oklch(0.65_0.12_70)] block mb-1.5">
              Minha intenção
            </label>
            <textarea
              value={intention}
              onChange={(event) => setIntention(event.target.value)}
              rows={3}
              placeholder="Ofereço este terço por..."
              className="w-full rounded-xl border border-[oklch(0.22_0.07_260/0.14)] bg-white/85 p-3 text-sm font-serif text-foreground focus:outline-none focus:ring-2 focus:ring-[oklch(0.75_0.12_75/0.38)]"
            />
          </div>

          <div className="mb-5">
            <p className="text-[10px] xs:text-xs font-display font-semibold uppercase tracking-widest text-[oklch(0.65_0.12_70)] mb-1.5">Mistérios</p>
            <div className="flex flex-wrap gap-1.5">
              {(Object.keys(ROSARY_MYSTERIES) as Array<keyof typeof ROSARY_MYSTERIES>).map((key) => (
                <button
                  key={key}
                  onClick={() => setSelectedKey(key)}
                  className={`px-2.5 py-1.5 rounded-full text-[10px] xs:text-xs font-medium transition-all ${
                    selectedKey === key
                      ? "bg-[oklch(0.22_0.07_260)] text-white shadow-md shadow-[oklch(0.22_0.07_260/0.18)]"
                      : "bg-white text-[oklch(0.22_0.07_260)] border border-[oklch(0.22_0.07_260/0.12)] hover:bg-[oklch(0.75_0.12_75/0.12)]"
                  }`}
                >
                  {ROSARY_MYSTERIES[key].name.replace("Mistérios ", "")}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="flex justify-center mt-2">
          <Button
            className="w-full h-11 xs:h-12 bg-[oklch(0.75_0.12_75)] hover:bg-[oklch(0.70_0.13_73)] text-[oklch(0.15_0.02_260)] font-semibold animate-pulse"
            onClick={handleStartAutomaticRosary}
          >
            <PlayCircle size={18} className="mr-2" />
            Iniciar com áudio
          </Button>
        </div>

        {/* Pré-carrega a próxima faixa enquanto a atual toca, para transição sem gap */}
        {autoRosaryActive && currentAudioTrack + 1 < rosaryAudioTracks.length && (
          <audio
            key={`preload-${currentAudioTrack + 1}`}
            src={resolveMediaUrl(rosaryAudioTracks[currentAudioTrack + 1].audioUrl)}
            preload="auto"
            aria-hidden="true"
            style={{ display: "none" }}
          />
        )}

        {showAudio && (
          <div className="mt-4 animate-fade-in">
            <AudioPlayer
              audioUrl={rosaryAudioTracks[currentAudioTrack].audioUrl}
              title={rosaryAudioTracks[currentAudioTrack].title}
              description={rosaryAudioTracks[currentAudioTrack].description}
              artworkUrl={getAudioArtworkUrl(currentAudioTrack)}
              supportTitle={audioSupport.supportTitle}
              supportDescription={audioSupport.supportDescription}
              supportText={audioSupport.supportText}
              autoPlay={autoRosaryActive}
              onTrackEnd={handleAudioTrackEnd}
              onTrackError={handleAudioTrackError}
            />
          </div>
        )}
      </section>
    </div>
  );

  const renderCompletion = () => (
    <section className="rounded-2xl border border-[oklch(0.75_0.12_75/0.3)] bg-[oklch(0.99_0.006_85/0.94)] backdrop-blur p-8 text-center shadow-xl shadow-[oklch(0.22_0.07_260/0.08)] animate-scale-in">
      <div className="w-20 h-20 rounded-full bg-[oklch(0.40_0.12_150/0.1)] border-2 border-[oklch(0.40_0.12_150/0.4)] flex items-center justify-center mx-auto mb-6">
        <CheckCircle size={36} className="text-[oklch(0.40_0.12_150)]" />
      </div>
      <h2 className="font-display text-3xl font-bold text-[oklch(0.22_0.07_260)] mb-3">Rosário concluído</h2>
      <p className="font-serif text-lg text-muted-foreground mb-2">Permaneça um instante em silêncio.</p>
      <p className="font-serif text-sm text-muted-foreground italic mb-8">Que Nossa Senhora acompanhe, guarde e conduza o seu dia.</p>
      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <Button className="bg-[oklch(0.22_0.07_260)] text-white font-semibold" onClick={handleComplete} disabled={logPrayer.isPending}>
          <Heart size={15} className="mr-2" />
          {logPrayer.isPending ? "Registrando..." : "Registrar oração no histórico"}
        </Button>
        <Button variant="outline" onClick={resetRosary}>
          <RotateCcw size={14} className="mr-2" />
          Rezar novamente
        </Button>
      </div>
    </section>
  );

  const getCurrentMysteryImageUrl = (): string | undefined => {
    if (
      step.type === "intro" ||
      step.type === "credo" ||
      step.type === "pai_nosso_initial" ||
      step.type === "ave_maria_initial"
    ) {
      return INITIAL_MARY_IMG;
    }

    if (
      step.type === "mystery" ||
      step.type === "pai_nosso" ||
      step.type === "ave_maria" ||
      step.type === "gloria" ||
      step.type === "fatima"
    ) {
      return getMysteryImageUrl(selectedKey, step.mysteryIndex);
    }

    return undefined;
  };

  const renderAudioControls = () =>
    showAudio ? (
      <div className="rounded-xl border border-[oklch(0.75_0.12_75/0.28)] bg-[oklch(0.99_0.006_85/0.94)] shadow-lg shadow-[oklch(0.22_0.07_260/0.06)] animate-fade-in overflow-hidden">
        {autoRosaryActive && currentAudioTrack + 1 < rosaryAudioTracks.length && (
          <audio
            key={`preload-aside-${currentAudioTrack + 1}`}
            src={resolveMediaUrl(rosaryAudioTracks[currentAudioTrack + 1].audioUrl)}
            preload="auto"
            aria-hidden="true"
            style={{ display: "none" }}
          />
        )}
        <AudioPlayer
          audioUrl={rosaryAudioTracks[currentAudioTrack].audioUrl}
          title={rosaryAudioTracks[currentAudioTrack].title}
          description={rosaryAudioTracks[currentAudioTrack].description}
          artworkUrl={getAudioArtworkUrl(currentAudioTrack)}
          supportTitle={audioSupport.supportTitle}
          supportDescription={audioSupport.supportDescription}
          supportText={audioSupport.supportText}
          autoPlay={autoRosaryActive}
          onTrackEnd={handleAudioTrackEnd}
          onTrackError={handleAudioTrackError}
        />
      </div>
    ) : null;

  const renderPrayer = () => {
    const display = getPrayerDisplay();
    const centerMysteryImage = getCurrentMysteryImageUrl();
    const prayerPanelStyle = {
      backgroundImage: "linear-gradient(160deg, rgba(224, 238, 255, 0.97) 0%, rgba(236, 246, 255, 0.95) 52%, rgba(216, 232, 255, 0.97) 100%)",
    };

    return (
      <section
        className="flex flex-col flex-1 min-h-0 md:flex-initial md:block md:h-auto rounded-2xl border border-[oklch(0.75_0.12_75/0.28)] bg-[oklch(0.99_0.006_85/0.94)] backdrop-blur shadow-xl shadow-[oklch(0.22_0.07_260/0.08)] animate-fade-in md:overflow-visible overflow-hidden"
        style={prayerPanelStyle}
      >
        {/* Cabeçalho da oração – compacto no mobile */}
        <div className="text-center px-4 pt-3 pb-1 md:pt-4 md:pb-2 lg:pt-5 lg:pb-2 xl:pt-6 xl:pb-3 shrink-0">
          <p className="text-[10px] xs:text-xs md:text-xs lg:text-sm xl:text-sm text-[oklch(0.65_0.12_70)] font-semibold uppercase tracking-[0.2em] mb-0.5 md:mb-1 lg:mb-1.5 xl:mb-2">{display.subtitle}</p>
          <h2 className="font-display text-base xs:text-xl md:text-2xl lg:text-3xl xl:text-3xl font-bold text-[oklch(0.22_0.07_260)] leading-tight">{display.title}</h2>
          {intention.trim() && (
            <p className="mt-1 md:mt-1.5 lg:mt-2 font-serif text-[10px] xs:text-xs md:text-xs lg:text-sm italic text-muted-foreground line-clamp-1">Intenção: {intention}</p>
          )}
        </div>

        {/* Terço interativo — ocupa todo o espaço disponível no mobile, block no desktop */}
        <div className="flex-1 min-h-0 md:flex-initial md:block md:my-3 lg:my-4 xl:my-5 flex flex-col items-center justify-center px-2">
          <RosaryBoard step={step} onSelectStep={handleSelectStep} mysteryImageUrl={centerMysteryImage} />
          <p className="mt-1 text-center text-[9px] xs:text-[10px] md:text-xs text-muted-foreground line-clamp-1 px-4">
            Toque em qualquer conta ou utilize os botões abaixo para navegar.
          </p>
        </div>

        {/* Controles de navegação + player — fixos na base no mobile, block no desktop */}
        <div className="shrink-0 px-3 pb-3 pt-1 flex flex-col gap-2 md:px-4 md:pb-4 md:pt-0 md:mb-3 md:gap-2 lg:mb-4 lg:gap-3 lg:px-5 xl:mb-5 xl:gap-3 xl:px-6">
          <div className="flex gap-2">
            <Button
              variant="outline"
              className="flex-1 font-semibold text-xs xs:text-sm md:text-sm lg:text-sm xl:text-base h-11 xs:h-12 md:h-9 lg:h-10 xl:h-10 bg-white"
              onClick={() => setStep((currentStep) => getPrevStep(currentStep))}
            >
              <ChevronLeft size={14} className="mr-1" /> Anterior
            </Button>
            <Button
              variant="default"
              className="flex-1 font-semibold text-xs xs:text-sm md:text-sm lg:text-sm xl:text-base h-11 xs:h-12 md:h-9 lg:h-10 xl:h-10 bg-[oklch(0.75_0.12_75)] hover:bg-[oklch(0.70_0.13_73)] text-[oklch(0.15_0.02_260)]"
              onClick={() => setStep((currentStep) => getNextStep(currentStep))}
            >
              Próximo <ChevronRight size={14} className="ml-1" />
            </Button>
          </div>
          {renderAudioControls()}
        </div>

        {display.meditation && (
          <div className="shrink-0 mx-3 mb-3 md:mx-0 md:mb-0 lg:mx-6 lg:mb-8 xl:mx-8 xl:mb-12 rounded-xl border border-[oklch(0.22_0.07_260/0.08)] bg-[oklch(0.97_0.01_85/0.84)] p-3 md:p-8 lg:p-10 xl:p-12 mt-3">
            <h3 className="font-display text-base xs:text-lg md:text-xl lg:text-2xl xl:text-3xl font-bold text-[oklch(0.22_0.07_260)] mb-1 md:mb-3 lg:mb-4 xl:mb-6">{display.text}</h3>
            <p className="text-[10px] md:text-xs lg:text-sm xl:text-base font-display font-semibold uppercase tracking-widest text-[oklch(0.65_0.12_70)] mb-1 md:mb-2 lg:mb-3 xl:mb-4">Meditação</p>
            <p className="font-serif text-xs xs:text-sm md:text-base lg:text-lg xl:text-xl leading-relaxed text-[oklch(0.25_0.03_260)] italic">{display.meditation}</p>
          </div>
        )}
      </section>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <img src={LOGO_IMG} alt="Sanctificare" className="w-16 h-16 object-contain animate-pulse" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <img src={LOGO_IMG} alt="Sanctificare" className="w-16 h-16 object-contain mx-auto mb-4" />
          <h2 className="font-display text-2xl font-bold mb-2">Acesso Restrito</h2>
          <p className="text-muted-foreground mb-6">Entre para rezar o Santo Rosário no app.</p>
          <a href={getLoginUrl()}><Button>Entrar</Button></a>
        </div>
      </div>
    );
  }

  const progress = getProgress();
  const audioSupport = getAudioSupportDisplay();

  return (
    <div
      className="rosary-fullscreen-layout bg-[oklch(0.18_0.04_260)]"
      style={{
        backgroundImage: `linear-gradient(180deg, oklch(0.12 0.04 260 / 0.74), oklch(0.97 0.01 85 / 0.92)), url(${ROSARY_IMG})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      {/* Topo: botão voltar + barra de progresso */}
      <header
        className="shrink-0 flex flex-row items-center gap-2 px-3 pb-1 pt-2 md:px-6 md:pb-2 md:pt-4 bg-transparent pr-14 border-none"
        style={{ paddingTop: "calc(0.5rem + var(--safe-area-top))" }}
      >
        <Link href="/oracoes">
          <Button
            variant="outline"
            size="sm"
            className="w-9 h-9 p-0 flex items-center justify-center bg-white/80 border-white/20 text-foreground hover:bg-white/90 rounded-lg shadow-sm shrink-0"
          >
            <ChevronLeft size={18} />
          </Button>
        </Link>
        <div className="flex-1 min-w-0 rounded-full bg-white/72 backdrop-blur border border-[oklch(0.75_0.12_75/0.26)] px-3 py-1.5 xs:px-4 xs:py-2">
          <div className="flex justify-between text-[10px] text-[oklch(0.22_0.07_260)] mb-0.5">
            <span className="font-semibold truncate">{mysteries.name}</span>
            <span className="shrink-0 ml-2">{progress}%</span>
          </div>
          <div className="h-1.5 bg-[oklch(0.88_0.01_260)] rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-[oklch(0.22_0.07_260)] to-[oklch(0.75_0.12_75)] rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </header>

      {/* Conteúdo principal */}
      <main className={`flex-1 min-h-0 flex flex-col p-3 gap-2 md:p-6 md:gap-4 lg:p-8 lg:gap-6 xl:p-12 xl:gap-8 md:flex-initial md:block md:overflow-visible md:p-0 md:pb-8 lg:pb-12 xl:pb-16 ${
        (step.type === "intro" && !autoRosaryActive) ? "overflow-y-auto" : "overflow-hidden"
      }`}>
        {step.type === "intro" && !autoRosaryActive && renderPreparation()}
        {step.type === "complete" && renderCompletion()}

        {(step.type !== "complete" && (step.type !== "intro" || autoRosaryActive)) && (
          <div className="flex flex-col flex-1 min-h-0 md:flex-initial md:block md:h-auto max-w-2xl lg:max-w-6xl xl:max-w-7xl w-full mx-auto">
            {renderPrayer()}
          </div>
        )}
      </main>
    </div>
  );
}
