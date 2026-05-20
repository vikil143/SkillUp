// seed/skills/databases.js — MongoDB, MySQL, Firebase
import { mk, uid } from '../helpers.js';

export default function buildDatabaseSkills() {
  return [
    mk('MongoDB', 'databases', null, {
      definition: 'Document-oriented NoSQL DB. Stores JSON-like BSON documents. Flexible schema, horizontal scaling.',
      apis: [
        {
          id: uid(),
          name: 'find()',
          signature: 'collection.find(filter?, options?): FindCursor',
          description: 'Returns a cursor over all documents matching the filter. Chainable with .sort(), .limit(), .skip().',
          params: 'filter — query object (e.g. { status: "active" }). options — projection, sort, limit.',
          returns: 'FindCursor — call .toArray() or iterate with for await.',
          example: "const users = await db.collection('users').find({ active: true }).limit(20).toArray();",
          gotchas: 'find() is lazy — it does not execute until you iterate or call toArray(). Always await toArray().',
        },
        {
          id: uid(),
          name: 'findOne()',
          signature: 'collection.findOne(filter?, options?): Promise<Document | null>',
          description: 'Returns the first document matching the filter, or null if none found.',
          params: 'filter — query object. options — projection.',
          returns: 'Promise<Document | null>',
          example: "const user = await db.collection('users').findOne({ _id: new ObjectId(id) });",
          gotchas: 'Returns null (not undefined) when not found. Check for null before accessing properties.',
        },
        {
          id: uid(),
          name: 'insertOne()',
          signature: 'collection.insertOne(doc): Promise<InsertOneResult>',
          description: 'Inserts a single document. MongoDB adds _id if not provided.',
          params: 'doc — document to insert.',
          returns: 'Promise<InsertOneResult> with insertedId and acknowledged fields.',
          example: "const result = await db.collection('posts').insertOne({ title, body, createdAt: new Date() });",
          gotchas: 'insertOne mutates the doc in-place by adding _id. Clone if you need the original unchanged.',
        },
        {
          id: uid(),
          name: 'updateMany()',
          signature: 'collection.updateMany(filter, update, options?): Promise<UpdateResult>',
          description: 'Updates all documents matching the filter. Use $set, $inc, $push operators.',
          params: 'filter — which docs to update. update — update operators. options — upsert, arrayFilters.',
          returns: 'Promise<UpdateResult> with matchedCount and modifiedCount.',
          example: "await db.collection('orders').updateMany({ status: 'pending' }, { $set: { status: 'cancelled' } });",
          gotchas: 'Passing a plain object as update (no $ operators) will error in driver v4+. Always use operators.',
        },
        {
          id: uid(),
          name: 'aggregate()',
          signature: 'collection.aggregate(pipeline: object[]): AggregationCursor',
          description: 'Executes a pipeline of stages (match, group, project, lookup, etc.) for complex queries.',
          params: 'pipeline — array of stage objects e.g. [{ $match: {} }, { $group: {} }].',
          returns: 'AggregationCursor — call .toArray() to get results.',
          example: "const stats = await db.collection('orders').aggregate([\n  { $match: { status: 'done' } },\n  { $group: { _id: '$userId', total: { $sum: '$amount' } } },\n]).toArray();",
          gotchas: '$lookup is expensive on large collections — ensure foreign collection is indexed on the join field.',
        },
      ],
    }),
    mk('MySQL', 'databases'),
    mk('Firebase', 'databases'),
  ];
}
