import { ValidatorConstraint, ValidatorConstraintInterface } from 'class-validator'
import {Player} from "./entities";

export type Move = "melee" | "spell" | "ranged"

export interface AttackType {
  attackType: Move
}

type MoveResult = "player" | "opponent" | "stalemate"

@ValidatorConstraint()
export class IsValidAttack implements ValidatorConstraintInterface {

  validate(attack: AttackType) {
    return attack.attackType === "melee" ||
      attack.attackType === "spell" ||
      attack.attackType === "ranged"
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

export const calculateWinner = (player: Player, opponent: Player): string | undefined => {
  if (player.hp <= 0) return opponent.character
  if (opponent.hp <= 0) return player.character
}
