import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const User = createParamDecorator((_, context: ExecutionContext) => {
  return context.switchToHttp().getRequest().user;
});
