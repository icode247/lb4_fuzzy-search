# Use Node.js 16 Alpine image
FROM node:16-alpine

# Set the working directory
WORKDIR /usr/src/app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install all dependencies
RUN npm ci

# Copy the rest of the code
COPY . .

# Run the build script
RUN npm run build

# Remove development dependencies
RUN npm prune --production

# Expose port 3000
EXPOSE 3000

# Start the application
CMD [ "node", "." ]
