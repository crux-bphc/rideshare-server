import { Entity, PrimaryGeneratedColumn, Column } from "typeorm"
import { User } from "./User"
import { timeSlot } from "../helpers/timeSlots"
import { Place } from "../helpers/places"


@Entity()
export class Post {

    @PrimaryGeneratedColumn("uuid")
    id: string

    @Column()
    originalPoster: User

    @Column()
    fromPlace: Place

    @Column()
    toPlace: Place

    @Column()
    seats: number

    @Column()
    departureTime: timeSlot

    @Column()
    participants: User[]

    @Column()
    status: Boolean

    @Column()
    createdAt: Date

    @Column()
    updatedAt: Date

    @Column()
    description: string

}
