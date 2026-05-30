// seed/skills/foundation.js - foundation question bank
import { mk, uid } from '../helpers.js';

const card = (q, a) => ({ id: uid(), q, a });

export default function buildFoundationSkills() {
  const skills = [];

  const programming = mk('Programming Foundations', 'foundation', null, {
    definition:
      'Core programming concepts that support every language and framework: values, control flow, data structures, functions, state, complexity, debugging, and basic system thinking.',
    codeExample:
      "function uniqueSortedNumbers(values) {\n  return [...new Set(values)].sort((a, b) => a - b);\n}",
    whenUsed:
      'Useful before interview revision or when refreshing fundamentals shared by frontend, backend, mobile, and data work.',
    gotchas:
      'Memorizing terms without examples makes answers brittle. Focus on what each concept changes in real code: correctness, readability, performance, or safety.',
    flashcards: [
      card('What is the difference between a variable and a constant?', 'A variable names a value that may be reassigned; a constant names a value that cannot be reassigned in that scope. In JavaScript, const prevents rebinding the variable, but objects and arrays stored in const can still be mutated unless frozen.'),
      card('What is control flow?', 'Control flow is the order in which statements run. Common tools are conditionals, loops, function calls, exceptions, and async scheduling. Good control flow makes program behavior predictable.'),
      card('What is a function?', 'A reusable block of logic that accepts inputs, performs work, and may return an output. Functions reduce duplication, isolate behavior, and make code easier to test.'),
      card('What is the difference between pass-by-value and pass-by-reference?', 'Pass-by-value copies the value into the function. In JavaScript, primitives are passed by value, while object references are passed by value, meaning the function can mutate the referenced object but cannot rebind the caller variable.'),
      card('What is a data structure?', 'A way to organize data for specific operations. Arrays are good for ordered lists, maps for key-value lookup, sets for uniqueness, queues for FIFO processing, and stacks for LIFO processing.'),
      card('Array vs linked list - what is the practical difference?', 'Arrays provide fast index access and cache-friendly storage but can be costly to insert in the middle. Linked lists make local insertion cheap when you already have the node, but lookup by index is slow and memory overhead is higher.'),
      card('What does Big O notation describe?', 'Big O describes how an algorithm scales as input grows, usually in time or memory. O(1), O(log n), O(n), O(n log n), and O(n^2) compare growth trends, not exact runtime.'),
      card('What is the difference between stack and heap memory?', 'The stack stores function call frames and short-lived local bookkeeping. The heap stores dynamically allocated objects that may outlive a function call. Managed languages hide allocation details but the lifetime idea still matters.'),
      card('What is recursion?', 'A function calling itself to solve smaller versions of the same problem. Every recursive solution needs a base case and progress toward that base case, otherwise it runs forever or overflows the call stack.'),
      card('What is mutation and why can it cause bugs?', 'Mutation changes existing data in place. It can be efficient, but shared mutable state makes bugs harder to trace because one part of the app can change data another part still relies on.'),
      card('What is an API?', 'An API is a contract for how software parts communicate. It defines available operations, inputs, outputs, errors, and behavior expectations, whether inside a codebase or across a network.'),
      card('What makes a good bug report?', 'Clear reproduction steps, expected result, actual result, environment, relevant logs or screenshots, and the smallest known failing case. A good report lets another engineer reproduce the problem quickly.'),
    ],
  });
  skills.push(programming);

  const web = mk('Web Foundations', 'foundation', programming.id, {
    definition:
      'Essential browser and internet concepts behind modern app development: HTML, CSS, JavaScript, HTTP, URLs, storage, security, and accessibility.',
    flashcards: [
      card('What roles do HTML, CSS, and JavaScript play?', 'HTML defines structure and meaning, CSS controls presentation and layout, and JavaScript adds behavior and state changes. Strong web apps keep those responsibilities understandable even when frameworks combine them.'),
      card('What happens when you enter a URL in the browser?', 'The browser resolves DNS, opens a connection, negotiates TLS for HTTPS, sends an HTTP request, receives a response, parses HTML, fetches linked assets, builds render trees, and paints the page.'),
      card('What is HTTP?', 'HTTP is an application-layer request-response protocol. Clients send methods like GET or POST to resources, and servers return status codes, headers, and optional bodies.'),
      card('What is the difference between authentication and authorization?', 'Authentication verifies who the user is. Authorization decides what that verified user is allowed to do. Login is authentication; checking access to an admin route is authorization.'),
      card('Why does accessibility matter in frontend work?', 'Accessibility makes software usable by people with different abilities and devices. Semantic HTML, labels, keyboard support, focus management, color contrast, and screen-reader-friendly content improve both inclusion and product quality.'),
      card('What is responsive design?', 'Responsive design lets a UI adapt to different screen sizes, input types, and device constraints using flexible layout, media queries, scalable assets, and content that reflows without breaking.'),
      card('What is the DOM?', 'The Document Object Model is the browser representation of a document as objects and nodes. JavaScript and frameworks update the DOM to change what users see and interact with.'),
      card('What is CORS?', 'Cross-Origin Resource Sharing is a browser security mechanism that lets servers declare which origins may read responses. It protects users from unauthorized cross-origin reads, but it is not a replacement for backend authorization.'),
    ],
  });
  skills.push(web);

  const data = mk('Data Foundations', 'foundation', programming.id, {
    definition:
      'Foundational data concepts used across databases, APIs, analytics, and application state.',
    flashcards: [
      card('What is the difference between data and information?', 'Data is raw facts or observations. Information is data organized with context so it can answer a question or support a decision.'),
      card('What is a primary key?', 'A primary key uniquely identifies each row in a table. It should be stable, non-null, and unique so records can be referenced safely.'),
      card('What is normalization in databases?', 'Normalization organizes relational data to reduce duplication and update anomalies. It usually means separating entities into related tables and connecting them with keys.'),
      card('What is an index in a database?', 'An index is an auxiliary data structure that speeds up lookups and sorting at the cost of extra storage and slower writes. Good indexes match real query patterns.'),
      card('What is a transaction?', 'A transaction groups operations into one unit of work that either commits fully or rolls back. It protects consistency when multiple related writes must succeed together.'),
      card('What is caching?', 'Caching stores a reusable copy of data or computation closer to where it is needed. It improves speed and reduces load, but requires freshness and invalidation rules.'),
      card('What is JSON?', 'JSON is a text format for structured data using objects, arrays, strings, numbers, booleans, and null. It is common in web APIs because it is language-independent and easy to parse.'),
      card('What is the difference between validation and sanitization?', 'Validation checks whether input meets rules. Sanitization transforms input into a safer form, such as escaping HTML. Most systems need validation at boundaries and context-specific sanitization before output or storage.'),
    ],
  });
  skills.push(data);

  return skills;
}
