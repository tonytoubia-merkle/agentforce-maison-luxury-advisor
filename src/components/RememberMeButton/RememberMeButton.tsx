import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/Button';
import { useCustomer } from '@/contexts/CustomerContext';
import { useConversation } from '@/contexts/ConversationContext';
import { cn } from '@/utils/cn';

interface RememberMeButtonProps {
  className?: string;
}

export const RememberMeButton: React.FC<RememberMeButtonProps> = ({ className }) => {
  const { customer } = useCustomer();
  const { sendMessage } = useConversation();
  const [isOpen, setIsOpen] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Only show for anonymous users (no customer or anonymous tier)
  const isAnonymous = !customer || customer.merkuryIdentity?.identityTier === 'anonymous';
  if (!isAnonymous) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) return;

    setIsSubmitting(true);

    // Inject a natural message into the conversation
    // This triggers the IdentityCapture topic flow naturally
    const message = `My name is ${name.trim()} and my email is ${email.trim()}`;
    await sendMessage(message);

    setIsSubmitting(false);
    setIsOpen(false);
    setName('');
    setEmail('');
  };

  const handleClose = () => {
    if (!isSubmitting) {
      setIsOpen(false);
      setName('');
      setEmail('');
    }
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className={cn(
          'flex items-center gap-2 px-3 py-1.5 rounded-full',
          'bg-white/10 hover:bg-white/20 backdrop-blur-sm',
          'text-white/80 hover:text-white text-sm',
          'border border-white/20 hover:border-white/30',
          'transition-all duration-200',
          className
        )}
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
        Remember Me
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
            onClick={handleClose}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="w-full max-w-md bg-white rounded-2xl p-6 shadow-2xl mx-4"
              onClick={(e) => e.stopPropagation()}
            >
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                Remember Me
              </h2>
              <p className="text-gray-500 text-sm mb-6">
                Share your details so I can personalize your experience and remember your preferences.
              </p>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                    Name
                  </label>
                  <input
                    id="name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter your name"
                    className={cn(
                      'w-full px-4 py-2.5 rounded-lg',
                      'bg-gray-50 border border-gray-200',
                      'text-gray-900 placeholder-gray-400',
                      'focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500',
                      'transition-all duration-200'
                    )}
                    required
                    disabled={isSubmitting}
                  />
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    className={cn(
                      'w-full px-4 py-2.5 rounded-lg',
                      'bg-gray-50 border border-gray-200',
                      'text-gray-900 placeholder-gray-400',
                      'focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500',
                      'transition-all duration-200'
                    )}
                    required
                    disabled={isSubmitting}
                  />
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={handleClose}
                    disabled={isSubmitting}
                    className={cn(
                      'flex-1 px-4 py-2.5 rounded-lg',
                      'bg-gray-100 hover:bg-gray-200 text-gray-700',
                      'font-medium transition-colors',
                      'disabled:opacity-50 disabled:cursor-not-allowed'
                    )}
                  >
                    Cancel
                  </button>
                  <Button
                    type="submit"
                    disabled={isSubmitting || !name.trim() || !email.trim()}
                    className="flex-1 bg-amber-800 hover:bg-amber-900 text-white"
                  >
                    {isSubmitting ? (
                      <span className="flex items-center justify-center gap-2">
                        <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                        </svg>
                        Connecting...
                      </span>
                    ) : (
                      'Connect'
                    )}
                  </Button>
                </div>
              </form>

              <p className="text-xs text-gray-400 text-center mt-4">
                Your information helps us provide personalized recommendations.
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
