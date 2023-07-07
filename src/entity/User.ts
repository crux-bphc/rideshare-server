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
  })
  name: string;

  @Column({
    type: "varchar2",
    width: 100,
  })
  email: string;

  @Column({
    type: "int",
    width: 14,
  })
  phNo: number;

  @Column({
    type: "int",
    width: 4,
  })
  batch: number;
}
