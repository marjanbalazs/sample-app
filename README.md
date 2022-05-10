## Sample App

### Install
```
npm install
npx lerna bootstrap
```

### Run in Dev mode
```
npm run compile
./start-local-mongo.sh
npm run dev
```
Navigate to http://localhost:8000 in the browser

### Improvements / Todo
* Set up production build targets with docker
  * Serve the client with nginx
  * Pass the backend url to the client
  * Set up environment variable handling with dotenv for the backend
* Handle errors on the frontend
* Add tracing to calls (transaction IDs for graphql requests, log failed transaction IDs on backend, pass back to frontend)
* Actually finish the abandoned local docker compose setup
* Set up CI/CD
* Fiddle with the backend graphql endpoints, they are not too graphqly
* Actually learn how mongodb works
* I'm unsure about the proper/idiomatic use of the mongo sdk
  * Create a mongodb schema?
  * Generate types for the graphql schema with the graphql codegen tool - it is possible: https://www.graphql-code-generator.com/plugins/typescript-mongodb
* Frontent is ugly
  * Move styling to stylesheets/styled componenets, somewhere out of the code
  * Ask for designer input, haha
* Tags could be little, clickable tags that you can multiselect when searching (or something)
  * Add pagination in case there are many collections or tasks inside collections?

