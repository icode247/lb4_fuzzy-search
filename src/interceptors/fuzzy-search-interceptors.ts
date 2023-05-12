// src/interceptors/fuzzy-search.interceptor.ts
import {
  inject,
  Interceptor,
  InvocationContext,
  InvocationResult,
  Provider,
  ValueOrPromise,
} from '@loopback/core';
import {FuseSearchService, FuseSearchOptions} from '../services';
import {RequestContext, RestBindings} from '@loopback/rest';
import {Model, Entity} from '@loopback/repository';
import {BindingKey} from '@loopback/context';

export class FuzzySearchInterceptor implements Provider<Interceptor> {
  constructor(
    @inject('services.FuseSearchService')
    private fuseSearchService: FuseSearchService,
    @inject(RestBindings.Http.CONTEXT)
    private requestContext: RequestContext,
  ) {}

  // Inside the FuzzySearchInterceptor class:
  static readonly BINDING_KEY = BindingKey.create<FuzzySearchInterceptor>(
    'interceptors.FuzzySearchInterceptor',
  );
  value() {
    return this.intercept.bind(this);
  }

  getModelProperties(modelInstance: Model): string[] {
    const modelClass = modelInstance.constructor as typeof Entity;
    const modelDefinition = modelClass.definition;
    if (!modelDefinition) {
      return [];
    }
    return Object.keys(modelDefinition.properties);
  }

  async intercept(
    invocationCtx: InvocationContext,
    next: () => ValueOrPromise<InvocationResult>,
  ): Promise<InvocationResult> {
    // const searchTerm = invocationCtx.args[1];
    const request = this.requestContext.request;
    const result = await next();

    const segments = request.path.split('/');

    // Check if the route contains 'fussy' and the result is non-empty array
    if (
      segments.includes('fussy') &&
      Array.isArray(result) &&
      result.length > 0 &&
      typeof result[0] === 'object'
    ) {
      const modelProperties = this.getModelProperties(result[0]);
      const options: FuseSearchOptions = {
        includeScore: true,
        includeMatches: true,
        minMatchCharLength: 3,
        threshold: 0.4,
        ignoreLocation: true,
        keys: modelProperties,
      };

      const searchTerm = segments[segments.indexOf('fussy') + 1];
      if (searchTerm) {
        let searchResult = this.fuseSearchService.search(
          result,
          searchTerm,
          options,
        );

        // Add model name and endpoint information to each result
        searchResult = searchResult.map(item => {
          return {
            ...item,
            modelName: result[0].constructor.name, // Name of the model
            endpoint: `${request.protocol}://${request.get('host')}${
              request.originalUrl
            }/${item.item.id}`, // Detailed endpoint URL
          };
        });

        return searchResult;
      }
    }

    return result;
  }
}
