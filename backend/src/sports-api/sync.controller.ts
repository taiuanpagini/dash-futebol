import { Body, Controller, Get, Post, HttpException, HttpStatus } from '@nestjs/common';
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

  @Post('configure')
  async configure(@Body() body: { apiKey: string }) {
    const key = body?.apiKey?.trim();
    if (!key) {
      throw new HttpException('API key não pode ser vazia.', HttpStatus.BAD_REQUEST);
    }
    this.sportsApi.setApiKey(key);
    return { message: 'API key configurada com sucesso.' };
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
