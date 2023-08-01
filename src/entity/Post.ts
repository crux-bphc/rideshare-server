import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  ManyToMany,
  JoinTable,
  Index
} from "typeorm"
import { User } from "./User"
import { Place } from "../helpers/places"


@Entity()
export class Post {

  @PrimaryGeneratedColumn("uuid")
  id: string

  @ManyToOne(() => User)
  originalPoster: User;

  @Column({
    type: "enum",
    enum: Place,
    nullable: false
  })
  fromPlace: Place

  @Column({
    type: "enum",
    enum: Place,
    default: Place.Airport,
    nullable: false
  })
  toPlace: Place

  @Column({
    type: "int",
    width: 3,
    nullable: false
  })
  seats: number

  @Column({
    type: 'timestamp',
    nullable: false
  })
  timeRangeStart: Date

  @Column({
    type: 'timestamp',
    nullable: false
  })
  timeRangeStop: Date

  @JoinTable()
  @ManyToMany(() => User, (user => user.posts))
  participants: User[];

  @JoinTable()
  @ManyToMany(() => User, (user => user.postRequests))
  participantQueue: User[];

  @Column({
    type: "bool",
    default: true
  })
  status: Boolean

  @Index()
  @Column({
    type: 'timestamp',
    nullable: false
  })
  createdAt: Date

  @Column({
    type: 'timestamp',
    nullable: false
  })
  updatedAt: Date

  @Column({
    type: "varchar",
    width: 200,
    nullable: true
  })
  description: string

}
