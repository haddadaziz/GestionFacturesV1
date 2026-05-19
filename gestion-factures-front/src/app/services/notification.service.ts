import { Injectable, signal } from '@angular/core';

export interface Notification {
  id: number;
  type: 'success' | 'error';
  message: string;
  removing?: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private counter = 0;
  notifications = signal<Notification[]>([]);

  showSuccess(message: string) {
    this.addNotification('success', message);
  }

  showError(message: string) {
    this.addNotification('error', message);
  }

  private addNotification(type: 'success' | 'error', message: string) {
    const id = ++this.counter;
    const notification: Notification = { id, type, message };
    this.notifications.update(list => [...list, notification]);

    // Lancer l'animation de sortie après 3.5s, puis supprimer après 0.4s d'animation
    setTimeout(() => {
      this.notifications.update(list =>
        list.map(n => n.id === id ? { ...n, removing: true } : n)
      );
      setTimeout(() => {
        this.notifications.update(list => list.filter(n => n.id !== id));
      }, 400);
    }, 3500);
  }

  dismiss(id: number) {
    this.notifications.update(list =>
      list.map(n => n.id === id ? { ...n, removing: true } : n)
    );
    setTimeout(() => {
      this.notifications.update(list => list.filter(n => n.id !== id));
    }, 400);
  }
}
