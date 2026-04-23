import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToOne,
  JoinColumn,
} from 'typeorm';
import { Lead } from './lead.entity';

@Entity('income_info')
export class IncomeInfo {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @OneToOne(() => Lead, (lead) => lead.incomeInfo, { onDelete: 'CASCADE' })
  @JoinColumn()
  lead: Lead;

  @Column({ nullable: true })
  employmentType: string;

  @Column({ nullable: true })
  companyName: string;

  @Column({ nullable: true })
  designation: string;

  @Column({ type: 'bigint', nullable: true })
  monthlyIncome: number;

  @Column({ type: 'bigint', nullable: true })
  otherIncome: number;

  @Column({ nullable: true })
  totalExperience: string;

  @Column({ nullable: true })
  currentJobExperience: string;

  @Column({ nullable: true })
  bankName: string;

  @Column({ nullable: true })
  accountNumber: string;

  @Column({ nullable: true })
  ifscCode: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
