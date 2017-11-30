FROM mhart/alpine-node:6

COPY package.json .
RUN npm install

COPY main.js .

CMD ["node", "main.js"]
