import { IsString, IsBoolean, IsOptional } from 'class-validator';

export class CreateGameDto {
  @IsString()
  opponentId: string;

  @IsString()
  timeControl: string;

  @IsOptional()
  @IsBoolean()
  isRated?: boolean;

  @IsOptional()
  @IsBoolean()
  isChaosMode?: boolean;
}
