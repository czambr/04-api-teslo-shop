import { Controller, Get, Post, Body, UseGuards, Req, SetMetadata } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

import { AuthService } from './auth.service';
import { CreateUserDto, LoginUserDto } from './dto';
import { Auth, GetUser, GetRowHeaders, RoleProtected } from './decorators';

import { User } from './entities/user.entity';
import { UserRoleGuard } from './guards/user-role.guard';
import { ValidRoles } from './interfaces';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {

  constructor(private readonly authService: AuthService) { }

  @Post('/register')
  create(@Body() createUserDto: CreateUserDto) {
    return this.authService.create(createUserDto);
  }

  @Post('/login')
  loginUser(@Body() loginUserDto: LoginUserDto) {
    return this.authService.login(loginUserDto)
  }

  @Get('/check-auth-status')
  @Auth()
  checkAuthStatus(
    @GetUser() user: User,
  ) {
    return this.authService.checkAuthStatus(user)
  }

  @Get('/private')
  @UseGuards(AuthGuard())
  testingPrivateRoute(
    @Req() req: Express.Request,
    @GetUser() user: User, // custom decorator
    @GetUser('email') userEmail: string, // custom decorator
    @GetRowHeaders() rawHeaders: string[]
  ) {
    console.log({ req })

    return {
      ok: true,
      message: 'Hola mundo desde test',
      user,
      userEmail,
      rawHeaders
    }
  }

  @Get('/private2')
  // @SetMetadata('roles', ['admin', 'super-user'])
  @RoleProtected(ValidRoles.superUser) // Setea o indicia la autorizacion que se tendra en el endpoint
  @UseGuards(
    AuthGuard(),       // Verificar la autenticacion 
    UserRoleGuard      // Verificar la autorizacion
  )
  privateRoute2(
    @GetUser() user: User,
  ) {

    return {
      ok: true,
      user
    }
  }


  @Get('/private3')
  @Auth(ValidRoles.admin, ValidRoles.superUser) // Contiene decoradores para simplificar los decoradores
  privateRoute3(
    @GetUser() user: User,
  ) {

    return {
      ok: true,
      user
    }
  }


}
