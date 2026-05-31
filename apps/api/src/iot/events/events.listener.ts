import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { PECUS_EVENTS } from '@pecus/types';

/**
 * EventsListener — observabilidad central de eventos de dominio.
 * Demuestra el bus de eventos (EventEmitter2). En producción aquí se
 * conectarían websockets, webhooks o un stream hacia el frontend.
 */
@Injectable()
export class EventsListener {
  private readonly logger = new Logger('Events');

  @OnEvent(PECUS_EVENTS.FEEDING_UPDATED)
  onFeeding(p: any) {
    this.logger.debug(`feeding.updated → ${p.codigoVaca} (${p.estado})`);
  }

  @OnEvent(PECUS_EVENTS.FEEDING_RESET_COMPLETED)
  onReset(p: any) {
    this.logger.log(`feeding.reset.completed → ${p.affected} vacas`);
  }

  @OnEvent(PECUS_EVENTS.REPRODUCTION_UPDATED)
  onRepro(p: any) {
    this.logger.debug(`reproduction.updated → ${p.codigoVaca} (${p.estadoNuevo})`);
  }

  @OnEvent(PECUS_EVENTS.ALERT_CREATED)
  onAlert(p: any) {
    this.logger.debug(`alert.created → ${p.type}`);
  }
}
