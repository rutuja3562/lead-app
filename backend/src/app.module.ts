import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import {
  Lead,
  Applicant,
  PropertyInfo,
  IncomeInfo,
  Reference,
  LeadDocument,
  Otp,
} from './database/entities';
import { OtpModule } from './modules/otp/index';
import { LeadModule } from './modules/lead/index';
import { MastersModule } from './modules/masters/index';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),

    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (cfg: ConfigService) => ({
        type: 'postgres',
        host: cfg.get('DB_HOST', 'localhost'),
        port: cfg.get<number>('DB_PORT', 5432),
        username: cfg.get('DB_USER', 'postgres'),
        password: cfg.get('DB_PASSWORD', 'postgres'),
        database: cfg.get('DB_NAME', 'lead_app'),
        entities: [Lead, Applicant, PropertyInfo, IncomeInfo, Reference, LeadDocument, Otp],
        synchronize: cfg.get('NODE_ENV') !== 'production',
        logging: cfg.get('NODE_ENV') === 'development',
      }),
    }),

    OtpModule,
    LeadModule,
    MastersModule,
  ],
})
export class AppModule {}
