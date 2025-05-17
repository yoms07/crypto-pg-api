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
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

@Controller('/products/:businessProfileId')
@UseGuards(AuthGuard)
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Post()
  @UseGuards(BusinessProfileGuard)
  create(
    @Body() createProductDto: CreateProductDto,
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
    @Body() updateProductDto: UpdateProductDto,
    @CurrentBusinessProfile() businessProfile: BusinessProfile,
  ) {
    return this.productsService.update(businessProfile, id, updateProductDto);
  }

  @Patch(':id/stock')
  @UseGuards(BusinessProfileGuard)
  updateStock(
    @Param('id') id: string,
    @Body('quantity') quantity: number,
    @CurrentBusinessProfile() businessProfile: BusinessProfile,
  ) {
    return this.productsService.updateStock(businessProfile, id, quantity);
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
