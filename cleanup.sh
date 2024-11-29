docker compose down
docker rmi -f $(docker images -aq)
docker volume rm $(docker volume ls -qf dangling=true)
# docker system prune