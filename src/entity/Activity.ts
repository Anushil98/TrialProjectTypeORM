import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  OneToMany,
  OneToOne,
  JoinColumn,
  ManyToOne,
} from "typeorm";
import { post } from "./Post";
import { User } from "./User";
export enum activityType {
  LIKE = "like",
  POSTED = "posted",
}

@Entity("activity")
export class Activity {
  @PrimaryGeneratedColumn()
  id: number;
  @Column()
  user_id: number;

  @ManyToOne(() => post, (post) => post)
  @JoinColumn({ name: "post_id" })
  post: post;

  @Column("text")
  post_id: string;

  @Column("int", { nullable: true })
  follow_id: number;

  @Column({ type: "enum", enum: activityType })
  activityType: activityType;

  @Column("int", { array: true, nullable: true })
  userTags: number[];
}
