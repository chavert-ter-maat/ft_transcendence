import { Column, Model, Table, PrimaryKey } from 'sequelize-typescript';

@Table
export class Match extends Model {
  @PrimaryKey
  @Column
  gameId: string;

  @Column
  player1Id: string;

  @Column
  player2Id: string;

  @Column
  player1Score: number;

  @Column
  player2Score: number;

  @Column
  gameMode: string;

  @Column
  startTime: Date;

  @Column
  endTime: Date;

  @Column
  winnerId: string;
}
