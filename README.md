add a .env file in the root directory:
DB_HOST is the docker ip adress of the database

to start:
docker compose up

to completelty remove:
docker compose down && ./cleanup.sh && docker system prune
