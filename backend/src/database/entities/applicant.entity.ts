import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToOne,
  JoinColumn,
} from 'typeorm';
import { Gender } from './enums';
import { Lead } from './lead.entity';

@Entity('applicants')
export class Applicant {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @OneToOne(() => Lead, (lead) => lead.applicant, { onDelete: 'CASCADE' })
  @JoinColumn()
  lead: Lead;

  @Column({ nullable: true })
  salutation: string;

  @Column({ nullable: true })
  firstName: string;

  @Column({ nullable: true })
  middleName: string;

  @Column({ nullable: true })
  lastName: string;

  @Column({ nullable: true })
  dob: string;

  @Column({ type: 'enum', enum: Gender, nullable: true })
  gender: Gender;

  @Column({ nullable: true })
  maritalStatus: string;

  @Column({ nullable: true })
  fatherName: string;

  @Column({ nullable: true })
  motherName: string;

  @Column({ nullable: true })
  spouseName: string;

  @Column({ nullable: true })
  nationality: string;

  @Column({ nullable: true })
  religion: string;

  @Column({ nullable: true })
  panNumber: string;

  @Column({ nullable: true })
  aadharNumber: string;

  @Column({ nullable: true })
  email: string;

  @Column({ nullable: true })
  alternateMobile: string;

  @Column({ nullable: true })
  addressLine1: string;

  @Column({ nullable: true })
  addressLine2: string;

  @Column({ nullable: true })
  city: string;

  @Column({ nullable: true })
  state: string;

  @Column({ nullable: true })
  pincode: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
