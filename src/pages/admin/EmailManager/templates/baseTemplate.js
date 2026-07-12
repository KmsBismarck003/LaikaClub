export const getBaseTemplate = (content, title = 'LAIKA CLUB') => {
  return `
    <!DOCTYPE html>
    <html lang="es">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${title}</title>
    </head>
    <body style="margin: 0; padding: 0; background-color: #f4f4f4; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; color: #333;">
      <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #f4f4f4; padding: 40px 0;">
        <tr>
          <td align="center">
            <table width="600" cellpadding="0" cellspacing="0" border="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 15px rgba(0,0,0,0.05);">
              <!-- Header -->
              <tr>
                <td style="background-color: #000000; padding: 40px 30px; text-align: center;">
                  <h1 style="color: #ffffff; margin: 0; font-size: 28px; letter-spacing: 4px; text-transform: uppercase; font-weight: 900;">LAIKA CLUB</h1>
                </td>
              </tr>
              <!-- Body -->
              <tr>
                <td style="padding: 40px 40px; font-size: 16px; line-height: 1.6; color: #333;">
                  ${content}
                </td>
              </tr>
              <!-- Footer -->
              <tr>
                <td style="background-color: #111111; padding: 30px; text-align: center; color: #666666; font-size: 12px; line-height: 1.5;">
                  <p style="margin: 0 0 10px 0; text-transform: uppercase; letter-spacing: 1px;">© ${new Date().getFullYear()} Laika Club. Todos los derechos reservados.</p>
                  <p style="margin: 0;">Estás recibiendo este correo porque formas parte de nuestra comunidad.</p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;
};
