import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Product } from './products.schema';
import { BusinessProfile } from '@/business-profile/schemas/business-profile.schema';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

@Injectable()
export class ProductsService {
  constructor(
    @InjectModel(Product.name) private productModel: Model<Product>,
  ) {}

  async create(
    businessProfile: BusinessProfile,
    createProductDto: CreateProductDto,
  ): Promise<Product> {
    const createdProduct = new this.productModel({
      ...createProductDto,
      business_profile_id: businessProfile._id,
    });
    return createdProduct.save();
  }

  async findAll(businessProfile: BusinessProfile): Promise<Product[]> {
    return this.productModel
      .find({
        business_profile_id: businessProfile._id,
        deleted: false,
      })
      .exec();
  }

  async findOne(
    businessProfile: BusinessProfile,
    id: string,
  ): Promise<Product> {
    const product = await this.productModel
      .findOne({
        _id: id,
        business_profile_id: businessProfile._id,
        deleted: false,
      })
      .exec();

    if (!product) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }
    return product;
  }

  async update(
    businessProfile: BusinessProfile,
    id: string,
    updateProductDto: UpdateProductDto,
  ): Promise<Product> {
    const updatedProduct = await this.productModel
      .findOneAndUpdate(
        { _id: id, business_profile_id: businessProfile._id, deleted: false },
        updateProductDto,
        { new: true },
      )
      .exec();

    if (!updatedProduct) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }
    return updatedProduct;
  }

  async remove(businessProfile: BusinessProfile, id: string): Promise<void> {
    const result = await this.productModel
      .findOneAndUpdate(
        { _id: id, business_profile_id: businessProfile._id, deleted: false },
        { deleted: true },
        { new: true },
      )
      .exec();

    if (!result) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }
  }

  async findByCategory(
    businessProfile: BusinessProfile,
    category: string,
  ): Promise<Product[]> {
    return this.productModel
      .find({
        business_profile_id: businessProfile._id,
        category,
        deleted: false,
      })
      .exec();
  }

  async updateStock(
    businessProfile: BusinessProfile,
    id: string,
    quantity: number,
  ): Promise<Product> {
    const product = await this.findOne(businessProfile, id);
    const newStock = product.stock + quantity;

    if (newStock < 0) {
      throw new Error('Insufficient stock');
    }

    return this.update(businessProfile, id, { stock: newStock });
  }

  async searchProducts(
    businessProfile: BusinessProfile,
    query: string,
  ): Promise<Product[]> {
    return this.productModel
      .find({
        business_profile_id: businessProfile._id,
        deleted: false,
        $or: [
          { item_name: { $regex: query, $options: 'i' } },
          { item_description: { $regex: query, $options: 'i' } },
          { sku: { $regex: query, $options: 'i' } },
        ],
      })
      .exec();
  }
}
