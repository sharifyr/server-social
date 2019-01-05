FROM node:8

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install npm@5.6.0
RUN rm -rf /usr/local/lib/node_modules/npm
RUN mv node_modules/npm /usr/local/lib/node_modules/npm
RUN npm -v
RUN npm install && npm install -g tsoa tslint typescript@3.1.1 nodemon@1.12.1 ts-node@7.0.1

COPY . .

EXPOSE 80

CMD [ "npm", "start"]
