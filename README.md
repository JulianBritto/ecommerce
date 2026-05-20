This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Mercado Pago Sandbox

Para probar Mercado Pago sin cobrar dinero real, usa **credenciales de sandbox**:

```bash
NEXT_PUBLIC_MERCADO_PAGO_PUBLIC_KEY="TEST-XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX"
MERCADO_PAGO_ACCESS_TOKEN="TEST-XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX"
```

Reglas importantes:

- `TEST-` = sandbox
- `APP_USR` = producción
- No mezcles credenciales de prueba con usuarios o tarjetas de producción
- No mezcles credenciales de producción con usuarios o tarjetas de prueba

### Flujo recomendado de pruebas

1. Configura `.env` con credenciales `TEST-`
2. Ejecuta `npm run dev`
3. Abre `/conexion` y verifica que Mercado Pago responda
4. Abre `/debug-mercadopago` y confirma que el token sea válido
5. Ve a `/checkout`
6. Completa el formulario usando usuarios y tarjetas de prueba de Mercado Pago
7. El backend usará `sandbox_init_point` cuando exista y, si no, la URL de sandbox devuelta por Mercado Pago

### Páginas útiles

- `/conexion`: verifica conexión, credenciales y métodos disponibles
- `/debug-mercadopago`: valida el access token contra Mercado Pago
- `/checkout`: inicia el flujo de pago

## Learn More

To learn more about Next.js, take a look at these resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out the [Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy this app is using the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out the [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
