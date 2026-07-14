import { useState, useMemo } from "react";
import { Link } from "wouter";
import {
  ArrowLeft,
  Coffee,
  Heart,
  Sparkles,
  Copy,
  Check,
  AlertCircle,
  Flame
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
    "010212", // Point of Initiation Method
    `26${(38 + key.length).toString()}`, // Merchant Account Information
    "0014br.gov.bcb.pix",
    `01${key.length.toString().padStart(2, "0")}${key}`,
    "52040000", // Merchant Category Code
    "5303986", // Transaction Currency (986 = BRL)
    `54${amountLen}${amountStr}`, // Transaction Amount
    "5802BR", // Country Code
    "5913Sanctificare", // Merchant Name
    "6009Sao Paulo", // Merchant City
    "62070503***", // Additional Data Field
    "6304", // CRC16 Indicator
  ].join("");

  const checksum = calculateCRC16(payload);
  return payload + checksum;
}

interface Tier {
  id: string;
  name: string;
  subLabel: string;
  amount: number;
  icon: typeof Coffee;
}

const TIERS: Tier[] = [
  {
    id: "simples",
    name: "Amigo",
    subLabel: "Apoio Fraterno",
    amount: 5.0,
    icon: Sparkles,
  },
  {
    id: "cafe",
    name: "Colaborador",
    subLabel: "Ajuda Generosa",
    amount: 10.0,
    icon: Coffee,
  },
  {
    id: "vela",
    name: "Benfeitor",
    subLabel: "Cuidado e Fé",
    amount: 25.0,
    icon: Flame,
  },
  {
    id: "missao",
    name: "Patrono",
    subLabel: "Sustentáculo da Missão",
    amount: 50.0,
    icon: Heart,
  },
];

export default function ApoieMissao() {
  const [selectedTierId, setSelectedTierId] = useState<string>("vela");
  const [customAmount, setCustomAmount] = useState<string>("");
  const [isCustom, setIsCustom] = useState<boolean>(false);
  const [copiedKey, setCopiedKey] = useState<boolean>(false);
  const [copiedCode, setCopiedCode] = useState<boolean>(false);
  const [showQrCode, setShowQrCode] = useState<boolean>(true);

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
    <div className="min-h-screen bg-gradient-to-b from-[oklch(0.12_0.05_270)] via-[oklch(0.08_0.04_260)] to-[oklch(0.05_0.03_250)] text-slate-100 font-sans pb-24 relative overflow-hidden">
      {/* Elementos de Brilho de Fundo (Glow Effect) */}
      <div className="absolute top-[-10%] left-[-10%] w-[60dvw] h-[60dvw] rounded-full bg-violet-600/10 blur-[130px] pointer-events-none" />
      <div className="absolute bottom-[10%] right-[-10%] w-[70dvw] h-[70dvw] rounded-full bg-indigo-500/10 blur-[160px] pointer-events-none" />
      <div className="absolute top-[40%] left-[20%] w-[35dvw] h-[35dvw] rounded-full bg-amber-500/5 blur-[100px] pointer-events-none" />

      {/* Navbar / Header com o layout igual ao anexo */}
      <div className="relative z-10 flex items-center justify-between px-6 pt-6 pb-2 max-w-xl mx-auto">
        <Link href="/perfil">
          <button className="flex items-center gap-1 text-slate-400 hover:text-white transition-all cursor-pointer focus:outline-none bg-white/5 hover:bg-white/10 border border-white/10 px-2.5 py-1 rounded-full backdrop-blur-md shadow-sm">
            <ArrowLeft size={14} />
            <span className="text-[10px] font-bold uppercase tracking-wider">Voltar</span>
          </button>
        </Link>
      </div>

      <div className="max-w-xl mx-auto px-6 mt-4 relative z-10">
        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="font-display text-3xl sm:text-4xl font-black text-amber-400 tracking-wider uppercase drop-shadow-[0_0_12px_rgba(251,191,36,0.3)]">
            Apoie a Missão
          </h1>
        </div>

        {/* Carta Solo (Nossa História) */}
        <div className="rounded-2xl border border-white/10 bg-white/5 p-5 mb-6 backdrop-blur-md shadow-xl relative">
          <div className="flex items-center justify-between mb-4 border-b border-white/10 pb-3">
            <h2 className="text-base font-bold text-white uppercase tracking-wider">Sobre Mim</h2>
            <span className="text-amber-400 font-bold text-lg leading-none">†</span>
          </div>

          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4">
            {/* Circular Avatar com o logo correto */}
            <div className="flex flex-col items-center gap-1.5 flex-shrink-0">
              <div className="relative">
                <div className="w-16 h-16 rounded-full border-2 border-amber-500/60 bg-gradient-to-br from-amber-500/20 to-amber-500/5 flex items-center justify-center shadow-md overflow-hidden p-1.5">
                  <img src="/assets/logo-sanctificare.webp" alt="Sanctificare Logo" className="w-12 h-12 object-contain" />
                </div>
                <div className="absolute bottom-0 right-0 w-5 h-5 rounded-full bg-amber-500 border border-slate-950 flex items-center justify-center shadow">
                  <span className="text-[10px] text-slate-950 font-bold leading-none">†</span>
                </div>
              </div>
              <span className="text-[11px] text-slate-400 font-bold uppercase tracking-widest">Fundador</span>
            </div>

            {/* Texto da História */}
            <div className="flex-1 text-sm text-slate-300 leading-relaxed font-serif text-justify">
              Olá! Sou Amarildo Ferrari, católico, marido, pai e criador do Sanctificare. O app nasceu do desejo de ajudar mais pessoas a cultivarem uma vida de oração e santidade no dia a dia. Hoje, desenvolvo e mantenho todo o projeto sozinho, buscando manter o app gratuito e livre de anúncios invasivos. Mas, para isso, preciso arcar com os custos de servidores, banco de dados, recursos de inteligência artificial e toda a infraestrutura que faz o app funcionar. Se o Sanctificare tem sido uma bênção para sua caminhada, apoie nosso trabalho!
            </div>
          </div>
        </div>

        {/* Seleção de Valor */}
        <div className="mb-6">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-3 block">
            Selecione um Nível de Apoio
          </h3>

          <div className="grid grid-cols-1 gap-2.5 mb-3">
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
                  className={`flex items-center justify-between w-full p-3.5 pl-5 pr-3 rounded-full border transition-all duration-300 cursor-pointer backdrop-blur-md ${
                    isSelected
                      ? "border-amber-400 bg-amber-500/10 shadow-[0_0_20px_oklch(0.75_0.18_75/0.2)] scale-[1.01]"
                      : "border-white/5 bg-white/5 hover:border-white/10 hover:bg-white/10"
                  }`}
                >
                  {/* Icon + Name */}
                  <div className="flex items-center gap-3">
                    <Icon className="text-amber-400 flex-shrink-0" size={16} />
                    <span className="font-bold text-base text-white">{tier.name}</span>
                  </div>

                  {/* Subtitle / Description */}
                  <div className="hidden sm:block text-sm text-slate-400 truncate max-w-[150px] font-serif italic pr-4">
                    {tier.subLabel}
                  </div>

                  {/* Amount Pill */}
                  <div className="px-4 py-1.5 rounded-full border border-amber-500/30 bg-black/40 flex items-center justify-center flex-shrink-0">
                    <span className="font-black text-amber-400 text-sm">R$ {tier.amount.toFixed(0)}</span>
                    <span className="text-[10px] text-slate-400 font-medium ml-1">/mês</span>
                  </div>
                </button>
              );
            })}

            {/* Outro valor */}
            <button
              onClick={() => setIsCustom(true)}
              className={`p-3.5 px-5 rounded-full border text-left transition-all duration-300 cursor-pointer backdrop-blur-md ${
                isCustom
                  ? "border-amber-400 bg-amber-500/10 shadow-[0_0_20px_oklch(0.75_0.18_75/0.2)] scale-[1.01]"
                  : "border-white/5 bg-white/5 hover:border-white/10 hover:bg-white/10"
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-base text-white">Outro Valor (Doação Livre)</span>
                {isCustom ? (
                  <div className="flex items-center gap-1.5 bg-black/40 rounded-full px-3 py-1 border border-white/10 animate-fade-in">
                    <span className="text-slate-400 font-bold text-sm">R$</span>
                    <input
                      type="number"
                      pattern="[0-9]*"
                      inputMode="decimal"
                      placeholder="20"
                      value={customAmount}
                      onChange={(e) => setCustomAmount(e.target.value)}
                      className="bg-transparent text-white focus:outline-none w-16 text-sm font-black text-center"
                      autoFocus
                    />
                    <span className="text-[10px] text-slate-400">/mês</span>
                  </div>
                ) : (
                  <span className="text-sm text-slate-400">Definir valor livre</span>
                )}
              </div>
            </button>
          </div>
        </div>

        {/* Área do PIX (Pagar com PIX Card) */}
        <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-white/10 to-transparent p-5 text-center backdrop-blur-md shadow-2xl relative">
          <div className="absolute inset-0 rounded-2xl bg-amber-500/5 opacity-40 pointer-events-none" />

          {/* Title */}
          <div className="flex items-center gap-2 mb-4 border-b border-white/10 pb-3">
            <span className="text-amber-400 text-lg leading-none">❖</span>
            <h3 className="font-bold text-white text-base uppercase tracking-wider">Pagar com PIX</h3>
          </div>

          {/* Subtitle */}
          <div className="flex items-center justify-between mb-3 border-b border-white/5 pb-2">
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-amber-400">◆</span>
              <span className="text-sm text-slate-300 font-bold uppercase tracking-wider">PIX Copia e Cola</span>
            </div>
            
            <button
              onClick={() => setShowQrCode(!showQrCode)}
              className="text-xs font-bold text-amber-400 hover:text-amber-300 transition-colors focus:outline-none bg-white/5 hover:bg-white/10 px-2.5 py-1 rounded-full cursor-pointer flex items-center gap-1"
            >
              <span>{showQrCode ? "Ocultar QR" : "Gerar QR Code"}</span>
            </button>
          </div>

          {showQrCode && (
            <div className="bg-white p-3 rounded-2xl w-44 h-44 mx-auto mb-4 flex items-center justify-center shadow-lg border border-amber-500/20 transition-all duration-300">
              <img
                src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&color=0b0d10&data=${encodeURIComponent(pixCode)}`}
                alt="QR Code PIX"
                className="w-36 h-36 object-contain"
                loading="lazy"
              />
            </div>
          )}

          {/* Código PIX Field */}
          <div className="flex items-center justify-between bg-black/40 rounded-xl px-4 py-3 border border-white/5 mb-4 max-w-full relative overflow-hidden">
            <span className="text-sm text-slate-400 font-mono truncate mr-4">
              {pixCode}
            </span>
            <button
              onClick={handleCopyCode}
              className="text-sm font-bold text-amber-400 hover:text-amber-300 transition-colors focus:outline-none flex-shrink-0 cursor-pointer"
            >
              {copiedCode ? "[Copiado!]" : "[Copiar Código]"}
            </button>
          </div>

          {/* Big Gold Button */}
          <Button
            onClick={handleCopyCode}
            className="w-full py-5 rounded-full bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 hover:from-amber-600 hover:to-amber-500 text-slate-950 font-black text-sm uppercase tracking-wider shadow-[0_0_20px_rgba(245,158,11,0.25)] hover:shadow-[0_0_25px_rgba(245,158,11,0.35)] transition-all duration-300 border-none cursor-pointer"
          >
            Doar com PIX
          </Button>

          {/* Chave PIX Direta */}
          <div className="mt-4 flex items-center justify-between bg-white/5 rounded-xl px-4 py-2.5 border border-white/5">
            <div className="text-left">
              <span className="text-[10px] text-slate-400 block uppercase tracking-wider">Chave PIX E-mail</span>
              <span className="text-sm font-semibold text-slate-200">{DEFAULT_PIX_KEY}</span>
            </div>
            <button
              onClick={handleCopyKey}
              className="text-sm font-bold text-slate-300 hover:text-white transition-colors focus:outline-none cursor-pointer"
            >
              {copiedKey ? "Copiada" : "Copiar Chave"}
            </button>
          </div>

          {/* Informativo */}
          <div className="mt-4 flex items-start gap-2 text-left bg-blue-500/5 border border-blue-500/10 rounded-xl p-3">
            <AlertCircle size={14} className="text-blue-400 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-slate-400 leading-normal">
              As doações são 100% voluntárias e não garantem recursos premium de orações ou áudios adicionais (para isso, utilize o plano Premium). Que Deus lhes pague!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
