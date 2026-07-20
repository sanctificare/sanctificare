import React, { useEffect, useState } from "react";
import { trpc } from "../lib/trpc";
import { Users, Sparkles, Award, Activity, ShieldAlert, ExternalLink } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";

const ADMIN_PORTAL_STALL_MS = 8000;

export default function AdminQuickPortal() {
  const statsQuery = trpc.admin.getStats.useQuery(undefined, {
    refetchInterval: 60000,
  });

  const [timedOut, setTimedOut] = useState(false);

  useEffect(() => {
    if (!statsQuery.isPending) {
      setTimedOut(false);
      return;
    }

    const timer = window.setTimeout(() => setTimedOut(true), ADMIN_PORTAL_STALL_MS);
    return () => window.clearTimeout(timer);
  }, [statsQuery.isPending]);

  if (statsQuery.isPending && !timedOut) {
    return (
      <div className="w-full py-6 flex items-center justify-center gap-2">
        <div className="w-5 h-5 rounded-full border-2 border-amber-500/20 border-t-amber-500 animate-spin" />
        <span className="text-xs text-slate-400">Carregando painel do dono...</span>
      </div>
    );
  }

  if (timedOut) {
    return (
      <div className="w-full py-6 space-y-3 border-t border-[oklch(0.75_0.12_75/0.2)] mt-6">
        <div className="rounded-xl border border-amber-500/20 bg-[oklch(0.25_0.05_260)] p-4 text-center">
          <p className="text-sm font-semibold text-amber-400">Painel do Dono indisponível no momento</p>
          <p className="mt-1 text-xs text-slate-400">As estatísticas demoraram para responder. Você pode tentar novamente.</p>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setTimedOut(false);
              void statsQuery.refetch();
            }}
            className="mt-3 border-amber-500/30 text-amber-400 hover:bg-amber-500/10"
          >
            Tentar novamente
          </Button>
        </div>
      </div>
    );
  }

  if (statsQuery.isError) {
    return null; // Don't show anything on mobile if there is an error/unauthorized
  }

  return (
    <div className="w-full py-6 space-y-4 border-t border-[oklch(0.75_0.12_75/0.2)] mt-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ShieldAlert className="w-5 h-5 text-amber-500" />
          <h3 className="text-base font-display font-semibold text-[oklch(0.88_0.08_80)]">Painel do Dono</h3>
        </div>
        <Link href="/admin">
          <Button variant="ghost" size="sm" className="text-xs text-amber-500 hover:text-amber-400 hover:bg-[oklch(0.75_0.12_75/0.1)] gap-1">
            Ver Completo <ExternalLink className="w-3 h-3" />
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {/* Metric 1 */}
        <Card className="bg-[oklch(0.25_0.05_260)] border-[oklch(0.75_0.12_75/0.1)] shadow-md">
          <CardContent className="p-3 flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-500">
              <Users className="w-4 h-4" />
            </div>
            <div>
              <p className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Total Fiéis</p>
              <h4 className="text-sm font-bold text-slate-100 mt-0.5">{statsQuery.data?.totalUsers}</h4>
            </div>
          </CardContent>
        </Card>

        {/* Metric 2 */}
        <Card className="bg-[oklch(0.25_0.05_260)] border-[oklch(0.75_0.12_75/0.1)] shadow-md">
          <CardContent className="p-3 flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <p className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Hoje</p>
              <h4 className="text-sm font-bold text-emerald-400 mt-0.5">+{statsQuery.data?.newUsersToday}</h4>
            </div>
          </CardContent>
        </Card>

        {/* Metric 3 */}
        <Card className="bg-[oklch(0.25_0.05_260)] border-[oklch(0.75_0.12_75/0.1)] shadow-md">
          <CardContent className="p-3 flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-amber-500/15 text-amber-500">
              <Award className="w-4 h-4" />
            </div>
            <div>
              <p className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Premium</p>
              <h4 className="text-sm font-bold text-amber-400 mt-0.5">{statsQuery.data?.activeSubscriptions}</h4>
            </div>
          </CardContent>
        </Card>

        {/* Metric 4 */}
        <Card className="bg-[oklch(0.25_0.05_260)] border-[oklch(0.75_0.12_75/0.1)] shadow-md">
          <CardContent className="p-3 flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-sky-500/10 text-sky-400">
              <Activity className="w-4 h-4" />
            </div>
            <div>
              <p className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Orações</p>
              <h4 className="text-sm font-bold text-sky-400 mt-0.5">{statsQuery.data?.totalPrayers}</h4>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
