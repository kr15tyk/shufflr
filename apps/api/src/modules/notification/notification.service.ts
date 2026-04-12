import { Injectable } from '@nestjs/common';
import { SendNotificationDto } from './dto/notification.dto';

@Injectable()
export class NotificationService {
  sendNotification(_dto: SendNotificationDto) {
    return { sent: true };
  }
}
