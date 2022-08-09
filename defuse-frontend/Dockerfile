FROM node:14.15.2-slim

WORKDIR /app
ENV PATH /app/node_modules/.bin:$PATH

COPY . .

RUN npm install

# CMD ng start
CMD ng serve --host 0.0.0.0 --port 4200