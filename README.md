# SERVER

- inside ```./server```, run ```npm install```
- create .env file and add:
  - PORT = *choose a port number*
  - JWT_SECRET = *choose a secret*
  - dbName = *name of your local postgres user*
  - dbPass = *associated postgres password*
- create a local **postgres** database with the name 'pet-tinder' (PGadmin)
- run ```nodemon``` command in terminal

Your server should be running! 

## NEXT STEPS

- build out models 
- import models ```{ Dog || User }``` into controllers
- import ```bcrypt``` and ```jwt``` into usercontroller
- build out controllers
## MIDDLEWARE
- setup middleware (```validateSession``` and ```headers```)
  - import ```{ User }``` and ```jwt``` into validateSession
  - we can probably copy/paste another validateSession, but maybe we should go over it as a group to refresh our memories
- import ```validateSession``` to controllers 