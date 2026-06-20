# Sanctificare — TODO

## Fase 1: Schema e estrutura base
- [x] Criar schema do banco: subscriptions, prayers, prayer_intentions, prayer_logs
- [x] Executar migração SQL
- [x] Criar helpers de DB para cada entidade
- [x] Criar routers tRPC para cada funcionalidade

## Fase 2: Assets visuais
- [x] Gerar logo/ícone do app (cruz estilizada)
- [x] Gerar imagem hero da landing page
- [x] Definir paleta de cores e tipografia católica

## Fase 3: Layout global e Landing Page
- [x] Configurar tema global (cores, fontes, CSS variables)
- [x] Criar componente de navegação principal (Navbar)
- [x] Criar Footer com links e identidade visual
- [x] Construir Landing Page com hero, features, CTA e planos
- [x] Criar rota /dashboard (app autenticado) com acesso rápido

## Fase 4: Orações Diárias
- [x] Página de orações com lista de orações disponíveis
- [x] Rosário guiado interativo (mistérios, Ave Marias, contagem)
- [x] Angelus com texto completo
- [x] Pai Nosso, Ave Maria, Glória, Credo e outras orações tradicionais
- [x] Registro de oração realizada no histórico

## Fase 5: Liturgia do Dia e Bíblia
- [x] Liturgia do Dia com leituras e evangelho
- [x] Bíblia Sagrada com navegação por livros, capítulos e versículos
- [x] Versículos famosos por livro

## Fase 6: Mural de Intenções
- [x] Página do mural de intenções da comunidade
- [x] Publicar intenção de oração (usuários autenticados)
- [x] Orar por uma intenção (contador de orações)

## Fase 7: Perfil, Histórico e Freemium
- [x] Página de perfil do usuário
- [x] Histórico de orações realizadas com estatísticas
- [x] Sistema freemium: conteúdo gratuito vs premium
- [x] Página de planos (mensal/anual)
- [x] Painel de assinatura e gerenciamento de conta
- [x] Conteúdo premium: novenas, meditações

## Fase 8: Testes e entrega
- [x] Escrever testes Vitest para routers principais (15 testes passando)
- [x] Revisar responsividade mobile
- [x] Checkpoint final e entrega


## Fase 9: Seletor de Templates
- [x] Adicionar coluna de template_preference na tabela users
- [x] Criar 4 templates com estilos diferentes (Clássico, Moderno, Tradicional, Minimalista)
- [x] Criar componente TemplateSelector com preview dos temas
- [x] Integrar seletor na página de personalização (/temas)
- [x] Integrar seletor no menu do usuário (AppNav)
- [x] Implementar sistema dinâmico de CSS variables por template
- [x] Testes do seletor de templates (15 testes passando)
- [x] Checkpoint final com templates


## Fase 10: Áudio Guiado para Rosário
- [x] Gerar áudios de narração e meditações para cada mistério (7 faixas)
- [x] Criar componente AudioPlayer com controles de reprodução
- [x] Integrar áudio na página RosaryGuided com botão toggle
- [x] Adicionar sincronização entre áudio e passos do Rosário
- [x] Testes de áudio e reprodução (30 testes passando, incluindo 10 novos testes de áudio)
- [x] Checkpoint final com áudio do Rosário
