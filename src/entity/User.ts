import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  Index,
  ManyToMany
} from "typeorm";

import { Post } from "./Post"
@Entity()
export class User {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({
    type: "varchar",
    width: 100,
    nullable: false
  })
  name: string;

  @Column({
    type: "varchar",
    width: 100,
    unique: true,
    nullable: false
  })
  @Index()
  email: string;

  @Column({
    type: "int",
    width: 14,
    unique: true,
    nullable: false
  })
  phNo: number;

  @Column({
    type: "int",
    width: 4,
    nullable: false
  })
  batch: number;

  @ManyToMany(() => Post , (trip) => trip.participantQueue)
  tripRequests!: Post[]
}
