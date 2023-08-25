# Use an official Nginx image as a parent image
FROM nginx:latest

# Remove the default Nginx configuration
RUN rm /etc/nginx/conf.d/default.conf

# Copy your custom Nginx configuration file to the container
COPY nginx.conf /etc/nginx/conf.d/

COPY certificate.pem /etc/nginx/ssl/
COPY key.pem /etc/nginx/ssl/

# Expose the ports that Nginx will listen on
EXPOSE 80 443

# Start Nginx when the container is started
CMD ["nginx", "-g", "daemon off;"]