FROM alpine:latest
RUN apk update
RUN apk add nodejs
RUN apk add npm
COPY . .
RUN npm install
RUN npx lerna bootstrap
EXPOSE 3000
CMD ["npm", "run", "dev"]