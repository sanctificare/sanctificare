import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { Button } from "@/components/ui/button";
import AppNav from "@/components/AppNav";
import { trpc } from "@/lib/trpc";
import { ROSARY_MYSTERIES, getTodayMystery } from "@/data/prayers";
import { getRosaryAudioTracks, MYSTERY_AUDIO_SET_BY_KEY } from "@/data/rosary-audio";
import AudioPlayer from "@/components/AudioPlayer";
import RosaryBoard, { type RosaryStep } from "@/components/RosaryBoard";
import {
  ChevronLeft,
  ChevronRight,
  Heart,
  CheckCircle,
  RotateCcw,
  PlayCircle,
} from "lucide-react";
import { toast } from "sonner";
import { Link } from "wouter";

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

const TOTAL_PROGRESS_UNITS = 76;

function getStepProgressRank(step: Step): number {
  if (step.type === "intro") return 0;
  if (step.type === "credo") return 1;
  if (step.type === "pai_nosso_initial") return 2;
  if (step.type === "ave_maria_initial") return 2 + step.count;
  if (step.type === "mystery") return 5 + step.mysteryIndex * 14 + 1;
  if (step.type === "pai_nosso") return 5 + step.mysteryIndex * 14 + 2;
  if (step.type === "ave_maria") return 5 + step.mysteryIndex * 14 + 2 + step.count;
  if (step.type === "gloria") return 5 + step.mysteryIndex * 14 + 13;
  if (step.type === "fatima") return 5 + step.mysteryIndex * 14 + 14;
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
  const logPrayer = trpc.prayers.logPrayer.useMutation();

  const rosaryAudioTracks = useMemo(() => {
    return getRosaryAudioTracks(MYSTERY_AUDIO_SET_BY_KEY[selectedKey]);
  }, [selectedKey]);

  const mysteries = ROSARY_MYSTERIES[selectedKey];

  const getNextStep = (current: Step): Step => {
    if (current.type === "intro") return { type: "credo" };
    if (current.type === "credo") return { type: "pai_nosso_initial" };
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
    if (current.type === "credo") return { type: "intro" };
    if (current.type === "pai_nosso_initial") return { type: "credo" };
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

    if (track.type === "credo") return { type: "credo" };
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
    try {
      await logPrayer.mutateAsync({
        prayerType: "rosario",
        prayerName: `Rosário — ${mysteries.name}`,
      });
      toast.success("Rosário concluído!", { description: "Que Nossa Senhora interceda por você!" });
    } catch {
      toast.error("Não foi possível registrar sua oração agora.");
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
    if (step.type === "credo") {
      return {
        title: "Sinal da Cruz",
        subtitle: "Início do Rosário",
        text: SINAL_DA_CRUZ,
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
      <section className="rounded-2xl overflow-hidden min-h-[440px] relative bg-[oklch(0.18_0.05_260)]">
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

      <section className="rounded-2xl border border-[oklch(0.75_0.12_75/0.28)] bg-[oklch(0.99_0.006_85/0.94)] backdrop-blur p-6 shadow-xl shadow-[oklch(0.22_0.07_260/0.08)]">
        <div className="mb-5">
          <p className="text-xs font-display font-semibold uppercase tracking-widest text-[oklch(0.65_0.12_70)] mb-1">Hoje</p>
          <h2 className="font-display text-2xl font-bold text-[oklch(0.22_0.07_260)]">{mysteries.name}</h2>
          <p className="text-sm text-muted-foreground">{mysteries.days}</p>
        </div>

        <div className="mb-5">
          <label className="text-xs font-display font-semibold uppercase tracking-widest text-[oklch(0.65_0.12_70)] block mb-2">
            Minha intenção
          </label>
          <textarea
            value={intention}
            onChange={(event) => setIntention(event.target.value)}
            rows={4}
            placeholder="Ofereço este terço por..."
            className="w-full rounded-xl border border-[oklch(0.22_0.07_260/0.14)] bg-white/85 p-3 text-sm font-serif text-foreground focus:outline-none focus:ring-2 focus:ring-[oklch(0.75_0.12_75/0.38)]"
          />
        </div>

        <div className="mb-6">
          <p className="text-xs font-display font-semibold uppercase tracking-widest text-[oklch(0.65_0.12_70)] mb-2">Mistérios</p>
          <div className="flex flex-wrap gap-2">
            {(Object.keys(ROSARY_MYSTERIES) as Array<keyof typeof ROSARY_MYSTERIES>).map((key) => (
              <button
                key={key}
                onClick={() => setSelectedKey(key)}
                className={`px-3 py-2 rounded-full text-xs font-medium transition-all ${
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

        <Button
          className="w-full h-12 bg-[oklch(0.75_0.12_75)] hover:bg-[oklch(0.70_0.13_73)] text-[oklch(0.15_0.02_260)] font-semibold"
          onClick={handleStartAutomaticRosary}
        >
          <PlayCircle size={18} className="mr-2" />
          Iniciar oração com áudio
        </Button>
        <p className="text-xs text-muted-foreground text-center mt-3">
          O modo automático segue todo o rosário em sequência, com apoio em texto quando necessário.
        </p>

        {/* Pré-carrega a próxima faixa enquanto a atual toca, para transição sem gap */}
        {autoRosaryActive && currentAudioTrack + 1 < rosaryAudioTracks.length && (
          <audio
            key={`preload-${currentAudioTrack + 1}`}
            src={rosaryAudioTracks[currentAudioTrack + 1].audioUrl}
            preload="auto"
            aria-hidden="true"
            style={{ display: "none" }}
          />
        )}

        {showAudio && (
          <div className="mt-5 animate-fade-in">
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
      <div className="rounded-2xl border border-[oklch(0.75_0.12_75/0.28)] bg-[oklch(0.99_0.006_85/0.94)] p-5 shadow-lg shadow-[oklch(0.22_0.07_260/0.06)] animate-fade-in">
        {autoRosaryActive && currentAudioTrack + 1 < rosaryAudioTracks.length && (
          <audio
            key={`preload-aside-${currentAudioTrack + 1}`}
            src={rosaryAudioTracks[currentAudioTrack + 1].audioUrl}
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
        className="rounded-2xl border border-[oklch(0.75_0.12_75/0.28)] bg-[oklch(0.99_0.006_85/0.94)] backdrop-blur p-6 md:p-8 shadow-xl shadow-[oklch(0.22_0.07_260/0.08)] animate-fade-in"
        style={prayerPanelStyle}
      >
        <div className="text-center mb-6">
          <p className="text-xs text-[oklch(0.65_0.12_70)] font-semibold uppercase tracking-[0.2em] mb-2">{display.subtitle}</p>
          <h2 className="font-display text-3xl font-bold text-[oklch(0.22_0.07_260)]">{display.title}</h2>
          {intention.trim() && (
            <p className="mt-3 font-serif text-sm italic text-muted-foreground">Intenção: {intention}</p>
          )}
        </div>

        <div className="mb-5">
          <RosaryBoard step={step} onSelectStep={handleSelectStep} mysteryImageUrl={centerMysteryImage} />
          <p className="mt-3 text-center text-xs text-muted-foreground">
            Toque em qualquer conta para navegar pela oração.
          </p>
        </div>

        <div className="mb-7">{renderAudioControls()}</div>

        {display.meditation && (
          <div className="rounded-2xl border border-[oklch(0.22_0.07_260/0.08)] bg-[oklch(0.97_0.01_85/0.84)] p-6 md:p-8">
            <h3 className="font-display text-xl font-bold text-[oklch(0.22_0.07_260)] mb-3">{display.text}</h3>
            <p className="text-xs font-display font-semibold uppercase tracking-widest text-[oklch(0.65_0.12_70)] mb-2">Meditação</p>
            <p className="font-serif text-base leading-relaxed text-[oklch(0.25_0.03_260)] italic">{display.meditation}</p>
          </div>
        )}
      </section>
    );
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
          <p className="text-muted-foreground mb-6">Entre para rezar o Santo Rosário no app.</p>
          <a href={getLoginUrl()}><Button>Entrar</Button></a>
        </div>
      </div>
    );
  }

  const progress = getProgress();
  const audioSupport = getAudioSupportDisplay();

  return (
    <div className="min-h-screen bg-[oklch(0.18_0.04_260)]">
      <AppNav />

      <main
        className="min-h-[calc(100vh-4rem)] bg-cover bg-center bg-fixed"
        style={{
          backgroundImage: `linear-gradient(180deg, oklch(0.12 0.04 260 / 0.74), oklch(0.97 0.01 85 / 0.92)), url(${ROSARY_IMG})`,
        }}
      >
        <div className="container py-8">
          <div className="max-w-5xl mx-auto">
            <div className="flex flex-col md:flex-row md:items-center gap-4 mb-6">
              <Link href="/oracoes">
                <Button variant="outline" size="sm" className="gap-2 bg-white/85 border-[oklch(0.75_0.12_75/0.35)]">
                  <ChevronLeft size={14} /> Orações
                </Button>
              </Link>
              <div className="flex-1 rounded-full bg-white/72 backdrop-blur border border-[oklch(0.75_0.12_75/0.26)] px-4 py-3">
                <div className="flex justify-between text-xs text-[oklch(0.22_0.07_260)] mb-2">
                  <span className="font-semibold">{mysteries.name}</span>
                  <span>{progress}%</span>
                </div>
                <div className="h-2 bg-[oklch(0.88_0.01_260)] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-[oklch(0.22_0.07_260)] to-[oklch(0.75_0.12_75)] rounded-full transition-all duration-500"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            </div>

            {step.type === "intro" && !autoRosaryActive && renderPreparation()}
            {step.type === "complete" && renderCompletion()}

            {(step.type !== "complete" && (step.type !== "intro" || autoRosaryActive)) && (
              <div className="max-w-2xl mx-auto">
                {renderPrayer()}
              </div>
            )}


          </div>
        </div>
      </main>
    </div>
  );
}
