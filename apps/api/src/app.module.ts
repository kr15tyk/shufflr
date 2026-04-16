import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './modules/auth/auth.module';
import { OrganizationModule } from './modules/organization/organization.module';
import { UserModule } from './modules/user/user.module';
import { LeagueModule } from './modules/league/league.module';
import { SeasonModule } from './modules/season/season.module';
import { TeamModule } from './modules/team/team.module';
import { PlayerModule } from './modules/player/player.module';
import { CourtModule } from './modules/court/court.module';
import { MatchModule } from './modules/match/match.module';
import { DivisionModule } from './modules/division/division.module';
import { NotificationModule } from './modules/notification/notification.module';
import { StandingsModule } from './modules/standings/standings.module';
import { HealthModule } from './health/health.module';
import { TenantMiddleware } from './common/middleware/tenant.middleware';
import { PrismaModule } from './common/prisma/prisma.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    EventEmitterModule.forRoot(),
    PrismaModule,
    AuthModule,
    OrganizationModule,
    UserModule,
    LeagueModule,
    SeasonModule,
    TeamModule,
    PlayerModule,
    CourtModule,
    MatchModule,
    DivisionModule,
    NotificationModule,
    StandingsModule,
    HealthModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(TenantMiddleware).forRoutes('*');
  }
}
