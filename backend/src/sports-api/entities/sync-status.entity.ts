import { Entity, Column, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

@Entity('sync_status')
export class SyncStatus {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ default: 'idle' })
  status: string; // 'idle' | 'syncing' | 'success' | 'error'

  @Column({ nullable: true, type: 'timestamptz' })
  lastSyncedAt: Date | null;

  @Column({ nullable: true, type: 'text' })
  errorMessage: string | null;

  @Column({ nullable: true })
  teamsCount: number | null;

  @Column({ nullable: true })
  fixturesCount: number | null;

  @Column({ nullable: true })
  playersCount: number | null;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;
}
