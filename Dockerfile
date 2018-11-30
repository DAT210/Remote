FROM node:8

WORKDIR /usr/src/app

COPY package*.json ./
RUN npm install

COPY ./src ./src

ENV NODE_ENV prod

COPY ./env/prod.env ./env/

COPY ./CouponDB ./CouponDB

COPY ./db ./db

EXPOSE 32100

CMD [ "node", "./src/app.js" ]

