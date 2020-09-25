module.exports = {
  async up(db, client) {
    const tracks = await (await db.collection("tracks").find()).toArray();
    console.log(tracks);
    tracks.forEach(async (t) => {
      await db.collection("tracks").update(
        { _id: t._id },
        {
          $set: {
            owner: t.owner.toLowerCase(),
            found: t.found.toLowerCase(),
          },
        }
      );
    });
    // await db.collection("tracks").updateMany(
    //   {},
    //   {
    //     $set: {
    //       owner: { $toLower: "$owner" },
    //       found: { $toLower: "$found" },
    //     },
    //   }
    // );
    // TODO write your migration here.
    // See https://github.com/seppevs/migrate-mongo/#creating-a-new-migration-script
    // Example:
    // await db.collection('albums').updateOne({artist: 'The Beatles'}, {$set: {blacklisted: true}});
  },

  async down(db, client) {
    // await db.collection("tracks").updateMany(
    //   {},
    //   {
    //     $set: {
    //       owner: { $toUpper: "$owner" },
    //       found: { $toUpper: "$found" },
    //     },
    //   }
    // );
    // TODO write the statements to rollback your migration (if possible)
    // Example:
    // await db.collection('albums').updateOne({artist: 'The Beatles'}, {$set: {blacklisted: false}});
  },
};
