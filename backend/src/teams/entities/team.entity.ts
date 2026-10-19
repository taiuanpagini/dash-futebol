import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from 'typeorm';

@Entity('teams')
export class Team {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  name: string;

  @Column()
  shortName: string;

  @Column()
  primaryColor: string;

  @Column()
  secondaryColor: string;

  @Column()
  stadium: string;

  @Column()
  founded: number;

  @Column()
  manager: string;

  @Column()
  logoText: string;

  @Column({ default: 0 })
  wins: number;

  @Column({ default: 0 })
  draws: number;

  @Column({ default: 0 })
  losses: number;

  @Column({ default: 0 })
  goalsScored: number;

  @Column({ default: 0 })
  goalsConceded: number;

  @Column({ default: 0 })
  cleanSheets: number;
}
