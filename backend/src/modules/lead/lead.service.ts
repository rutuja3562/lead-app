import {
  Injectable,
  NotFoundException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import {
  Lead,
  Applicant,
  PropertyInfo,
  IncomeInfo,
  Reference,
  LeadStage,
} from '../../database/entities';
import {
  CreateQuickLeadDto,
  SaveBasicInfoDto,
  SavePropertyInfoDto,
  SaveIncomeInfoDto,
  SaveReferencesDto,
} from './lead.dto';

// ── Pure helpers ──────────────────────────────────────────────────────────────

const getNextStage = (current: LeadStage): LeadStage => {
  const order: LeadStage[] = [
    LeadStage.QuickLead,
    LeadStage.BasicInfo,
    LeadStage.PropertyInfo,
    LeadStage.IncomeInfo,
    LeadStage.PhotoUpload,
    LeadStage.DocumentUpload,
    LeadStage.References,
    LeadStage.Submitted,
  ];
  const idx = order.indexOf(current);
  return idx < order.length - 1 ? order[idx + 1] : LeadStage.Submitted;
};

const pickOfficer = (leadId: string): string => {
  const officers = ['officer_1', 'officer_2', 'officer_3', 'officer_4'];
  const hash = leadId.split('').reduce((a, c) => a + c.charCodeAt(0), 0);
  return officers[hash % officers.length];
};

// ── Service ───────────────────────────────────────────────────────────────────

@Injectable()
export class LeadService {
  private readonly logger = new Logger(LeadService.name);

  constructor(
    @InjectRepository(Lead) private readonly leadRepo: Repository<Lead>,
    @InjectRepository(Applicant) private readonly applicantRepo: Repository<Applicant>,
    @InjectRepository(PropertyInfo) private readonly propertyRepo: Repository<PropertyInfo>,
    @InjectRepository(IncomeInfo) private readonly incomeRepo: Repository<IncomeInfo>,
    @InjectRepository(Reference) private readonly referenceRepo: Repository<Reference>,
    private readonly dataSource: DataSource,
  ) {}

  async createQuickLead(
    dto: CreateQuickLeadDto,
  ): Promise<{ leadId: string; workflowId: string | null }> {
    const qr = this.dataSource.createQueryRunner();
    await qr.connect();
    await qr.startTransaction();
    try {
      const lead = this.leadRepo.create({
        mobileNumber: dto.mobileNumber,
        countryCode: dto.countryCode ?? '+91',
        customerType: dto.customerType,
        leadStatus: dto.leadStatus,
        leadSource: dto.leadSource,
        loanType: dto.loanType,
        schemeType: dto.schemeType,
        loanAmount: dto.loanAmount,
        propertyType: dto.propertyType,
        propertyLocation: dto.propertyLocation,
        businessType: dto.businessType,
        businessGSTIN: dto.businessGSTIN,
        businessName: dto.businessName,
        isDraft: dto.isDraft ?? false,
        currentStage: LeadStage.QuickLead,
        assignedTo: pickOfficer(Date.now().toString()),
      });

      const saved = await qr.manager.save(Lead, lead);

      const applicant = this.applicantRepo.create({
        firstName: dto.firstName,
        middleName: dto.middleName,
        lastName: dto.lastName,
        gender: dto.gender,
        addressLine1: dto.addressLine1,
        addressLine2: dto.addressLine2,
        city: dto.city,
        state: dto.state,
        pincode: dto.pincode,
        lead: saved,
      });
      await qr.manager.save(Applicant, applicant);
      await qr.commitTransaction();

      this.logger.log(`Lead created: ${saved.id}`);

      // Temporal workflow start (optional — won't break if Temporal is down)
      let workflowId: string | null = null;
      try {
        const { Client, Connection } = await import('@temporalio/client');
        const connection = await Connection.connect({
          address: process.env.TEMPORAL_ADDRESS ?? 'localhost:7233',
        });
        const client = new Client({ connection });
        const handle = await client.workflow.start('leadOnboardingWorkflow', {
          args: [{ leadId: saved.id, mobileNumber: dto.mobileNumber }],
          taskQueue: 'lead-onboarding',
          workflowId: `lead-${saved.id}`,
        });
        workflowId = handle.workflowId;
        await this.leadRepo.update(saved.id, { temporalWorkflowId: workflowId });
        await connection.close();
      } catch (err) {
        this.logger.warn('Temporal unavailable, skipping workflow start');
      }

      return { leadId: saved.id, workflowId };
    } catch (err) {
      await qr.rollbackTransaction();
      throw err;
    } finally {
      await qr.release();
    }
  }

  async saveBasicInfo(leadId: string, dto: SaveBasicInfoDto): Promise<void> {
    const lead = await this.findOrFail(leadId);
    const existing = await this.applicantRepo.findOne({ where: { lead: { id: leadId } } });
    if (existing) {
      await this.applicantRepo.update(existing.id, { ...dto });
    } else {
      await this.applicantRepo.save(this.applicantRepo.create({ ...dto, lead }));
    }
    await this.advanceStage(leadId, LeadStage.QuickLead);
  }

  async savePropertyInfo(leadId: string, dto: SavePropertyInfoDto): Promise<void> {
    const lead = await this.findOrFail(leadId);
    const existing = await this.propertyRepo.findOne({ where: { lead: { id: leadId } } });
    if (existing) {
      await this.propertyRepo.update(existing.id, { ...dto });
    } else {
      await this.propertyRepo.save(this.propertyRepo.create({ ...dto, lead }));
    }
    await this.advanceStage(leadId, LeadStage.BasicInfo);
  }

  async saveIncomeInfo(leadId: string, dto: SaveIncomeInfoDto): Promise<void> {
    const lead = await this.findOrFail(leadId);
    const existing = await this.incomeRepo.findOne({ where: { lead: { id: leadId } } });
    if (existing) {
      await this.incomeRepo.update(existing.id, { ...dto });
    } else {
      await this.incomeRepo.save(this.incomeRepo.create({ ...dto, lead }));
    }
    await this.advanceStage(leadId, LeadStage.PropertyInfo);
  }

  async saveReferences(leadId: string, dto: SaveReferencesDto): Promise<void> {
    const lead = await this.findOrFail(leadId);
    await this.referenceRepo.delete({ lead: { id: leadId } });
    const refs = dto.references.map((r) =>
      this.referenceRepo.create({ ...r, lead }),
    );
    await this.referenceRepo.save(refs);
    await this.advanceStage(leadId, LeadStage.DocumentUpload);
  }

  async submitLead(leadId: string): Promise<{ status: string }> {
    await this.findOrFail(leadId);
    await this.leadRepo.update(leadId, { currentStage: LeadStage.Submitted });
    this.logger.log(`Lead submitted: ${leadId}`);
    return { status: 'submitted' };
  }

  async getLead(leadId: string): Promise<Lead> {
    return this.findOrFail(leadId);
  }

  async getAllLeads(): Promise<Lead[]> {
    return this.leadRepo.find({
      relations: ['applicant'],
      order: { createdAt: 'DESC' },
      take: 100,
    });
  }

  private async findOrFail(leadId: string): Promise<Lead> {
    const lead = await this.leadRepo.findOne({
      where: { id: leadId },
      relations: ['applicant', 'propertyInfo', 'incomeInfo', 'references'],
    });
    if (!lead) throw new NotFoundException(`Lead ${leadId} not found`);
    return lead;
  }

  private async advanceStage(leadId: string, completedStage: LeadStage): Promise<void> {
    const next = getNextStage(completedStage);
    await this.leadRepo.update(leadId, { currentStage: next });
  }
}
