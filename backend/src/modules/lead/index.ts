import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import {
  Lead,
  Applicant,
  PropertyInfo,
  IncomeInfo,
  Reference,
  LeadDocument,
} from '../../database/entities';
import { LeadService } from './lead.service';
import { LeadController } from './lead.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Lead,
      Applicant,
      PropertyInfo,
      IncomeInfo,
      Reference,
      LeadDocument,
    ]),
  ],
  controllers: [LeadController],
  providers: [LeadService],
  exports: [LeadService],
})
export class LeadModule {}
