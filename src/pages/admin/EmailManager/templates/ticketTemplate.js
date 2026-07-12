import { getBaseTemplate } from './baseTemplate';

export const getTicketTemplate = ({ userName, eventName, eventDate, eventTime, venue, seat, qrCodeUrl }) => {
  const content = `
    <div style="text-align: center; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;">
      <h2 style="margin-top: 0; color: #000; text-transform: uppercase; font-weight: 900; font-size: 24px; letter-spacing: 1px;">¡Tu acceso está listo!</h2>
      <p style="color: #666; margin-bottom: 30px; font-size: 16px;">Hola <strong>${userName || 'Usuario'}</strong>, prepárate para una experiencia inolvidable.</p>
      
      <div style="background-color: #fafafa; border: 2px dashed #000; border-radius: 12px; padding: 40px 30px; margin-bottom: 30px; position: relative;">
        <h3 style="margin: 0 0 25px 0; font-size: 22px; color: #000; text-transform: uppercase; font-weight: 800;">${eventName || 'EVENTO SELECCIONADO'}</h3>
        
        <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom: 30px; text-align: left; font-size: 15px;">
          <tr>
            <td style="padding: 10px 0; border-bottom: 1px solid #eee;">
              <span style="color: #888; font-size: 12px; text-transform: uppercase; display: block; margin-bottom: 3px;">Fecha</span>
              <strong style="color: #000;">${eventDate || 'Por definir'}</strong>
            </td>
            <td style="padding: 10px 0; border-bottom: 1px solid #eee;">
              <span style="color: #888; font-size: 12px; text-transform: uppercase; display: block; margin-bottom: 3px;">Hora</span>
              <strong style="color: #000;">${eventTime || 'Por definir'}</strong>
            </td>
          </tr>
          <tr>
            <td style="padding: 10px 0; border-bottom: 1px solid #eee;">
              <span style="color: #888; font-size: 12px; text-transform: uppercase; display: block; margin-bottom: 3px;">Lugar</span>
              <strong style="color: #000;">${venue || 'Laika Club'}</strong>
            </td>
            <td style="padding: 10px 0; border-bottom: 1px solid #eee;">
              <span style="color: #888; font-size: 12px; text-transform: uppercase; display: block; margin-bottom: 3px;">Zona / Asiento</span>
              <strong style="color: #000;">${seat || 'General'}</strong>
            </td>
          </tr>
        </table>
        
        <div style="text-align: center; margin-top: 30px;">
          <div style="display: inline-block; padding: 15px; background: #fff; border-radius: 8px; border: 1px solid #eee;">
            <img src="${qrCodeUrl || 'https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=LAIKACLUB_DEMO_TICKET'}" alt="Código QR" width="180" height="180" style="display: block; margin: 0 auto;" />
          </div>
          <p style="font-size: 13px; color: #666; margin-top: 15px; text-transform: uppercase; font-weight: bold; letter-spacing: 1px;">Presenta este código en la entrada</p>
        </div>
      </div>
      
      <a href="#" style="display: inline-block; background-color: #000; color: #fff; text-decoration: none; padding: 16px 35px; font-weight: 800; border-radius: 4px; text-transform: uppercase; letter-spacing: 1.5px; font-size: 14px;">Descargar PDF</a>
    </div>
  `;
  return getBaseTemplate(content, `Tu boleto para ${eventName || 'el evento'}`);
};
