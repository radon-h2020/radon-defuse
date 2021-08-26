# Stage 1
FROM node:14.16.1

# set working directory
WORKDIR /app

# add `/app/node_modules/.bin` to $PATH
ENV PATH /app/node_modules/.bin:$PATH

# install and cache app dependencies
COPY package.json /app/package.json
RUN npm install -g @angular/cli@11.2.9 @angular-devkit/build-angular@0.1102.9 --force
RUN npm install

# add app
COPY . /app

# start app
CMD ng serve --host 0.0.0.0 --port 4200
