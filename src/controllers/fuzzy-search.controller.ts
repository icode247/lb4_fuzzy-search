import {getModelSchemaRef, get, requestBody} from '@loopback/rest';
import Fuse from 'fuse.js';
import {DefaultCrudRepository, Entity, Model} from '@loopback/repository';
import {inject} from '@loopback/core';
import {DataSource} from '@loopback/repository';
import path from 'path';
import * as fs from 'fs';
import {juggler} from '@loopback/repository';

export class FuzzySearchController {
  constructor(
    @inject('datasources.DbDataSource') private dataSource: DataSource,
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

  private getModelProperties(modelInstance: Model): string[] {
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

  @get('/fuzzy-search', {
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
      query: string;
      options: object;
    },
  ): Promise<object[]> {
    const {query, options} = requestbody;

    // Get model files
    const modelFiles = await this.getModelFiles();
    
    // Get model instances
    const modelInstances = await this.getModelInstances(modelFiles);

    // Get model repositories
    const modelRepositories = this.getModelRepositories(modelInstances);

    // Fetch data from all models
    const allData = await Promise.all(
      modelRepositories.map(async repo => repo.find()),
    ).then(results => results.flat());

    // Get model properties
    const modelProperties = this.getModelProperties(allData[0]);

    // Merge provided options with model properties
    const searchOptions = {
      ...options,
      keys: modelProperties,
    };

    // Initialize Fuse.js with the combined data and merged options
    const fuse = new Fuse(allData, searchOptions);

    // Perform the fuzzy search
    const results = fuse.search(query);

    return results;
  }
}
