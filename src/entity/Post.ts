import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  AfterInsert,
  BeforeInsert,
  getConnection,
  AfterUpdate,
  getRepository,
  OneToMany,
  Index,
  AfterLoad,
  ManyToOne,
  JoinColumn,
} from "typeorm";
import { Activity, activityType } from "./Activity";

export interface postMeta {
  likes: number;
  userTags?: number[];
}

@Entity("post")
//this ignores the indexes during synchronization.
//This is done so that the indexes are not removed by TypeORM when the database
//is synchronized with the TypeORM cinfiguration
@Index(" post_liked_by_gin_idx", { synchronize: false })
@Index(" content_text_idx", { synchronize: false })
@Index("title_idx", { synchronize: false })
export class post {
  @PrimaryGeneratedColumn()
  id: string;

  @Column()
  user_id: number;

  @Column("text")
  title: string;

  @Column("text")
  content: string;

  @Column({ type: "jsonb", default: { likes: 0 } })
  metadata: postMeta;

  @Column({ type: "jsonb", default: { ids: [] } })
  likedby: { ids: number[] };

  @OneToMany(() => Activity, (activity) => activity.post)
  activity: Activity;

  @OneToMany(() => comment, (comment) => comment.post)
  comment: comment[];

  // @AfterInsert()
  // async addToActivity() {

  // }

  // @AfterUpdate()
  // async addLikedActivity() {
  //   console.log("I am being hit after update");
  //   await getConnection()
  //     .createQueryBuilder()
  //     .insert()
  //     .into(Activity)
  //     .values([
  //       {
  //         user_id: this.user_id,
  //         post_id: this.id,
  //         activityType: activityType.LIKE,
  //       },
  //     ])
  //     .execute();
  // }
}

@Entity("comment")
export class comment {
  @PrimaryGeneratedColumn()
  comment_id: string;

  @Column("text")
  text: string;

  @ManyToOne(() => post, (post) => post.comment)
  @JoinColumn({ name: "post_id" })
  post: post;

  @Column("text")
  post_id: String;

  @OneToMany(() => reply, (reply) => reply.comment)
  reply: reply[];
}

@Entity("reply")
export class reply {
  @PrimaryGeneratedColumn()
  reply_id: string;

  @Column("text")
  text: string;

  @ManyToOne(() => comment, (comment) => comment.reply)
  @JoinColumn({ name: "comment_id" })
  comment: reply;

  @Column("text")
  comment_id: String;
}
