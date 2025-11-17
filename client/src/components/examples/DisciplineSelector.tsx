import { useState } from 'react';
import DisciplineSelector from '../DisciplineSelector';

export default function DisciplineSelectorExample() {
  const [disciplines, setDisciplines] = useState(['architecture', 'mepf']);
  const [lod, setLod] = useState('300');

  const handleDisciplineChange = (disciplineId: string, checked: boolean) => {
    setDisciplines(prev =>
      checked ? [...prev, disciplineId] : prev.filter(id => id !== disciplineId)
    );
  };

  return (
    <div className="p-8 max-w-3xl">
      <DisciplineSelector
        selectedDisciplines={disciplines}
        lodLevel={lod}
        onDisciplineChange={handleDisciplineChange}
        onLodChange={setLod}
      />
    </div>
  );
}
