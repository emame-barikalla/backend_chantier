# Stage 1: Build the Angular application
FROM node:20 AS build
# Set working directory
WORKDIR /app
# Copy package.json and package-lock.json
COPY package*.json ./
# Install dependencies
RUN npm install
# Copy the rest of the application code
COPY . .
# Build the application
RUN npm run build -- --configuration production

# Stage 2: Serve the application using Nginx
FROM nginx:alpine
# Copy the build output to replace the default nginx contents
COPY --from=build /app/dist/frontend/browser /usr/share/nginx/html
# Expose port 80
EXPOSE 80
# Start Nginx server
CMD ["nginx", "-g", "daemon off;"]
