import {BaseEntity, Column, Entity, PrimaryGeneratedColumn} from "typeorm";

type Character = 'fighter' | 'mage' | 'cleric'


@Entity()
export class Player extends BaseEntity {

  @PrimaryGeneratedColumn()
  id?: number

  @Column('text')
  character: Character

}
