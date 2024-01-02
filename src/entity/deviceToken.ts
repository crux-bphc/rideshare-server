import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from "typeorm";
import { User } from "./User";

@Entity()
export class deviceToken {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @ManyToOne(() => User)
  user: User;

  @Column({
    type: "varchar",
    width: 200,
    unique: true,
    nullable: false,
  })
  tokenId: string;
}
