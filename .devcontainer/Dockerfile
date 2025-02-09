FROM node:21

WORKDIR /workspace

COPY package*.json ./

RUN npm install -g npm@latest 

RUN npm install

COPY . .

EXPOSE 3000

CMD ["npm", "start"]
