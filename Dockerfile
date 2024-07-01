FROM node:14

RUN mkdir users
WORKDIR /users
COPY . .
RUN npm install
CMD ["npm","run","start"]
