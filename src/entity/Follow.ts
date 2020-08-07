import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from "typeorm";
import { User } from "./User";

@Entity("follow")
export class Follow {
  @PrimaryGeneratedColumn()
  id: string;

  @ManyToOne(() => User, (user) => user.user_id)
  @JoinColumn({ name: "followerId" })
  follower: User;

  @ManyToOne(() => User, (user) => user.user_id)
  @JoinColumn({ name: "followingId" })
  following: User;

  @Column()
  followerId: number;

  @Column()
  followingId: number;
}
