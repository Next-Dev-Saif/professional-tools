import NotesClient from '@/components/page-sections/meeting-notes/NotesClient';

export const metadata = {
  title: 'Meeting to Report | Hephaestus Tools',
  description: 'Convert meeting notes into structured reports and executive summaries.',
};

export default function MeetingNotesPage() {
  return <NotesClient />;
}
