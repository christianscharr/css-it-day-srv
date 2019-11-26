import { Body, Controller, Get, Header, Logger, Param, Post, Req, Res } from '@nestjs/common';
import { Response, Request } from 'express';
import { AppService } from './app.service';
import { SaveBodyDto } from './saveBody.model';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get('teams')
  getTeams(@Req() request: Request, @Res() res: Response) {
    this.appService.getTeams(ret => {
      res.status(ret.statusCode).json(ret).send();
    });
  }

  @Post('save')
  save(@Body() body: SaveBodyDto, @Res() res: Response) {
    Logger.log('Processing save:', JSON.stringify(body, null, 2));

    this.appService.save(body, ret => {
      res.status(ret.statusCode).json(ret);
    });
  }

  @Get('team/:team/sprint/:sprint/latest')
  loadLatestSavefile(@Param('team') team: string, @Param('sprint') sprint: string, @Res() res: Response) {
    this.appService.getLatestSave(team, sprint, ret => {
      Logger.log('loadLatestSavefile() [Response]:' + JSON.stringify(ret));
      res.status(ret.statusCode).json(ret);
    });
  }

  @Get('team/:team/sprint/:sprint/timestamp/:timestamp')
  loadSavefile(@Param('team') team: string, @Param('sprint') sprint: string, @Param('timestamp') timestamp: number, @Res() res: Response) {
    this.appService.getSave(team, sprint, timestamp, ret => {
      Logger.log('loadSavefile() [Response]:' + JSON.stringify(ret));
      res.status(ret.statusCode).json(ret);
    });
  }
}
