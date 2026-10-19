import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SportsApiService } from './sports-api.service';
import { SyncService } from './sync.service';
import { SyncController } from './sync.controller';
import { SyncStatus } from './entities/sync-status.entity';
import { Team } from '../teams/entities/team.entity';
import { Fixture } from '../fixtures/entities/fixture.entity';
import { MatchStats } from '../fixtures/entities/match-stats.entity';
import { Player } from '../players/entities/player.entity';
import { PlayerStats } from '../players/entities/player-stats.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      SyncStatus,
      Team,
      Fixture,
      MatchStats,
      Player,
      PlayerStats,
    ]),
  ],
  controllers: [SyncController],
  providers: [SportsApiService, SyncService],
  exports: [SportsApiService, SyncService],
})
export class SportsApiModule {}
