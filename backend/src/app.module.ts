import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TeamsModule } from './teams/teams.module';
import { FixturesModule } from './fixtures/fixtures.module';
import { PlayersModule } from './players/players.module';
import { SeedModule } from './seed/seed.module';
import { SportsApiModule } from './sports-api/sports-api.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        url: config.get<string>('DATABASE_URL'),
        entities: [__dirname + '/**/*.entity{.ts,.js}'],
        synchronize: config.get<string>('NODE_ENV') !== 'production',
        logging: (config.get<string>('NODE_ENV') ?? 'development') === 'development',
      }),
      inject: [ConfigService],
    }),
    TeamsModule,
    FixturesModule,
    PlayersModule,
    SeedModule,
    SportsApiModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
