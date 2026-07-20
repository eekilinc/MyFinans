import { LocalNotifications } from '@capacitor/local-notifications';
import { Capacitor } from '@capacitor/core';
import type { ExpenseGroup } from '../types';

export const notificationService = {
  async requestPermission(): Promise<boolean> {
    if (!Capacitor.isNativePlatform()) return false;
    try {
      const perm = await LocalNotifications.checkPermissions();
      if (perm.display === 'granted') return true;
      const req = await LocalNotifications.requestPermissions();
      return req.display === 'granted';
    } catch (e) {
      console.error('Error requesting notification permissions:', e);
      return false;
    }
  },

  async scheduleNotificationsForGroups(groups: ExpenseGroup[]): Promise<void> {
    if (!Capacitor.isNativePlatform()) return;

    try {
      // First check/request permission
      const hasPerm = await this.requestPermission();
      if (!hasPerm) return;

      // Cancel all existing scheduled notifications from us to avoid duplicates
      await LocalNotifications.cancel({
        notifications: await (await LocalNotifications.getPending()).notifications
      });

      const today = new Date();
      const currentYear = today.getFullYear();
      const currentMonth = today.getMonth(); // 0-11
      const currentDay = today.getDate();

      const notificationList: any[] = [];
      let idCounter = 1;

      for (const group of groups) {
        const unpaid = group.total_amount - group.paid_amount;
        if (unpaid <= 0) continue;

        // Calculate due date for current month
        const dueDay = Math.min(Math.max(group.due_day, 1), 31);
        let dueYear = currentYear;
        let dueMonth = currentMonth;

        // If due date has already passed for this month, schedule for next month
        let dueDate = new Date(dueYear, dueMonth, dueDay, 9, 0, 0); // 9:00 AM
        if (currentDay > dueDay) {
          dueMonth += 1;
          if (dueMonth > 11) {
            dueMonth = 0;
            dueYear += 1;
          }
          dueDate = new Date(dueYear, dueMonth, dueDay, 9, 0, 0);
        }

        const groupName = group.name;

        // 1. Due day morning (09:00 AM)
        if (dueDate.getTime() > today.getTime()) {
          notificationList.push({
            id: idCounter++,
            title: 'Ödeme Günü Hatırlatması',
            body: `Bugün ${groupName} ödeme günü! Kalan tutar: ₺${unpaid.toFixed(2)}`,
            schedule: { at: dueDate },
            sound: 'default'
          });
        }

        // 2. 3 Days Before due day (09:00 AM)
        const threeDaysBefore = new Date(dueDate.getTime() - 3 * 24 * 60 * 60 * 1000);
        if (threeDaysBefore.getTime() > today.getTime()) {
          notificationList.push({
            id: idCounter++,
            title: 'Yaklaşan Ödeme Günü',
            body: `${groupName} ödemesine 3 gün kaldı. Kalan tutar: ₺${unpaid.toFixed(2)}`,
            schedule: { at: threeDaysBefore },
            sound: 'default'
          });
        }

        // 3. Due day night (21:00 PM)
        const dueNight = new Date(dueDate.getTime());
        dueNight.setHours(21, 0, 0); // 9:00 PM
        if (dueNight.getTime() > today.getTime()) {
          notificationList.push({
            id: idCounter++,
            title: 'Ödeme Yapılmadı',
            body: `${groupName} için henüz ödeme yapılmadı. Kalan tutar: ₺${unpaid.toFixed(2)}`,
            schedule: { at: dueNight },
            sound: 'default'
          });
        }
      }

      if (notificationList.length > 0) {
        await LocalNotifications.schedule({
          notifications: notificationList
        });
        console.log(`Scheduled ${notificationList.length} notifications.`);
      }
    } catch (error) {
      console.error('Failed to schedule local notifications:', error);
    }
  }
};
