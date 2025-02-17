'use client';

import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import Board from './board';

const BoardContainer = () => {
  return (
    <DndProvider backend={HTML5Backend}>
      <Board />
    </DndProvider>
  );
}

export default BoardContainer;