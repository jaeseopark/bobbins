
## Development

```bash
docker-compose up --build -d
docker-compose exec ui yarn add prettier --write .
```

## Production

```bash
docker-compose -f docker-compose-prd.yml up --build -d
```
