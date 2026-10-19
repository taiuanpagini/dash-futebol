import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Team } from '../teams/entities/team.entity';
import { Fixture } from '../fixtures/entities/fixture.entity';
import { MatchStats } from '../fixtures/entities/match-stats.entity';
import { Player } from '../players/entities/player.entity';
import { PlayerStats } from '../players/entities/player-stats.entity';
import { DataSeederService } from './seed.service';

@Module({
  imports: [TypeOrmModule.forFeature([Team, Fixture, MatchStats, Player, PlayerStats])],
  providers: [DataSeederService],
})
export class SeedModule {}
