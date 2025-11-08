import { Stack } from 'expo-router';
import DailyNoteScreen from '@/src/screens/care/DailyNoteScreen';

export default function DailyNotePage() {
  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <DailyNoteScreen />
    </>
  );
}
