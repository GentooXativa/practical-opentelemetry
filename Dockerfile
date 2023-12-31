FROM node:20-alpine

WORKDIR /app

COPY . /app
RUN npm install

EXPOSE 3000

ENTRYPOINT [ "node", "--require", "/app/openTelemetry.js", "index.js" ]