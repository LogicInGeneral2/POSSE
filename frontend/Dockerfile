# frontend/Dockerfile
# Stage 1: Build the React application
FROM node:18-alpine AS builder
WORKDIR /app

COPY package*.json ./
# If you use yarn, use `COPY yarn.lock package.json ./` and `RUN yarn install`
RUN npm install

COPY . .
# Build the Vite project
RUN npm run build

# Stage 2: Serve the application with Nginx
FROM nginx:alpine
# Copy built assets from the builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]