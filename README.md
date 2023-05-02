# lb4-fuzzy-search-demo

This application is generated using [LoopBack 4 CLI](https://loopback.io/doc/en/lb4/Command-line-interface.html) with the
[initial project layout](https://loopback.io/doc/en/lb4/Loopback-application-layout.html).

## Prerequisites

- Docker
- Docker Compose

## Setup

1. Clone this repository.


       git clone https://github.com/icode247/lb4_fuzzy-search/
       cd lb4_fuzzy-search

2. Install dependencies

By default, dependencies were installed when this application was generated.
Whenever dependencies in `package.json` are changed, run the following command:

```sh
npm install
```

## Build the LoopBack 4 application Docker image.

       docker-compose build
       
       
## Start the Docker containers for the LoopBack 4 application and MySQL database.

       docker-compose up -d
       
## Run the LoopBack 4 migration script to create the necessary tables and indexes in the MySQL database.

      docker-compose exec lb4_app npm run migrate
      
The LoopBack 4 application should now be running and accessible at http://localhost:3000.

## Testing the Fuzzy Search Feature
Use a REST client, such as Postman, to create some Product records.

       POST http://localhost:3000/products
       
Test the fuzzy search endpoint by replacing {keyword} with the desired search keyword.

       GET http://localhost:3000/products/fuzzy-search/{keyword}
       
## Stopping and Removing the Docker Containers
To stop and remove the Docker containers, run:


       docker-compose down
       

## What's next

Please check out [LoopBack 4 documentation](https://loopback.io/doc/en/lb4/) to
understand how you can continue to add features to this application.

[![LoopBack](https://github.com/loopbackio/loopback-next/raw/master/docs/site/imgs/branding/Powered-by-LoopBack-Badge-(blue)-@2x.png)](http://loopback.io/)
