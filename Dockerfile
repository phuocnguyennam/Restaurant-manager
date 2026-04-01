FROM node:18-alpine as builder
WORKDIR /app
COPY package-lock.json ./
COPY . .
RUN npm run dev
FROM nginx:alpine
RUN rm -rf /usr/share/nginx/html/*

COPY --from=builder /app/build /usr/share/nginx/html

EXPOSE 80

# Khởi chạy Nginx
CMD ["nginx", "-g", "daemon off;"]