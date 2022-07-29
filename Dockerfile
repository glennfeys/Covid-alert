FROM node:latest
WORKDIR /app
COPY package.json /app
RUN yarn
ADD https://github.com/ufoscout/docker-compose-wait/releases/download/2.2.1/wait /wait
RUN chmod +x /wait
COPY . /app
CMD /wait && npm run start
EXPOSE 3000