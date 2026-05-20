// seed/skills/design-patterns.js — Singleton, Factory, Observer, Strategy, Repository, Decorator
import { mk } from '../helpers.js';

export default function buildDesignPatternSkills() {
  return [
    mk('Singleton', 'design-patterns', null, {
      definition: 'Ensures a class has only one instance and provides a global access point.',
    }),
    mk('Factory', 'design-patterns', null, {
      definition: 'Creates objects without specifying the exact class. Subclasses decide what to instantiate.',
    }),
    mk('Observer', 'design-patterns', null, {
      definition: 'One-to-many dependency — when subject changes, all observers notified. Foundation of event systems.',
    }),
    mk('Strategy', 'design-patterns', null, {
      definition: 'Defines a family of algorithms, makes them interchangeable at runtime.',
    }),
    mk('Repository', 'design-patterns', null, {
      definition: 'Abstracts data access behind a collection-like interface. Decouples domain logic from persistence.',
    }),
    mk('Decorator', 'design-patterns', null, {
      definition: 'Attaches additional responsibilities to an object dynamically. Flexible alternative to subclassing.',
    }),
  ];
}
