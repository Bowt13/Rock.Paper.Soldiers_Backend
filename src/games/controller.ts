import {Authorized, CurrentUser, HttpCode, JsonController, Post} from "routing-controllers";
import User from "../users/entity";
import {Game, Player} from "./entities";

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

    return game
  }
}
