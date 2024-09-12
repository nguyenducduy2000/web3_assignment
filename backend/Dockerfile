# Stage 1: Build
FROM node:20-slim AS build

WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy all source files
COPY . .

# Build the application
RUN npm run build

# Stage 2: Production
FROM node:20-alpine

WORKDIR /app

# Copy the build artifacts from the build stage
COPY --from=build /app/build /app/build

# Copy only the necessary files from the build stage
COPY --from=build /app/package*.json /app/build

# Install production dependencies
WORKDIR /app/build

RUN npm install --production

EXPOSE 3333

# Command to run the application
CMD ["sh", "-c", "node ace migration:run && bin/server.js"]
