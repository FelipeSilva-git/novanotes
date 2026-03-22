import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: Number(process.env.SMTP_PORT) || 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export async function sendVerificationEmail(to, username, code) {
  const from = process.env.SMTP_FROM || `NovaNotes <${process.env.SMTP_USER}>`;

  await transporter.sendMail({
    from,
    to,
    subject: 'Seu código de verificação — NovaNotes',
    html: `
<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"></head>
<body style="margin:0;padding:0;background:#0f0f1a;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <div style="max-width:480px;margin:40px auto;background:#1e1e3a;border-radius:16px;border:1px solid rgba(108,99,255,0.25);overflow:hidden;">

    <!-- Header -->
    <div style="padding:28px 32px;background:linear-gradient(135deg,rgba(108,99,255,0.2),rgba(0,212,255,0.1));border-bottom:1px solid rgba(108,99,255,0.2);text-align:center;">
      <div style="display:inline-flex;align-items:center;gap:10px;">
        <div style="width:36px;height:36px;background:linear-gradient(135deg,#6c63ff,#00d4ff);border-radius:10px;display:flex;align-items:center;justify-content:center;">
          <span style="color:#fff;font-size:18px;">✦</span>
        </div>
        <span style="font-size:20px;font-weight:800;background:linear-gradient(135deg,#6c63ff,#00d4ff);-webkit-background-clip:text;-webkit-text-fill-color:transparent;">NovaNotes</span>
      </div>
    </div>

    <!-- Body -->
    <div style="padding:32px;">
      <p style="color:#9090b8;font-size:14px;margin:0 0 6px;">Olá, <strong style="color:#e8e8ff;">${username}</strong></p>
      <h2 style="color:#e8e8ff;font-size:20px;font-weight:700;margin:0 0 20px;">Verifique seu email</h2>
      <p style="color:#9090b8;font-size:14px;line-height:1.6;margin:0 0 28px;">
        Use o código abaixo para confirmar seu endereço de email e ativar sua conta. O código expira em <strong style="color:#e8e8ff;">15 minutos</strong>.
      </p>

      <!-- Code -->
      <div style="text-align:center;margin:0 0 28px;">
        <div style="display:inline-block;background:#0f0f1a;border:2px solid rgba(108,99,255,0.5);border-radius:14px;padding:18px 36px;box-shadow:0 0 30px rgba(108,99,255,0.2);">
          <span style="font-size:38px;font-weight:800;letter-spacing:10px;color:#6c63ff;font-family:monospace;">${code}</span>
        </div>
      </div>

      <p style="color:#9090b8;font-size:12px;line-height:1.6;margin:0;">
        Se você não criou uma conta no NovaNotes, ignore este email com segurança.
      </p>
    </div>

    <!-- Footer -->
    <div style="padding:16px 32px;border-top:1px solid rgba(108,99,255,0.15);text-align:center;">
      <p style="color:#9090b8;font-size:11px;margin:0;opacity:0.6;">NovaNotes — sua área de notas pessoal</p>
    </div>

  </div>
</body>
</html>`,
  });
}
