import { NestFactory } from '@nestjs/core';
import type { IncomingMessage, ServerResponse } from 'http';
import { AppModule } from './app.module';
import { configureApp } from './app.setup';

type RequestListener = (req: IncomingMessage, res: ServerResponse) => void;

// Instância cacheada fora do handler (ADR-001 §Backend): só a primeira
// request de cada instância serverless paga o bootstrap do Nest.
let cached: Promise<RequestListener> | undefined;

async function bootstrap(): Promise<RequestListener> {
  const app = await NestFactory.create(AppModule);
  configureApp(app);
  await app.init();
  return app.getHttpAdapter().getInstance();
}

export async function handler(req: IncomingMessage, res: ServerResponse): Promise<void> {
  cached ??= bootstrap().catch((error) => {
    cached = undefined; // próxima request tenta de novo em vez de herdar a falha
    throw error;
  });
  const listener = await cached;
  listener(req, res);
}
