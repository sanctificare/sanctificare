import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Bell, Clock, Check, Sparkles } from "lucide-react";
import { toast } from "sonner";

interface DailyReminderModalProps {
  isOpen: boolean;
  onClose: () => void;
  bookTitle: string;
}

export default function DailyReminderModal({
  isOpen,
  onClose,
  bookTitle,
}: DailyReminderModalProps) {
  const [reminderTime, setReminderTime] = useState<string>(() => {
    return (
      (typeof window !== "undefined"
        ? localStorage.getItem("sanctificare_retiro_reminder_time")
        : null) || "07:00"
    );
  });
  const [isEnabled, setIsEnabled] = useState<boolean>(() => {
    return (
      (typeof window !== "undefined"
        ? localStorage.getItem("sanctificare_retiro_reminder_enabled")
        : null) === "true"
    );
  });

  const handleSave = async () => {
    if (typeof window !== "undefined") {
      localStorage.setItem("sanctificare_retiro_reminder_time", reminderTime);
      localStorage.setItem("sanctificare_retiro_reminder_enabled", "true");
      setIsEnabled(true);
    }

    if ("Notification" in window) {
      if (Notification.permission !== "granted" && Notification.permission !== "denied") {
        await Notification.requestPermission();
      }
    }

    toast.success(`Lembrete diário agendado para às ${reminderTime}!`);
    onClose();
  };

  const handleDisable = () => {
    if (typeof window !== "undefined") {
      localStorage.setItem("sanctificare_retiro_reminder_enabled", "false");
      setIsEnabled(false);
    }
    toast.info("Lembrete diário desativado.");
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md bg-[#0b1329] border border-amber-500/30 text-slate-100 p-6 rounded-2xl shadow-2xl overflow-hidden">
        <DialogHeader className="mb-2">
          <DialogTitle className="flex items-center gap-2 text-sm uppercase tracking-wider font-bold text-amber-400">
            <Bell size={16} />
            Lembrete Diário de Meditação
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 my-2 text-center">
          <p className="text-xs text-slate-300 font-serif leading-relaxed">
            Escolha o melhor horário do seu dia para realizar sua meditação diária em <strong>{bookTitle}</strong>.
          </p>

          <div className="bg-white/5 border border-white/10 rounded-2xl p-4 flex flex-col items-center gap-3">
            <Clock size={24} className="text-amber-400" />
            <div className="flex flex-col items-center gap-1">
              <label htmlFor="time-select" className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Horário do Lembrete</label>
              <input
                id="time-select"
                type="time"
                value={reminderTime}
                onChange={(e) => setReminderTime(e.target.value)}
                className="bg-[#141e38] border border-amber-500/30 text-white font-bold text-xl px-4 py-2 rounded-xl text-center focus:outline-none focus:border-amber-400"
              />
            </div>
          </div>

          {isEnabled && (
            <p className="text-[11px] text-emerald-400 flex items-center justify-center gap-1">
              <Check size={13} /> Lembrete ativo diariamente às {reminderTime}
            </p>
          )}
        </div>

        <div className="flex flex-col sm:flex-row gap-2 mt-2">
          {isEnabled && (
            <Button
              onClick={handleDisable}
              variant="outline"
              className="w-full border-red-500/30 bg-red-500/10 hover:bg-red-500/20 text-red-300 font-bold text-xs uppercase tracking-wider h-10 rounded-xl cursor-pointer"
            >
              Desativar
            </Button>
          )}

          <Button
            onClick={handleSave}
            className="w-full bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs uppercase tracking-wider h-10 rounded-xl cursor-pointer shadow-md"
          >
            Salvar Lembrete
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
