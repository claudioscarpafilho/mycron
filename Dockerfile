FROM node:18-slim
WORKDIR /usr/src/app
RUN npm install -g nodemon
COPY package*.json ./
RUN npm ci ---omit=dev
COPY . .
CMD npm run start
# CMD npm run dev