FROM node:20-alpine

WORKDIR /usr/src/app

COPY package*.json ./
RUN npm install

COPY . .

ENV DEBUG=pyroscope
EXPOSE 3000

CMD ["node", "app.js"]
