import {getModelSchemaRef, get, requestBody, param} from '@loopback/rest';
import Fuse from 'fuse.js';
import {DefaultCrudRepository, Entity, Model} from '@loopback/repository';
import {InvocationResult, ValueOrPromise, inject} from '@loopback/core';
import {DataSource} from '@loopback/repository';
import path from 'path';
import * as fs from 'fs';
import {juggler} from '@loopback/repository';
import {FuseSearchOptions, FuseSearchService} from '../services';

export class FuzzySearchController {
  constructor(
    @inject('datasources.DbDataSource') private dataSource: DataSource,
    @inject('services.FuseSearchService')
    private fuseSearchService: FuseSearchService,
  ) {}

  private async getModelFiles(): Promise<string[]> {
    const modelPath = path.join(__dirname, '..', '/models');
    const modelFiles = fs
      .readdirSync(modelPath)
      .filter(file => {
        return file.endsWith('.model.ts') || file.endsWith('.model.js');
      })
      .map(file => path.join(modelPath, file));
    return modelFiles;
  }

  getModelProperties(modelInstance: Model): string[] {
    const modelClass = modelInstance.constructor as typeof Entity;
    const modelDefinition = modelClass.definition;
    if (!modelDefinition) {
      return [];
    }
    return Object.keys(modelDefinition.properties);
  }
  private getModelRepositories(
    modelClasses: (typeof Entity & {prototype: Entity})[],
  ): Array<DefaultCrudRepository<any, any>> {
    return modelClasses.map(
      // eslint-disable-next-line @typescript-eslint/naming-convention
      ModelClass => {
        const modelDataSource = new juggler.DataSource(
          this.dataSource.settings,
        );
        return new DefaultCrudRepository(ModelClass, modelDataSource);
      },
    );
  }
  private async getModelInstances(
    modelFiles: string[],
  ): Promise<(typeof Entity & {prototype: Entity})[]> {
    const modelClasses: (typeof Entity & {prototype: Entity})[] = [];
    for (const file of modelFiles) {
      const importedModule = await import(file);
      const ModelClass = Object.values(importedModule)[0] as typeof Entity & {
        prototype: Entity;
      };
      modelClasses.push(ModelClass);
    }
    return modelClasses;
  }
  @get('/fuzzy/{searchTerm}', {
    responses: {
      '200': {
        description: 'Fuzzy search results',
        content: {
          'application/json': {
            schema: {
              type: 'array',
              items: getModelSchemaRef(Object),
            },
          },
        },
      },
    },
  })
  async fuzzySearch(
    @requestBody({
      content: {
        'application/json': {
          schema: {
            type: 'object',
            properties: {
              query: {type: 'string'},
              options: {type: 'object'},
            },
          },
        },
      },
    })
    requestbody: {
      options: object;
    },
    @param.path.string('searchTerm') searchTerm: string,
  ): Promise<object[]> {
    //const {options} = requestbody;
    let result: ValueOrPromise<InvocationResult>;
    const modelFiles = await this.getModelFiles();

    // // Get model instances
    const modelInstances = await this.getModelInstances(modelFiles);

    // // Get model repositories
    const modelRepositories = this.getModelRepositories(modelInstances);

    // Fetch data from all models
    result = await Promise.all(
      modelRepositories.map(async repo => repo.find()),
    ).then(results => results.flat());

    // Get model properties
    const modelProperties = this.getModelProperties(result[0]);

    const options: FuseSearchOptions = {
      includeScore: true,
      includeMatches: true,
      minMatchCharLength: 3,
      threshold: 0.4,
      ignoreLocation: true,
      keys: modelProperties,
    };

    let searchResult = this.fuseSearchService.search(
      result,
      searchTerm,
      options,
    );
    // Add model name and endpoint information to each result
    searchResult = searchResult.map((item, index) => {
      return {
        ...item,
        model: result[index].constructor.name, // Name of the model
      };
    });

    return searchResult;
  }
}
