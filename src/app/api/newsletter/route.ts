// src/app/api/newsletter/route.ts
import { Resend } from 'resend';
import { NextResponse } from 'next/server';

// DON'T instantiate at module level - moved inside handler below

export async function POST(request: Request) {
  try {
    // Instantiate Resend inside the handler to avoid build-time errors
    const apiKey = process.env.RESEND_API_KEY;
    
    if (!apiKey) {
      console.error('❌ Missing RESEND_API_KEY environment variable');
      return NextResponse.json(
        { error: 'Service de newsletter non configuré' },
        { status: 500 }
      );
    }

    const resend = new Resend(apiKey);

    const { email } = await request.json();

    // Validation de l'email
    if (!email || !email.includes('@')) {
      return NextResponse.json(
        { error: 'Email invalide' },
        { status: 400 }
      );
    }

    console.log('📧 Envoi email à:', email);

    // Envoyer l'email de confirmation
    const { data, error } = await resend.emails.send({
      from: 'Ilma Skin <onboarding@resend.dev>',
      to: email,
      subject: '🎉 Bienvenue chez Ilma Skin !',
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <style>
              body { 
                font-family: Arial, sans-serif; 
                line-height: 1.6; 
                color: #333; 
                margin: 0;
                padding: 0;
              }
              .container { 
                max-width: 600px; 
                margin: 0 auto; 
                background: #ffffff;
              }
              .header { 
                background: linear-gradient(135deg, #ec4899 0%, #a855f7 100%); 
                padding: 40px 20px; 
                text-align: center;
              }
              .header h1 { 
                color: white; 
                margin: 0; 
                font-size: 32px; 
              }
              .content { 
                padding: 40px 30px; 
              }
              .code-box { 
                background: #fce7f3; 
                padding: 20px; 
                text-align: center; 
                border-radius: 8px; 
                margin: 30px 0; 
              }
              .code-box .code { 
                font-size: 28px; 
                color: #ec4899; 
                font-weight: bold;
                letter-spacing: 3px; 
              }
              .benefits { 
                background: #f9fafb; 
                padding: 20px; 
                border-radius: 8px;
                margin: 20px 0;
              }
              .benefits ul { 
                margin: 10px 0; 
                padding-left: 20px; 
              }
              .benefits li { 
                margin: 8px 0; 
              }
              .footer { 
                text-align: center; 
                padding: 20px; 
                color: #6b7280; 
                font-size: 12px; 
              }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>✨ Bienvenue chez Ilma Skin !</h1>
              </div>
              
              <div class="content">
                <p style="font-size: 16px;">Bonjour,</p>
                
                <p style="font-size: 16px;">
                  Merci de vous être inscrit à notre newsletter ! Vous faites désormais partie 
                  de notre communauté exclusive de passionnés de beauté. 💄
                </p>
                
                <p style="font-size: 18px; font-weight: bold; margin-top: 30px;">
                  🎁 Voici votre cadeau de bienvenue :
                </p>
                
                <div class="code-box">
                  <p style="margin: 0; font-size: 14px; color: #6b7280;">
                    Utilisez ce code pour obtenir
                  </p>
                  <p style="margin: 5px 0; font-size: 20px; font-weight: bold; color: #111;">
                    10% DE RÉDUCTION
                  </p>
                  <p style="margin: 0; font-size: 14px; color: #6b7280;">
                    sur votre premier achat
                  </p>
                  <p style="margin-top: 20px;" class="code">WELCOME10</p>
                </div>

                <div class="benefits">
                  <p style="font-weight: bold; margin-top: 0;">
                    🌟 En vous abonnant, vous recevrez :
                  </p>
                  <ul>
                    <li>🎨 Les dernières tendances beauté</li>
                    <li>💄 Des looks exclusifs de nos créateurs</li>
                    <li>🛍️ Accès anticipé aux nouveautés</li>
                    <li>✨ Offres réservées aux abonnés</li>
                  </ul>
                </div>

                <p style="margin-top: 30px;">
                  À très bientôt,<br>
                  <strong>L'équipe Ilma Skin</strong> 💖
                </p>
              </div>
              
              <div class="footer">
                <p>Vous recevez cet email car vous vous êtes inscrit sur ilmaskin.com</p>
                <p>© 2026 Ilma Skin. Tous droits réservés.</p>
              </div>
            </div>
          </body>
        </html>
      `
    });

    if (error) {
      console.error('❌ Erreur Resend:', error);
      return NextResponse.json(
        { error: 'Erreur lors de l\'envoi de l\'email' },
        { status: 500 }
      );
    }

    console.log('✅ Email envoyé avec succès:', data);

    return NextResponse.json(
      { message: '✅ Inscription réussie ! Vérifiez votre boîte mail.' },
      { status: 200 }
    );

  } catch (error: any) {
    console.error('❌ Erreur:', error);
    return NextResponse.json(
      { error: 'Erreur lors de l\'inscription' },
      { status: 500 }
    );
  }
}