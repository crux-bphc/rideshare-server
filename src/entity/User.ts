import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  Index,
  ManyToMany,
  OneToMany
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

  @Index()
  @Column({
    type: "varchar",
    width: 100,
    unique: true,
    nullable: false
  })
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

  @ManyToMany(() => Post , (post) => post.participantQueue)
  postRequests!: Post[]

  @ManyToMany(() => Post , (post) => post.participants)
  posts!: Post[]

}
