import {
  Authorized, BadRequestError, Body, CurrentUser, ForbiddenError, Get, HttpCode, JsonController, NotFoundError, Param,
  Patch,
  Post
} from "routing-controllers";
import User from "../users/entity";
import {Game, Player} from "./entities";
import {io} from "../index";
import {calcMoveWinner, calculateWinner} from "./logic";

interface attackType {
  attackType: "melee" | "spell" | "ranged"
}

@JsonController()
export default class GameController {
  @Authorized()
  @Post('/games')
  @HttpCode(201)
  async createGame (
    @CurrentUser() user: User
  ) {
    const entity = await Game.create().save()

    await Player.create({
      game: entity,
      user,
      character: 'fighter'
    }).save()

    const game = await Game.findOneById(entity.id)

    io.emit('action', {
      type: 'ADD_GAME',
      payload: game
    })

    return game
  }

  @Authorized()
  @Post('/games/:id([0-9]+)/players')
  @HttpCode(201)
  async joinGame(
    @CurrentUser() user: User,
    @Param('id') gameId: number
  ) {
    const game = await Game.findOneById(gameId)
    if(!game) throw new BadRequestError('Game does not exist.')
    if(game.status !== 'pending') throw new BadRequestError('Game has already started.')

    if (game.players.filter(p => p.userId === user.id).length > 0) throw new BadRequestError('You are already in this game.')

    game.status = 'started'
    await game.save()

    const player = await Player.create({
      game,
      user,
      character: 'mage'
    }).save()

    io.emit('action', {
      type: 'UPDATE_GAME',
      payload: await Game.findOneById(game.id)
    })

    return player
  }

  @Authorized()
  @Patch('/games/:id([0-9]+)')
  async updateGame(
    @CurrentUser() user: User,
    @Param('id') gameId: number,
    @Body() update: attackType
  ) {
    const game = await Game.findOneById(gameId)
    if(!game) throw new NotFoundError('Game not found.')

    const player = await Player.findOne({ user, game })

    if(!player) throw new ForbiddenError('You are not in this game.')
    if(game.status !== 'started') throw new BadRequestError('The game did not start yet or is already finished')
    if(player.pendingMove) throw new BadRequestError('You already made a move, wait for the opponent')

    const opponent = game.players.find(p => p.userId !== user.id)

    if(!opponent) throw new BadRequestError("You somehow don't have an opponent and still got to this point..")

    player.pendingMove = update.attackType

    await player.save()

    if(player.pendingMove && opponent.pendingMove) {
      if (calcMoveWinner(player.pendingMove, opponent.pendingMove) === 'opponent') {
        player.hp = player.hp - 2
      }
      if (calcMoveWinner(player.pendingMove, opponent.pendingMove) === 'player') {
        opponent.hp = opponent.hp - 2
      }
      if (player.hp <= 0 || opponent.hp <= 0) {
        game.winner = calculateWinner(player, opponent)
        game.status = 'finished'
        game.save()
      }

      const lessUpdatedGame = await Game.findOneById(game.id)

      io.emit('action', {
        type: 'UPDATE_GAME',
        payload: lessUpdatedGame
      })

      player.pendingMove = null
      opponent.pendingMove = null

      await player.save()
      await opponent.save()

      const updatedGame = await Game.findOneById(game.id)

      setTimeout(_ => {
        io.emit('action', {
          type: 'UPDATE_GAME',
          payload: updatedGame
        })
      }, 1000)

      return updatedGame
    }

    const updatedGame = await Game.findOneById(game.id)

    io.emit('action', {
      type: 'UPDATE_GAME',
      payload: updatedGame
    })

    return updatedGame
  }

  @Authorized()
  @Get('/games')
  getGames() {
    return Game.find()
  }

  @Authorized()
  @Get('/games/:id([0-9]+)')
  getGame (
    @Param('id') id: number
  ) {
    return Game.findOneById(id)
  }
}
