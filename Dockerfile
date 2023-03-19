FROM node:16 AS build
WORKDIR ./../src/app
copy package.json package-lock.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:1.21.6-alpine
COPY --from=build dist/money-manager /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf