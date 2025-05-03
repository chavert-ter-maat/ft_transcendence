NAME = ft_transcendence

include .env

DB_DATA = ${DB_LOCATION}

DOCKER_COMPOSE = docker compose -f ./docker-compose.yml

DOCKER = docker

all: up

up:
	@mkdir -p $(DB_DATA)
	NODE_ENV=production ${DOCKER_COMPOSE} up

dev:
	@mkdir -p $(DB_DATA)
	NODE_ENV=development HOSTNAME=$(shell hostname) ${DOCKER_COMPOSE} --profile dev up

eval:
	@mkdir -p $(DB_DATA)
	NODE_ENV=eval HOSTNAME=$(shell hostname) ${DOCKER_COMPOSE} --profile eval up

test: down build up

down:
	${DOCKER_COMPOSE} down

start:
	$(DOCKER_COMPOSE) start

stop:
	$(DOCKER_COMPOSE) stop

build:
	$(DOCKER_COMPOSE) build

db:
	docker exec -it db bash

clean:
	@docker stop $$(docker ps -qa) || true
	@docker rm $$(docker ps -qa) || true
	@docker rmi -f $$(docker images -qa) || true
	@docker volume rm $$(docker volume ls -q) || true
	@docker network rm $$(docker network ls -q) || true
	@rm -rf $(DB_DATA) || true

re: clean up
	NODE_ENV=production ${DOCKER_COMPOSE} up --build

redev: clean dev
	NODE_ENV=development HOSTNAME=$(shell hostname) ${DOCKER_COMPOSE} --profile dev up --build

prune: clean
	@docker system prune -a --volumes -f

.PHONY: all up down start stop build clean re prune db dev redev