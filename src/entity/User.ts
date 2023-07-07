import {
    Entity,
    PrimaryGeneratedColumn,
    Column
} from "typeorm";

@Entity()
export class User {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({
    type: "varchar2",
    width: 100,
    nullable: false
  })
  name: string;

  @Column({
    type: "varchar2",
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
}
