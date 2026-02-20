import { Controller, Get, Post, Param, Body, UsePipes } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiParam, ApiBody } from '@nestjs/swagger';
import { SitesService } from './sites.service';
import { CreateSiteSchema, CreateSiteDto } from './dto/sites.dto';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe';
import { successResponse } from '../common/dto/api-response.dto';

@ApiTags('Sites')
@Controller('sites')
export class SitesController {
  constructor(private readonly sitesService: SitesService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new industrial site' })
  @ApiBody({
    schema: {
      type: 'object',
      required: ['name', 'emissionLimit'],
      properties: {
        name: { type: 'string', example: 'Well Pad Alpha' },
        location: { type: 'string', example: 'Alberta, Canada' },
        emissionLimit: { type: 'number', example: 5000 },
        metadata: {
          type: 'object',
          example: { region: 'western-canada', operator: 'Highwood Energy' },
        },
      },
    },
  })
  @UsePipes(new ZodValidationPipe(CreateSiteSchema))
  async create(@Body() dto: CreateSiteDto) {
    const site = await this.sitesService.create(dto);
    return successResponse(site);
  }

  @Get()
  @ApiOperation({ summary: 'List all sites' })
  async findAll() {
    const sites = await this.sitesService.findAll();
    return successResponse(sites);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a site by ID' })
  @ApiParam({ name: 'id', description: 'Site UUID' })
  async findOne(@Param('id') id: string) {
    const site = await this.sitesService.findOne(id);
    return successResponse(site);
  }

  @Get(':id/metrics')
  @ApiOperation({ summary: 'Get compliance metrics for a site' })
  @ApiParam({ name: 'id', description: 'Site UUID' })
  async getMetrics(@Param('id') id: string) {
    const metrics = await this.sitesService.getMetrics(id);
    return successResponse(metrics);
  }
}
