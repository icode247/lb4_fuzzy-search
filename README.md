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

3. Setup Dev Environment

To run the application locally on your computer, you need to setup the dev environment by copying these credentials below to a `.env` file.:


       DATABASE_HOST="db"
       DATABASE_PORT="3306"
       DATABASE_USER="lb4"
       DATABASE_PASSWORD="lb4"
       DATABASE_NAME="lb4db"


1. Install dependencies

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
The Fuzzy search feature works for all the models and controllers in the application.
Use a REST client, such as Postman, to create some Product records.

       POST http://localhost:3000/products

All the controllers in your application will have a `/fussy/{searchTerm}` endpoint that implemets fuzzy search for all the models properties for tha controller:

       GET http://localhost:3000/products/fussy/Petrick

## Stopping and Removing the Docker Containers
To stop and remove the Docker containers, run:


       docker-compose down


## What's next

Please check out [LoopBack 4 documentation](https://loopback.io/doc/en/lb4/) to
understand how you can continue to add features to this application.

[![LoopBack](https://github.com/loopbackio/loopback-next/raw/master/docs/site/imgs/branding/Powered-by-LoopBack-Badge-(blue)-@2x.png)](http://loopback.io/)
