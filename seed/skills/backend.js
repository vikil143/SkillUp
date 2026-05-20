// seed/skills/backend.js — Node.js, Express, REST, GraphQL, WebSockets
import { mk, uid } from '../helpers.js';

export default function buildBackendSkills() {
  return [
    mk('Node.js', 'backend', null, {
      definition: 'JS runtime built on V8. Event-driven, non-blocking I/O. Used for servers, CLIs, tooling.',
      apis: [
        {
          id: uid(),
          name: 'fs.readFile',
          signature: 'fs.readFile(path, options, callback) / fs.promises.readFile(path, options): Promise<Buffer|string>',
          description: 'Reads a file asynchronously. Use the promise form (fs.promises) to avoid callback hell.',
          params: 'path — file path. options — encoding (e.g. "utf8") or object. callback — (err, data) => void.',
          returns: 'void (callback) or Promise<Buffer | string> (promise form).',
          example: "const { readFile } = require('fs/promises');\nconst src = await readFile('./data.json', 'utf8');",
          gotchas: 'Without encoding option, returns a Buffer. Large files should use createReadStream instead.',
        },
        {
          id: uid(),
          name: 'fs.writeFile',
          signature: 'fs.promises.writeFile(path, data, options?): Promise<void>',
          description: 'Writes data to a file, creating it if it does not exist. Overwrites by default.',
          params: 'path — destination. data — string, Buffer, or TypedArray. options — encoding, flag, mode.',
          returns: 'Promise<void>',
          example: "await fs.promises.writeFile('./out.json', JSON.stringify(obj), 'utf8');",
          gotchas: "Use flag: 'a' to append instead of overwrite. Not atomic — use a temp file + rename for safety.",
        },
        {
          id: uid(),
          name: 'http.createServer',
          signature: 'http.createServer(handler: (req, res) => void): http.Server',
          description: 'Creates a raw HTTP server. Foundation that Express and Fastify build on.',
          params: 'handler — called with IncomingMessage (req) and ServerResponse (res) for each request.',
          returns: 'http.Server instance. Call .listen(port) to start.',
          example: "const server = http.createServer((req, res) => {\n  res.writeHead(200);\n  res.end('Hello');\n});\nserver.listen(3000);",
          gotchas: 'No routing or body parsing built-in. Use Express or parse req as a stream manually.',
        },
        {
          id: uid(),
          name: 'process.env',
          signature: 'process.env: { [key: string]: string | undefined }',
          description: 'Object containing the user environment at process start. Used for config/secrets.',
          params: 'N/A — property access: process.env.MY_VAR.',
          returns: 'string | undefined for each key.',
          example: "const port = parseInt(process.env.PORT ?? '3000', 10);",
          gotchas: 'All values are strings. Accessing an unset key returns undefined — always provide defaults.',
        },
        {
          id: uid(),
          name: 'Buffer.from',
          signature: 'Buffer.from(value, encoding?): Buffer',
          description: 'Creates a Buffer from a string, array, ArrayBuffer, or another Buffer.',
          params: 'value — source data. encoding — for string input (default "utf8").',
          returns: 'Buffer instance.',
          example: "const b = Buffer.from('hello', 'utf8');\nconsole.log(b.toString('base64')); // aGVsbG8=",
          gotchas: 'Do not use new Buffer() — deprecated and insecure. Always use Buffer.from/alloc/allocUnsafe.',
        },
      ],
    }),
    mk('Express.js', 'backend'),
    mk('REST APIs', 'backend'),
    mk('GraphQL', 'backend'),
    mk('WebSockets', 'backend', null, {
      definition: 'Full-duplex protocol for real-time bidirectional comms over a single TCP connection.',
      whenUsed: 'Real-time market data streaming for Option Chain. Collaborative editing in Docusaurus.',
      flashcards: [
        { id: uid(), q: 'WebSocket vs SSE?', a: 'WebSocket is bidirectional. SSE is server→client only, simpler (just HTTP), auto-reconnects.' },
      ],
    }),
  ];
}
