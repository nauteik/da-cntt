scp -i "C:\Users\Lenovo\.ssh\digitalocean" -r "c:\Users\Lenovo\OneDrive\Desktop\TDTU\src\da_cntt\backend" root@159.89.207.151:/opt/app/

cd /opt/app
docker-compose down
docker-compose up -d --build