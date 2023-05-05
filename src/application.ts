import {BootMixin} from '@loopback/boot';
import {ApplicationConfig, asGlobalInterceptor} from '@loopback/core';
import {
  RestExplorerBindings,
  RestExplorerComponent,
} from '@loopback/rest-explorer';
import {RepositoryMixin} from '@loopback/repository';
import {RestApplication} from '@loopback/rest';
import {ServiceMixin} from '@loopback/service-proxy';
import path from 'path';
import {MySequence} from './sequence';
import {FuseSearchService} from './services';
import {FuzzySearchInterceptor} from './interceptors/fuzzy-search-interceptors';
import { DbDataSourceDataSource } from './datasources';

export {ApplicationConfig};

export class Lb4FuzzySearchDemoApplication extends BootMixin(
  ServiceMixin(RepositoryMixin(RestApplication)),
) {
  constructor(options: ApplicationConfig = {}) {
    super(options);

    // Set up the custom sequence
    this.sequence(MySequence);

    // Set up default home page
    this.static('/', path.join(__dirname, '../public'));

    // Customize @loopback/rest-explorer configuration here
    this.configure(RestExplorerBindings.COMPONENT).to({
      path: '/explorer',
    });
    this.component(RestExplorerComponent);

    this.projectRoot = __dirname;
    // Customize @loopback/boot Booter Conventions here
    this.bootOptions = {
      controllers: {
        // Customize ControllerBooter Conventions here
        dirs: ['controllers'],
        extensions: ['.controller.js'],
        nested: true,
      },
    };
    this.service(FuseSearchService);
   // this.dataSource(DbDataSourceDataSource, 'db')
    // Register the FuzzySearchInterceptor as a global interceptor
    this.bind('interceptors.FuzzySearchInterceptor')
      .toProvider(FuzzySearchInterceptor)
      .apply(asGlobalInterceptor());
  }
}
