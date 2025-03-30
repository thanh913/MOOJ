FROM node:16-alpine

WORKDIR /app

# Copy package files first for better layer caching
COPY package.json package-lock.json* ./

# Install all dependencies, including devDependencies
RUN npm install

# Copy the rest of the app
COPY . .

# Add healthcheck
RUN apk add --no-cache curl
HEALTHCHECK --interval=30s --timeout=5s --retries=3 CMD curl -f http://localhost:3000/ || exit 1

# Set environment variables
ENV REACT_APP_API_URL=http://localhost:8000/api

EXPOSE 3000

CMD ["npm", "start"]
