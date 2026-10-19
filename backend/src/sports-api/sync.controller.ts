import { Controller, Get, Post, HttpException, HttpStatus } from '@nestjs/common';
import { SyncService } from './sync.service';
import { SportsApiService } from './sports-api.service';

@Controller('sync')
export class SyncController {
  constructor(
    private readonly syncService: SyncService,
    private readonly sportsApi: SportsApiService,
  ) {}

  @Get('status')
  async getStatus() {
    const status = await this.syncService.getStatus();
    return {
      ...status,
      isConfigured: this.sportsApi.isConfigured,
    };
  }

  @Post('trigger')
  async trigger() {
    if (!this.sportsApi.isConfigured) {
      throw new HttpException(
        'SPORTS_API_KEY não configurada. Acesse as configurações do projeto, adicione a variável SPORTS_API_KEY com sua chave da API-Football (https://api-football.com) e tente novamente.',
        HttpStatus.BAD_REQUEST,
      );
    }

    const result = await this.syncService.triggerSync();
    return result;
  }
}
