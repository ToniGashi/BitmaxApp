FROM postgres:latest
ENV POSTGRES_PASSWORD docker
ENV POSTGRES_DB task
COPY task.sql /docker-entrypoint-initdb.d/
