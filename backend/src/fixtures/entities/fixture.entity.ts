import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { Team } from '../../teams/entities/team.entity';
import { MatchStats } from './match-stats.entity';

@Entity('fixtures')
export class Fixture {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: true })
  externalId: number;

  @Column()
  matchweek: number;

  @Column({ type: 'date' })
  date: string;

  @ManyToOne(() => Team, { eager: true })
  @JoinColumn({ name: 'home_team_id' })
  homeTeam: Team;

  @ManyToOne(() => Team, { eager: true })
  @JoinColumn({ name: 'away_team_id' })
  awayTeam: Team;

  @Column({ default: 0 })
  homeGoals: number;

  @Column({ default: 0 })
  awayGoals: number;

  @Column({ default: false })
  played: boolean;

  @OneToMany(() => MatchStats, (stats) => stats.fixture, { eager: true, cascade: true })
  stats: MatchStats[];
}
