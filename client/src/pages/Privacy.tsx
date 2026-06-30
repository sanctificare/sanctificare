import { Link } from "wouter";
import { ArrowLeft, Shield, Mail, Globe } from "lucide-react";
import { useEffect } from "react";

export default function Privacy() {
  // Garantir que a página inicie no topo
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-[oklch(0.98_0.005_85)] text-[oklch(0.12_0.02_260)] font-serif antialiased pb-16">
      {/* Top Header Navigation */}
      <header className="sticky top-0 z-50 bg-[oklch(0.22_0.07_260)] text-[oklch(0.96_0.015_85)] shadow-md border-b border-[oklch(0.75_0.12_75)/0.2]">
        <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/">
            <a className="inline-flex items-center gap-2 text-sm font-sans font-semibold text-[oklch(0.96_0.015_85)] hover:text-[oklch(0.75_0.12_75)] transition-colors cursor-pointer">
              <ArrowLeft className="w-4 h-4" />
              <span>Voltar para o Início</span>
            </a>
          </Link>

          <div className="flex items-center gap-2">
            <img
              src="/assets/logo-sanctificare.webp"
              alt="Sanctificare Logo"
              className="w-8 h-8 rounded-full border border-[oklch(0.75_0.12_75)]"
              onError={(e) => {
                // Fallback caso a imagem não exista
                e.currentTarget.style.display = "none";
              }}
            />
            <span className="font-display font-semibold tracking-wider text-[oklch(0.75_0.12_75)] text-lg">
              Sanctificare
            </span>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-3xl mx-auto px-4 mt-12">
        {/* Banner Card */}
        <div className="bg-gradient-to-br from-[oklch(0.22_0.07_260)] to-[oklch(0.15_0.05_265)] text-white p-8 rounded-2xl shadow-xl mb-10 border border-[oklch(0.75_0.12_75)/0.3] relative overflow-hidden">
          <div className="absolute top-0 right-0 translate-x-8 -translate-y-8 opacity-5">
            <Shield className="w-64 h-64" />
          </div>
          
          <div className="relative z-10 flex flex-col md:flex-row items-center gap-6">
            <div className="bg-[oklch(0.75_0.12_75)] p-4 rounded-full text-[oklch(0.15_0.05_265)] shadow-lg">
              <Shield className="w-10 h-10" />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-display font-bold text-[oklch(0.75_0.12_75)] tracking-wide mb-2">
                Política de Privacidade
              </h1>
              <p className="text-sm font-sans text-slate-300">
                Última atualização: Junho de 2026 • Versão 1.0
              </p>
            </div>
          </div>
        </div>

        {/* Content Details */}
        <div className="bg-white/90 backdrop-blur-sm border border-[oklch(0.88_0.01_260)] rounded-2xl p-6 md:p-10 shadow-md space-y-8 leading-relaxed text-slate-800">
          <p className="text-lg text-slate-700 italic border-l-4 border-[oklch(0.75_0.12_75)] pl-4">
            O Sanctificare respeita sua privacidade e está comprometido em proteger seus dados pessoais. Esta Política de Privacidade explica como coletamos, utilizamos, armazenamos e protegemos suas informações quando você utiliza nosso aplicativo, nosso website e demais serviços relacionados.
          </p>

          <p className="text-slate-700">
            Ao utilizar o Sanctificare, você concorda com as práticas descritas nesta Política.
          </p>

          <hr className="border-t border-slate-200" />

          {/* Section 1 */}
          <section className="space-y-3">
            <h2 className="text-2xl font-display font-semibold text-[oklch(0.22_0.07_260)] flex items-center gap-2">
              <span className="text-[oklch(0.75_0.12_75)]">1.</span> Quem somos
            </h2>
            <p>
              O Sanctificare é uma plataforma digital destinada ao crescimento espiritual cristão, oferecendo recursos como jornadas de santificação, orações, estudos bíblicos, conteúdos personalizados e ferramentas baseadas em inteligência artificial para auxiliar na vida espiritual.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 pt-2 text-sm font-sans">
              <a 
                href="https://sanctificare.app" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="inline-flex items-center gap-2 text-[oklch(0.22_0.07_260)] hover:text-[oklch(0.75_0.12_75)] transition-colors"
              >
                <Globe className="w-4 h-4" />
                <span>https://sanctificare.app</span>
              </a>
              <a 
                href="mailto:contato@sanctificare.app" 
                className="inline-flex items-center gap-2 text-[oklch(0.22_0.07_260)] hover:text-[oklch(0.75_0.12_75)] transition-colors"
              >
                <Mail className="w-4 h-4" />
                <span>contato@sanctificare.app</span>
              </a>
            </div>
          </section>

          {/* Section 2 */}
          <section className="space-y-4">
            <h2 className="text-2xl font-display font-semibold text-[oklch(0.22_0.07_260)] flex items-center gap-2">
              <span className="text-[oklch(0.75_0.12_75)]">2.</span> Quais informações coletamos
            </h2>
            <p>
              Dependendo da forma como você utiliza o aplicativo, poderemos coletar:
            </p>
            
            <div className="space-y-3 pl-4 border-l-2 border-slate-100">
              <h3 className="text-lg font-bold text-slate-800">Informações fornecidas por você</h3>
              <ul className="list-disc list-inside space-y-1 pl-2 text-slate-700">
                <li>Nome;</li>
                <li>Endereço de e-mail;</li>
                <li>Foto de perfil (quando disponível);</li>
                <li>Idioma;</li>
                <li>Preferências de uso;</li>
                <li>Informações fornecidas durante o cadastro.</li>
              </ul>
            </div>

            <div className="space-y-3 pl-4 border-l-2 border-slate-100">
              <h3 className="text-lg font-bold text-slate-800">Conteúdo criado pelo usuário</h3>
              <p className="text-slate-700">
                Quando você utiliza recursos como:
              </p>
              <ul className="list-disc list-inside space-y-1 pl-2 text-slate-700">
                <li>Pedidos de oração;</li>
                <li>Diário espiritual;</li>
                <li>Metas espirituais;</li>
                <li>Perguntas feitas ao assistente de IA;</li>
                <li>Anotações pessoais.</li>
              </ul>
              <p className="text-sm text-slate-500 italic">
                Esses conteúdos poderão ser armazenados para possibilitar o funcionamento do serviço.
              </p>
            </div>

            <div className="space-y-3 pl-4 border-l-2 border-slate-100">
              <h3 className="text-lg font-bold text-slate-800">Informações coletadas automaticamente</h3>
              <ul className="list-disc list-inside space-y-1 pl-2 text-slate-700">
                <li>Modelo do dispositivo;</li>
                <li>Sistema operacional;</li>
                <li>Identificadores do dispositivo;</li>
                <li>Endereço IP;</li>
                <li>Informações sobre falhas (crash reports);</li>
                <li>Registros de acesso;</li>
                <li>Estatísticas de utilização;</li>
                <li>Informações sobre desempenho do aplicativo.</li>
              </ul>
            </div>
          </section>

          {/* Section 3 */}
          <section className="space-y-3">
            <h2 className="text-2xl font-display font-semibold text-[oklch(0.22_0.07_260)] flex items-center gap-2">
              <span className="text-[oklch(0.75_0.12_75)]">3.</span> Como utilizamos seus dados
            </h2>
            <p>
              Utilizamos suas informações para:
            </p>
            <ul className="list-disc list-inside space-y-1 pl-4 text-slate-700">
              <li>Criar e manter sua conta;</li>
              <li>Fornecer conteúdos personalizados;</li>
              <li>Gerar recomendações espirituais;</li>
              <li>Oferecer respostas por meio da inteligência artificial;</li>
              <li>Sincronizar seus dados entre dispositivos;</li>
              <li>Melhorar nossos serviços e corrigir erros;</li>
              <li>Enviar notificações quando autorizadas;</li>
              <li>Prestar suporte técnico;</li>
              <li>Cumprir obrigações legais.</li>
            </ul>
            <p className="font-semibold text-[oklch(0.22_0.07_260)] bg-[oklch(0.75_0.12_75)/0.1] p-3 rounded-lg border border-[oklch(0.75_0.12_75)/0.2] mt-4">
              Jamais utilizamos seus dados para vender informações pessoais a terceiros.
            </p>
          </section>

          {/* Section 4 */}
          <section className="space-y-3">
            <h2 className="text-2xl font-display font-semibold text-[oklch(0.22_0.07_260)] flex items-center gap-2">
              <span className="text-[oklch(0.75_0.12_75)]">4.</span> Inteligência Artificial
            </h2>
            <p>
              Alguns recursos do Sanctificare utilizam inteligência artificial para gerar respostas, sugestões, planos espirituais e conteúdos personalizados.
            </p>
            <p>
              As informações enviadas para esses recursos poderão ser processadas por provedores de IA contratados pelo Sanctificare exclusivamente para fornecer essas funcionalidades.
            </p>
            <p className="text-amber-700 font-sans text-sm bg-amber-50 p-3 rounded-lg border border-amber-200">
              <strong>Atenção:</strong> Recomendamos que você não compartilhe informações extremamente sensíveis ou dados pessoais confidenciais durante essas interações com a Inteligência Artificial.
            </p>
          </section>

          {/* Section 5 */}
          <section className="space-y-3">
            <h2 className="text-2xl font-display font-semibold text-[oklch(0.22_0.07_260)] flex items-center gap-2">
              <span className="text-[oklch(0.75_0.12_75)]">5.</span> Compartilhamento de dados
            </h2>
            <p>
              Podemos compartilhar informações apenas quando necessário com:
            </p>
            <ul className="list-disc list-inside space-y-1 pl-4 text-slate-700">
              <li>Provedores de hospedagem na nuvem;</li>
              <li>Serviços de autenticação;</li>
              <li>Provedores de processamento de pagamento;</li>
              <li>Serviços de análise de desempenho e logs;</li>
              <li>Provedores de serviços de inteligência artificial;</li>
              <li>Autoridades públicas quando exigido por leis vigentes.</li>
            </ul>
            <p className="text-slate-700">
              Nenhuma informação é compartilhada para fins de marketing ou comerciais externos. Não comercializamos seus dados pessoais.
            </p>
          </section>

          {/* Section 6 */}
          <section className="space-y-3">
            <h2 className="text-2xl font-display font-semibold text-[oklch(0.22_0.07_260)] flex items-center gap-2">
              <span className="text-[oklch(0.75_0.12_75)]">6.</span> Compras e assinaturas
            </h2>
            <p>
              Caso você adquira uma assinatura Premium, os pagamentos serão inteiramente processados pela loja oficial de aplicativos (Google Play Store no Android ou Apple App Store no iOS).
            </p>
            <p>
              O Sanctificare não armazena e não tem acesso às informações completas de cartões de crédito ou outros dados de pagamento direto utilizados nessas plataformas parceiras.
            </p>
          </section>

          {/* Section 7 */}
          <section className="space-y-3">
            <h2 className="text-2xl font-display font-semibold text-[oklch(0.22_0.07_260)] flex items-center gap-2">
              <span className="text-[oklch(0.75_0.12_75)]">7.</span> Cookies e tecnologias semelhantes
            </h2>
            <p>
              Nosso website poderá utilizar cookies para melhorar sua experiência de navegação, manter sua sessão autenticada, analisar métricas gerais de acesso e lembrar suas preferências (como a escolha de template visual).
            </p>
            <p>
              Você poderá controlar, limitar ou desabilitar o uso de cookies diretamente nas configurações do seu respectivo navegador de internet.
            </p>
          </section>

          {/* Section 8 */}
          <section className="space-y-3">
            <h2 className="text-2xl font-display font-semibold text-[oklch(0.22_0.07_260)] flex items-center gap-2">
              <span className="text-[oklch(0.75_0.12_75)]">8.</span> Segurança
            </h2>
            <p>
              Adotamos rígidas medidas técnicas e organizacionais para proteger suas informações contra acesso não autorizado, alteração, divulgação, destruição ou perda acidental de dados.
            </p>
            <p>
              Contudo, embora utilizemos práticas modernas de criptografia e segurança da informação, é importante lembrar que nenhum sistema digital de armazenamento ou transmissão de rede é completamente imune a falhas ou riscos de segurança.
            </p>
          </section>

          {/* Section 9 */}
          <section id="exclusao-dados" className="space-y-3">
            <h2 className="text-2xl font-display font-semibold text-[oklch(0.22_0.07_260)] flex items-center gap-2">
              <span className="text-[oklch(0.75_0.12_75)]">9.</span> Retenção dos dados
            </h2>
            <p>
              Seus dados pessoais e registros espirituais serão mantidos ativos em nosso sistema enquanto sua conta de usuário permanecer ativa, ou pelo tempo estritamente necessário para prestar nossos serviços, cumprir obrigações regulatórias, fiscais e legais, resolver eventuais disputas ou fazer cumprir nossos contratos de adesão.
            </p>
            <p className="font-sans text-sm text-[oklch(0.22_0.07_260)] bg-slate-50 p-3 rounded-lg border border-slate-200">
              Você poderá solicitar a <strong>exclusão completa da sua conta e de todos os seus dados pessoais associados</strong> a qualquer momento, diretamente por meio das configurações de Perfil no aplicativo ou entrando em contato por e-mail.
            </p>
          </section>

          {/* Section 10 */}
          <section className="space-y-3">
            <h2 className="text-2xl font-display font-semibold text-[oklch(0.22_0.07_260)] flex items-center gap-2">
              <span className="text-[oklch(0.75_0.12_75)]">10.</span> Seus direitos
            </h2>
            <p>
              Dependendo da legislação aplicável do seu país ou estado (como a LGPD no Brasil), você poderá solicitar os seguintes direitos em relação aos seus dados pessoais:
            </p>
            <ul className="list-disc list-inside space-y-1 pl-4 text-slate-700">
              <li>Acesso aos seus dados sob nosso tratamento;</li>
              <li>Correção de informações desatualizadas ou incompletas;</li>
              <li>Exclusão completa ou bloqueio de dados;</li>
              <li>Portabilidade das informações para outro serviço similar;</li>
              <li>Revogação de consentimentos concedidos anteriormente.</li>
            </ul>
            <p>
              Para exercer qualquer um destes direitos, basta nos enviar um e-mail descrevendo sua solicitação para o endereço informado nesta política.
            </p>
          </section>

          {/* Section 11 */}
          <section className="space-y-3">
            <h2 className="text-2xl font-display font-semibold text-[oklch(0.22_0.07_260)] flex items-center gap-2">
              <span className="text-[oklch(0.75_0.12_75)]">11.</span> Privacidade de crianças
            </h2>
            <p>
              O Sanctificare não busca nem realiza intencionalmente a coleta de dados pessoais de crianças sem a devida autorização ou consentimento dos pais ou responsáveis legais, em conformidade com as legislações vigentes de proteção ao menor.
            </p>
            <p>
              Caso tenhamos conhecimento de que dados de crianças foram coletados sem consentimento, tomaremos medidas imediatas para remover essas informações permanentemente de nossos servidores.
            </p>
          </section>

          {/* Section 12 */}
          <section className="space-y-3">
            <h2 className="text-2xl font-display font-semibold text-[oklch(0.22_0.07_260)] flex items-center gap-2">
              <span className="text-[oklch(0.75_0.12_75)]">12.</span> Links para terceiros
            </h2>
            <p>
              Nosso aplicativo poderá conter conexões ou links para websites externos de comunidades, paróquias ou recursos litúrgicos externos.
            </p>
            <p>
              Não nos responsabilizamos pela prática de segurança de dados ou pelas políticas de privacidade de serviços de terceiros. Recomendamos que você leia atentamente os termos de cada site parceiro antes de utilizá-los.
            </p>
          </section>

          {/* Section 13 */}
          <section className="space-y-3">
            <h2 className="text-2xl font-display font-semibold text-[oklch(0.22_0.07_260)] flex items-center gap-2">
              <span className="text-[oklch(0.75_0.12_75)]">13.</span> Alterações desta Política
            </h2>
            <p>
              Esta Política poderá ser atualizada periodicamente para refletir mudanças em nossos serviços, avanços tecnológicos ou atualizações regulatórias.
            </p>
            <p>
              Quando houver alterações relevantes, notificaremos os usuários por meio do próprio aplicativo ou publicando um aviso em destaque no nosso site principal. A versão mais recente e válida estará sempre disponível publicamente em:
            </p>
            <p className="font-sans text-sm text-[oklch(0.22_0.07_260)] font-semibold">
              https://sanctificare.app/privacidade
            </p>
          </section>

          {/* Section 14 */}
          <section className="space-y-4">
            <h2 className="text-2xl font-display font-semibold text-[oklch(0.22_0.07_260)] flex items-center gap-2">
              <span className="text-[oklch(0.75_0.12_75)]">14.</span> Contato
            </h2>
            <p>
              Em caso de dúvidas, esclarecimentos ou requisições sobre esta Política de Privacidade ou sobre o tratamento de seus dados pessoais pelo Sanctificare, entre em contato através de:
            </p>
            <div className="bg-[oklch(0.98_0.005_85)] p-4 rounded-xl border border-slate-200 space-y-2 text-sm font-sans">
              <p className="font-serif text-base font-bold text-[oklch(0.22_0.07_260)]">Sanctificare App</p>
              <p className="flex items-center gap-2 text-slate-700">
                <Globe className="w-4 h-4 text-[oklch(0.75_0.12_75)]" />
                <span>Website: <a href="https://sanctificare.app" target="_blank" rel="noopener noreferrer" className="underline hover:text-[oklch(0.22_0.07_260)]">https://sanctificare.app</a></span>
              </p>
              <p className="flex items-center gap-2 text-slate-700">
                <Mail className="w-4 h-4 text-[oklch(0.75_0.12_75)]" />
                <span>E-mail: <a href="mailto:contato@sanctificare.app" className="underline hover:text-[oklch(0.22_0.07_260)]">contato@sanctificare.app</a></span>
              </p>
            </div>
          </section>

          <hr className="border-t border-slate-200" />

          <p className="text-center text-sm text-slate-500 font-sans italic pt-4">
            Ao utilizar o Sanctificare, você declara que leu e compreendeu integralmente esta Política de Privacidade.
          </p>
        </div>

        {/* Back Button Footer */}
        <div className="mt-8 text-center">
          <Link href="/">
            <a className="inline-flex items-center gap-2 px-6 py-2.5 bg-[oklch(0.22_0.07_260)] text-[oklch(0.96_0.015_85)] hover:bg-[oklch(0.15_0.05_265)] hover:text-white rounded-lg shadow-md hover:shadow-lg transition-all text-sm font-sans font-semibold cursor-pointer">
              <ArrowLeft className="w-4 h-4" />
              <span>Voltar para a Página Inicial</span>
            </a>
          </Link>
        </div>
      </main>
    </div>
  );
}
