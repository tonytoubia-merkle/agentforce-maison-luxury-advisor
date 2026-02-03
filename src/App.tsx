import { MaisonProvider } from '@/contexts/MaisonContext';
import { SceneProvider } from '@/contexts/SceneContext';
import { ConversationProvider } from '@/contexts/ConversationContext';
import { CustomerProvider } from '@/contexts/CustomerContext';
import { ActivityToastProvider } from '@/components/ActivityToast';
import { MaisonPage } from '@/components/MaisonPage';

function App() {
  return (
    <MaisonProvider>
      <CustomerProvider>
        <SceneProvider>
          <ActivityToastProvider>
            <ConversationProvider>
              <MaisonPage />
            </ConversationProvider>
          </ActivityToastProvider>
        </SceneProvider>
      </CustomerProvider>
    </MaisonProvider>
  );
}

export default App;
