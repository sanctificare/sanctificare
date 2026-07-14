import { useState, useMemo } from "react";
import { Link } from "wouter";
import {
  ArrowLeft,
  Coffee,
  Heart,
  Sparkles,
  Copy,
  Check,
  QrCode,
  AlertCircle,
  Barcode
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { DEFAULT_PIX_KEY } from "@/const";

// Função para calcular CRC16 do PIX (garante que o código Copia e Cola seja válido no banco)
function calculateCRC16(str: string): string {
  let crc = 0xffff;
  for (let i = 0; i < str.length; i++) {
    crc ^= str.charCodeAt(i) << 8;
    for (let j = 0; j < 8; j++) {
      if ((crc & 0x8000) !== 0) {
        crc = (crc << 1) ^ 0x1021;
      } else {
        crc = crc << 1;
      }
    }
  }
  return (crc & 0xffff).toString(16).toUpperCase().padStart(4, "0");
}

function generatePixCode(amount: number, key: string): string {
  const amountStr = amount.toFixed(2);
  const amountLen = amountStr.length.toString().padStart(2, "0");
  
  // Estrutura padrão EMV do PIX
  const payload = [
    "000201", // Payload Format Indicator
    "010212", // Point of Initiation Method (12 = recorrente/dinâmico, mas aceito em qualquer app)
    `26${(38 + key.length).toString()}`, // Merchant Account Information - Pix length
    "0014br.gov.bcb.pix",
    `01${key.length.toString().padStart(2, "0")}${key}`,
    "52040000", // Merchant Category Code
    "5303986", // Transaction Currency (986 = BRL)
    `54${amountLen}${amountStr}`, // Transaction Amount
    "5802BR", // Country Code
    "5913Sanctificare", // Merchant Name
    "6009Sao Paulo", // Merchant City
    "62070503***", // Additional Data Field (TxID como ***)
    "6304", // CRC16 Indicator
  ].join("");

  const checksum = calculateCRC16(payload);
  return payload + checksum;
}

interface Tier {
  id: string;
  name: string;
  amount: number;
  icon: typeof Coffee;
  description: string;
}

const TIERS: Tier[] = [
  {
    id: "simples",
    name: "Apoio Simples",
    amount: 5.0,
    icon: Sparkles,
    description: "Uma pequena ajuda voluntária que faz diferença para o projeto.",
  },
  {
    id: "cafe",
    name: "Café do Desenvolvedor",
    amount: 10.0,
    icon: Coffee,
    description: "Um gesto simples de agradecimento para me manter acordado programando.",
  },
  {
    id: "vela",
    name: "Vela Virtual",
    amount: 25.0,
    icon: Sparkles,
    description: "Ajuda direta com os custos de banco de dados e inteligência artificial de voz.",
  },
  {
    id: "missao",
    name: "Apoio Missionário",
    amount: 50.0,
    icon: Heart,
    description: "Para patrocinar melhorias contínuas e levar o app a mais fiéis católicos.",
  },
];

export default function ApoieMissao() {
  const [selectedTierId, setSelectedTierId] = useState<string>("vela");
  const [customAmount, setCustomAmount] = useState<string>("");
  const [isCustom, setIsCustom] = useState<boolean>(false);
  const [copiedKey, setCopiedKey] = useState<boolean>(false);
  const [copiedCode, setCopiedCode] = useState<boolean>(false);

  const amount = useMemo(() => {
    if (isCustom) {
      const parsed = parseFloat(customAmount);
      return isNaN(parsed) || parsed <= 0 ? 10.0 : parsed;
    }
    const tier = TIERS.find((t) => t.id === selectedTierId);
    return tier ? tier.amount : 25.0;
  }, [isCustom, customAmount, selectedTierId]);

  const pixCode = useMemo(() => {
    return generatePixCode(amount, DEFAULT_PIX_KEY);
  }, [amount]);

  const handleCopyKey = () => {
    void navigator.clipboard.writeText(DEFAULT_PIX_KEY);
    setCopiedKey(true);
    toast.success("Chave PIX copiada com sucesso!");
    setTimeout(() => setCopiedKey(false), 2000);
  };

  const handleCopyCode = () => {
    void navigator.clipboard.writeText(pixCode);
    setCopiedCode(true);
    toast.success("Código PIX Copia e Cola copiado!");
    setTimeout(() => setCopiedCode(false), 2000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[oklch(0.12_0.05_270)] via-[oklch(0.08_0.04_260)] to-[oklch(0.05_0.03_250)] text-slate-100 font-sans pb-16 relative overflow-hidden">
      {/* Elementos de Brilho de Fundo (Glow Effect) */}
      <div className="absolute top-[-10%] left-[-10%] w-[60dvw] h-[60dvw] rounded-full bg-violet-600/10 blur-[130px] pointer-events-none" />
      <div className="absolute bottom-[10%] right-[-10%] w-[70dvw] h-[70dvw] rounded-full bg-indigo-500/10 blur-[160px] pointer-events-none" />
      <div className="absolute top-[40%] left-[20%] w-[35dvw] h-[35dvw] rounded-full bg-amber-500/5 blur-[100px] pointer-events-none" />

      {/* Navbar */}
      <div className="relative z-10 flex items-center justify-between px-4 pt-5 max-w-3xl mx-auto">
        <Link href="/perfil">
          <button className="flex items-center gap-2 text-slate-300 hover:text-white transition-all cursor-pointer focus:outline-none bg-white/5 hover:bg-white/10 border border-white/10 px-3 py-1.5 rounded-full backdrop-blur-md shadow-sm">
            <ArrowLeft size={16} />
            <span className="text-xs font-bold">Voltar ao Perfil</span>
          </button>
        </Link>
      </div>

      <div className="max-w-xl mx-auto px-4 mt-8 relative z-10">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="font-display text-3xl sm:text-4xl font-black text-white mb-2 tracking-tight drop-shadow-sm">
            Apoie a Missão
          </h1>
          <p className="text-amber-400 font-serif italic text-sm drop-shadow-md">
            “Dê cada um conforme o impulso do seu coração” (2 Coríntios 9, 7)
          </p>
        </div>

        {/* Carta Solo (Glassmorphic) */}
        <div className="rounded-2xl border border-white/10 bg-white/5 p-6 mb-8 backdrop-blur-md shadow-xl shadow-black/10">
          <p className="text-sm text-slate-200 leading-relaxed font-serif">
            Olá! Sou Amarildo Ferrari, católico, marido, pai e o criador do <strong>Sanctificare</strong>.
          </p>
          <p className="text-sm text-slate-200 leading-relaxed font-serif mt-3">
            O Sanctificare nasceu do desejo de ajudar mais pessoas a cultivarem uma vida de oração mais profunda e um caminho de santidade no dia a dia. Hoje, desenvolvo e mantenho todo o projeto sozinho, dedicando meu tempo e meu trabalho para que ele continue crescendo.
          </p>
          <p className="text-sm text-slate-200 leading-relaxed font-serif mt-3">
            Procuro manter o aplicativo gratuito, sem anúncios invasivos, para que nada distraia esse momento de encontro com Deus. Mas, para isso, preciso arcar com os custos de servidores, banco de dados, recursos de inteligência artificial e toda a infraestrutura que faz o app funcionar.
          </p>
          <p className="text-sm text-slate-200 leading-relaxed font-serif mt-3">
            Se o Sanctificare tem sido uma bênção para a sua caminhada de fé, considere fazer uma contribuição voluntária. Qualquer valor faz diferença e ajuda a manter este projeto vivo, alcançando cada vez mais pessoas.
          </p>
          <p className="text-sm text-slate-200 leading-relaxed font-serif mt-4 font-semibold text-amber-400">
            Muito obrigado pelo seu apoio. Que Deus o abençoe abundantemente!
          </p>
        </div>

        {/* Seleção de Valor */}
        <div className="mb-8">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4 block">
            Selecione uma opção de apoio
          </h3>

          <div className="grid grid-cols-1 gap-3 mb-4">
            {TIERS.map((tier) => {
              const Icon = tier.icon;
              const isSelected = !isCustom && selectedTierId === tier.id;
              return (
                <button
                  key={tier.id}
                  onClick={() => {
                    setIsCustom(false);
                    setSelectedTierId(tier.id);
                  }}
                  className={`flex items-start gap-4 p-4 rounded-xl border text-left transition-all duration-300 cursor-pointer backdrop-blur-md ${
                    isSelected
                      ? "border-amber-500/50 bg-amber-500/10 shadow-[0_0_25px_oklch(0.75_0.18_75/0.12)] scale-[1.01]"
                      : "border-white/5 bg-white/5 hover:border-white/10 hover:bg-white/10"
                  }`}
                >
                  <div className={`p-2 rounded-lg transition-colors ${isSelected ? "bg-amber-500/20 text-amber-400" : "bg-white/5 text-slate-300"}`}>
                    <Icon size={20} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline justify-between">
                      <span className="font-bold text-sm text-white">{tier.name}</span>
                      <span className="font-black text-amber-400 text-md">R$ {tier.amount.toFixed(2)}</span>
                    </div>
                    <p className="text-xs text-slate-400 mt-1 leading-normal">
                      {tier.description}
                    </p>
                  </div>
                </button>
              );
            })}

            {/* Outro valor */}
            <button
              onClick={() => setIsCustom(true)}
              className={`p-4 rounded-xl border text-left transition-all duration-300 cursor-pointer backdrop-blur-md ${
                isCustom
                  ? "border-amber-500/50 bg-amber-500/10 shadow-[0_0_25px_oklch(0.75_0.18_75/0.12)] scale-[1.01]"
                  : "border-white/5 bg-white/5 hover:border-white/10 hover:bg-white/10"
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="font-bold text-sm text-white">Outro Valor (Doação Livre)</span>
                {isCustom && <span className="text-xs font-bold text-amber-400">Ativado</span>}
              </div>
              {isCustom ? (
                <div className="flex items-center gap-2 bg-black/40 rounded-lg px-3 py-1.5 border border-white/10 animate-fade-in">
                  <span className="text-slate-400 font-bold text-sm">R$</span>
                  <input
                    type="number"
                    pattern="[0-9]*"
                    inputMode="decimal"
                    placeholder="20,00"
                    value={customAmount}
                    onChange={(e) => setCustomAmount(e.target.value)}
                    className="bg-transparent text-white focus:outline-none w-full text-sm font-black"
                    autoFocus
                  />
                </div>
              ) : (
                <p className="text-xs text-slate-400">Defina o valor que desejar para sua contribuição.</p>
              )}
            </button>
          </div>
        </div>

        {/* Área do PIX (Glassmorphic Glow Card) */}
        <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-white/10 to-transparent p-6 text-center backdrop-blur-lg shadow-2xl relative">
          {/* Sutil glow interno */}
          <div className="absolute inset-0 rounded-2xl bg-amber-500/5 opacity-40 pointer-events-none" />

          {/* Visual Barcode Graphic */}
          <div className="flex flex-col items-center justify-center bg-white/5 border border-white/10 p-3 rounded-xl w-44 mx-auto mb-4 backdrop-blur-md shadow-inner">
            <div className="flex items-stretch justify-center h-10 w-36 gap-[2px] opacity-75">
              <div className="w-[3px] bg-white" />
              <div className="w-[1px] bg-white" />
              <div className="w-[4px] bg-white" />
              <div className="w-[1px] bg-white" />
              <div className="w-[2px] bg-white" />
              <div className="w-[3px] bg-white" />
              <div className="w-[1px] bg-white" />
              <div className="w-[4px] bg-white" />
              <div className="w-[2px] bg-white" />
              <div className="w-[1px] bg-white" />
              <div className="w-[3px] bg-white" />
              <div className="w-[1px] bg-white" />
              <div className="w-[2px] bg-white" />
              <div className="w-[4px] bg-white" />
              <div className="w-[1px] bg-white" />
              <div className="w-[3px] bg-white" />
              <div className="w-[2px] bg-white" />
              <div className="w-[1px] bg-white" />
              <div className="w-[4px] bg-white" />
              <div className="w-[1px] bg-white" />
            </div>
            <span className="text-[8px] text-amber-400 font-mono tracking-widest mt-1.5 font-bold uppercase">PIX Copia e Cola</span>
          </div>

          <h3 className="font-bold text-white text-md mb-1">Doar R$ {amount.toFixed(2)} via PIX</h3>
          <p className="text-slate-400 text-xs mb-6">Use o PIX Copia e Cola no aplicativo do seu banco</p>

          {/* Código PIX */}
          <div className="flex items-center justify-between bg-black/40 rounded-xl px-4 py-3 border border-white/5 mb-4 max-w-full">
            <span className="text-xs text-slate-400 font-mono truncate mr-4">
              {pixCode}
            </span>
            <Button
              onClick={handleCopyCode}
              size="sm"
              className="bg-gradient-to-r from-amber-500 to-amber-300 hover:from-amber-600 hover:to-amber-400 text-slate-950 font-black flex-shrink-0 shadow-[0_0_15px_oklch(0.75_0.18_75/0.2)]"
            >
              {copiedCode ? <Check size={14} /> : <Copy size={14} />}
              <span className="ml-1 text-xs">Copiar PIX</span>
            </Button>
          </div>

          {/* Chave PIX Direta */}
          <div className="flex items-center justify-between bg-white/5 rounded-xl px-4 py-3 border border-white/5">
            <div className="text-left">
              <span className="text-[10px] text-slate-400 block uppercase tracking-wider">Chave PIX E-mail</span>
              <span className="text-xs font-semibold text-white">{DEFAULT_PIX_KEY}</span>
            </div>
            <Button
              onClick={handleCopyKey}
              variant="ghost"
              size="sm"
              className="text-slate-300 hover:text-white hover:bg-white/5"
            >
              {copiedKey ? <Check size={14} /> : <Copy size={14} />}
              <span className="ml-1 text-xs">Copiar Chave</span>
            </Button>
          </div>

          {/* Informativo */}
          <div className="mt-5 flex items-start gap-2 text-left bg-blue-500/5 border border-blue-500/10 rounded-xl p-3">
            <AlertCircle size={16} className="text-blue-400 flex-shrink-0 mt-0.5" />
            <p className="text-[10px] text-slate-400 leading-normal">
              As doações são 100% voluntárias e não garantem recursos premium de áudios adicionais de forma recorrente (para isso, utilize o plano Premium). Deus lhes pague!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
