import {lifeCycleObserver, LifeCycleObserver} from '@loopback/core';
import {repository} from '@loopback/repository';
import {CategoryRepository, GenreRepository} from '../repositories';

@lifeCycleObserver('')
export class UpdateCategoryRelationObserver implements LifeCycleObserver {
  constructor(
    @repository(CategoryRepository)
    private categoryRepo: CategoryRepository,

    @repository(GenreRepository)
    private genreRepo: GenreRepository,
  ) {}

  async start(): Promise<void> {
    this.categoryRepo.modelClass.observe(
      'after save',
      async ({data, isNewInstance}) => {
        if (isNewInstance) {
          return;
        }
        await this.genreRepo.updateRelation('categories', data);
      },
    );
  }

  async stop(): Promise<void> {}
}
