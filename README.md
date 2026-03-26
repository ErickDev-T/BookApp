# bookapp

app mvc con express + sequelize + hbs.

## scripts

- `npm run dev`: entorno development
- `npm run dev:qa`: entorno qa
- `npm run db:sync`: crea tablas en db development
- `npm run db:sync:qa`: crea tablas en db qa
- `npm run mail:test -- --to=correo@dominio.com`: prueba correo en development
- `npm run mail:test:qa -- --to=correo@dominio.com`: prueba correo en qa

## variables de entorno

### `.env` (development)

```env
PORT=3000
DB_DIALECT=sqlite
DB_STORAGE=./database/dev.sqlite
DB_LOGGING=false
MAIL_MODE=auto
MAIL_HOST=
MAIL_PORT=587
MAIL_SECURE=false
MAIL_USER=
MAIL_PASS=
MAIL_FROM=no-reply@bookapp.local
MAIL_TEST_TO=
```

### `.env.qa` (qa)

```env
PORT=4000
DB_DIALECT=sqlite
DB_STORAGE=./database/qa.sqlite
DB_LOGGING=false
MAIL_MODE=auto
MAIL_HOST=
MAIL_PORT=587
MAIL_SECURE=false
MAIL_USER=
MAIL_PASS=
MAIL_FROM=no-reply@bookapp.local
MAIL_TEST_TO=
```

## envio de correo al crear libro

al crear un libro se intenta enviar correo al autor.

- `MAIL_MODE=auto`: usa smtp si hay config completa, si no usa mock.
- `MAIL_MODE=smtp`: fuerza smtp.
- `MAIL_MODE=mock`: fuerza simulacion en consola.

si quieres smtp real, coloca host/puerto/credenciales del proveedor (gmail, mailtrap, etc).
