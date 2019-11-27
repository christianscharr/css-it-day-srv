import { Injectable, Logger } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import { SaveBodyDto } from './saveBody.model';
import { ResponseCnt } from './responseCnt.model';
import { TeamDetail, Version } from './teamDetail.model';

@Injectable()
export class AppService {
  save(save: SaveBodyDto, callFn: (response: ResponseCnt<boolean>) => void): void {
    const teamPath = path.join(__dirname, '..', 'saves', save.team);

    fs.mkdir(teamPath, {
      recursive: true,
    }, dirErr => {
      if (dirErr) {
        callFn({
          statusCode: 500,
          statusText: JSON.stringify(dirErr),
          success: false,
        });

        return;
      }

      const filePath = path.join(teamPath, `${save.sprint}_${Date.now()}.json`);

      fs.writeFile(filePath, JSON.stringify(save, null, 2), {
        flag: 'w+',
        encoding: 'utf8',
      }, (writeErr) => {
        if (writeErr) {
          callFn({
            statusCode: 500,
            statusText: JSON.stringify(writeErr),
            success: false,
          });

          return;
        }

        callFn({
          statusCode: 200,
          statusText: 'Successfully saved data',
          success: true,
        });
      });
    });
  }

  getTeams(callFn: (response: ResponseCnt<TeamDetail[]>) => void): void {
    Logger.log('Looking up teams...');

    fs.readdir(path.join(__dirname, '..', 'saves'),
      {
        withFileTypes: true,
      }, (err, files) => {
        if (err) {
          callFn({
            statusCode: 500,
            statusText: JSON.stringify(err),
            success: false,
          });

          return;
        }

        const teams = files
          .filter(result => result.isDirectory())
          .map(result => result.name)
          .map(team => {
            const teamVersions = fs.readdirSync(path.join(__dirname, '..', 'saves', team), {
              withFileTypes: true,
            }).filter(file => file.isFile())
              .map(file => file.name)
              .map(filename => {
                const fnParts = filename.match(/^([^_]*)_([0-9]*)\.json$/);

                return {
                  sprint: fnParts[1],
                  timestamp: parseInt(fnParts[2], 10),
                } as Version;
              });

            return {
              name: team,
              versions: teamVersions,
            } as TeamDetail;
          });

        if (!!!teams) {
          Logger.log('No teams found :(');
          callFn({
            success: true,
            statusCode: 200,
            statusText: 'No teams found yet',
          });

          return;
        }

        Logger.log('Successfully looked up teams...');
        callFn({
          body: teams,
          success: true,
          statusCode: 200,
          statusText: 'Successfully looked up teams',
        });
      });
  }

  getLatestSave(team: string, sprint: string, callFn: (response: ResponseCnt<SaveBodyDto>) => void): void {
    fs.readdir(path.join(__dirname, '..', 'saves', team),
      {
        withFileTypes: true,
      }, (err, files) => {
        Logger.log('Found files: ' + JSON.stringify(files));

        const saveFiles = files.filter(result => result.isFile())
          .map(fileObj => fileObj.name)
          .filter(file => file.startsWith(sprint))
          .sort((f1, f2) => (parseInt(f1, 10) > parseInt(f2, 10)) ? 1 : -1);

        if (!saveFiles) {
          callFn({
            success: true,
            statusCode: 200,
            statusText: 'No savefiles found',
          });

          Logger.log('No savefiles found');
          return;
        }

        fs.readFile(path.join(__dirname, '..', 'saves', team, saveFiles[0]), {
          flag: 'r',
          encoding: 'utf8',
        }, (readErr, readFile) => {
          if (readErr) {
            callFn({
              success: false,
              statusCode: 500,
              statusText: JSON.stringify(readErr),
            });

            return;
          }

          callFn({
            success: true,
            statusCode: 200,
            statusText: 'Successfully loaded savefile',
            body: JSON.parse(readFile),
          });
        });
      });
  }

  getSave(team: string, sprint: string, timestamp: number, callFn: (response: ResponseCnt<SaveBodyDto>) => void): void {
    fs.readFile(path.join(__dirname, '..', 'saves', team, sprint + '_' + timestamp + '.json'), {
      flag: 'r',
      encoding: 'utf8',
    }, (readErr, readFile) => {
      if (readErr) {
        callFn({
          success: false,
          statusCode: 500,
          statusText: JSON.stringify(readErr),
        });

        return;
      }

      callFn({
        success: true,
        statusCode: 200,
        statusText: 'Successfully loaded savefile',
        body: JSON.parse(readFile),
      });
    });
  }
}
