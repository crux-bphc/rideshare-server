import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  Index,
  ManyToMany,
  OneToMany
} from "typeorm";

import { Ride } from "./Ride"
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
    type: "int8",
    width: 10,
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

  @Column({
    type: "string",
    width: 200
  })
  profilePicture : string

  @ManyToMany(() => Ride, (ride) => ride.participantQueue)
  rideRequests!: Ride[]

  @ManyToMany(() => Ride, (ride) => ride.participants)
  rides!: Ride[]

}
