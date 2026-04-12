import { IsString } from 'class-validator';

export class SendNotificationDto {
  @IsString()
  message!: string;

  @IsString()
  recipientId!: string;
}
