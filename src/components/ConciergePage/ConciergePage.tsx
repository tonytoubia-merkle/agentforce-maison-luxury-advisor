import { motion, AnimatePresence } from 'framer-motion';
import { useScene } from '@/contexts/SceneContext';
import { useConversation } from '@/contexts/ConversationContext';
import { GenerativeBackground } from '@/components/GenerativeBackground';
import { ChatInterface } from '@/components/ChatInterface';
import { ProductShowcase } from '@/components/ProductShowcase';
import { CheckoutOverlay } from '@/components/CheckoutOverlay';
import { WelcomeScreen } from '@/components/WelcomeScreen/WelcomeScreen';
import { WelcomeLoader } from '@/components/WelcomeScreen/WelcomeLoader';
import { PersonaSelector } from '@/components/PersonaSelector/PersonaSelector';
import { ProfilePanel } from '@/components/ProfilePanel/ProfilePanel';
import { sceneAnimationVariants } from '@/utils/animations';

export const ConciergePage: React.FC = () => {
  const { scene } = useScene();
  const { messages, sendMessage, isAgentTyping, isLoadingWelcome, suggestedActions } = useConversation();

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
            key={scene.transitionKey}
            variants={sceneAnimationVariants[scene.layout]}
            initial="initial"
            animate="animate"
            exit="exit"
            className="relative z-10 min-h-screen flex flex-col"
          >
            <ChatInterface
              position={scene.chatPosition}
              messages={messages}
              onSendMessage={sendMessage}
              isAgentTyping={isAgentTyping}
              isMinimized={scene.layout === 'checkout'}
              suggestedActions={suggestedActions}
              productSlot={
                scene.layout !== 'conversation-centered' && scene.products.length > 0 ? (
                  <ProductShowcase
                    products={scene.products}
                    layout={scene.layout}
                  />
                ) : undefined
              }
            />
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {scene.checkoutActive && (
          <CheckoutOverlay />
        )}
      </AnimatePresence>

      <PersonaSelector />
      <ProfilePanel />
    </div>
  );
};
