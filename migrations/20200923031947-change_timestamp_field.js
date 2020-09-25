module.exports = {
  async up(db, client) {
    await db.collection("tracks").updateMany(
      {},
      {
        $rename: {
          timestamp: "leave_at",
        },
      }
    );
    // TODO write your migration here.
    // See https://github.com/seppevs/migrate-mongo/#creating-a-new-migration-script
    // Example:
    // await db.collection('albums').updateOne({artist: 'The Beatles'}, {$set: {blacklisted: true}});
  },

  async down(db, client) {
    await db.collection("tracks").updateMany(
      {},
      {
        $rename: {
          leave_at: "timestamp",
        },
      }
    );
    // TODO write the statements to rollback your migration (if possible)
    // Example:
    // await db.collection('albums').updateOne({artist: 'The Beatles'}, {$set: {blacklisted: false}});
  },
};
