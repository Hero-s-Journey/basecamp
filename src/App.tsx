import { useEffect } from "react";
import { BrowserRouter } from "react-router-dom";
import { AppRoutes } from "./router";
import { I18nextProvider } from "react-i18next";
import i18n from "./i18n";
import SchemaOrg from "./components/feature/SchemaOrg";
import { PaymentModalProvider } from "./components/feature/PaymentModalContext";
import { captureUtm } from "./lib/utm";


function App() {
  useEffect(() => {
    captureUtm();
  }, []);

  return (
    <I18nextProvider i18n={i18n}>
      <SchemaOrg />
      <PaymentModalProvider>
        <BrowserRouter basename={__BASE_PATH__}>
          <AppRoutes />
        </BrowserRouter>
      </PaymentModalProvider>
    </I18nextProvider>
  );
}

export default App;
