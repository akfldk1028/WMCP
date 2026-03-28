import { PlanningChat } from '@/modules/planning-chat';

export default function PlanningPage() {
  return (
    <main>
      <PlanningChat
        config={{
          apiEndpoint: '/api/planning/chat',
          mode: 'both',
        }}
      />
    </main>
  );
}
