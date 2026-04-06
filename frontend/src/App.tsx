import { ReactFlowProvider } from 'reactflow';
import AppLayout from './components/Layout/AppLayout';

function App() {
  return (
    <ReactFlowProvider>
      <AppLayout />
    </ReactFlowProvider>
  );
}

export default App;
