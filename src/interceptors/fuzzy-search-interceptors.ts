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
import { Model, Entity} from '@loopback/repository';

export class FuzzySearchInterceptor implements Provider<Interceptor> {
  constructor(
    @inject('services.FuseSearchService')
    private fuseSearchService: FuseSearchService,
    @inject(RestBindings.Http.CONTEXT)
    private requestContext: RequestContext,
  ) {}

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
    const searchTerm = this.requestContext.request.query.searchTerm;
    const result = await next();

    if (!searchTerm || !Array.isArray(result) || result.length === 0) {
      return result;
    }

    const modelProperties = this.getModelProperties(result[0]);

    const options: FuseSearchOptions = {
      includeScore: true,
      includeMatches: true,
      minMatchCharLength: 3,
      threshold: 0.4,
      ignoreLocation: true,
      keys: modelProperties,
    };

    return this.fuseSearchService.search(result, searchTerm as string, options);
  }
}

