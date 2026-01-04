import { IsString } from 'class-validator';

export class MakeMoveDto {
  @IsString()
  move: string;
}
