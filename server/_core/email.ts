import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

const FROM = "Sanctificare <noreply@rezaroterco.com.br>";

/**
 * Envia e-mail de recuperação de senha com o link de redefinição.
 * Em desenvolvimento (sem RESEND_API_KEY), apenas loga o link no console.
 */
export async function sendPasswordResetEmail(
  toEmail: string,
  toName: string,
  resetLink: string
): Promise<void> {
  if (!process.env.RESEND_API_KEY) {
    console.log(`\n[DEV] Password reset link for ${toEmail}:\n${resetLink}\n`);
    return;
  }

  const html = `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Redefinição de Senha – Sanctificare</title>
</head>
<body style="margin:0;padding:0;background:#0f1117;font-family:'Georgia',serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0f1117;padding:40px 20px;">
    <tr>
      <td align="center">
        <table width="520" cellpadding="0" cellspacing="0" style="background:#181c2a;border-radius:16px;overflow:hidden;border:1px solid #2a2f45;">
          <!-- Header -->
          <tr>
            <td align="center" style="padding:36px 40px 24px;background:linear-gradient(135deg,#181c2a 0%,#1e2340 100%);">
              <img src="https://pub-dc71a0e15f28405db17b1df753564e3c.r2.dev/sanctificare-logo.webp"
                   alt="Sanctificare" width="64" height="64"
                   style="border-radius:50%;border:2px solid rgba(195,160,80,0.4);display:block;margin:0 auto 16px;" />
              <h1 style="margin:0;color:#fff;font-size:22px;letter-spacing:3px;font-family:'Georgia',serif;">SANCTIFICARE</h1>
              <p style="margin:8px 0 0;color:#8891aa;font-size:13px;font-style:italic;">Para maior glória de Deus</p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:32px 40px;">
              <p style="margin:0 0 16px;color:#c8cde0;font-size:15px;line-height:1.7;">
                Olá, <strong style="color:#fff;">${toName}</strong>,
              </p>
              <p style="margin:0 0 24px;color:#c8cde0;font-size:15px;line-height:1.7;">
                Recebemos uma solicitação para redefinir a senha da sua conta no Sanctificare.
                Clique no botão abaixo para criar uma nova senha. O link é válido por <strong style="color:#c8a050;">1 hora</strong>.
              </p>

              <div style="text-align:center;margin:32px 0;">
                <a href="${resetLink}"
                   style="display:inline-block;background:#c8a050;color:#0f1117;text-decoration:none;
                          font-family:'Georgia',serif;font-weight:bold;font-size:15px;letter-spacing:1px;
                          padding:14px 36px;border-radius:50px;box-shadow:0 4px 20px rgba(195,160,80,0.3);">
                  ✝ Redefinir Minha Senha
                </a>
              </div>

              <p style="margin:24px 0 0;color:#6b7290;font-size:13px;line-height:1.6;">
                Se você não solicitou a redefinição de senha, ignore este e-mail com tranquilidade.
                Sua conta permanece segura.
              </p>
              <p style="margin:12px 0 0;color:#6b7290;font-size:12px;word-break:break-all;">
                Link alternativo: <a href="${resetLink}" style="color:#c8a050;">${resetLink}</a>
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding:20px 40px 28px;border-top:1px solid #2a2f45;text-align:center;">
              <p style="margin:0;color:#454d6b;font-size:12px;font-style:italic;">
                "Buscai em primeiro lugar o Reino de Deus e a sua justiça." — Mt 6:33
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

  const { error } = await resend.emails.send({
    from: FROM,
    to: toEmail,
    subject: "Redefinição de Senha – Sanctificare",
    html,
  });

  if (error) {
    console.error("[Email] Failed to send password reset email:", error);
    throw new Error("Falha ao enviar o e-mail. Tente novamente.");
  }
}
