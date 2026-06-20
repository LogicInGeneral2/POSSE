# frontend/Dockerfile
# Stage 1: Build the React application
FROM node:18-alpine AS builder
WORKDIR /app

COPY package*.json ./
# Install dependencies
RUN npm install

COPY . .
# Build the React project
RUN npm run build

# Stage 2: Nginx
FROM nginx:alpine
# Copy built assets 
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]