import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

export interface WorkingHour {
  day: number;
  start: string;
  end: string;
}

@Entity('organizer_settings')
export class OrganizerSettings {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid', nullable: true })
  userId?: string;

  @Column({ type: 'varchar', length: 100 })
  timezone!: string;

  @Column({ type: 'jsonb' })
  workingHours!: WorkingHour[];

  @Column({ type: 'int' })
  meetingDuration!: number;

  @Column({ type: 'int', default: 0 })
  bufferBefore!: number;

  @Column({ type: 'int', default: 0 })
  bufferAfter!: number;

  @Column({ type: 'int' })
  minimumNotice!: number;

  @Column({ type: 'jsonb', nullable: true })
  blackoutDates?: string[];

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
