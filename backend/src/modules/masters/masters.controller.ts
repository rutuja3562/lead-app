import { Controller, Get, Param, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { MastersService } from './masters.service';

@ApiTags('Masters')
@Controller('masters')
export class MastersController {
  constructor(private readonly mastersService: MastersService) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get all master dropdown data' })
  getMasters() {
    return { success: true, data: this.mastersService.getMasters() };
  }

  @Get(':key')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get dropdown data by key' })
  getMasterByKey(@Param('key') key: string) {
    return { success: true, data: this.mastersService.getMasterByKey(key) };
  }
}
