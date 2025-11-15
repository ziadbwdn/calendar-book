import { Entity, PrimaryGeneratedColumn, Column, Index, VersionColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('bookings')
@Index(['organizerId', 'startTime'], { unique: true, where: '"status" = \'confirmed\'' })
export class Booking {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid' })
  organizerId!: string;

  @Column({ type: 'varchar', length: 255 })
  inviteeName!: string;

  @Column({ type: 'varchar', length: 255 })
  inviteeEmail!: string;

  @Column({ type: 'timestamptz' })
  startTime!: Date;

  @Column({ type: 'timestamptz' })
  endTime!: Date;

  @Column({ type: 'enum', enum: ['confirmed', 'cancelled'], default: 'confirmed' })
  status!: 'confirmed' | 'cancelled';

  @VersionColumn()
  version!: number;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
