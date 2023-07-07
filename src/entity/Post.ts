import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, ManyToMany, JoinTable } from "typeorm"
import { User } from "./User"
import { timeSlot } from "../helpers/timeSlots"
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
        default: Place.Campus,
    })
    fromPlace: Place

    @Column({
        type: "enum",
        enum: Place,
        default: Place.Airport,
    })
    toPlace: Place

    @Column({
        type: "int",
        width: 3
    })
    seats: number

    @Column({
        type: "enum",
        enum: timeSlot,
        default: timeSlot["12:00"],
    })
    departureTime: timeSlot

    @ManyToMany(() => User)
    @JoinTable()
    participants: User[];

    @Column({
        type: "bool"
    })
    status: Boolean

    @Column({
        type: 'timestamp'
    })
    createdAt: Date

    @Column({
        type: 'timestamp'
    })
    updatedAt: Date

    @Column({
        type: "varchar2",
        width: 200
    })
    description: string

}
