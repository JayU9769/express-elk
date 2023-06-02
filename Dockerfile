FROM node:16-alpine

RUN apk update && apk upgrade && apk add bash make git python3

# Set working directory
WORKDIR /app

EXPOSE 9200
EXPOSE 5601
EXPOSE 5044
EXPOSE 1514
EXPOSE 9600

