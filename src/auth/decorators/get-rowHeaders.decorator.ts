import { createParamDecorator, ExecutionContext } from "@nestjs/common";

export const GetRowHeaders = createParamDecorator(
    (_, ctx: ExecutionContext) => {
        const req = ctx.switchToHttp().getRequest()
        const rawHeaders = req.rawHeaders;
        return rawHeaders;
    }
)