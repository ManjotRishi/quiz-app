import React from 'react';
import ChildLearning from '../components/ChildLearning';
import { childAnimalData, getAnimalImageSource } from '../constants/childLearning';

const ChildAnimals = () => (
  <ChildLearning
    data={childAnimalData}
    title="Animal Learning"
    helperText="Tap speak and repeat each animal name clearly."
    imageResolver={getAnimalImageSource}
    showSymbolBubble={false}
  />
);

export default ChildAnimals;
