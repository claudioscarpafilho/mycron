@echo off

REM Construir a imagem do Docker
docker-compose build

REM Subir o container
docker-compose up -d

REM Remover imagens órfãs
docker image prune -f