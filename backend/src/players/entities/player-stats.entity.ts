import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Player } from './player.entity';

@Entity('player_stats')
export class PlayerStats {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Player, (player) => player.stats)
  @JoinColumn({ name: 'player_id' })
  player: Player;

  @Column()
  matchweek: number;

  @Column({ default: 0 })
  goals: number;

  @Column({ default: 0 })
  assists: number;

  @Column({ default: 0 })
  minutesPlayed: number;

  @Column({ default: 0 })
  shots: number;

  @Column({ default: 0 })
  shotsOnTarget: number;

  @Column({ default: 0 })
  passes: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
  passAccuracy: number;

  @Column({ type: 'decimal', precision: 4, scale: 2, default: 6.0 })
  rating: number;

  @Column({ default: false })
  yellowCard: boolean;

  @Column({ default: false })
  redCard: boolean;
}
