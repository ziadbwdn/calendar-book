import { IsString, IsInt, IsArray, Min, Max, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

class WorkingHourDto {
  @IsInt()
  @Min(1)
  @Max(7)
  day!: number;

  @IsString()
  start!: string;

  @IsString()
  end!: string;
}

export class UpdateSettingsDto {
  @IsString()
  timezone!: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => WorkingHourDto)
  workingHours!: WorkingHourDto[];

  @IsInt()
  @Min(15)
  @Max(240)
  meetingDuration!: number;

  @IsInt()
  @Min(0)
  bufferBefore!: number;

  @IsInt()
  @Min(0)
  bufferAfter!: number;

  @IsInt()
  @Min(0)
  minimumNotice!: number;

  @IsArray()
  blackoutDates?: string[];
}
