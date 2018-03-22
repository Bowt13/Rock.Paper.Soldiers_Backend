import 'mocha'
import {calcMoveWinner, calculateWinner} from "./logic";
import {equal} from "assert";
import {Game, Player} from "./entities";
import User from "../users/entity";
import setupDb from '../db'

describe('calcMoveWinner()', () => {

  it('melee should win from ranged', () => {
    equal(calcMoveWinner('melee', 'ranged'), 'player')
    equal(calcMoveWinner('ranged', 'melee'), 'opponent')
  })

  it('ranged should win from spell', () => {
    equal(calcMoveWinner('ranged', 'spell'), 'player')
    equal(calcMoveWinner('spell', 'ranged'), 'opponent')
  })

  it('spell should win from melee', () => {
    equal(calcMoveWinner('spell', 'melee'), 'player')
    equal(calcMoveWinner('melee', 'spell'), 'opponent')
  })

  it('should return player if player move wins', () => {
    equal(calcMoveWinner('melee', 'ranged'), 'player')
    equal(calcMoveWinner('ranged', 'spell'), 'player')
    equal(calcMoveWinner('spell', 'melee'), 'player')
  })

  it('should return opponent if opponent move wins', () => {
    equal(calcMoveWinner('ranged', 'melee'), 'opponent')
    equal(calcMoveWinner('spell', 'ranged'), 'opponent')
    equal(calcMoveWinner('melee', 'spell'), 'opponent')
  })

  it('should return stalemate if both players have the same move', () => {
    equal(calcMoveWinner('melee', 'melee'), 'stalemate')
    equal(calcMoveWinner('spell', 'spell'), 'stalemate')
    equal(calcMoveWinner('ranged', 'ranged'), 'stalemate')
  })

})

describe('calculateWinner()', () => {

  before('connect', () => {
    return setupDb()
  })

  it('should return undefined when both players have more than 0 hp', () => {

    const fakeUser = User.create({
      username: 'test',
      email: 'test@test.test',
      password: 'test'
    })

    const fakeGame = Game.create()

    const fakePlayer = Player.create({
      game: fakeGame,
      user: fakeUser,
      character: 'fighter'
    })

    const fakeOpponent = Player.create({
      game: fakeGame,
      user: fakeUser,
      character: 'mage'
    })

    equal(calculateWinner(fakePlayer, fakeOpponent), undefined)
  })

  it('should return the player with more than 0 hp if one has 0 or less than 0 hp', () => {

    const fakeUser = User.create({
      username: 'tesst',
      email: 'test@test.tesst',
      password: 'tesst'
    })

    const fakeGame = Game.create()

    const fakePlayer = Player.create({
      game: fakeGame,
      user: fakeUser,
      character: 'fighter'
    })

    const deadFakeOpponent = Player.create({
      game: fakeGame,
      user: fakeUser,
      character: 'mage',
      hp: 0
    })
    const deadFakeOpponent2 = Player.create({
      game: fakeGame,
      user: fakeUser,
      character: 'mage',
      hp: -1
    })

    equal(calculateWinner(fakePlayer, deadFakeOpponent), fakePlayer.userId)
    equal(calculateWinner(fakePlayer, deadFakeOpponent2), fakePlayer.userId)
    equal(calculateWinner(deadFakeOpponent, fakePlayer), fakePlayer.userId)
    equal(calculateWinner(deadFakeOpponent2, fakePlayer), fakePlayer.userId)
  })

})
