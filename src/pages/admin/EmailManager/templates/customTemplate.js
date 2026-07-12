import { getBaseTemplate } from './baseTemplate';

export const getCustomTemplate = ({ htmlContent, subject }) => {
  return getBaseTemplate(htmlContent || '<p>Escribe tu contenido aquí...</p>', subject || 'Comunicado Oficial');
};
