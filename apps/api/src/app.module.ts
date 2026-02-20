import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { SitesModule } from './sites/sites.module';
import { IngestModule } from './ingest/ingest.module';

@Module({
  imports: [PrismaModule, SitesModule, IngestModule],
})
export class AppModule {}
