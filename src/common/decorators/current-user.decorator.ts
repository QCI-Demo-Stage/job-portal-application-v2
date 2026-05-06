import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import type { JwtUser } from '../../auth/strategies/jwt.strategy';

export const CurrentUser = createParamDecorator(
  (
    data: keyof JwtUser | undefined,
    ctx: ExecutionContext,
  ): JwtUser[keyof JwtUser] | JwtUser | undefined => {
    const request = ctx.switchToHttp().getRequest<{ user?: JwtUser }>();
    const user = request.user;
    if (!user) {
      return undefined;
    }
    return data ? user[data] : user;
  },
);
