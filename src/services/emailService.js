const nodemailer = require('nodemailer');

// 1. Configuración del transportador con credenciales codificadas
// Usamos el servicio 'gmail' y las credenciales directas.
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        // CREDENCIALES CODIFICADAS DIRECTAMENTE (PARA LA ESCUELA)
        user: 'folium.cut@gmail.com',
        // ¡IMPORTANTE! Se eliminaron los espacios de la contraseña
        pass: 'qqfqrbczugigeaia' 
    }
});

// 2. Función principal de envío
const sendWelcomeEmail = async (userEmail, userName) => {
    const senderEmail = 'folium.cut@gmail.com';

    const mailOptions = {
    from: senderEmail, // Correo del remitente (el mismo de la autenticación)
    to: userEmail,                // Correo del destinatario
    subject: '¡Bienvenido a la comunidad Folium! 🌱 Tu viaje verde comienza aquí',
html: `
    <table width="100%" bgcolor="#F9F9F9" cellpadding="0" cellspacing="0" border="0" style="font-family: 'Arial', sans-serif;">
        <tr>
            <td style="padding: 20px 0;" align="center">
                <table width="600" cellpadding="0" cellspacing="0" border="0" style="border-collapse: collapse; background-color: white; border: 1px solid #EEEEEE; border-radius: 4px; overflow: hidden;">
                    
                    <tr>
                        <td align="left" style="background-color: #111111; padding: 25px 40px; border-bottom: 1px solid #DDDDDD;">
                            <h1 style="color: white; margin: 0; font-size: 28px; 
                                       font-weight: 300; 
                                       letter-spacing: 3px; 
                                       font-family: Georgia, serif;"> 
                                FOLIUM
                            </h1>
                        </td>
                    </tr>
                    
                    <tr>
                        <td style="padding: 35px 40px; color: #333333; font-size: 15px; line-height: 1.7;">
                            
                            <h2 style="color: #111111; margin-top: 0; font-size: 20px; font-weight: 400;">
                                Bienvenid@ a Folium, ${userName}
                            </h2>
                            
                            <p style="margin-bottom: 30px; font-weight: 300;">
                                Tu registro ha sido completado con éxito. Ahora formas parte de nuestra comunidad enfocada en dar y recibir plantas con elegancia y simplicidad.
                            </p>

                            <h3 style="color: #111111; font-size: 17px; border-bottom: 1px solid #DDDDDD; padding-bottom: 5px; margin-top: 30px; font-weight: 400;">
                                Proceso de Intercambio:
                            </h3>
                            
                            <ol style="padding-left: 20px; color: #555555; font-weight: 300;">
                                <li style="margin-bottom: 15px;">
                                    <strong style="color: #333333; font-weight: 500;">Para Donar:</strong>
                                    Inicia sesión y publica tu planta con una fotografía de alta calidad. Define los detalles y publícala en la galería.
                                </li>
                                <li style="margin-bottom: 15px;">
                                    <strong style="color: #333333; font-weight: 500;">Para Adoptar:</strong>
                                    Explora la galería y, al encontrar una planta de tu interés, envía una solicitud formal al donador.
                                </li>
                            </ol>
                            
                            <table align="center" border="0" cellpadding="0" cellspacing="0" width="100%" style="margin: 30px 0;">
                                <tr>
                                    <td align="center">
                                        <a href="https://www.instagram.com/foliumcut?igsh=MnM5cXBycDJ4dTlm&utm_source=qr" target="_blank" style="background-color: #111111; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; font-weight: 400; font-size: 14px; display: inline-block; letter-spacing: 1px;">
                                            Síguenos en Instagram
                                        </a>
                                    </td>
                                </tr>
                            </table>

                            <p style="margin-top: 30px; border-top: 1px solid #EEEEEE; padding-top: 20px; color: #666666; font-size: 14px; font-weight: 300;">
                                Si tienes alguna consulta, por favor, no dudes en contactar a nuestro equipo de soporte.
                            </p>
                            
                            <p style="color: #333333; margin-top: 20px; font-weight: 400;">
                                Atentamente,<br>
                                El Equipo Folium
                            </p>
                        </td>
                    </tr>
                    
                    <tr>
                        <td align="center" style="background-color: #111111; padding: 15px 40px; color: #AAAAAA; font-size: 11px; font-weight: 300;">
                            © ${new Date().getFullYear()} Folium | Todos los derechos reservados.
                        </td>
                    </tr>
                    
                </table>
                </td>
        </tr>
    </table>
`
};

    try {
        await transporter.sendMail(mailOptions);
        console.log(`[EMAIL] Correo de bienvenida enviado a: ${userEmail}`);
    } catch (error) {
        console.error(`[EMAIL ERROR] Fallo al enviar correo a ${userEmail}:`, error);
        // Si el error persiste con el código EAUTH, significa que 
        // la Contraseña de Aplicación ('qqfqrbczugigeaia') es incorrecta 
        // o fue revocada por Google.
    }
};

module.exports = { sendWelcomeEmail };