import { ExpoRoot } from 'expo-router';

export default function App() {
  const context = require.context('./apps/mobile/app');
  return <ExpoRoot context={context} />;
}
