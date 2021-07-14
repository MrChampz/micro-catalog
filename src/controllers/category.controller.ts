import {Count, CountSchema, EntityNotFoundError, Filter, repository, Where} from '@loopback/repository';
import {param, get, getModelSchemaRef} from '@loopback/rest';
import {Category} from '../models';
import {CategoryRepository} from '../repositories';
import {PaginatorSerializer} from "../utils/paginator-serializer";
import {CategoryFilter} from "../filters/category.filter";

export class CategoryController {
  constructor(
    @repository(CategoryRepository)
    public categoryRepository: CategoryRepository,
  ) {}

  @get('/categories/count', {
    responses: {
      '200': {
        description: 'Category model count',
        content: {'application/json': {schema: CountSchema}},
      },
    },
  })
  async count(
    @param.where(Category) where?: Where<Category>,
  ): Promise<Count> {
    return this.categoryRepository.count(where);
  }

  @get('/categories', {
    responses: {
      '200': {
        description: 'Array of Category model instances',
        content: {
          'application/json': {
            schema: {
              type: 'array',
              items: getModelSchemaRef(Category, {includeRelations: true}),
            },
          },
        },
      },
    },
  })
  async find(
    @param.filter(Category) filter?: Filter<Category>,
  ): Promise<PaginatorSerializer<Category>> {
    const newFilter = new CategoryFilter(filter).build();
    return this.categoryRepository.paginate(newFilter);
  }

  @get('/categories/{id}', {
    responses: {
      '200': {
        description: 'Category model instance',
        content: {
          'application/json': {
            schema: getModelSchemaRef(Category, {includeRelations: true}),
          },
        },
      },
    },
  })
  async findById(
    @param.path.string('id') id: string,
    @param.filter(Category, {exclude: 'where'}) filter?: Filter<Category>
  ): Promise<Category> {
    const newFilter = new CategoryFilter(filter)
      .where({ id })
      .build();
    const category = await this.categoryRepository.findOne(newFilter);

    if (!category) {
      throw new EntityNotFoundError(Category, id);
    }

    return category;
  }
}
