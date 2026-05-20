// seed/skills/mobile.js — React Native, Electron
import { mk, uid } from '../helpers.js';

export default function buildMobileSkills() {
  const rn = mk('React Native', 'mobile', null, {
    definition: 'Framework for building native iOS/Android apps using React. Renders to native components.',
    whenUsed: 'Maak, Packarma at Mypcot. Integrated Firebase, Razorpay, GPS, biometrics.',
  });

  const rnNav = mk('Navigation', 'mobile', rn.id, {
    definition: 'react-navigation provides stack/tab/drawer navigators for screen routing.',
  });

  const rnLists = mk('Lists & Performance', 'mobile', rn.id, {
    definition: 'FlatList virtualizes long lists. SectionList for grouped data. ScrollView only for short, known content.',
    flashcards: [
      { id: uid(), q: 'Why FlatList over ScrollView for long lists?', a: 'FlatList virtualizes — renders only visible items, recycles views. ScrollView mounts everything.' },
    ],
  });

  const electron = mk('Electron', 'mobile');

  return [rn, rnNav, rnLists, electron];
}
