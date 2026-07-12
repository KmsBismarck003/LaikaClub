import { getBaseTemplate } from './baseTemplate';

export const getNotificationTemplate = ({ title, message, actionText, actionUrl, userName }) => {
  const content = `
    <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;">
      <h2 style="margin-top: 0; color: #000; text-transform: uppercase; font-weight: 800; font-size: 22px; letter-spacing: 0.5px; border-bottom: 2px solid #000; padding-bottom: 15px; margin-bottom: 25px;">
        ${title || 'Aviso Importante'}
      </h2>
      
      <p style="font-size: 16px; color: #333; margin-bottom: 20px;">
        Hola <strong>${userName || 'Usuario'}</strong>,
      </p>
      
      <div style="font-size: 16px; color: #444; line-height: 1.8; margin-bottom: 30px;">
        ${message || 'Este es un mensaje de notificación automática de nuestro sistema.'}
      </div>
      
      ${actionText && actionUrl ? `
        <div style="margin-top: 35px; text-align: center;">
          <a href="${actionUrl}" style="display: inline-block; background-color: #000; color: #fff; text-decoration: none; padding: 14px 30px; font-weight: bold; border-radius: 4px; text-transform: uppercase; letter-spacing: 1px; font-size: 14px;">${actionText}</a>
        </div>
      ` : ''}
    </div>
  `;
  return getBaseTemplate(content, title || 'Notificación de Laika Club');
};
