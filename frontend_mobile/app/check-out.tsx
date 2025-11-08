import { Stack } from 'expo-router';
import { CheckOutScreen } from '@/src/screens';

export default function CheckOutPage() {
  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <CheckOutScreen />
    </>
  );
}