import { prisma } from './db';
import { sendEmail } from './email';
import { getSiteSettings } from './settings';

// Generate a random 6-digit verification code
export function generateVerificationCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// Send verification email with code
export async function sendVerificationEmail(email: string, code: string, name: string = ''): Promise<boolean> {
  try {
    const siteSettings = await getSiteSettings()
    const siteName = siteSettings.siteName
    
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>E-posta Doğrulama</title>
      </head>
      <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f5f7fa;">
        <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);">
          <!-- Header -->
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px 20px; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 28px; font-weight: 600;">${siteName}</h1>
            <p style="color: rgba(255, 255, 255, 0.9); margin: 10px 0 0; font-size: 16px;">E-posta Doğrulama</p>
          </div>
          
          <!-- Content -->
          <div style="padding: 40px 30px;">
            <h2 style="color: #333333; margin-top: 0; font-size: 24px; font-weight: 600;">Merhaba${name ? ' ' + name : ''}!</h2>
            
            <p style="color: #666666; font-size: 16px; line-height: 1.6; margin: 20px 0;">
              ${siteName} hesabınızı oluşturduğunuz için teşekkür ederiz. Hesabınızı etkinleştirmek için aşağıdaki 6 haneli doğrulama kodunu girin:
            </p>
            
            <div style="text-align: center; margin: 30px 0;">
              <div style="display: inline-block; background-color: #f0f4ff; border: 2px dashed #667eea; border-radius: 12px; padding: 20px 40px;">
                <span style="font-size: 32px; font-weight: 700; color: #667eea; letter-spacing: 4px;">${code}</span>
              </div>
            </div>
            
            <p style="color: #666666; font-size: 14px; line-height: 1.6; margin: 20px 0;">
              Bu kod 10 dakika boyunca geçerlidir. Eğer bu işlemi siz yapmadıysanız, bu e-postayı görmezden gelebilirsiniz.
            </p>
            
            <div style="background-color: #fff8e6; border-left: 4px solid #ffc107; padding: 15px; border-radius: 8px; margin: 30px 0;">
              <p style="color: #856404; margin: 0; font-size: 14px;">
                <strong>Güvenlik İpucu:</strong> Bu kodu kimseyle paylaşmayın. ${siteName} ekibi asla doğrulama kodu istemez.
              </p>
            </div>
          </div>
          
          <!-- Footer -->
          <div style="background-color: #f8f9fa; padding: 20px 30px; text-align: center; border-top: 1px solid #eeeeee;">
            <p style="color: #999999; font-size: 12px; margin: 0;">
              © ${new Date().getFullYear()} ${siteName}. Tüm hakları saklıdır.
            </p>
            <p style="color: #cccccc; font-size: 11px; margin: 5px 0 0;">
              Bu otomatik bir e-postadır, lütfen yanıtlamayın.
            </p>
          </div>
        </div>
      </body>
      </html>
    `;

    const result = await sendEmail(
      email,
      `${siteName} - E-posta Doğrulama Kodu`,
      html
    );

    // Check if email was sent successfully
    if (result && result.success) {
      console.log(`Verification email successfully sent to ${email} with messageId: ${result.messageId}`);
      return true;
    } else {
      console.error(`Failed to send verification email to ${email}`, result);
      return false;
    }
  } catch (error) {
    console.error('Error sending verification email:', error);
    return false;
  }
}

// Save verification code to database
export async function saveVerificationCode(userId: number, code: string): Promise<void> {
  const expiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes from now
  
  await prisma.user.update({
    where: { id: userId },
    data: {
      emailVerificationToken: code,
      emailVerificationTokenExpiry: expiry
    }
  });
}

// Verify code
export async function verifyCode(userId: number, code: string): Promise<boolean> {
  const user = await prisma.user.findUnique({
    where: { id: userId }
  });

  if (!user || !user.emailVerificationToken || !user.emailVerificationTokenExpiry) {
    return false;
  }

  // Check if code matches and hasn't expired
  if (user.emailVerificationToken === code && user.emailVerificationTokenExpiry > new Date()) {
    // Clear the verification token and mark as verified
    await prisma.user.update({
      where: { id: userId },
      data: {
        emailVerificationToken: null,
        emailVerificationTokenExpiry: null,
        emailVerified: new Date(),
        isVerified: true
      }
    });
    return true;
  }

  return false;
}