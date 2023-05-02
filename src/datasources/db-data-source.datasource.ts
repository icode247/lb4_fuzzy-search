import {inject, lifeCycleObserver, LifeCycleObserver} from '@loopback/core';
import {juggler} from '@loopback/repository';

const config = {
  name: 'DbDataSource',
  connector: 'mysql',
  url: '',
  host: process.env.DATABASE_HOST,
  port: process.env.DATABASE_PORT,
  user: process.env.DATABASE_USER,
  password: process.env.DATABASE_PASSWORD,
  database: process.env.DATABASE_NAME,
};

// Observe application's life cycle to disconnect the datasource when
// application is stopped. This allows the application to be shut down
// gracefully. The `stop()` method is inherited from `juggler.DataSource`.
// Learn more at https://loopback.io/doc/en/lb4/Life-cycle.html
@lifeCycleObserver('datasource')
export class DbDataSourceDataSource extends juggler.DataSource
  implements LifeCycleObserver {
  static dataSourceName = 'DbDataSource';
  static readonly defaultConfig = config;

  constructor(
    @inject('datasources.config.DbDataSource', {optional: true})
    dsConfig: object = config,
  ) {
    super(dsConfig);
  }
}
