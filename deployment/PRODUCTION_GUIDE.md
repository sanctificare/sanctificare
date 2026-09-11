# Sanctificare - Guia de Operação e Checklist de Produção

Este guia consolida os procedimentos operacionais para implantação, monitoramento, backup e recuperação de desastres do aplicativo **Sanctificare**.

---

## 1. Arquitetura da Infraestrutura em Produção

```
[ Usuários / Mobile App ]
           │
           ▼
[ Cloudflare / DNS & DDoS ]
           │
           ▼
   [ Nginx (Porta 443) ]
     ├─► /assets/*           ──► Filesystem local (/dist/public/assets) [Cache 1 ano]
     ├─► /blog/*             ──► PHP 8.2-FPM (/var/www/wordpress) [Uploads/XML-RPC bloqueados]
     └─► / e /api/* (Proxy)  ──► Node.js via PM2 (127.0.0.1:3000)
                                      │
                                      ▼
                              [ PostgreSQL 16+ ]
```

---

## 2. Monitoramento e Saúde do Sistema

### 2.1 Endpoint de Health Check
O backend disponibiliza verificação ativa da aplicação e do pool do banco de dados:
```bash
curl -i http://127.0.0.1:3000/health
# Ou externamente:
curl -i https://sanctificare.app/health
```
Resposta esperada (HTTP 200):
```json
{
  "status": "healthy",
  "timestamp": "2026-09-11T22:30:00.000Z",
  "database": "connected",
  "uptime": 8421.32
}
```

### 2.2 Gerenciamento com PM2
O processo do servidor é mantido pelo PM2 conforme o arquivo [ecosystem.config.cjs](../ecosystem.config.cjs):
- **Verificar status:** `pm2 status`
- **Verificar logs em tempo real:** `pm2 logs sanctificare-backend --lines 100`
- **Dashboard de CPU/Memória:** `pm2 monit`
- **Recarga sem queda (Zero-downtime):**
  ```bash
  pm2 reload ecosystem.config.cjs --update-env
  ```

### 2.3 Rotação de Logs do PM2
Para evitar que arquivos de log saturem o disco da VPS, garanta que o módulo de rotação esteja instalado:
```bash
pm2 install pm2-logrotate
pm2 set pm2-logrotate:max_size 50M
pm2 set pm2-logrotate:retain 10
pm2 set pm2-logrotate:compress true
```

---

## 3. Política de Backup e Restauração do Banco de Dados

### 3.1 Script de Backup Automatizado (Cron)
Crie o script em `/usr/local/bin/backup-sanctificare.sh`:
```bash
#!/bin/bash
set -e

BACKUP_DIR="/var/backups/sanctificare"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
FILENAME="$BACKUP_DIR/sanctificare_$TIMESTAMP.dump"

mkdir -p "$BACKUP_DIR"

# Realiza dump comprimido do PostgreSQL
pg_dump -U postgres -d sanctificare -F c -b -v -f "$FILENAME"

# Exclui backups com mais de 14 dias
find "$BACKUP_DIR" -name "sanctificare_*.dump" -mtime +14 -delete

echo "[$(date)] Backup concluído com sucesso: $FILENAME"
```

Tornar executável e agendar via cron (`crontab -e`):
```cron
# Backup diário às 03:00 da madrugada
0 3 * * * /usr/local/bin/backup-sanctificare.sh >> /var/log/backup-sanctificare.log 2>&1
```

### 3.2 Procedimento de Restauração (Restore)
Em caso de necessidade de restauração de desastre:
```bash
# 1. Parar a aplicação temporariamente
pm2 stop sanctificare-backend

# 2. Restaurar dump no banco
pg_restore -U postgres -d sanctificare --clean --if-exists -v /var/backups/sanctificare/sanctificare_YYYYMMDD_HHMMSS.dump

# 3. Reiniciar a aplicação
pm2 start ecosystem.config.cjs --update-env
```

---

## 4. Pipeline de CI/CD e Procedimento de Rollback

### 4.1 Funcionamento do GitHub Actions
O workflow `.github/workflows/deploy.yml` executa em duas etapas estritas:
1. **Etapa de Validação (CI):** Roda em container isolado no GitHub (`pnpm check` e `pnpm build`). Se houver qualquer erro de tipagem ou empacotamento, o deploy é abortado imediatamente e o servidor de produção sequer é acessado.
2. **Etapa de Deploy (VPS):**
   - Conecta via SSH;
   - Salva o commit anterior (`PREV_COMMIT`);
   - Realiza `git pull`, `pnpm install --frozen-lockfile` e `pnpm build`;
   - Executa `pm2 reload ecosystem.config.cjs --update-env`;
   - Executa 6 tentativas de health check no endpoint `http://127.0.0.1:3000/health`. Se falhar, executa **rollback automático** restaurando o commit anterior.

### 4.2 Rollback Manual de Emergência
Caso ocorra algum problema funcional não detectado automaticamente:
```bash
cd /var/www/sanctificare # ou pasta configurada em APP_DIR

# 1. Identificar o commit estável anterior
git log --oneline -n 5

# 2. Reverter para a versão desejada
git checkout <HASH_DO_COMMIT_ANTERIOR>

# 3. Recompilar e reiniciar
pnpm build
pm2 reload ecosystem.config.cjs --update-env

# 4. Confirmar que o serviço está online
curl -f http://127.0.0.1:3000/health
```

---

## 5. Checklist Pré-Lançamento (Go-Live Checklist)

- [x] **Segredos e Credenciais:** Nenhum script com credenciais em texto puro no repositório.
- [x] **Segurança TLS:** Bypasses de rejeição de certificado SSL (`NODE_TLS_REJECT_UNAUTHORIZED`) desativados.
- [x] **Autenticação:** Hashing de senhas seguro e assíncrono com PBKDF2 (liberando a thread principal do Node).
- [x] **Controle de Acesso:** Rotas administrativas no tRPC protegidas por validação rígida de papel (`role === 'admin'`).
- [x] **Resiliência do Servidor:** Graceful shutdown implementado com liberação correta de conexões do pool de banco de dados.
- [x] **Tratamento de Erros:** Erros globais não tratados (`uncaughtException`, `unhandledRejection`) são logados sem derrubar o processo de forma desgovernada.
- [x] **Proteção do WordPress:** Nginx bloqueia explicitamente a execução de scripts em uploads e mitiga ataques ao XML-RPC.
- [x] **Otimização de Frontend:** Bundles pesados (Admin, Recharts, telas secundárias) isolados em *lazy chunks*.
- [x] **Eficiência de Rede Móvel:** Sincronização de snapshot em background otimizada com debounce e intervalo ocioso ampliado.
- [x] **CI/CD Automatizado:** Pipeline com teste prévio de compilação e teste pós-deploy com verificação de saúde.
