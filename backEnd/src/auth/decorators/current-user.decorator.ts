import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { AuthUserPayload } from '../types/auth-user.payload';

export const CurrentUser = createParamDecorator(
  (_data: unknown, context: ExecutionContext): AuthUserPayload => {
    const request = context.switchToHttp().getRequest<{ user: AuthUserPayload }>();
    return request.user;
  },
);
