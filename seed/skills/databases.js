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

  // Added by Claude Code audit — 2026-05-20

  // MongoDB — additional top-level flashcards
  mongo.flashcards.push(
    card('What is a TTL index and when do you use it?', 'A TTL index on a Date field automatically deletes documents after a specified number of seconds — ideal for sessions, cache entries, and temporary records.'),
    card('How do change streams work in MongoDB?', 'Change streams use the oplog to emit real-time insert/update/delete events on a collection — enabling reactive server-push without polling.'),
    card('What is connection pooling and why does maxPoolSize matter?', 'The driver reuses a pool of persistent connections; maxPoolSize caps concurrent connections to the server — too low starves throughput, too high overloads the server.'),
    card('Why should you prefer $set over full document replacement in updateOne?', 'Full replacement can accidentally erase fields not included in the update payload; $set modifies only specified paths.'),
    card('What is the difference between findOne and findOneAndUpdate?', 'findOne is a read; findOneAndUpdate atomically modifies and returns the document (before or after) — eliminating a read-modify-write race condition.'),
  );

  // MongoDB — additional APIs
  mongo.apis.push(
    api('deleteOne / deleteMany', 'collection.deleteOne(filter) / deleteMany(filter)', 'Deletes one or all matching documents.', 'filter object', 'DeleteResult', "await users.deleteOne({ _id: userId });\nawait sessions.deleteMany({ expiresAt: { $lt: new Date() } });", 'Missing filter in deleteMany removes ALL documents.'),
    api('findOneAndUpdate', 'collection.findOneAndUpdate(filter, update, options?)', 'Atomically finds, updates, and returns the document.', 'filter, update operators, returnDocument option', 'Promise<Document | null>', "const updated = await users.findOneAndUpdate(\n  { _id },\n  { $set: { lastLogin: new Date() } },\n  { returnDocument: 'after' }\n);", 'Returns null if no document matches — handle explicitly.'),
    api('countDocuments', 'collection.countDocuments(filter?, options?)', 'Returns count of matching documents.', 'optional filter', 'Promise<number>', "const total = await orders.countDocuments({ status: 'open' });", 'Prefer over collection.count() which is deprecated.'),
    api('watch (change streams)', 'collection.watch(pipeline?, options?)', 'Subscribes to real-time change events on a collection.', 'optional aggregation pipeline and options', 'ChangeStream cursor', "const stream = users.watch([{ $match: { operationType: 'insert' } }]);\nstream.on('change', (ev) => notify(ev.fullDocument));", 'Requires replica set or sharded cluster; not available on standalone.'),
  );

  // MongoDB sub-topics — specific flashcards
  skills.forEach((s) => {
    if (s.parentId !== mongo.id) return;
    const specific = {
      'Data Modeling (embed vs reference)': [
        card('What is the "one-to-many with document reference" pattern?', 'Store the parent _id inside each child document — analogous to a foreign key. Use when children are numerous, independently updated, or shared across parents.'),
        card('Why can embedding unbounded arrays be dangerous?', 'MongoDB documents have a 16 MB size limit; an array that grows indefinitely will eventually hit this limit and break writes.'),
      ],
      'CRUD Patterns': [
        card('What does upsert: true do in updateOne?', 'If no document matches the filter, MongoDB inserts a new document combining the filter and update — useful for idempotent write operations.'),
        card('Why use bulkWrite instead of many individual writes?', 'bulkWrite batches operations into fewer round-trips, dramatically reducing latency for high-volume insert/update workloads.'),
      ],
      'Indexes & Query Plans': [
        card('What is a compound index prefix rule?', 'MongoDB can use a compound index {a:1, b:1, c:1} for queries on (a), (a,b), or (a,b,c) but not on (b) or (c) alone — the left-most fields must be present.'),
        card('What does COLLSCAN in explain() output mean?', 'Collection scan — the query examined every document. An index is missing or the query predicate cannot use the available indexes.'),
      ],
      'Aggregation Pipeline': [
        card('Why should $match come as early as possible in a pipeline?', 'An early $match filters documents before later stages process them, allowing MongoDB to use indexes and reducing the amount of data flowing through the pipeline.'),
        card('What does $lookup do and what is its performance concern?', '$lookup performs a left outer join to another collection — it can be expensive without an index on the foreign field and may not use indexes for the joined collection.'),
      ],
      'Transactions & Sessions': [
        card('What storage engine requirement exists for MongoDB transactions?', 'Multi-document transactions require WiredTiger storage engine and a replica set (or sharded cluster) — they are not available on standalone instances.'),
        card('Why must transaction callbacks be idempotent?', 'MongoDB may automatically retry transactions on transient errors (TransientTransactionError) — the callback must be safe to run multiple times without unintended side effects.'),
      ],
      'Sharding & Replication': [
        card('What is the shard key and why is choice critical?', 'The shard key determines how data is distributed across shards. A poor choice (low cardinality, monotonically increasing like ObjectId) creates hotspots and uneven distribution.'),
        card('What is a replica set election?', 'When the primary becomes unreachable, replica set members vote to elect a new primary — requires a majority of members to be reachable, so odd member counts are recommended.'),
      ],
      'Schema Validation': [
        card('How do you enforce a schema in MongoDB?', 'Use `validator` with $jsonSchema in createCollection or collMod — MongoDB checks the schema on insert/update and rejects documents that fail validation.'),
        card('What does validationAction: "warn" do vs "error"?', '"error" rejects invalid documents; "warn" allows them but logs a warning — useful for gradual schema enforcement on existing collections.'),
      ],
    };
    const cards = specific[s.name];
    if (cards) s.flashcards.push(...cards);
  });

  // MySQL sub-topics — specific flashcards
  skills.forEach((s) => {
    if (s.parentId !== mysql.id) return;
    const specific = {
      'Relational Modeling': [
        card('What is normalisation and when do you denormalise?', 'Normalisation removes data redundancy by splitting into related tables. Denormalise (store computed/joined values) when read performance on hot queries outweighs write overhead.'),
        card('What is a surrogate key vs a natural key?', 'Surrogate key is an artificial identifier (auto-increment, UUID) with no business meaning; natural key uses a real-world value (email, ISBN) — surrogates are simpler to join but natural keys enforce real-world uniqueness.'),
      ],
      'Joins & Query Optimization': [
        card('What is the difference between INNER JOIN and LEFT JOIN?', 'INNER JOIN returns only rows with matches in both tables; LEFT JOIN returns all rows from the left table with NULLs for unmatched right-table columns.'),
        card('What does "Using filesort" in EXPLAIN mean?', 'MySQL could not use an index to satisfy the ORDER BY and is sorting in memory/on disk — add an index covering the sort columns to eliminate it.'),
      ],
      'Indexes & Composite Keys': [
        card('What is an index covering query?', 'A query where all selected and filtered columns are present in the index — MySQL reads only the index structure without accessing table rows, maximising performance.'),
        card('Why can too many indexes hurt write performance?', 'Every INSERT/UPDATE/DELETE must update all applicable indexes — tables with 10+ indexes on write-heavy workloads can see significant throughput degradation.'),
      ],
      'Transactions & Isolation': [
        card('What is a phantom read and which isolation level prevents it?', 'A phantom read is when a transaction re-runs a range query and sees new rows inserted by another transaction. SERIALIZABLE prevents it; REPEATABLE READ does not for range queries.'),
        card('How do you handle a deadlock in application code?', 'Catch the deadlock error (MySQL error 1213) and retry the transaction — deadlocks are transient by design and the retried transaction will usually succeed.'),
      ],
      'Migrations': [
        card('Why should schema migrations be version-controlled?', 'Migrations as code ensure every environment applies the same changes in the same order, enabling reproducible database state across dev/staging/prod.'),
        card('What is a reversible migration?', 'A migration that includes both an up (apply) and a down (rollback) operation — critical for safe production rollbacks when a deployment must be reverted.'),
      ],
      'Replication & Backups': [
        card('What is MySQL binary log replication used for?', 'Replica servers stream the binary log from the primary and apply the same statements/row changes, enabling read scaling and failover.'),
        card('Why is a logical backup (mysqldump) different from a physical backup?', 'mysqldump exports SQL statements that recreate data — portable but slow to restore at scale. Physical backups (xtrabackup) copy data files directly — faster restore but tied to MySQL version.'),
      ],
      'Keyset Pagination': [
        card('How does keyset pagination avoid the offset performance problem?', 'Instead of OFFSET N (scan and discard N rows), keyset uses WHERE id > lastSeenId ORDER BY id LIMIT n — the index jumps directly to the cursor position.'),
        card('What is the limitation of keyset pagination?', 'You cannot jump to an arbitrary page number — only sequential forward navigation is possible. Also requires a unique, indexed sort key.'),
      ],
    };
    const cards = specific[s.name];
    if (cards) s.flashcards.push(...cards);
  });

  // Firebase — additional top-level flashcards
  firebase.flashcards.push(
    card('What is the difference between getDoc and onSnapshot for a single document?', 'getDoc is a one-time read returning a Promise; onSnapshot establishes a real-time listener and calls back on every change — use getDoc when live updates are not needed.'),
    card('How are Firestore read/write costs calculated?', 'Each document read, write, or delete counts as one operation. onSnapshot listeners count reads on every document in the result set per snapshot — design queries to minimise document counts returned.'),
    card('What is a subcollection and when do you use it?', 'A collection nested inside a document — use for high-cardinality one-to-many data (e.g., user → messages) where the parent document should not grow unbounded with child data.'),
    card('How does Firebase Auth integrate with Firestore Security Rules?', 'request.auth in rules is populated by Firebase Auth — you can restrict document access to `request.auth.uid == resource.data.userId` to enforce per-user data isolation.'),
  );

  // Firebase — additional APIs
  firebase.apis.push(
    api('getDoc', 'getDoc(docRef)', 'Fetches a single document once.', 'DocumentReference', 'Promise<DocumentSnapshot>', "const snap = await getDoc(doc(db, 'users', uid));\nif (snap.exists()) console.log(snap.data());", 'snap.exists() must be checked before snap.data() to avoid undefined errors.'),
    api('deleteDoc', 'deleteDoc(docRef)', 'Deletes a document by reference.', 'DocumentReference', 'Promise<void>', "await deleteDoc(doc(db, 'sessions', sessionId));", 'Does not delete subcollections — those must be deleted separately.'),
    api('writeBatch', 'writeBatch(db)', 'Performs up to 500 writes atomically in one commit.', 'db instance', 'WriteBatch instance', "const batch = writeBatch(db);\nbatch.set(doc(db,'logs',id), entry);\nbatch.update(doc(db,'counters','total'), { n: increment(1) });\nawait batch.commit();", 'Batch does not guarantee read-modify-write atomicity — use runTransaction for that.'),
    api('arrayUnion / arrayRemove / increment', 'arrayUnion(...items) / arrayRemove(...items) / increment(n)', 'Atomic field-level transforms for arrays and numeric counters.', 'values to add/remove or numeric delta', 'FieldValue sentinel', "await updateDoc(ref, {\n  tags: arrayUnion('featured'),\n  score: increment(1),\n});", 'These are server-evaluated — do not read-modify-write the array yourself to avoid race conditions.'),
    api('collectionGroup', 'collectionGroup(db, collectionId)', 'Queries all subcollections with the given ID across the entire database.', 'collection ID string', 'query object', "const q = query(collectionGroup(db, 'messages'), where('unread', '==', true));", 'Requires a composite index with __name__ and the queried fields.'),
  );

  // Firebase sub-topics — specific flashcards
  skills.forEach((s) => {
    if (s.parentId !== firebase.id) return;
    const specific = {
      'Firestore Data Modeling': [
        card('What is the fan-out write pattern in Firestore?', 'Writing denormalised copies of data to multiple documents for fast reads — e.g., duplicating a username into every post document to avoid a join lookup.'),
        card('Why should document size be kept under 1 MB?', 'Firestore has a 1 MB document size limit; large documents also mean every read loads the entire document — split large payloads into subcollections.'),
      ],
      'Realtime Listeners': [
        card('What is the metadata.hasPendingWrites field on a snapshot?', 'It is true when the snapshot reflects a local optimistic write not yet confirmed by the server — useful for showing pending state in the UI.'),
        card('How do you listen to multiple documents efficiently?', 'Use a single query listener rather than individual document listeners — fewer network connections and Firestore charges per snapshot, not per listener.'),
      ],
      'Security Rules': [
        card('What does `allow write: if false` in rules mean?', 'No client can write to that path at all — useful for server-only documents that should only be mutated via Cloud Functions with the Admin SDK.'),
        card('What is the difference between resource and request.resource in rules?', 'resource is the current document data (before write); request.resource is the incoming data (after write) — use both to validate that only allowed fields changed.'),
      ],
      'Indexes & Query Limits': [
        card('What query operations always require a composite index in Firestore?', 'Queries with inequality filters on one field combined with ordering on a different field, or any query combining multiple inequality filters.'),
        card('What happens when a required Firestore index is missing?', 'The query throws a permission/index error with a link to the Firebase console to create the index — missing indexes are a common first-deploy production surprise.'),
      ],
      'Transactions & Batched Writes': [
        card('What is the maximum number of documents in a batched write?', '500 documents per batch.commit() — for larger datasets, split into multiple batches or use the Admin SDK bulk writer.'),
        card('Why might a Firestore transaction retry multiple times?', 'If a document read inside the transaction is modified by another client before commit, Firestore aborts and retries — callbacks must be idempotent.'),
      ],
      'Offline Sync': [
        card('How does Firestore offline persistence work?', 'The SDK caches documents locally and serves reads from cache when offline; writes are queued and synced when connectivity resumes.'),
        card('What is the risk of relying on offline data for security decisions?', 'Cached data may be stale — always re-verify sensitive state on the server (via Cloud Functions or after a fresh online fetch) before critical actions.'),
      ],
      'Cloud Functions Integration': [
        card('What is the difference between onWrite and onUpdate Firestore triggers?', 'onWrite fires for create, update, and delete; onUpdate fires only when an existing document changes — use onUpdate when you only care about modifications.'),
        card('Why use the Admin SDK inside Cloud Functions?', 'Admin SDK bypasses security rules, enabling trusted server-side writes that clients should not be allowed to perform directly.'),
      ],
    };
    const cards = specific[s.name];
    if (cards) s.flashcards.push(...cards);
  });

  return skills;
}
