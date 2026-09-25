import { useNavigate } from 'react-router-dom';
import { Button, Card } from '../design-system';

export function NotFoundPage() {
  const navigate = useNavigate();
  return (
    <Card title="Page not found" description="That page doesn’t exist.">
      <Button onClick={() => navigate('/')}>Back to portal</Button>
    </Card>
  );
}
