import {repository} from '@loopback/repository';
import {
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

  @get('/products/fuzzy-search')
  async fuzzySearch(): Promise<Products[]> {
    return this.productsRepository.find();
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
