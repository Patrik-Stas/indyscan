localhost-logs:
	docker-compose -f docker-compose.yml logs -f

localhost-up:
	docker-compose -f docker-compose.yml up

localhost-down:
	docker-compose -f docker-compose.yml down --remove-orphans --volumes

localhost-new:
	docker-compose -f docker-compose.yml down --remove-orphans --volumes && \
	docker-compose -f docker-compose.yml up -d && \
	make localhost-logs
