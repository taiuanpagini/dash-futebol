import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { Team } from '../../teams/entities/team.entity';
import { PlayerStats } from './player-stats.entity';

@Entity('players')
export class Player {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  position: string;

  @ManyToOne(() => Team, { eager: true })
  @JoinColumn({ name: 'team_id' })
  team: Team;

  @Column()
  age: number;

  @Column()
  nationality: string;

  @Column()
  number: number;

  @OneToMany(() => PlayerStats, (stats) => stats.player, { cascade: true })
  stats: PlayerStats[];
}
