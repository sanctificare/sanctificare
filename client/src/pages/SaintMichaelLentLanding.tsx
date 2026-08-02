import { useEffect } from "react";
import { Link, useLocation } from "wouter";
import { Bell, BookOpen, CalendarDays, ChevronDown, Cross, Heart, Share2, Sparkles, TrendingUp } from "lucide-react";
import { useAuth } from "@/_core/hooks/useAuth";
import { trackEvent } from "@/lib/analytics";
import "./SaintMichaelLentLanding.css";

const JOURNEY_PATH = "/quaresma-sao-miguel";

const benefits = [
  { icon: BookOpen, title: "Orações tradicionais", text: "Cada oração em sua ordem, claramente identificada e pronta para acompanhar." },
  { icon: Heart, title: "Meditação diária", text: "Reflexões para aprofundar a fé e viver cada dia com maior recolhimento." },
  { icon: TrendingUp, title: "Progresso da jornada", text: "Visualize os dias percorridos e retome com serenidade sempre que precisar." },
  { icon: Bell, title: "Lembretes diários", text: "Escolha seu horário e preserve um momento diário para estar em oração." },
  { icon: Sparkles, title: "Propósito do dia", text: "Transforme a oração em um gesto concreto de conversão e caridade." },
  { icon: CalendarDays, title: "Quarenta dias organizados", text: "Encontre toda a caminhada reunida em um único lugar, no celular ou computador." },
];

const faq = [
  ["Quando começa a Quaresma de São Miguel em 2026?", "Tradicionalmente, começa em 15 de agosto e termina em 29 de setembro, Festa dos Santos Arcanjos Miguel, Gabriel e Rafael."],
  ["Por que são 40 dias se o período tem 46 dias?", "Entre 15 de agosto e 29 de setembro existem 46 dias. Excluindo-se os seis domingos, formam-se os 40 dias penitenciais."],
  ["É obrigatório começar em 15 de agosto?", "Não. Por se tratar de uma devoção privada, ela também pode ser realizada em outro período do ano."],
  ["Como faço para participar?", "Clique em “Quero participar”, entre no Sanctificare e inicie a jornada. Cada dia estará organizado para acompanhar você."],
  ["Preciso instalar um aplicativo?", "Não. O Sanctificare também funciona pela internet no navegador do celular, tablet ou computador."],
  ["E se eu perder um dia?", "Retome com serenidade. A constância cristã não deve ser transformada em culpa. Continue sua jornada no Sanctificare."],
];

export default function SaintMichaelLentLanding() {
  const { isAuthenticated } = useAuth();
  const [, navigate] = useLocation();

  const participate = (source: string) => {
    void trackEvent("qsm_landing_cta_click", { source, authenticated: isAuthenticated });
    navigate(isAuthenticated ? JOURNEY_PATH : `/login?tab=cadastrar&path=${encodeURIComponent(JOURNEY_PATH)}`);
  };

  const login = () => {
    void trackEvent("qsm_landing_login_click", { source: "landing" });
    navigate(`/login?tab=entrar&path=${encodeURIComponent(JOURNEY_PATH)}`);
  };

  const shareUrl = `https://wa.me/?text=${encodeURIComponent("No dia 15 de agosto começa a Quaresma de São Miguel. Vou acompanhar os 40 dias pelo Sanctificare. Venha viver esta jornada comigo: https://sanctificare.app/quaresma-de-sao-miguel")}`;

  useEffect(() => {
    const previousTitle = document.title;
    const description = document.querySelector<HTMLMetaElement>('meta[name="description"]');
    const previousDescription = description?.content;
    document.title = "Quaresma de São Miguel 2026 | Sanctificare";
    if (description) description.content = "Viva a Quaresma de São Miguel de 15 de agosto a 29 de setembro com orações, meditações, progresso e lembretes no Sanctificare.";
    void trackEvent("qsm_landing_view", { campaign: "quaresma_sao_miguel_2026" });
    return () => {
      document.title = previousTitle;
      if (description && previousDescription) description.content = previousDescription;
    };
  }, []);

  return (
    <main className="qsm-landing">
      <header className="qsm-header">
        <Link className="qsm-brand" href="/" aria-label="Sanctificare — início">
          <img src="/assets/sanctificare-logo-v2.webp" alt="" />
          <span>Sanctificare</span>
        </Link>
        <nav aria-label="Navegação da página">
          <a href="#a-quaresma">A Quaresma</a><a href="#como-funciona">Como funciona</a><a href="#recursos">Recursos</a><a href="#duvidas">Dúvidas</a>
        </nav>
        <button className="qsm-account" onClick={login}>Minha conta</button>
      </header>

      <section className="qsm-hero" id="inicio">
        <div className="qsm-hero-art" aria-hidden="true" />
        <div className="qsm-hero-content">
          <p className="qsm-eyebrow"><Sparkles /> 15 de agosto a 29 de setembro</p>
          <h1>Viva a Quaresma de<br /><em>São Miguel</em> 2026</h1>
          <div className="qsm-ornament"><span /><b>✦</b><span /></div>
          <p className="qsm-lead">Durante 40 dias, acompanhe as orações tradicionais, meditações e seu progresso diário em uma jornada feita para ajudar você a perseverar.</p>
          <div className="qsm-actions">
            <button className="qsm-button qsm-gold" onClick={() => participate("hero")}><Sparkles /> Quero participar</button>
            <button className="qsm-button qsm-outline" onClick={login}>Já tenho uma conta</button>
          </div>
          <div className="qsm-trust">
            <div><BookOpen /><strong>Orações</strong><small>tradicionais</small></div>
            <div><TrendingUp /><strong>Progresso</strong><small>da jornada</small></div>
            <div><Bell /><strong>Lembretes</strong><small>diários</small></div>
            <div><Heart /><strong>Meditação</strong><small>diária</small></div>
          </div>
        </div>
        <a className="qsm-scroll" href="#a-quaresma">Conheça a jornada <ChevronDown /></a>
      </section>

      <section className="qsm-section qsm-devotional" id="a-quaresma">
        <div className="qsm-heading"><p>UM CAMINHO DE CONVERSÃO</p><h2>Quarenta dias para ordenar o coração<br />e perseverar na oração</h2><i /></div>
        <div className="qsm-devotional-grid">
          <blockquote><span>“</span><p>Mais do que cumprir uma sequência de práticas, esta caminhada é um convite à conversão, à confiança em Deus e à perseverança no combate espiritual.</p><b>40<small>DIAS</small></b></blockquote>
          <div className="qsm-prose">
            <p>A Quaresma de São Miguel é uma devoção tradicionalmente vivida entre <strong>15 de agosto</strong>, Solenidade da Assunção de Nossa Senhora, e <strong>29 de setembro</strong>, Festa dos Santos Arcanjos Miguel, Gabriel e Rafael.</p>
            <p>Excluindo-se os domingos desse intervalo, percorremos 40 dias dedicados à oração e à penitência. O Sanctificare ajuda você a manter a jornada organizada e presente na vida cotidiana.</p>
            <aside><Sparkles /><span>Esta é uma devoção privada e pode ser realizada em outra época do ano. Escolha práticas penitenciais prudentes e adequadas à sua condição.</span></aside>
          </div>
        </div>
      </section>

      <section className="qsm-section qsm-features" id="recursos">
        <div className="qsm-heading qsm-light"><p>TUDO EM SEU DEVIDO LUGAR</p><h2>Concentre-se no que realmente importa:<br /><em>a sua oração</em></h2><i /></div>
        <div className="qsm-feature-grid">{benefits.map(({ icon: Icon, title, text }) => <article key={title}><span><Icon /></span><h3>{title}</h3><p>{text}</p></article>)}</div>
        <p className="qsm-note"><Sparkles /> Uma jornada preparada para ajudar você a rezar, meditar e perseverar durante os 40 dias.</p>
      </section>

      <section className="qsm-section qsm-steps-section" id="como-funciona">
        <div className="qsm-heading qsm-left"><p>COMEÇAR É SIMPLES</p><h2>Uma jornada clara para<br />cada dia de oração</h2><i /></div>
        <div className="qsm-steps-grid">
          <ol className="qsm-steps">
            <li><b>01</b><div><h3>Confirme sua participação</h3><p>Entre no Sanctificare e abra a jornada da Quaresma de São Miguel.</p></div></li>
            <li><b>02</b><div><h3>Inicie a Quaresma de São Miguel</h3><p>Encontre cada oração, meditação e propósito diário em sua ordem.</p></div></li>
            <li><b>03</b><div><h3>Reserve seu momento de oração</h3><p>Ative o lembrete, acompanhe o progresso e retorne todos os dias.</p></div></li>
          </ol>
          <div className="qsm-journey-card">
            <div><span>JORNADA EM ANDAMENTO</span><b>Dia 01 de 40</b></div><progress value="1" max="40" />
            <article><Sparkles /><small>PRIMEIRO DIA</small><h3>O primeiro passo é colocar-se diante de Deus</h3><p>Oração tradicional • Meditação • Propósito</p></article>
            <footer><span><Bell /> Lembrete ativado</span><span><Heart /> Momento de oração</span></footer>
          </div>
        </div>
        <button className="qsm-button qsm-gold qsm-center-button" onClick={() => participate("how_it_works")}>Quero iniciar minha jornada</button>
      </section>

      <section className="qsm-section qsm-preparation">
        <div className="qsm-heading"><p>PREPARE-SE PARA A JORNADA</p><h2>Um passo de cada vez.<br /><em>Um encontro com Deus a cada dia.</em></h2><i /></div>
        <div className="qsm-preparation-grid">
          <article><small>ANTES DE COMEÇAR</small><h3>Prepare o coração</h3><p>Escolha viver estes 40 dias com sinceridade, constância e confiança em Deus.</p><ul><li>Reserve um horário possível</li><li>Prepare seu espaço de oração</li><li>Escolha uma penitência prudente</li><li>Apresente suas intenções a Deus</li><li>Convide alguém para rezar com você</li></ul><button className="qsm-button qsm-dark-outline" onClick={() => participate("preparation")}>Quero participar</button></article>
          <article className="qsm-dark-card"><span>40 DIAS COM SÃO MIGUEL</span><small>DURANTE A QUARESMA</small><h3>Persevere na oração</h3><p>Deixe que cada dia conduza você a uma entrega mais profunda ao Senhor.</p><ul><li>Reze as orações da devoção</li><li>Medite com atenção e silêncio</li><li>Viva o propósito de cada dia</li><li>Acompanhe sua caminhada</li><li>Retome com serenidade quando precisar</li></ul><button className="qsm-button qsm-gold" onClick={() => participate("perseverance")}>Iniciar minha jornada</button></article>
        </div>
      </section>

      <section className="qsm-community"><div><p>REZAR TAMBÉM É CAMINHAR JUNTOS</p><h2>Convide alguém para viver<br />esta jornada com você</h2><span>Cada pessoa percorre os mesmos dias, unida pela oração.</span></div><a className="qsm-button qsm-gold" href={shareUrl} target="_blank" rel="noreferrer" onClick={() => void trackEvent("qsm_share_click", { channel: "whatsapp" })}><Share2 /> Compartilhar pelo WhatsApp</a></section>

      <section className="qsm-section qsm-faq" id="duvidas"><div className="qsm-heading"><p>PERGUNTAS FREQUENTES</p><h2>Para começar com tranquilidade</h2><i /></div><div className="qsm-faq-list">{faq.map(([q, a]) => <details key={q}><summary>{q}<span>+</span></summary><p>{a}</p></details>)}</div></section>

      <section className="qsm-final"><div className="qsm-halo"><Cross /></div><p>15 DE AGOSTO A 29 DE SETEMBRO</p><h2>Prepare o coração<br />para começar esta jornada</h2><span>Orações organizadas, meditação diária, progresso e lembretes para ajudar você a perseverar.</span><div className="qsm-actions"><button className="qsm-button qsm-gold" onClick={() => participate("final")}>Quero participar</button><button className="qsm-button qsm-outline" onClick={login}>Já tenho uma conta</button></div></section>

      <footer className="qsm-footer"><Link className="qsm-brand" href="/"><img src="/assets/sanctificare-logo-v2.webp" alt="" /><span>Sanctificare</span></Link><p>Um apoio para sua vida de oração.</p><small>O Sanctificare é uma iniciativa independente de apoio à vida de oração.</small></footer>
    </main>
  );
}
