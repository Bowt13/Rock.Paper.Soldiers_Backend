import {BaseEntity, Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn} from "typeorm";
import User from "../users/entity";

type Character = 'fighter' | 'mage' | 'cleric'
type Status = 'pending' | 'started' | 'finished'

@Entity()
export class Game extends BaseEntity {

  @PrimaryGeneratedColumn()
  id?: number

  @Column('text', {default: 'pending'})
  status: Status

  @Column('text', {nullable:true})
  winner: string

  @OneToMany(_ => Player, player => player.game, {eager:true})
  players: Player[]

}

@Entity()
export class Player extends BaseEntity {

  @PrimaryGeneratedColumn()
  id?: number

  @Column('integer', {default: 10})
  hp: number

  @Column('text')
  character: Character

  @ManyToOne(_ => Game, game => game.players)
  game: Game

  @ManyToOne(_ => User, user => user.players)
  user: User

}
