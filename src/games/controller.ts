import {Authorized, BadRequestError, CurrentUser, HttpCode, JsonController, Param, Post} from "routing-controllers";
import User from "../users/entity";
import {Game, Player} from "./entities";
import {io} from "../index";

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

    game.status = 'started'
    await game.save()

    const player = await Player.create({
      game,
      user,
      character: 'fighter'
    })

    io.emit('action', {
      type: 'UPDATE_GAME',
      payload: await Game.findOneById(game.id)
    })

    return player
  }
}
