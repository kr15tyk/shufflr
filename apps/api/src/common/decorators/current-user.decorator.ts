import { createParamDecorator, ExecutionContext } from '@nestjs/common';

type CurrentAuthenticatedUser = {
  userId: string;
  email: string;
  roles: unknown[];
};

export const CurrentUser = createParamDecorator((_data: unknown, ctx: ExecutionContext) => {
  const request = ctx.switchToHttp().getRequest();
  return request.user as CurrentAuthenticatedUser;
});
