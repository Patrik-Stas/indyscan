logs:
	docker-compose -f docker-compose.yml logs -f

up:
	docker-compose -f docker-compose.yml up && \
	make logs

down:
	docker-compose -f docker-compose.yml down

new:
	docker-compose -f docker-compose.yml down --remove-orphans --volumes && \
	docker-compose -f docker-compose.yml up -d && \
	make logs
