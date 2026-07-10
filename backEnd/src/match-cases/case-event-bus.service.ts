import { Injectable, Logger } from '@nestjs/common';
import { CaseDomainEvent } from './domain/domain-events';

@Injectable()
export class CaseEventBus {
  private readonly logger = new Logger(CaseEventBus.name);

  emit(event: CaseDomainEvent): void {
    this.logger.debug(`Case event: ${event.type} caseId=${event.caseId}`);
    // Notification listeners will subscribe here in a future iteration.
  }
}
