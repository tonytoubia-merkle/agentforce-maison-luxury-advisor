import { MaisonProvider } from '@/contexts/MaisonContext';
import { SceneProvider } from '@/contexts/SceneContext';
import { ConversationProvider } from '@/contexts/ConversationContext';
import { CustomerProvider } from '@/contexts/CustomerContext';
import { MaisonPage } from '@/components/MaisonPage';

function App() {
  return (
    <MaisonProvider>
      <CustomerProvider>
        <SceneProvider>
          <ConversationProvider>
            <MaisonPage />
          </ConversationProvider>
        </SceneProvider>
      </CustomerProvider>
    </MaisonProvider>
  );
}

export default App;
