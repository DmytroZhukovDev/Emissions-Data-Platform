import {
  Controller,
  Post,
  Body,
  Headers,
  UsePipes,
  BadRequestException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiHeader, ApiBody } from '@nestjs/swagger';
import { IngestService } from './ingest.service';
import { CreateIngestSchema, CreateIngestDto } from './dto/ingest.dto';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe';
import { successResponse } from '../common/dto/api-response.dto';

@ApiTags('Ingestion')
@Controller('ingest')
export class IngestController {
  constructor(private readonly ingestService: IngestService) {}

  @Post()
  @ApiOperation({
    summary: 'Ingest a batch of methane readings',
    description:
      'Accepts up to 100 readings for a site. Uses X-Idempotency-Key header to prevent duplicate processing on retries.',
  })
  @ApiHeader({
    name: 'X-Idempotency-Key',
    description:
      'Unique key for this request. Retrying with the same key returns the cached result without re-processing.',
    required: true,
    example: 'batch-2026-02-19-abc123',
  })
  @ApiBody({
    schema: {
      type: 'object',
      required: ['siteId', 'readings'],
      properties: {
        siteId: {
          type: 'string',
          format: 'uuid',
          example: 'df6afa20-06b3-4ad6-86d5-1f0c13831a4a',
        },
        readings: {
          type: 'array',
          maxItems: 100,
          items: {
            type: 'object',
            required: ['value', 'recordedAt'],
            properties: {
              value: { type: 'number', example: 42.5 },
              unit: { type: 'string', default: 'kg', example: 'kg' },
              recordedAt: {
                type: 'string',
                format: 'date-time',
                example: '2026-02-19T10:00:00Z',
              },
            },
          },
        },
      },
    },
  })
  @UsePipes(new ZodValidationPipe(CreateIngestSchema))
  async ingest(
    @Body() dto: CreateIngestDto,
    @Headers('x-idempotency-key') idempotencyKey?: string,
  ) {
    if (!idempotencyKey) {
      throw new BadRequestException(
        'X-Idempotency-Key header is required',
      );
    }

    const result = await this.ingestService.ingest(dto, idempotencyKey);
    return successResponse(result);
  }
}
