import { createContext, useCallback, useContext, useState, type ReactNode } from "react";
import PaymentModal from "./PaymentModal";
import { CLUB_BACKEND_IDS, type ClubId } from "@/data/clubs";

interface OpenArgs {
  clubId?: ClubId;
}

interface PaymentModalContextValue {
  open: (args?: OpenArgs) => void;
  close: () => void;
}

const PaymentModalContext = createContext<PaymentModalContextValue | null>(null);

export function PaymentModalProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [clubId, setClubId] = useState<ClubId>("4you"); // default fallback

  const open = useCallback((args?: OpenArgs) => {
    if (args?.clubId) setClubId(args.clubId);
    setIsOpen(true);
  }, []);
  const close = useCallback(() => setIsOpen(false), []);

  return (
    <PaymentModalContext.Provider value={{ open, close }}>
      {children}
      <PaymentModal open={isOpen} onClose={close} clubBackendId={CLUB_BACKEND_IDS[clubId]} clubId={clubId} />
    </PaymentModalContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function usePaymentModal(): PaymentModalContextValue {
  const ctx = useContext(PaymentModalContext);
  if (!ctx) throw new Error("usePaymentModal must be used inside PaymentModalProvider");
  return ctx;
}
