import { IsString, IsEmail, IsISO8601 } from 'class-validator';

export class CreateBookingDto {
  @IsISO8601()
  startTime!: string;

  @IsString()
  inviteeName!: string;

  @IsEmail()
  inviteeEmail!: string;

  @IsString()
  timezone!: string;
}
