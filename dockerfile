# Use the official Node.js image from the Docker Hub
FROM node:22-alpine


RUN apk add --no-cache git
# Set the working directory inside the container
WORKDIR /app

# Install Yarn globally

# Copy the package.json and yarn.lock files to the working directory
COPY package.json yarn.lock ./

# Install dependencies using Yarn
RUN yarn install

# Copy the rest of the application files to the container
COPY . .

RUN yarn run build-info
# Expose the application port (change as necessary)
EXPOSE 9991

# Command to run your app
CMD ["yarn", "start"]
