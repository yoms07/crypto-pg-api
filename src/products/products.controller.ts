import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ProductsService } from './products.service';
import { AuthGuard } from '@/auth/guards/auth.guard';
import { BusinessProfileGuard } from '@/business-profile/guards/business-profile-param.guard';
import { CurrentBusinessProfile } from '@/business-profile/decorators/current-business-profile.decorator';
import { BusinessProfile } from '@/business-profile/schemas/business-profile.schema';
import {
  CreateProductDto,
  createProductSchema,
} from './dto/create-product.dto';
import {
  UpdateProductDto,
  updateProductSchema,
} from './dto/update-product.dto';
import { UpdateStockDto, updateStockSchema } from './dto/update-stock.dto';
import { ZodValidationPipe } from '@/zod-validation';

@Controller('/products/:businessProfileId')
@UseGuards(AuthGuard)
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Post()
  @UseGuards(BusinessProfileGuard)
  create(
    @Body(new ZodValidationPipe(createProductSchema))
    createProductDto: CreateProductDto,
    @CurrentBusinessProfile() businessProfile: BusinessProfile,
  ) {
    return this.productsService.create(businessProfile, createProductDto);
  }

  @Get()
  @UseGuards(BusinessProfileGuard)
  findAll(@CurrentBusinessProfile() businessProfile: BusinessProfile) {
    return this.productsService.findAll(businessProfile);
  }

  @Get('search')
  @UseGuards(BusinessProfileGuard)
  search(
    @Query('q') query: string,
    @CurrentBusinessProfile() businessProfile: BusinessProfile,
  ) {
    return this.productsService.searchProducts(businessProfile, query);
  }

  @Get('category/:category')
  @UseGuards(BusinessProfileGuard)
  findByCategory(
    @Param('category') category: string,
    @CurrentBusinessProfile() businessProfile: BusinessProfile,
  ) {
    return this.productsService.findByCategory(businessProfile, category);
  }

  @Get(':id')
  @UseGuards(BusinessProfileGuard)
  findOne(
    @Param('id') id: string,
    @CurrentBusinessProfile() businessProfile: BusinessProfile,
  ) {
    return this.productsService.findOne(businessProfile, id);
  }

  @Patch(':id')
  @UseGuards(BusinessProfileGuard)
  update(
    @Param('id') id: string,
    @Body(new ZodValidationPipe(updateProductSchema))
    updateProductDto: UpdateProductDto,
    @CurrentBusinessProfile() businessProfile: BusinessProfile,
  ) {
    return this.productsService.update(businessProfile, id, updateProductDto);
  }

  @Patch(':id/stock')
  @UseGuards(BusinessProfileGuard)
  updateStock(
    @Param('id') id: string,
    @Body(new ZodValidationPipe(updateStockSchema))
    updateStockDto: UpdateStockDto,
    @CurrentBusinessProfile() businessProfile: BusinessProfile,
  ) {
    return this.productsService.updateStock(
      businessProfile,
      id,
      updateStockDto.quantity,
    );
  }

  @Delete(':id')
  @UseGuards(BusinessProfileGuard)
  remove(
    @Param('id') id: string,
    @CurrentBusinessProfile() businessProfile: BusinessProfile,
  ) {
    return this.productsService.remove(businessProfile, id);
  }
}
