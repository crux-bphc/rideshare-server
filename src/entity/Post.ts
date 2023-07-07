import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    ManyToMany,
    JoinTable
} from "typeorm"
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
        type: "enum",
        enum: timeSlot,
        nullable: false
    })
    departureTime: timeSlot

    @ManyToMany(() => User)
    @JoinTable()
    participants: User[];

    @Column({
        type: "bool",
        default: true
    })
    status: Boolean

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
        type: "varchar2",
        width: 200,
        nullable: true
    })
    description: string

}
