import { PushPsychology } from '../utils/PushPsychology';

class PushEngineService {
  constructor() {
    this.isSupported = 'Notification' in window && 'serviceWorker' in navigator;
    this.registration = null;
    this.permission = this.isSupported ? Notification.permission : 'denied';
  }

  /**
   * Initializes the Push Engine. Registers the Service Worker and requests permission.
   */
  async init() {
    if (!this.isSupported) {
      console.warn('Push Notifications are not supported in this browser.');
      return false;
    }

    try {
      // Register Service Worker
      this.registration = await navigator.serviceWorker.register('/laika-push-sw.js');
      console.log('Push SW registered successfully:', this.registration.scope);

      // We do not immediately request permission here to avoid annoying the user on first load.
      // Permission should ideally be requested via a user interaction (like a button click).
      // However, we check the current state.
      this.permission = Notification.permission;
      return true;
    } catch (error) {
      console.error('Service Worker registration failed:', error);
      return false;
    }
  }

  /**
   * Request Notification Permission from the user.
   */
  async requestPermission() {
    if (!this.isSupported) return false;
    
    if (this.permission === 'granted') return true;

    try {
      const permission = await Notification.requestPermission();
      this.permission = permission;
      return permission === 'granted';
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      return false;
    }
  }

  /**
   * Sends a native OS notification.
   * If a Service Worker is active, it uses it for better background/OS integration.
   * Otherwise falls back to native Notification API.
   * 
   * @param {string} title 
   * @param {Object} options 
   */
  async sendNotification(title, options = {}) {
    if (!this.isSupported || this.permission !== 'granted') {
      console.warn('Cannot send notification. Permission not granted or unsupported.');
      return false;
    }

    const defaultOptions = {
      icon: '/117.png',
      badge: '/117.png',
      vibrate: [200, 100, 200],
      requireInteraction: false,
      data: window.location.origin, // URL to open on click
      ...options
    };

    try {
      if (this.registration && this.registration.showNotification) {
        // Preferred: Use Service Worker for rich native OS integration
        await this.registration.showNotification(title, defaultOptions);
      } else {
        // Fallback: Direct Notification API
        const notif = new Notification(title, defaultOptions);
        notif.onclick = function(event) {
          event.preventDefault();
          window.open(defaultOptions.data, '_blank');
          notif.close();
        };
      }
      return true;
    } catch (error) {
      console.error('Error sending notification:', error);
      return false;
    }
  }

  /**
   * Smart Trigger: Uses psychology logic to send contextual notifications.
   * e.g., PushEngine.triggerSmart('TICKET_PURCHASE', { eventName: 'Concierto Rock' })
   */
  async triggerSmart(type, data = {}) {
    if (!this.isSupported || this.permission !== 'granted') return false;
    
    // Check anti-spam rules
    if (!PushPsychology.shouldSend('currentUser', type)) {
      console.log(`[PushEngine] Skipped ${type} notification due to anti-spam rules.`);
      return false;
    }

    // Generate optimized content
    const content = PushPsychology.optimizeContent(type, data);
    
    const success = await this.sendNotification(content.title, {
      body: content.body,
      data: data.url || window.location.origin
    });

    if (success) {
      PushPsychology.markSent(type);
    }
    
    return success;
  }
}

// Singleton export
export const PushEngine = new PushEngineService();
