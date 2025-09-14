import { Toaster } from 'sonner';
import 'react-toastify/dist/ReactToastify.css';
import AppRoutes from "./routes";

function App() {
  return (
    <>
      <AppRoutes />
      <Toaster richColors closeButton position="top-center" />
    </>
  );
}

export default App;
