FROM node:14

RUN mkdir users
WORKDIR /users
COPY . package.json
RUN npm install
COPY . .
CMD ["npm","run","start"]
