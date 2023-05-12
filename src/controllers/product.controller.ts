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

  /**
   * This endpoint performs a fuzzy search on the Products.
   *
   * @param searchTerm The term to search for in the Products data.
   * @returns An array of Products that match the search term.
   *
   * Example usage: /produtcs/fussy/john
   */
  @get('/products/fussy/{searchTerm}', {
    responses: {
      '200': {
        description: 'Array of Products model instances',
        content: {
          'application/json': {
            schema: {
              type: 'array',
              items: getModelSchemaRef(Products, {includeRelations: true}),
            },
          },
        },
      },
    },
  })
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
