import React from 'react';
import ChildLearning from '../components/ChildLearning';
import { childCountingData } from '../constants/childLearning';

const countingRanges = [
  { label: '1-10', startIndex: 0, endIndex: 9, colors: ['#F97316', '#FB7185'] as [string, string] },
  { label: '10-20', startIndex: 9, endIndex: 19, colors: ['#F59E0B', '#F97316'] as [string, string] },
  { label: '20-30', startIndex: 19, endIndex: 29, colors: ['#EAB308', '#22C55E'] as [string, string] },
  { label: '30-40', startIndex: 29, endIndex: 39, colors: ['#14B8A6', '#06B6D4'] as [string, string] },
  { label: '40-50', startIndex: 39, endIndex: 49, colors: ['#0EA5E9', '#3B82F6'] as [string, string] },
  { label: '50-60', startIndex: 49, endIndex: 59, colors: ['#6366F1', '#8B5CF6'] as [string, string] },
  { label: '60-70', startIndex: 59, endIndex: 69, colors: ['#8B5CF6', '#D946EF'] as [string, string] },
  { label: '70-80', startIndex: 69, endIndex: 79, colors: ['#EC4899', '#F43F5E'] as [string, string] },
  { label: '80-90', startIndex: 79, endIndex: 89, colors: ['#FB7185', '#F97316'] as [string, string] },
  { label: '90-100', startIndex: 89, endIndex: 99, colors: ['#22C55E', '#14B8A6'] as [string, string] },
];

const ChildCounting = () => (
  <ChildLearning
    data={childCountingData}
    title="Counting Learning"
    helperText="Tap speak and repeat the number out loud."
    ranges={countingRanges}
  />
);

export default ChildCounting;
