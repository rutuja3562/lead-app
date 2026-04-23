import {
  Controller,
  Post,
  Put,
  Get,
  Body,
  Param,
  HttpCode,
  HttpStatus,
  ParseUUIDPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { LeadService } from './lead.service';
import {
  CreateQuickLeadDto,
  SaveBasicInfoDto,
  SavePropertyInfoDto,
  SaveIncomeInfoDto,
  SaveReferencesDto,
} from './lead.dto';

@ApiTags('Leads')
@Controller('leads')
export class LeadController {
  constructor(private readonly leadService: LeadService) {}

  @Post('quick')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create quick lead (Step 1)' })
  async createQuickLead(@Body() dto: CreateQuickLeadDto) {
    const result = await this.leadService.createQuickLead(dto);
    return { success: true, data: result };
  }

  @Put(':id/basic-info')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Save basic info tab' })
  async saveBasicInfo(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: SaveBasicInfoDto,
  ) {
    await this.leadService.saveBasicInfo(id, dto);
    return { success: true, message: 'Basic info saved' };
  }

  @Put(':id/property-info')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Save property info tab' })
  async savePropertyInfo(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: SavePropertyInfoDto,
  ) {
    await this.leadService.savePropertyInfo(id, dto);
    return { success: true, message: 'Property info saved' };
  }

  @Put(':id/income-info')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Save income info tab' })
  async saveIncomeInfo(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: SaveIncomeInfoDto,
  ) {
    await this.leadService.saveIncomeInfo(id, dto);
    return { success: true, message: 'Income info saved' };
  }

  @Put(':id/references')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Save references tab' })
  async saveReferences(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: SaveReferencesDto,
  ) {
    await this.leadService.saveReferences(id, dto);
    return { success: true, message: 'References saved' };
  }

  @Post(':id/submit')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Final submit' })
  async submitLead(@Param('id', ParseUUIDPipe) id: string) {
    const result = await this.leadService.submitLead(id);
    return { success: true, data: result };
  }

  @Get()
  @ApiOperation({ summary: 'Get all leads' })
  async getAllLeads() {
    const leads = await this.leadService.getAllLeads();
    return { success: true, data: leads };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get lead by ID' })
  async getLead(@Param('id', ParseUUIDPipe) id: string) {
    const lead = await this.leadService.getLead(id);
    return { success: true, data: lead };
  }
}
