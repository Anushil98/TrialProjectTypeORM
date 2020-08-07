import "reflect-metadata";
import {
  createConnection,
  getConnection,
  getRepository,
  Repository,
  Like,
  createQueryBuilder,
  getManager,
  Connection,
  QueryRunner,
} from "typeorm";
import { User } from "./entity/User";
import { Follow } from "./entity/Follow";
import { post } from "./entity/Post";
import { Activity, activityType } from "./entity/Activity";
import * as fs from "fs";
import { PostRefactoring1596629398209 } from "./migration/1596629398209-PostRefactoring";

const queries: string = fs
  .readFileSync(__dirname + "/test.sql")
  .toString()
  .replace(/(\r\n|\n|\r)/gm, " ") // remove newlines
  .replace(/\s+/g, " "); // excess white space

const likePost = async (post_id: string, user_id: number): Promise<void> => {
  const manager = getManager();
  //array append for normal postgres arrays
  // try {
  //   const LikedPost = await manager.query(
  //     `UPDATE post set likedby =  array_append(likedby::Integer[],${user_id}) where id = ${post_id}`
  //   );
  // } catch (err) {
  //   console.log(err);
  // }
  //array append for Jsonb nested  arrays
  try {
    const LikedPost = await manager.query(
      `update post set likedBy = jsonb_set(likedBy::jsonb,array['ids'],(likedBy->'ids')::jsonb || '[${user_id}]'::jsonb) where id = ${post_id}`
    );
  } catch (err) {
    console.log(err);
  }

  // await addActivityLiked(LikedPost);
};
const dislikePost = async (post_id: string, user_id: number): Promise<void> => {
  const manager = getManager();
  //array deletion of a particular element from an array
  // try {
  //   const LikedPost = await manager.query(
  //     `UPDATE post set likedby =  array_remove(likedby::Integer[],${user_id}) where id = ${post_id}`
  //   );
  // }
  //array deletion of the last element(index -1) from a nested array in an object
  try {
    const LikedPost = await manager.query(
      `update post set likedBy = jsonb_set(likedBy::jsonb,array['ids'],(likedBy->'ids')::jsonb #- '{-1}') where id = ${post_id}`
    );
  } catch (err) {
    console.log(err);
  }
  //just for documentation purpose
  await getConnection()
    .createQueryBuilder()
    .select([

    ]).from(post,"post")
    .where("user_id = :userid", { userid: "some_id" })
    .limit()
    .skip()
    .getMany();

  // await addActivityLiked(LikedPost);
};

const addActivityPosted = async (obj: any): Promise<void> => {
  console.log(obj, "obj in posted");
  await getConnection()
    .createQueryBuilder()
    .insert()
    .into(Activity)
    .values([
      {
        user_id: obj.user_id,
        post_id: obj.id,
        activityType: activityType.POSTED,
        userTags: [...obj.metadata.userTags],
      },
    ])
    .execute();
};
const addActivityLiked = async (obj: any): Promise<void> => {
  console.log(obj, "obj in liked");
  await getConnection()
    .createQueryBuilder()
    .insert()
    .into(Activity)
    .values([
      {
        user_id: obj.user_id,
        post_id: obj.id,
        activityType: activityType.LIKE,
      },
    ])
    .execute();
};

createConnection()
  .then(async (connection) => {
    console.log("Connected To database");
    // await getConnection().createQueryBuilder().delete().from(User).execute();
    // // add users
    // await getConnection()
    //   .createQueryBuilder()
    //   .insert()
    //   .into(User)
    //   .values([
    //     { user_id: 1, firstName: "anushil", lastName: "GhoshDastidar" },
    //     { user_id: 2, firstName: "Agashi", lastName: "Sensai" },
    //     { user_id: 3, firstName: "Raghav", lastName: "Sharma" },
    //     { user_id: 4, firstName: "Sudip", lastName: "Guha" },
    //   ])
    //   .execute();
    // //add follow data
    // await getConnection()
    //   .createQueryBuilder()
    //   .insert()
    //   .into(Follow)
    //   .values([
    //     {
    //       followerId: 1,
    //       followingId: 4,
    //     },
    //     {
    //       followerId: 1,
    //       followingId: 2,
    //     },
    //     {
    //       followerId: 2,
    //       followingId: 4,
    //     },
    //     {
    //       followerId: 3,
    //       followingId: 1,
    //     },
    //   ])
    //   .execute();

    // const repository = connection.getRepository(post);
    // const new_post = new post();
    // new_post.user_id = 2;
    // new_post.title = "Title 2";
    // new_post.content = "This is content by 2";
    // new_post.metadata = { likes: 0, userTags: [2, 3] };

    // const saved_post = await repository.save(new_post);
    // console.log("saved_post", saved_post);
    // await likePost("4", 1); //post of id 1 liked by user of id 2
    // await dislikePost("4", 1);

    //getActivities of the users followed by the user_id
    const followersID = await connection
      .getRepository(Follow)
      .createQueryBuilder("follow")
      .select("follow.followingId AS following")
      .where("follow.followerId = :user_id", { user_id: 1 });
    //   .execute();
    // console.log(followersID, "followersID");

    const activities = await getConnection()
      .createQueryBuilder(post, "post")
      .innerJoinAndSelect(Activity, "activity", "post.id = activity.post_id")
      .where("activity.user_id IN (" + followersID.getQuery() + ")")
      .setParameters(followersID.getParameters())
      .getRawMany();

    console.log(activities, "activities of the users followings");
    let ids = await followersID.execute();
    console.log(ids, "ids");

    //query to check a user's folowings are tagged in some other posts
    let taggedposts: any[] = [];
    for (const id of ids) {
      let p = await getConnection()
        .createQueryBuilder(post, "post")
        .innerJoinAndSelect(Activity, "activity", "post.id = activity.post_id")
        .where("post.metaData -> 'userTags' @> '[" + id.following + "]'")
        .getRawMany();
      taggedposts.push(p);
    }

    console.log(taggedposts, "tagged posts of the users followings");

    const manager = getManager();
    // //create fucntion
    await manager.query(`create or replace function total_user()
    returns integer as $total$
    declare
    total integer;
    begin
    select count(8) into total from users;
    return total;
    end;
    $total$ language plpgsql;`);

    // await manager.query(`create or replace function fullname(firstname text,lastname text)
    // returns text as $$
    // declare
    // fullname text;
    // begin
    // fullname := firstname || ' ' || lastname
    // return text;
    // end;
    // $$ language plpgsql;`);

    await manager.query(queries);

    // let total = await manager.query("Select total_follow()");
    // console.log(total);
    // //this is for Virtual Field
    // // let users = await getConnection()
    // //   .createQueryBuilder(User, "user")
    // //   .select()
    // //   // .orderBy("fullname")//this does'nt work
    // //   .getMany();

    // //This is for aliased funciton value
    let users = await getConnection()
      .createQueryBuilder(User, "user")
      .select()
      .addSelect(`fullname("firstName","lastName") as fullname`)
      .orderBy("fullname")
      .limit()
      .skip() //this works
      .getRawMany();

    // console.log(users);

    // await getConnection()
    //   .createQueryBuilder()
    //   .insert()
    //   .into("post")
    //   .values([
    //     {
    //       user_id: 1,
    //       title: "Title 1",
    //       content: " content 1",
    //     },
    //     {
    //       user_id: 2,
    //       title: "Title 2",
    //       content: " content 2",
    //     },
    //     {
    //       user_id: 3,
    //       title: "Title 3",
    //       content: " content 3",
    //     },
    //     {
    //       user_id: 4,
    //       title: "Title 4",
    //       content: " content 4",
    //     },
    //   ])
    //   .execute();

    await getConnection()
      .createQueryBuilder()
      .insert()
      .into("comment")
      .values([
        {
          text: " 1 comment on 1",
          post_id: 1,
        },
        {
          text: " 2 comment on 1",
          post_id: 1,
        },
        {
          text: " 3 comment on 1",
          post_id: 1,
        },
        {
          text: " 1 comment on 2",
          post_id: 2,
        },
        {
          text: " 2 comment on 2",
          post_id: 2,
        },
      ])
      .execute();

    //removing data
    // await getConnection().createQueryBuilder().delete().from(post).execute();
    // await getConnection().createQueryBuilder().delete().from(Follow).execute();
    // await getConnection().createQueryBuilder().delete().from(User).execute();
  })
  .catch((error) => console.log(error));

