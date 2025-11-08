import { Stack } from 'expo-router';
import { CancelScheduleScreen } from '@/src/screens';

export default function CancelSchedulePage() {
  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <CancelScheduleScreen />
    </>
  );
}