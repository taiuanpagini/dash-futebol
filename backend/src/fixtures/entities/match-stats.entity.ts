import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Fixture } from './fixture.entity';
import { Team } from '../../teams/entities/team.entity';

@Entity('match_stats')
export class MatchStats {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Fixture, (fixture) => fixture.stats)
  @JoinColumn({ name: 'fixture_id' })
  fixture: Fixture;

  @ManyToOne(() => Team, { eager: true })
  @JoinColumn({ name: 'team_id' })
  team: Team;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 50 })
  possession: number;

  @Column({ default: 0 })
  shots: number;

  @Column({ default: 0 })
  shotsOnTarget: number;

  @Column({ default: 0 })
  passes: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
  passAccuracy: number;

  @Column({ default: 0 })
  fouls: number;

  @Column({ default: 0 })
  yellowCards: number;

  @Column({ default: 0 })
  redCards: number;

  @Column({ default: 0 })
  corners: number;

  @Column({ default: 0 })
  offsides: number;
}
