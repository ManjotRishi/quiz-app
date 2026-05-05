import React from 'react';
import ChildLearning from '../components/ChildLearning';
import { childAlphabetData } from '../constants/childLearning';

const ChildAlphabet = () => (
  <ChildLearning
    data={childAlphabetData}
    title="Alphabet Learning"
    helperText="Tap speak and repeat the word out loud."
  />
);

export default ChildAlphabet;
