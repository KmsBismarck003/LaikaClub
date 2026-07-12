export const PushPsychology = {
  /**
   * Generates a psychologically optimized notification title and body based on the context.
   * Uses scarcity, curiosity, exclusivity, and urgency. NO EMOJIS.
   * 
   * @param {string} type - e.g. 'NEW_EVENT', 'TICKET_PURCHASE', 'CART_REMINDER', 'PROMO'
   * @param {Object} data - context data for the notification
   * @returns {Object} { title, body }
   */
  optimizeContent: (type, data) => {
    switch (type) {
      case 'TICKET_PURCHASE':
        return {
          title: "Boletos confirmados",
          body: `Tus accesos para ${data.eventName || 'el evento'} están listos. Prepárate para una experiencia única. Revisa los detalles en tu perfil.`
        };
      
      case 'NEW_EVENT':
        return {
          title: "Nuevo evento descubierto",
          body: `Acabamos de anunciar ${data.eventName || 'un evento que coincide con tus gustos'}. Los primeros lugares suelen agotarse rápido. Descúbrelo antes que los demás.`
        };
        
      case 'CART_REMINDER':
        return {
          title: "Tus lugares siguen reservados",
          body: "Por poco tiempo más, mantendremos tus boletos en espera. Finaliza tu compra ahora y asegura tu asistencia antes de que se liberen."
        };
        
      case 'PROMO':
        return {
          title: "Beneficio exclusivo disponible",
          body: `Se ha activado una oportunidad especial para tu cuenta${data.discount ? ` con un ${data.discount} de descuento` : ''}. Ingresa para aprovecharla antes de que expire.`
        };

      case 'UPCOMING_EVENT':
        return {
          title: "Tu evento se acerca",
          body: `Faltan solo ${data.daysLeft || 'pocos'} días para ${data.eventName || 'tu evento'}. Revisa las recomendaciones de llegada y asegúrate de tener todo listo.`
        };

      case 'ACHIEVEMENT':
        return {
          title: "Nuevo nivel alcanzado",
          body: "Tu actividad reciente te ha otorgado un nuevo reconocimiento en LaikaClub. Entra para ver tus nuevos beneficios."
        };

      default:
        return {
          title: data.title || "Notificación de LaikaClub",
          body: data.body || "Tienes nueva información relevante esperándote en tu cuenta."
        };
    }
  },

  /**
   * Helper to determine if we should send an automated notification right now
   * based on engagement rules (anti-spam logic).
   */
  shouldSend: (userId, notificationType) => {
    // In a real backend, we'd check rate limits (e.g. no more than 1 promo per day)
    // For this client side demo, we assume true but throttle locally if needed
    const lastSentStr = localStorage.getItem(`laika_last_push_${notificationType}`);
    if (lastSentStr) {
      const lastSent = parseInt(lastSentStr, 10);
      const now = Date.now();
      // Cool-down period: 1 hour for standard triggers to prevent spam
      if (now - lastSent < 3600000) {
        return false;
      }
    }
    return true;
  },

  markSent: (notificationType) => {
    localStorage.setItem(`laika_last_push_${notificationType}`, Date.now().toString());
  }
};
