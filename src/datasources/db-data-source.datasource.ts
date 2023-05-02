import {inject, lifeCycleObserver, LifeCycleObserver} from '@loopback/core';
import {juggler} from '@loopback/repository';

const config = {
  name: 'DbDataSource',
  connector: 'mysql',
  url: '',
  host: 'aurora-mysql-test.cpfyybdyajmx.eu-central-1.rds.amazonaws.com',
  port: 3306,
  user: 'admin',
  password: 'florida2012',
  database: 'classicmodelsid'
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
