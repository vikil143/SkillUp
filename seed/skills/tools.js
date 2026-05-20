// seed/skills/tools.js — VS Code, Postman, Chrome DevTools, Figma, Notion
import { mk } from '../helpers.js';

export default function buildToolsSkills() {
  return [
    mk('VS Code', 'tools', null, {
      definition: "Microsoft's lightweight, extensible code editor. Built on Electron. Massive extension ecosystem.",
    }),
    mk('Postman', 'tools', null, {
      definition: 'API client for sending HTTP/GraphQL requests, organizing collections, scripting tests.',
    }),
    mk('Chrome DevTools', 'tools', null, {
      definition: 'Browser-based debug suite — DOM inspector, network panel, performance profiler, JS debugger.',
    }),
    mk('Figma', 'tools', null, {
      definition: 'Browser-based collaborative UI design tool. Components, auto-layout, prototyping, dev handoff.',
    }),
    mk('Notion', 'tools', null, {
      definition: 'All-in-one workspace for notes, docs, databases, and project tracking.',
    }),
  ];
}
