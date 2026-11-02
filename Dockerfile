# Use the small official Node.js image as the base.
FROM node:24-alpine

# Set production mode for the Node.js application.
ENV NODE_ENV=production

# Use /app as the working directory inside the container.
WORKDIR /app

# Copy the app's package file and server into /app in the image.
# COPY syntax: COPY [source on your computer] [destination in the image]
# The source paths are relative to the build context (the folder passed to docker build).
COPY package.json server.js ./

# Copy the browser files into /app/public in the image.
COPY public ./public

# Run the app as the non-root node user.
USER node

# Document that the app listens on port 3000.
EXPOSE 3000

# Start the Node.js application when the container launches.
CMD ["npm", "start"]
