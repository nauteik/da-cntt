import { Stack } from 'expo-router';
import { CheckInScreen } from '@/src/screens';

export default function CheckInPage() {
  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <CheckInScreen />
    </>
  );
}