import { Injectable } from '@nestjs/common';

@Injectable()
export class NotificationService {
  sendNotification(_data: Record<string, unknown>) {
    return { sent: true };
  }
}
