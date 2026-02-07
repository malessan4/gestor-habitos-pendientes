import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // 1. Habilitar CORS para que el frontend (Vercel) pueda consultar al backend (Render)
  app.enableCors();

  // 2. Usar el puerto que asigne el hosting o el 3000 por defecto para local
  const port = process.env.PORT || 3000;

  await app.listen(port);
  console.log(`🚀 Habitus Stamina Server running on: http://localhost:${port}`);
}
bootstrap();