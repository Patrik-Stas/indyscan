## Full Indyscan + ES
logs:
	docker-compose -f docker-compose.yml -f docker-compose.es.yml logs -f

pull:
	docker-compose -f docker-compose.yml -f docker-compose.es.yml pull

up:
	docker-compose -f docker-compose.yml -f docker-compose.es.yml up && \
	make logs

down:
	docker-compose -f docker-compose.yml -f docker-compose.es.yml down --remove-orphans

destroy:
	docker-compose -f docker-compose.yml -f docker-compose.es.yml down --remove-orphans --volumes

new:
	make destroy && \
	docker-compose -f docker-compose.yml -f docker-compose.es.yml up -d
