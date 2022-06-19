FROM node:16
RUN mkdir -p /app
WORKDIR /app
COPY package.json /app
RUN npm install 
COPY . /app
EXPOSE 5000
CMD ["npm","start"]