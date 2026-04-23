import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Lead } from './lead.entity';

@Entity('lead_documents')
export class LeadDocument {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Lead, (lead) => lead.documents, { onDelete: 'CASCADE' })
  @JoinColumn()
  lead: Lead;

  @Column()
  fileKey: string;

  @Column()
  fileName: string;

  @Column()
  mimeType: string;

  @Column({ type: 'bigint' })
  fileSize: number;

  @Column({ nullable: true })
  documentType: string;

  @Column({ nullable: true })
  fileUrl: string;

  @CreateDateColumn()
  createdAt: Date;
}
