# IB-project

Repository for the project of Information security

## installation

### Easy way: Docker

- Get docker & docker-compose
- Run `docker-compose build` and `docker-compose up`.
- Visit http://localhost:3000

### Harder way: no Docker

- Install node
- Install mongoDB (https://www.mongodb.com/download-center/community)
- Clone project: `git clone https://github.ugent.be/ndossche/IB-project.git`
- Go into project: `cd IB-project`
- Install dependencies: `npm install`
- Start mongodb server
- change databaseURL in `/server/config.json` to `mongodb://localhost:27017/infectionsuspect`
- Start server: `npm start` or as developer `npm run devstart`
- Visit http://localhost:3000
