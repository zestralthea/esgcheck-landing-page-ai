import { useState, createContext, useContext, ReactNode } from "react";

interface WaitlistModalContextType {
  isOpen: boolean;
  openModal: () => void;
  closeModal: () => void;
}

const WaitlistModalContext = createContext<WaitlistModalContextType | undefined>(undefined);

export function WaitlistModalProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);

  const openModal = () => setIsOpen(true);
  const closeModal = () => setIsOpen(false);

  return (
    <WaitlistModalContext.Provider value={{ isOpen, openModal, closeModal }}>
      {children}
    </WaitlistModalContext.Provider>
  );
}

export function useWaitlistModal() {
  const context = useContext(WaitlistModalContext);
  if (context === undefined) {
    throw new Error('useWaitlistModal must be used within a WaitlistModalProvider');
  }
  return context;
}