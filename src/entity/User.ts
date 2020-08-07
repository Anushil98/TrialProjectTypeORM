import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  Index,
  PrimaryColumn,
  AfterLoad,
} from "typeorm";

@Entity("users")
export class User {
  @PrimaryColumn()
  user_id: number;

  @Column()
  @Index()
  firstName: string;

  @Column()
  lastName: string;
  //this is not a column or field in the database
  fullname: string;

  @AfterLoad()
  addFullname = () => {
    console.log("This is being hit after the entitity");
    this.fullname = this.firstName + " " + this.lastName;
  };
}
