import { ValidatorConstraint, ValidatorConstraintInterface } from 'class-validator'
import {Player} from "./entities";

export type Move = "melee" | "spell" | "ranged"

export type MoveResult = "player" | "opponent" | "stalemate"

@ValidatorConstraint()
export class IsValidAttack implements ValidatorConstraintInterface {

  validate(attack: Move) {
    return attack === "melee" ||
      attack === "spell" ||
      attack === "ranged"
  }

}

export const calcMoveWinner = (playerMove: Move, opponentMove: Move): MoveResult => {

  if(playerMove === 'melee') {
    if (opponentMove === 'spell') return 'opponent'
    if (opponentMove === 'ranged') return 'player'
  }
  if(playerMove === 'spell') {
    if (opponentMove === 'melee') return 'player'
    if (opponentMove === 'ranged') return 'opponent'
  }
  if(playerMove === 'ranged') {
    if (opponentMove === 'melee') return 'opponent'
    if (opponentMove === 'spell') return 'player'
  }
  return 'stalemate'


}

export const calculateWinner = (player: Player, opponent: Player): number | undefined => {
  if (player.hp <= 0) return opponent.userId
  if (opponent.hp <= 0) return player.userId
}
