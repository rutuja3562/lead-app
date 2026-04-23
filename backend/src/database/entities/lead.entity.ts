import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToOne,
  OneToMany,
} from 'typeorm';
import { CustomerType, LeadStatus, LeadStage } from './enums';

@Entity('leads')
export class Lead {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  mobileNumber: string;

  @Column({ nullable: true })
  countryCode: string;

  @Column({ type: 'enum', enum: CustomerType, nullable: true })
  customerType: CustomerType;

  @Column({ type: 'enum', enum: LeadStatus, nullable: true })
  leadStatus: LeadStatus;

  @Column({ nullable: true })
  leadSource: string;

  @Column({ nullable: true })
  loanType: string;

  @Column({ nullable: true })
  schemeType: string;

  @Column({ type: 'bigint', nullable: true })
  loanAmount: number;

  @Column({ nullable: true })
  propertyType: string;

  @Column({ nullable: true })
  propertyLocation: string;

  @Column({ nullable: true })
  businessType: string;

  @Column({ nullable: true })
  businessGSTIN: string;

  @Column({ nullable: true })
  businessName: string;

  @Column({ type: 'enum', enum: LeadStage, default: LeadStage.QuickLead })
  currentStage: LeadStage;

  @Column({ default: false })
  isDraft: boolean;

  @Column({ nullable: true })
  temporalWorkflowId: string;

  @Column({ nullable: true })
  assignedTo: string;

  // Relations declared with string-based lazy refs to avoid circular init
  @OneToOne('Applicant', 'lead', { cascade: true, eager: false })
  applicant: any;

  @OneToOne('PropertyInfo', 'lead', { cascade: true, eager: false })
  propertyInfo: any;

  @OneToOne('IncomeInfo', 'lead', { cascade: true, eager: false })
  incomeInfo: any;

  @OneToMany('Reference', 'lead', { cascade: true, eager: false })
  references: any[];

  @OneToMany('LeadDocument', 'lead', { cascade: true, eager: false })
  documents: any[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
