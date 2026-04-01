FROM node:18-alpine as builder
WORKDIR /app
COPY . .
WORKDIR /app/Eleven2Eleven_RMS
RUN npm install
RUN npm run build
FROM nginx:alpine
RUN rm -rf /usr/share/nginx/html/*

COPY --from=builder /app/Eleven2Eleven_RMS/dist /usr/share/nginx/html
EXPOSE 80

# Khởi chạy Nginx
CMD ["nginx", "-g", "daemon off;"]