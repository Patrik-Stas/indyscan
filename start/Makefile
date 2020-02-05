logs:
	docker-compose -f docker-compose.yml logs -f

up:
	docker-compose -f docker-compose.yml up && \
	make logs

down:
	docker-compose -f docker-compose.yml down --remove-orphans

destroy:
	docker-compose -f docker-compose.yml down --remove-orphans --volumes

new:
	make destroy && \
	docker-compose -f docker-compose.yml up -d && \
	make logs
