import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const Auth = createParamDecorator((_, ctx: ExecutionContext) => {
  const req = ctx.switchToHttp().getRequest();
  return req.user;
});
