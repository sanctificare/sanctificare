import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Award, Share2, Heart, Sparkles, CheckCircle2 } from "lucide-react";
import { shareText } from "@/lib/share";
import { toast } from "sonner";

interface RetiroCompletionModalProps {
  isOpen: boolean;
  onClose: () => void;
  bookTitle: string;
  author: string;
  totalDays: number;
}

export default function RetiroCompletionModal({
  isOpen,
  onClose,
  bookTitle,
  author,
  totalDays,
}: RetiroCompletionModalProps) {
  const handleShareCompletion = async () => {
    const text = `Graças a Deus concluí os ${totalDays} dias do itinerário de "${bookTitle}" por ${author} no aplicativo Sanctificare! ✦ Deus seja louvado!`;
    await shareText({
      title: `Conclusão do Itinerário: ${bookTitle}`,
      text,
    });
    toast.success("Que alegria compartilhar essa conquista espiritual!");
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-lg bg-[#0b1329] border border-amber-500/40 text-slate-100 p-6 rounded-3xl shadow-2xl overflow-hidden text-center">
        {/* Glow Effects */}
        <div className="absolute w-60 h-60 rounded-full bg-amber-500/10 blur-3xl -top-20 -left-10 pointer-events-none" />
        <div className="absolute w-60 h-60 rounded-full bg-amber-500/10 blur-3xl -bottom-20 -right-10 pointer-events-none" />

        <div className="relative z-10 space-y-5">
          {/* Badge Icon */}
          <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-amber-500 to-amber-300 border-4 border-white/10 shadow-2xl flex items-center justify-center mx-auto animate-bounce" style={{ animationDuration: '3s' }}>
            <Award size={40} className="text-slate-950 stroke-[2]" />
          </div>

          <div>
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-amber-400 bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/20">
              Marco de Perseverança Espiritual
            </span>
            <h2 className="font-display text-2xl sm:text-3xl font-black text-white mt-2 leading-tight">
              Parabéns! Você concluiu a {bookTitle}!
            </h2>
            <p className="font-serif text-sm text-slate-300 mt-2 max-w-md mx-auto">
              Você completou com fidelidade os <strong>{totalDays} dias</strong> desta caminhada de oração, conversão e busca da santidade com {author}.
            </p>
          </div>

          <div className="rounded-2xl border border-amber-500/20 bg-white/5 p-4 text-left font-serif italic text-xs leading-relaxed text-slate-200">
            <div className="flex items-center gap-1.5 text-amber-400 font-sans font-bold not-italic mb-1.5 uppercase text-[10px] tracking-wider">
              <Sparkles size={12} /> Protesto Devoto de Amor
            </div>
            “Eu entrego a minha mente, o meu corpo, o meu trabalho e o meu futuro totalmente a Ti, meu Pai e meu Senhor Deus! Tu és o único Rei do meu coração e o meu amor eterno.”
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <Button
              onClick={handleShareCompletion}
              className="w-full bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs uppercase tracking-wider h-11 rounded-xl cursor-pointer shadow-lg flex items-center justify-center gap-2"
            >
              <Share2 size={16} />
              Compartilhar Vitória Espiritual
            </Button>
            <Button
              onClick={onClose}
              variant="outline"
              className="w-full border-white/10 bg-white/5 hover:bg-white/10 text-white font-bold text-xs uppercase tracking-wider h-11 rounded-xl cursor-pointer"
            >
              <CheckCircle2 size={16} className="mr-1 text-emerald-400" />
              Concluir Retiro
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
