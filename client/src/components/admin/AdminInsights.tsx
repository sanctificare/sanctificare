import { useState } from "react";
import { Activity, Globe, MousePointerClick, UserPlus } from "lucide-react";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  PLATFORM_LABELS,
  acquisitionSourceLabel,
  featureLabel,
} from "@shared/analytics";

type Period = 7 | 30 | 90 | 365;

const PERIODS: Array<{ value: Period; label: string }> = [
  { value: 7, label: "7 dias" },
  { value: 30, label: "30 dias" },
  { value: 90, label: "90 dias" },
  { value: 365, label: "1 ano" },
];

const LOGIN_METHOD_LABELS: Record<string, string> = {
  credentials: "E-mail e senha",
  google: "Google",
  desconhecido: "Não informado",
};

const PRAYER_TYPE_LABELS: Record<string, string> = {
  rosario: "Santo Rosário",
  liturgia: "Liturgia",
  lectio_divina: "Lectio Divina",
  novena: "Novenas",
  via_sacra: "Via-Sacra",
  vela_virtual: "Vela Virtual",
  video_biblico: "Vídeos Bíblicos",
};

const EVENT_LABELS: Record<string, string> = {
  sign_up: "Cadastro por e-mail",
  login: "Login por e-mail",
  login_started: "Início de login com Google",
  prayer_opened: "Oração aberta",
  rosary_started: "Terço iniciado",
  rosary_completed: "Terço concluído",
  rosary_cta_click: "Clique em rezar o terço",
  light_candle: "Vela acesa",
  add_intention: "Intenção publicada",
  subscription_plan_selected: "Plano Premium escolhido",
  subscription_checkout_started: "Checkout Premium iniciado",
  subscription_checkout_redirect: "Enviado ao pagamento",
  subscription_checkout_error: "Erro no checkout",
  prayer_locked_upgrade_prompt: "Oração bloqueada (oferta Premium)",
  qsm_landing_view: "Página da Quaresma de São Miguel",
  qsm_share_click: "Compartilhou a Quaresma",
};

const REGION_NAMES = (() => {
  try {
    return new Intl.DisplayNames(["pt-BR"], { type: "region" });
  } catch {
    return null;
  }
})();

const countryLabel = (code: string) => REGION_NAMES?.of(code) ?? code;
const timezoneLabel = (tz: string) => tz.split("/").slice(1).join(" / ").replace(/_/g, " ") || tz;

type BarRow = { key: string; label: string; value: number; detail?: string };

function RankedBars({ rows, emptyText, unit }: { rows: BarRow[]; emptyText: string; unit: string }) {
  if (rows.length === 0) {
    return <p className="py-6 text-center text-xs text-slate-500">{emptyText}</p>;
  }
  const max = Math.max(...rows.map((row) => row.value), 1);
  const total = rows.reduce((sum, row) => sum + row.value, 0);

  return (
    <ul className="space-y-3">
      {rows.map((row) => {
        const share = total > 0 ? Math.round((row.value / total) * 100) : 0;
        return (
          <li
            key={row.key}
            className="group"
            title={`${row.label}: ${row.value.toLocaleString("pt-BR")} ${unit}${row.detail ? ` · ${row.detail}` : ""}`}
          >
            <div className="mb-1 flex items-baseline justify-between gap-3 text-xs">
              <span className="truncate text-slate-200">{row.label}</span>
              <span className="shrink-0 tabular-nums text-slate-400">
                <span className="font-semibold text-slate-100">{row.value.toLocaleString("pt-BR")}</span>
                {row.detail ? ` · ${row.detail}` : ` · ${share}%`}
              </span>
            </div>
            <div className="h-2 w-full rounded-full bg-slate-800/60">
              <div
                className="h-2 rounded-full bg-amber-500/80 transition-colors group-hover:bg-amber-400"
                style={{ width: `${Math.max((row.value / max) * 100, 2)}%` }}
              />
            </div>
          </li>
        );
      })}
    </ul>
  );
}

function Panel({ title, description, children }: { title: string; description?: string; children: React.ReactNode }) {
  return (
    <Card className="bg-[#121622] border-amber-500/10 shadow-lg">
      <CardHeader className="border-b border-slate-800 pb-4">
        <CardTitle className="text-base font-serif font-bold text-amber-500 dark:text-amber-300">{title}</CardTitle>
        {description && <CardDescription className="text-xs text-slate-400">{description}</CardDescription>}
      </CardHeader>
      <CardContent className="p-5">{children}</CardContent>
    </Card>
  );
}

function StatTile({ label, value, hint, icon: Icon }: { label: string; value: string; hint?: string; icon: typeof Activity }) {
  return (
    <Card className="bg-[#121622] border-amber-500/10 shadow-lg">
      <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
        <CardTitle className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{label}</CardTitle>
        <Icon className="w-4 h-4 text-amber-500" />
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-bold text-slate-100 tabular-nums">{value}</div>
        {hint && <p className="mt-1 text-xs text-slate-500">{hint}</p>}
      </CardContent>
    </Card>
  );
}

export default function AdminInsights() {
  const [days, setDays] = useState<Period>(30);
  const insightsQuery = trpc.admin.getInsights.useQuery({ days }, { placeholderData: (prev) => prev });
  const data = insightsQuery.data;

  const periodSelector = (
    <div className="flex flex-wrap gap-2" role="group" aria-label="Período">
      {PERIODS.map((period) => (
        <Button
          key={period.value}
          size="sm"
          variant={days === period.value ? "default" : "outline"}
          onClick={() => setDays(period.value)}
          className={days === period.value ? "bg-amber-500 text-slate-900 hover:bg-amber-600" : "border-amber-500/30 text-amber-500 dark:text-amber-300"}
        >
          {period.label}
        </Button>
      ))}
    </div>
  );

  if (insightsQuery.isError && !data) {
    return (
      <div className="space-y-4">
        {periodSelector}
        <Card className="border-red-500/20 bg-[#121622]">
          <CardContent className="p-8 text-center text-sm text-red-400">
            {insightsQuery.error.message || "Não foi possível carregar as estatísticas."}
            <div className="mt-4">
              <Button size="sm" variant="outline" onClick={() => void insightsQuery.refetch()}>Tentar novamente</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="space-y-4">
        {periodSelector}
        <div className="flex min-h-40 items-center justify-center gap-3 text-sm text-slate-400">
          <div className="w-6 h-6 rounded-full border-2 border-amber-500/20 border-t-amber-500 animate-spin" />
          Carregando estatísticas detalhadas...
        </div>
      </div>
    );
  }

  const { acquisition, usage } = data;
  const untracked = Math.max(acquisition.signups - acquisition.trackedSignups, 0);

  const sourceRows: BarRow[] = acquisition.bySource.map((row) => ({
    key: row.key,
    label: acquisitionSourceLabel(row.key),
    value: row.count,
  }));
  const platformRows: BarRow[] = acquisition.byPlatform.map((row) => ({
    key: row.key,
    label: PLATFORM_LABELS[row.key] ?? row.key,
    value: row.count,
  }));
  const loginRows: BarRow[] = acquisition.byLoginMethod.map((row) => ({
    key: row.key,
    label: LOGIN_METHOD_LABELS[row.key] ?? row.key,
    value: row.count,
  }));
  const regionRows: BarRow[] = acquisition.byCountry.length > 0
    ? acquisition.byCountry.map((row) => ({ key: row.key, label: countryLabel(row.key), value: row.count }))
    : acquisition.byTimezone.map((row) => ({ key: row.key, label: timezoneLabel(row.key), value: row.count }));
  const campaignRows: BarRow[] = acquisition.byCampaign.map((row) => ({ key: row.key, label: row.key, value: row.count }));
  const referrerRows: BarRow[] = acquisition.byReferrer.map((row) => ({ key: row.key, label: row.key, value: row.count }));

  const featureRows: BarRow[] = usage.features.map((row) => ({
    key: row.feature,
    label: featureLabel(row.feature),
    value: row.users,
    detail: `${row.views.toLocaleString("pt-BR")} acessos`,
  }));
  const eventRows: BarRow[] = usage.events.map((row) => ({
    key: row.name,
    label: EVENT_LABELS[row.name] ?? row.name,
    value: row.count,
    detail: `${row.users.toLocaleString("pt-BR")} pessoas`,
  }));
  const prayerRows: BarRow[] = usage.prayerTypes.map((row) => ({
    key: row.key,
    label: PRAYER_TYPE_LABELS[row.key] ?? row.key,
    value: row.count,
    detail: `${row.users.toLocaleString("pt-BR")} pessoas`,
  }));
  const communityRows: BarRow[] = [
    { key: "candles", label: "Velas acesas", value: usage.candles.count, detail: `${usage.candles.users} pessoas` },
    { key: "intentions", label: "Intenções publicadas", value: usage.intentions.count, detail: `${usage.intentions.users} pessoas` },
    { key: "lectio", label: "Diários de Lectio Divina", value: usage.lectio.count, detail: `${usage.lectio.users} pessoas` },
  ].filter((row) => row.value > 0);

  const dailyActiveData = usage.dailyActive.map((row) => ({
    label: format(new Date(`${row.date}T12:00:00`), "dd/MM", { locale: ptBR }),
    users: row.users,
  }));

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-xl font-serif font-bold text-amber-500 dark:text-amber-300">Estatísticas detalhadas</h3>
          <p className="text-xs text-slate-400">De onde vêm os novos fiéis e quais recursos estão sendo usados.</p>
        </div>
        {periodSelector}
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatTile label="Cadastros no período" value={acquisition.signups.toLocaleString("pt-BR")} icon={UserPlus} />
        <StatTile
          label="Com origem identificada"
          value={acquisition.trackedSignups.toLocaleString("pt-BR")}
          hint={untracked > 0 ? `${untracked} sem dados (antes do rastreamento ou app desatualizado)` : undefined}
          icon={Globe}
        />
        <StatTile label="Usuários ativos no período" value={usage.activeUsers.toLocaleString("pt-BR")} icon={Activity} />
        <StatTile label="Recursos acessados" value={usage.features.length.toLocaleString("pt-BR")} icon={MousePointerClick} />
      </div>

      <section className="space-y-4">
        <h4 className="text-sm font-semibold uppercase tracking-wider text-slate-400">Origem dos cadastros</h4>
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <Panel title="De onde vieram" description="Canal do primeiro acesso de quem se cadastrou (UTM, site de origem ou loja).">
            <RankedBars rows={sourceRows} emptyText="Nenhum cadastro no período." unit="cadastros" />
          </Panel>
          <Panel title="Por onde se cadastraram" description="Aplicativo Android, iOS ou site no navegador.">
            <RankedBars rows={platformRows} emptyText="Nenhum cadastro no período." unit="cadastros" />
          </Panel>
          <Panel
            title="Região"
            description={acquisition.byCountry.length > 0 ? "País informado pela rede." : "Fuso horário do aparelho (indica a região aproximada)."}
          >
            <RankedBars rows={regionRows} emptyText="Ainda sem dados de região." unit="cadastros" />
          </Panel>
          <Panel title="Forma de cadastro" description="Conta criada com e-mail e senha ou com Google.">
            <RankedBars rows={loginRows} emptyText="Nenhum cadastro no período." unit="cadastros" />
          </Panel>
          <Panel title="Campanhas (utm_campaign)" description="Use links com ?utm_source=...&utm_campaign=... nas suas divulgações.">
            <RankedBars rows={campaignRows} emptyText="Nenhuma campanha identificada no período." unit="cadastros" />
          </Panel>
          <Panel title="Sites de origem" description="Endereço de onde a pessoa clicou para chegar ao site.">
            <RankedBars rows={referrerRows} emptyText="Nenhum site de origem registrado no período." unit="cadastros" />
          </Panel>
        </div>
      </section>

      <section className="space-y-4">
        <h4 className="text-sm font-semibold uppercase tracking-wider text-slate-400">Uso dos recursos</h4>
        <Panel title="Usuários ativos por dia" description="Pessoas logadas que abriram o app em cada dia.">
          {dailyActiveData.length === 0 ? (
            <p className="py-6 text-center text-xs text-slate-500">Os dados aparecem assim que os usuários abrirem a nova versão do app.</p>
          ) : (
            <div className="h-56 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={dailyActiveData} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
                  <defs>
                    <linearGradient id="dauFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#f59e0b" stopOpacity={0.25} />
                      <stop offset="100%" stopColor="#f59e0b" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid stroke="#1e293b" strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="label" stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} />
                  <YAxis stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} allowDecimals={false} />
                  <Tooltip
                    cursor={{ stroke: "#f59e0b", strokeOpacity: 0.4 }}
                    contentStyle={{ backgroundColor: "#0F121C", border: "1px solid rgba(245,158,11,0.2)", borderRadius: 8, fontSize: 12 }}
                    labelStyle={{ color: "#cbd5e1" }}
                    formatter={(value) => [`${value} usuários`, "Ativos"]}
                  />
                  <Area type="monotone" dataKey="users" stroke="#f59e0b" strokeWidth={2} fill="url(#dauFill)" activeDot={{ r: 4 }} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}
        </Panel>
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <Panel title="Recursos mais usados" description="Pessoas diferentes que abriram cada tela no período.">
            <RankedBars
              rows={featureRows}
              emptyText="Os dados aparecem assim que os usuários abrirem a nova versão do app."
              unit="pessoas"
            />
          </Panel>
          <Panel title="Ações realizadas" description="Eventos registrados dentro do app (terços, velas, Premium...).">
            <RankedBars rows={eventRows} emptyText="Nenhuma ação registrada no período." unit="vezes" />
          </Panel>
          <Panel title="Orações concluídas por tipo" description="Histórico do banco — disponível também para períodos anteriores ao rastreamento.">
            <RankedBars rows={prayerRows} emptyText="Nenhuma oração concluída no período." unit="orações" />
          </Panel>
          <Panel title="Comunidade e diário" description="Histórico do banco no período.">
            <RankedBars rows={communityRows} emptyText="Nenhuma vela, intenção ou diário no período." unit="registros" />
          </Panel>
        </div>
      </section>
    </div>
  );
}
