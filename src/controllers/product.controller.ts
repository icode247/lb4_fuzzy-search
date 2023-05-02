import {
  repository,
  WhereBuilder,
} from '@loopback/repository';
import {
  param,
  post,
  get,
  getModelSchemaRef,
  requestBody,
  response,
} from '@loopback/rest';
import {Products} from '../models';
import {ProductsRepository} from '../repositories';

export class ProductController {
  constructor(
    @repository(ProductsRepository)
    public productsRepository: ProductsRepository,
  ) {}
  @get('/product/fuzzy-search/{keyword}')
  async fuzzySearch(
    @param.path.string('keyword') keyword: string,
  ): Promise<Products[]> {
    const whereBuilder = new WhereBuilder<Products>();
    const where = whereBuilder
      .impose({
        or: [
          {
            name: {
              like: `%${keyword}%`,
              options: 'i',
            },
          },
          {
            description: {
              like: `%${keyword}%`,
              options: 'i',
            },
          },
        ],
      })
      .build();
    return this.productsRepository.find({where});
  }

  @post('/products')
  @response(200, {
    description: 'Products model instance',
    content: {'application/json': {schema: getModelSchemaRef(Products)}},
  })
  async create(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Products, {
            title: 'NewProducts',
            exclude: ['id'],
          }),
        },
      },
    })
    products: Omit<Products, 'id'>,
  ): Promise<Products> {
    return this.productsRepository.create(products);
  }

}
