import { motion, AnimatePresence } from 'framer-motion';
import { useScene } from '@/contexts/SceneContext';
import { useConversation } from '@/contexts/ConversationContext';
import { useMaison } from '@/contexts/MaisonContext';
import { GenerativeBackground } from '@/components/GenerativeBackground';
import { ChatInterface } from '@/components/ChatInterface';
import { CheckoutOverlay } from '@/components/CheckoutOverlay';
import { WelcomeScreen } from '@/components/WelcomeScreen/WelcomeScreen';
import { WelcomeLoader } from '@/components/WelcomeScreen/WelcomeLoader';
import { IdentityPanel } from '@/components/IdentityPanel/IdentityPanel';
import { MaisonSelector } from '@/components/MaisonSelector/MaisonSelector';
import { RememberMeButton } from '@/components/RememberMeButton';

export const MaisonPage: React.FC = () => {
  const { scene } = useScene();
  const { messages, sendMessage, isAgentTyping, isLoadingWelcome, suggestedActions } = useConversation();
  const { maison } = useMaison();

  return (
    <div className="relative min-h-screen overflow-hidden">
      <GenerativeBackground
        background={scene.background}
        setting={scene.setting}
      />

      <AnimatePresence mode="wait">
        {isLoadingWelcome ? (
          <WelcomeLoader key="loader" />
        ) : scene.welcomeActive ? (
          <WelcomeScreen key="welcome" />
        ) : (
          <motion.div
            key="main-chat"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="relative z-10 min-h-screen flex flex-col"
          >
            <ChatInterface
              position={scene.chatPosition}
              messages={messages}
              onSendMessage={sendMessage}
              isAgentTyping={isAgentTyping}
              isMinimized={scene.layout === 'checkout'}
              suggestedActions={suggestedActions}
              sceneLayout={scene.layout}
            />
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {scene.checkoutActive && (
          <CheckoutOverlay />
        )}
      </AnimatePresence>

      <IdentityPanel />
      <MaisonSelector />

      {/* Remember Me button for anonymous users - positioned near identity panel */}
      <div className="fixed top-4 right-48 z-50">
        <RememberMeButton />
      </div>
    </div>
  );
};
