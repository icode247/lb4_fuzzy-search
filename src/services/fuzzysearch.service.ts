import {bind, BindingScope} from '@loopback/core';
import Fuse from 'fuse.js';

export interface FuseSearchOptions {
  includeScore?: boolean;
  includeMatches?: boolean;
  minMatchCharLength?: number;
  threshold?: number;
  ignoreLocation?: boolean;
  keys: string[];
}

@bind({scope: BindingScope.SINGLETON})
export class FuseSearchService {
  constructor() {}

  search<T>(
    data: T[],
    searchTerm: string,
    options: FuseSearchOptions,
  ): Fuse.FuseResult<T>[] {
    const fuseIndex = Fuse.createIndex(options.keys, data);
    const fuse = new Fuse(data, options, fuseIndex);
    return fuse.search(searchTerm);
  }
}
