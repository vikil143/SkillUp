// seed/skills/state-architecture.js — Redux, Context, Microfrontend, etc.
import { mk } from '../helpers.js';

export default function buildStateSkills() {
  return [
    mk('Redux', 'state', null, {
      definition: 'Predictable state container. Single store, action-reducer flow, pure reducers.',
    }),
    mk('Redux Toolkit', 'state', null, {
      definition: 'Official Redux toolset — createSlice, createAsyncThunk, Immer-powered mutations.',
    }),
    mk('Context API', 'state'),
    mk('Custom Hooks', 'state', null, {
      codeExample: 'function useDebounce(value, ms) {\n  const [v, setV] = useState(value);\n  useEffect(() => {\n    const id = setTimeout(() => setV(value), ms);\n    return () => clearTimeout(id);\n  }, [value, ms]);\n  return v;\n}',
    }),
    mk('Microfrontend', 'state', null, {
      definition: 'Architecture splitting a frontend into independently deployable apps.',
      whenUsed: 'Dynamic Content Editor at Netcore — modules deployed independently.',
    }),
    mk('Component-Driven Architecture', 'state'),
    mk('MVC', 'state'),
  ];
}
