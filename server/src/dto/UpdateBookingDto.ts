import { IsString, IsISO8601, IsOptional } from 'class-validator';

export class UpdateBookingDto {
  @IsString()
  action!: 'reschedule' | 'cancel';

  @IsISO8601()
  @IsOptional()
  newStartTime?: string;
}
