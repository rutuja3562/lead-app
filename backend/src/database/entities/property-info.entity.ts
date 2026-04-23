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

@Entity('property_info')
export class PropertyInfo {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @OneToOne(() => Lead, (lead) => lead.propertyInfo, { onDelete: 'CASCADE' })
  @JoinColumn()
  lead: Lead;

  @Column({ nullable: true })
  propertyType: string;

  @Column({ nullable: true })
  propertyLocation: string;

  @Column({ type: 'decimal', nullable: true })
  propertyArea: number;

  @Column({ nullable: true })
  areaUnit: string;

  @Column({ nullable: true })
  propertyAge: string;

  @Column({ type: 'bigint', nullable: true })
  marketValue: number;

  @Column({ type: 'bigint', nullable: true })
  distressValue: number;

  @Column({ nullable: true })
  ownerName: string;

  @Column({ nullable: true })
  ownerContact: string;

  @Column({ nullable: true })
  propertyDescription: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
