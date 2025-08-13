import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger } from '@nestjs/common';

async function bootstrap() {
  const appContext = await NestFactory.createApplicationContext(AppModule, {
    bufferLogs: true,
  });

  const logger = new Logger('Modo Standalone Activado');

  try {
    
    

  } catch (error) {
    logger.error(error);
  } finally {
    await appContext.close();
  }
}

bootstrap();
