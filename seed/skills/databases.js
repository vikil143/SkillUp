// seed/skills/databases.js — MongoDB, MySQL, Firebase
import { mk, uid } from '../helpers.js';

const card = (q, a) => ({ id: uid(), q, a });
const api = (name, signature, description, params, returns, example, gotchas) => ({
  id: uid(),
  name,
  signature,
  description,
  params,
  returns,
  example,
  gotchas,
});
const ref = (title, url) => ({ id: uid(), title, url });

export default function buildDatabaseSkills() {
  const skills = [];

  const mongo = mk('MongoDB', 'databases', null, {
    definition:
      'MongoDB is a document-oriented database storing BSON documents with flexible schema design. It supports rich querying, aggregation pipelines, indexing, and horizontal scaling via sharding. MongoDB works well for evolving domain models and read-heavy API workloads when data access patterns are understood.',
    codeExample:
      "import { MongoClient, ObjectId } from 'mongodb';\n\nconst client = new MongoClient(process.env.MONGO_URI);\nawait client.connect();\nconst db = client.db('skillup');\n\nconst users = db.collection('users');\nawait users.createIndex({ email: 1 }, { unique: true });\n\nconst inserted = await users.insertOne({ email: 'a@b.com', active: true, createdAt: new Date() });\nconst user = await users.findOne({ _id: new ObjectId(inserted.insertedId) });\n\nawait users.updateOne({ _id: user._id }, { $set: { lastLoginAt: new Date() } });",
    whenUsed: 'Used heavily in `p-stock` for flexible domain data and optimized query patterns.',
    gotchas:
      'Unindexed queries cause collection scans and unpredictable latency under load.\nLarge unbounded arrays in documents can grow document size and hurt update performance.\nMixing types for the same field (string vs number) breaks query/index selectivity.\nUsing many `$lookup` stages without proper index strategy can behave like expensive joins.',
    flashcards: [
      card('Why does flexible schema still require discipline?', 'Without conventions/validation, data shape drift makes queries brittle and migrations expensive.'),
      card('When should embedding be preferred over referencing in MongoDB?', 'Embed for tightly coupled one-to-few data read together; reference for large/shared/high-cardinality relations.'),
      card('What does covered query mean in MongoDB?', 'Query can be answered using index keys alone without fetching full documents.'),
      card('Why can `_id` type inconsistency create bugs?', 'String/objectId mismatches make filters silently miss documents and break relation lookups.'),
      card('What is the purpose of `explain("executionStats")`?', 'It reveals query plan, scanned docs/keys, and whether indexes are used efficiently.'),
      card('How does write concern impact reliability?', 'Higher write concern improves durability/consistency at the cost of write latency.'),
      card('Why are partial indexes useful?', 'They reduce index size and improve performance for frequently queried subsets.'),
      card('What is a common pitfall with `skip` pagination?', 'Large offsets are costly; cursor/range pagination scales better.'),
    ],
    apis: [
      api('find', 'collection.find(filter?, options?)', 'Returns cursor for matching documents.', 'filter object and options', 'FindCursor', "const rows = await users.find({ active: true }).limit(20).toArray();", 'Cursor is lazy; query executes on iteration/toArray.'),
      api('findOne', 'collection.findOne(filter?, options?)', 'Returns first matching document or null.', 'filter and projection options', 'Promise<Document | null>', "const user = await users.findOne({ email });", 'Always handle null result explicitly.'),
      api('insertOne', 'collection.insertOne(doc, options?)', 'Inserts one document.', 'document and optional write options', 'InsertOneResult', "const res = await users.insertOne({ email, createdAt: new Date() });", 'Validate schema before insert to prevent drift.'),
      api('updateOne', 'collection.updateOne(filter, update, options?)', 'Updates first matching document using operators.', 'filter, update operators, options', 'UpdateResult', "await users.updateOne({ _id }, { $set: { active: false } });", 'Forgetting operators can replace whole docs in some contexts.'),
      api('aggregate', 'collection.aggregate(pipeline, options?)', 'Runs aggregation pipeline for analytics/transformations.', 'pipeline stage array', 'AggregationCursor', "const stats = await orders.aggregate([{ $group: { _id: '$status', c: { $sum: 1 } } }]).toArray();", 'Pipeline order and index use strongly affect performance.'),
      api('createIndex', 'collection.createIndex(keys, options?)', 'Creates index to optimize query patterns.', 'key specification and index options', 'index name', "await orders.createIndex({ userId: 1, createdAt: -1 });", 'Over-indexing slows writes and increases storage.'),
      api('startSession/transaction', 'client.startSession(); session.withTransaction(fn)', 'Runs multi-document ACID transactions on replica sets/shards.', 'session options and transaction callback', 'transaction result', "await session.withTransaction(async () => {\n  await wallets.updateOne({ _id: from }, { $inc: { bal: -100 } }, { session });\n  await wallets.updateOne({ _id: to }, { $inc: { bal: 100 } }, { session });\n});", 'Transaction retries and transient errors must be handled.'),
      api('bulkWrite', 'collection.bulkWrite(operations, options?)', 'Executes many write ops in one round-trip.', 'array of insert/update/delete operations', 'BulkWriteResult', "await events.bulkWrite([{ insertOne: { document: e1 } }, { insertOne: { document: e2 } }]);", 'Ordered mode stops on first error by default.'),
    ],
    refs: [
      ref('MongoDB Manual', 'https://www.mongodb.com/docs/manual/'),
      ref('MongoDB Node Driver', 'https://www.mongodb.com/docs/drivers/node/current/'),
      ref('MongoDB Aggregation', 'https://www.mongodb.com/docs/manual/aggregation/'),
      ref('MongoDB Indexing', 'https://www.mongodb.com/docs/manual/indexes/'),
      ref('MongoDB Data Modeling', 'https://www.mongodb.com/docs/manual/core/data-modeling-introduction/'),
    ],
    relatedProjectIds: ['p-stock'],
  });
  skills.push(mongo);

  [
    'Data Modeling (embed vs reference)',
    'CRUD Patterns',
    'Indexes & Query Plans',
    'Aggregation Pipeline',
    'Transactions & Sessions',
    'Sharding & Replication',
    'Schema Validation',
  ].forEach((name) => {
    skills.push(
      mk(name, 'databases', mongo.id, {
        definition: `${name} is a core MongoDB subtopic for correctness and scale in production systems.`,
        codeExample:
          name === 'Indexes & Query Plans'
            ? "await db.collection('orders').createIndex({ userId: 1, createdAt: -1 });\nconst plan = await db.collection('orders').find({ userId }).explain('executionStats');"
            : name === 'Aggregation Pipeline'
              ? "const result = await orders.aggregate([\n  { $match: { status: 'done' } },\n  { $group: { _id: '$userId', total: { $sum: '$amount' } } },\n]).toArray();"
              : "await users.updateOne({ _id }, { $set: { active: true } });",
        flashcards: [
          card(`What fails most often in ${name}?`, 'Assuming development-size data behavior will hold without index or model strategy adjustments.'),
          card(`How do you validate ${name} quality?`, 'Use execution plans, load tests, and schema constraints aligned to access patterns.'),
        ],
      })
    );
  });

  const mysql = mk('MySQL', 'databases', null, {
    definition:
      'MySQL is a relational database system built around structured schemas, SQL querying, and transactional guarantees. It is strong for normalized domain data, consistent writes, and complex joins when indexed properly. MySQL remains a default choice for many transactional systems and reporting workloads.',
    codeExample:
      "import mysql from 'mysql2/promise';\n\nconst db = await mysql.createPool({ uri: process.env.MYSQL_URL, connectionLimit: 10 });\n\nconst [rows] = await db.execute(\n  'SELECT id, symbol, price FROM instruments WHERE active = ? ORDER BY updated_at DESC LIMIT 20',\n  [1]\n);\n\nawait db.execute(\n  'UPDATE instruments SET price = ?, updated_at = NOW() WHERE id = ?',\n  [125.5, rows[0].id]\n);",
    whenUsed: 'Used in `p-stock` for transactional and relational data needs alongside MongoDB.',
    gotchas:
      'Missing composite indexes for join/filter/order patterns causes slow queries.\nUsing `SELECT *` in hot paths increases transfer and parsing overhead.\nLong-lived transactions can create lock contention and deadlocks.\nSchema changes without migration strategy can block production traffic.',
    flashcards: [
      card('Why are composite index column order and query predicates coupled?', 'MySQL uses left-most prefix rules; poor order can make index unusable for common filters/sorts.'),
      card('When should you avoid ORM-generated defaults blindly?', 'Generated SQL may ignore query-plan realities and produce inefficient joins or N+1 access.'),
      card('What is the difference between REPEATABLE READ and READ COMMITTED?', 'REPEATABLE READ prevents non-repeatable reads within transaction snapshot; READ COMMITTED sees latest committed rows each statement.'),
      card('Why do prepared statements matter for APIs?', 'They protect against SQL injection and can improve execution plan reuse.'),
      card('What is a practical deadlock mitigation approach?', 'Keep transactions short and consistent in lock ordering; retry transient deadlock errors.'),
      card('Why is pagination with high OFFSET expensive?', 'Server still scans/skips rows; keyset pagination is more scalable.'),
      card('How does normalization trade off with read performance?', 'Normalization improves integrity but may require joins; strategic denormalization can optimize hot reads.'),
      card('What is EXPLAIN used for?', 'It shows access path, index usage, join order, and estimated row counts for query tuning.'),
    ],
    apis: [
      api('SELECT', 'SELECT cols FROM table WHERE ...', 'Reads data with filtering/projection/sorting.', 'table, predicates, selected columns', 'result rows', 'SELECT id, name FROM users WHERE active = 1;', 'Avoid SELECT * in production hot paths.'),
      api('INSERT', 'INSERT INTO table(cols) VALUES (...)', 'Creates new rows.', 'column list and values', 'insert metadata', "INSERT INTO users(email, created_at) VALUES (?, NOW());", 'Handle duplicate keys with constraints/upsert patterns.'),
      api('UPDATE', 'UPDATE table SET ... WHERE ...', 'Modifies matching rows.', 'set clauses and where filter', 'affected rows', 'UPDATE users SET active = 0 WHERE last_login_at < ?;', 'Missing WHERE updates entire table.'),
      api('DELETE', 'DELETE FROM table WHERE ...', 'Deletes matching rows.', 'where condition', 'affected rows', 'DELETE FROM sessions WHERE expires_at < NOW();', 'Use soft delete if audit/history is required.'),
      api('JOIN', 'INNER/LEFT JOIN', 'Combines related table rows.', 'join conditions and selected columns', 'joined result rows', 'SELECT o.id, u.email FROM orders o JOIN users u ON u.id = o.user_id;', 'Join cardinality mistakes can multiply rows unexpectedly.'),
      api('EXPLAIN', 'EXPLAIN SELECT ...', 'Inspects query execution plan.', 'target query', 'plan rows', 'EXPLAIN SELECT * FROM orders WHERE user_id = ?;', 'Read key, type, rows, extra fields for tuning.'),
      api('Transaction', 'START TRANSACTION; COMMIT; ROLLBACK;', 'Groups operations atomically.', 'transaction statements', 'atomic success/failure', "await conn.beginTransaction();\nawait conn.execute('UPDATE wallets SET bal = bal - ? WHERE id = ?', [amt, from]);\nawait conn.execute('UPDATE wallets SET bal = bal + ? WHERE id = ?', [amt, to]);\nawait conn.commit();", 'Always rollback on error and release connection.'),
      api('Prepared Statement', 'db.execute(sql, params)', 'Runs parameterized SQL safely.', 'SQL with placeholders + parameter array', 'result rows/metadata', "const [rows] = await db.execute('SELECT * FROM users WHERE email = ?', [email]);", 'Do not interpolate user input into raw SQL strings.'),
    ],
    refs: [
      ref('MySQL 8.0 Reference', 'https://dev.mysql.com/doc/refman/8.0/en/'),
      ref('MySQL Performance Schema', 'https://dev.mysql.com/doc/refman/8.0/en/performance-schema.html'),
      ref('MySQL EXPLAIN Output', 'https://dev.mysql.com/doc/refman/8.0/en/explain-output.html'),
      ref('MySQL Transaction Isolation', 'https://dev.mysql.com/doc/refman/8.0/en/innodb-transaction-isolation-levels.html'),
      ref('Use the Index, Luke', 'https://use-the-index-luke.com/'),
    ],
    relatedProjectIds: ['p-stock'],
  });
  skills.push(mysql);

  [
    'Relational Modeling',
    'Joins & Query Optimization',
    'Indexes & Composite Keys',
    'Transactions & Isolation',
    'Migrations',
    'Replication & Backups',
    'Keyset Pagination',
  ].forEach((name) => {
    skills.push(
      mk(name, 'databases', mysql.id, {
        definition: `${name} is a MySQL skill area for safe schema evolution and predictable query performance.`,
        codeExample:
          name === 'Joins & Query Optimization'
            ? "EXPLAIN SELECT o.id, u.email\nFROM orders o\nJOIN users u ON u.id = o.user_id\nWHERE o.status = 'open';"
            : name === 'Transactions & Isolation'
              ? "START TRANSACTION;\nUPDATE ledger SET balance = balance - 100 WHERE id = 1;\nUPDATE ledger SET balance = balance + 100 WHERE id = 2;\nCOMMIT;"
              : 'ALTER TABLE users ADD COLUMN timezone VARCHAR(64) NULL;',
        flashcards: [
          card(`What mistake is common in ${name}?`, 'Optimizing syntax before validating execution plans and real workload access patterns.'),
          card(`How do teams de-risk ${name}?`, 'Migration playbooks, rollback strategies, and production-like query benchmarking.'),
        ],
      })
    );
  });

  const firebase = mk('Firebase', 'databases', null, {
    definition:
      'Firebase provides managed backend services including Firestore/Realtime Database, auth, storage, and serverless tooling. It speeds up mobile/web delivery with SDK-driven development and real-time sync primitives. Firestore offers document collections with indexing, offline support, and security rules for access control.',
    codeExample:
      "import { initializeApp } from 'firebase/app';\nimport { getFirestore, collection, addDoc, query, where, getDocs } from 'firebase/firestore';\n\nconst app = initializeApp({ apiKey: 'x', projectId: 'skillup' });\nconst db = getFirestore(app);\n\nawait addDoc(collection(db, 'bookings'), {\n  userId: 'u1',\n  status: 'pending',\n  createdAt: Date.now(),\n});\n\nconst q = query(collection(db, 'bookings'), where('status', '==', 'pending'));\nconst snap = await getDocs(q);\nconst rows = snap.docs.map((d) => ({ id: d.id, ...d.data() }));",
    whenUsed: 'Used in `p-maak` and `p-packarma` for auth/data sync and app backend acceleration.',
    gotchas:
      'Loose security rules can expose entire collections to unauthorized reads/writes.\nQuery limitations (inequality/orderBy combinations) require index planning early.\nClient-side aggregation on large collections is expensive and quota-unfriendly.\nDocument hot-spots from high write contention (single doc counters) cause throttling.',
    flashcards: [
      card('Why are Firebase security rules not optional if app checks auth?', 'Client code can be bypassed; rules are the server-side policy enforcement layer.'),
      card('When should you choose Cloud Functions with Firestore?', 'For trusted server-side mutations, fan-out writes, and integrations requiring secrets.'),
      card('What is a common Firestore modeling pitfall?', 'Putting unrelated high-volume writes into one document or deeply nested unbounded arrays.'),
      card('Why do composite indexes matter in Firestore?', 'Many multi-field query patterns require explicit indexes or queries fail at runtime.'),
      card('How does offline persistence affect conflict handling?', 'Local writes sync later; apps should design for eventual server reconciliation states.'),
      card('What is the risk of broad collection listeners?', 'High read costs and UI churn from unnecessary real-time updates.'),
      card('How should timestamps be written for consistency?', 'Use server timestamps when ordering/consistency across clients matters.'),
      card('Why can document IDs impact security and scaling?', 'Predictable IDs aid enumeration; poorly partitioned IDs can create write concentration.'),
    ],
    apis: [
      api('initializeApp', 'initializeApp(config)', 'Initializes Firebase app instance.', 'project config object', 'Firebase app', "const app = initializeApp(firebaseConfig);", 'Use environment-specific config per app target.'),
      api('getFirestore', 'getFirestore(app?)', 'Returns Firestore client instance.', 'optional app instance', 'Firestore DB object', 'const db = getFirestore(app);', 'Avoid re-initializing app multiple times.'),
      api('collection/doc', 'collection(db, path), doc(db, path, id?)', 'Builds typed references to collections/documents.', 'db and path/id segments', 'reference objects', "const usersRef = collection(db, 'users');", 'Invalid path segment counts throw runtime errors.'),
      api('addDoc/setDoc/updateDoc', 'addDoc(colRef, data), setDoc(docRef, data), updateDoc(docRef, patch)', 'Creates or updates documents.', 'refs and data payload', 'write result/void', "await updateDoc(doc(db, 'users', uid), { lastSeenAt: Date.now() });", 'updateDoc fails if document does not exist.'),
      api('query/where/orderBy/limit', 'query(ref, where(...), orderBy(...), limit(n))', 'Composes Firestore queries.', 'constraints chain', 'query object', "const q = query(collection(db, 'orders'), where('status', '==', 'open'), limit(20));", 'Some combinations require composite index creation.'),
      api('onSnapshot', 'onSnapshot(refOrQuery, callback)', 'Subscribes to realtime updates.', 'reference/query and callback', 'unsubscribe function', "const unsub = onSnapshot(q, (snap) => setRows(snap.docs));", 'Always unsubscribe on component unmount.'),
      api('runTransaction', 'runTransaction(db, async (tx) => {...})', 'Performs atomic read-modify-write operations.', 'transaction callback', 'Promise<result>', "await runTransaction(db, async (tx) => {\n  const ref = doc(db, 'counters', 'orders');\n  const snap = await tx.get(ref);\n  tx.update(ref, { value: snap.data().value + 1 });\n});", 'Retry behavior requires idempotent callback logic.'),
      api('serverTimestamp', 'serverTimestamp()', 'Writes server-generated timestamp sentinel.', 'none', 'FieldValue sentinel', "await updateDoc(ref, { updatedAt: serverTimestamp() });", 'Value resolves asynchronously after write acknowledgement.'),
    ],
    refs: [
      ref('Firebase Docs', 'https://firebase.google.com/docs'),
      ref('Firestore Data Model', 'https://firebase.google.com/docs/firestore/data-model'),
      ref('Firestore Query Data', 'https://firebase.google.com/docs/firestore/query-data/queries'),
      ref('Firestore Security Rules', 'https://firebase.google.com/docs/firestore/security/get-started'),
      ref('Firebase Emulator Suite', 'https://firebase.google.com/docs/emulator-suite'),
    ],
    relatedProjectIds: ['p-maak', 'p-packarma'],
  });
  skills.push(firebase);

  [
    'Firestore Data Modeling',
    'Realtime Listeners',
    'Security Rules',
    'Indexes & Query Limits',
    'Transactions & Batched Writes',
    'Offline Sync',
    'Cloud Functions Integration',
  ].forEach((name) => {
    skills.push(
      mk(name, 'databases', firebase.id, {
        definition: `${name} is a Firebase subtopic that determines scalability, security, and operational cost.`,
        codeExample:
          name === 'Security Rules'
            ? "match /users/{uid} {\n  allow read, write: if request.auth != null && request.auth.uid == uid;\n}"
            : name === 'Realtime Listeners'
              ? "const unsub = onSnapshot(queryRef, (snap) => {\n  const rows = snap.docs.map((d) => d.data());\n});"
              : "await setDoc(doc(db, 'orders', orderId), payload);",
        flashcards: [
          card(`What risk appears first in ${name}?`, 'Underestimating rule/index constraints until production traffic patterns emerge.'),
          card(`How do you verify ${name} before release?`, 'Use Emulator Suite tests and synthetic load for read/write/listener patterns.'),
        ],
      })
    );
  });

  return skills;
}
