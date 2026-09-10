# Publicar el portafolio con HTTPS

El sitio se sirve desde el mismo servidor donde ya viven n8n, Caddy y Clack.
Caddy pide y renueva el certificado por su cuenta, así que el HTTPS no cuesta
nada: no hace falta el balanceador de AWS ni sus 16 USD al mes.

## Preparación, una sola vez

**1. Añade el bloque del dominio** al final de `/home/ubuntu/n8n-docker/Caddyfile`:

```
francisco.kursperu.duckdns.org {
    reverse_proxy portafolio:3002
}
```

**2. Recarga Caddy** sin cortar ninguna conexión:

```bash
docker exec n8n-docker-caddy-1 caddy reload --config /etc/caddy/Caddyfile
```

**3. Comprueba el nombre de la red** de Docker, que el script necesita:

```bash
docker network ls | grep n8n
```

Si no se llama `n8n-docker_default`, corrige la línea `--network` de
`publicar.sh`.

## Cada despliegue

Desde tu Mac, en la carpeta del proyecto:

```bash
export PORTAFOLIO_SERVIDOR=usuario@tu-servidor
bash despliegue/publicar.sh
```

Compila aquí, envía solo lo construido, reconstruye el contenedor y comprueba
que `https://francisco.kursperu.duckdns.org/health` responde.

## Por qué así

| Decisión | Motivo |
|---|---|
| Compilar en el Mac | La instancia comparte memoria con n8n; mejor no hacerle trabajar de más |
| Sin publicar puertos | El contenedor solo es accesible desde Caddy, por la red interna |
| `HTTPS_ENABLED=true` | Detrás de Caddy sí hay certificado, así que procede exigir HTTPS y anunciar HSTS |
| Recargar en vez de reiniciar Caddy | Un reinicio cortaría también n8n y Clack |

## Si algo falla

```bash
docker logs portafolio          # qué dice la aplicación
docker ps | grep portafolio     # ¿está en marcha?
docker exec n8n-docker-caddy-1 caddy validate --config /etc/caddy/Caddyfile
```
