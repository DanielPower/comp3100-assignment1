# COMP 3100 Assignment 1

Author: Daniel Power  
Student Number: 201244498  
Email: djp468@mun.ca  

# Running the server

1. Open a terminal and `cd` into the project root (the directory containing `package.json`)
2. Install dependencies  
   `npm install`
3. Set environment variables  
   `export STOREFILE=store.json`
4. Run the server  
   `node app.js`

# Running unit tests
1. Follow the steps for running the server. Be sure to set the STOREFILE to the same file you use
   for the test runner. Using another file like `test.json` instead of `store.json` is a good idea
   to avoid overwriting "production" data.
2. Open a separate terminal to run the unit tests in.
3. Set environment variables. Be sure to use the same STOREFILE as you did for the server.  
   ```
   export STOREFILE=test.json
   export LOCATION=http://localhost:3000
   ```
4. Run unit tests  
   `node test.js`
