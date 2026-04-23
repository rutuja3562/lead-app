import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';

@Entity('otps')
export class Otp {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  mobileNumber: string;

  @Column()
  countryCode: string;

  @Column()
  otp: string;

  @Column({ default: false })
  verified: boolean;

  @Column({ default: 0 })
  attempts: number;

  @Column({ type: 'timestamp' })
  expiresAt: Date;

  @CreateDateColumn()
  createdAt: Date;
}
