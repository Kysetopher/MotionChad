#!/bin/sh

echo "==> Checking for certificate renewal..."

# Run Certbot renewal
certbot renew --nginx --quiet

# If any certificates were renewed, reload Nginx
if [ $? -eq 0 ]; then
  echo "==> Certificates renewed. Reloading Nginx..."
  nginx -s reload
else
  echo "==> No certificates were renewed."
fi
