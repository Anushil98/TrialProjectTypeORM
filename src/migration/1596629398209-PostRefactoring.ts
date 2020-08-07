import { MigrationInterface, QueryRunner, TableIndex } from "typeorm";

export class PostRefactoring1596629398209 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    console.log("I am the up function");
    await queryRunner.createIndex(
      "post",
      new TableIndex({
        name: "post_liked_by",
        columnNames: ["likedBy"],
      })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    console.log("I am the up function");
  }
}
