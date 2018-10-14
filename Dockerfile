FROM node:8

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install npm@5.6.0
RUN rm -rf /usr/local/lib/node_modules/npm
RUN mv node_modules/npm /usr/local/lib/node_modules/npm
RUN npm -v
RUN npm install

COPY . .

EXPOSE 80

CMD [ "npm", "start"]
