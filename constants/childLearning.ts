import { ImageSourcePropType } from 'react-native';

export type ChildLearningItem = {
  symbol: string;
  speaking: string;
  hindi: string;
  punjabi: string;
  img?: string;
  displayText?: string;
};

export type ChildAlphabetItem = ChildLearningItem;
export type ChildCountingItem = ChildLearningItem;
export type ChildAnimalItem = ChildLearningItem;
export type TableQuestion = {
  id: string;
  table: number;
  multiplier: number;
  answer: number;
  displayQuestion: string;
  speechText: string;
};

const childImageSources: Record<string, ImageSourcePropType> = {
  'apple.jpeg': require('../assets/child_images/apple.jpeg'),
  'ball.jpeg': require('../assets/child_images/ball.jpeg'),
  'cat.jpeg': require('../assets/child_images/cat.jpeg'),
  'dog.jpeg': require('../assets/child_images/dog.jpeg'),
  'elephant.jpeg': require('../assets/child_images/elephant.jpeg'),
  'fish.jpeg': require('../assets/child_images/fish.jpeg'),
  'girl.jpeg': require('../assets/child_images/girl.jpeg'),
  'ice.jpeg': require('../assets/child_images/ice.jpeg'),
  'joker.jpeg': require('../assets/child_images/joker.jpeg'),
  'king.jpeg': require('../assets/child_images/king.jpeg'),
  'lion.jpeg': require('../assets/child_images/lion.jpeg'),
  'mango.jpeg': require('../assets/child_images/mango.jpeg'),
  'nest.jpeg': require('../assets/child_images/nest.jpeg'),
  'optopus.jpeg': require('../assets/child_images/optopus.jpeg'),
  'pumpkin.jpeg': require('../assets/child_images/pumpkin.jpeg'),
  'queen.jpeg': require('../assets/child_images/queen.jpeg'),
  'rat.jpeg': require('../assets/child_images/rat.jpeg'),
  'sun.jpeg': require('../assets/child_images/sun.jpeg'),
  'turtle.jpeg': require('../assets/child_images/turtle.jpeg'),
  'umbralla.jpeg': require('../assets/child_images/umbralla.jpeg'),
  'van.jpeg': require('../assets/child_images/van.jpeg'),
  'watch.jpeg': require('../assets/child_images/watch.jpeg'),
  'hat.jpg': require('../assets/child_images/hat.jpg'),
  'xophone.jpeg': require('../assets/child_images/xophone.jpeg'),
  'yoyo.jpeg': require('../assets/child_images/yoyo.jpeg'),
  'zibra.jpeg': require('../assets/child_images/zibra.jpeg'),
};

const animalImageSources: Record<string, ImageSourcePropType> = {
  'bat.jpg': require('../assets/animal/bat.jpg'),
  'bear.jpg': require('../assets/animal/bear.jpg'),
  'butterfly.jpg': require('../assets/animal/butterfly.jpg'),
  'camel.webp': require('../assets/animal/camel.webp'),
  'cat.jpg': require('../assets/animal/cat.jpg'),
  'chimpangy.jpg': require('../assets/animal/chimpangy.jpg'),
  'cow.jpg': require('../assets/animal/cow.jpg'),
  'deer.jpg': require('../assets/animal/deer.jpg'),
  'dog.jpg': require('../assets/animal/dog.jpg'),
  'duck.jpg': require('../assets/animal/duck.jpg'),
  'elephant.jpg': require('../assets/animal/elephant.jpg'),
  'fish.jpg': require('../assets/animal/fish.jpg'),
  'Flamingos.jpg': require('../assets/animal/Flamingos.jpg'),
  'horse.jpg': require('../assets/animal/horse.jpg'),
  'Kangaroo.jpg': require('../assets/animal/Kangaroo.jpg'),
  'lemur (2).jpg': require('../assets/animal/lemur (2).jpg'),
  'lemur.jpg': require('../assets/animal/lemur.jpg'),
  'lion (2).jpg': require('../assets/animal/lion (2).jpg'),
  'lion.jpg': require('../assets/animal/lion.jpg'),
  'monkey.jpg': require('../assets/animal/monkey.jpg'),
  'owl.jpg': require('../assets/animal/owl.jpg'),
  'panda.jpg': require('../assets/animal/panda.jpg'),
  'peacock.jpg': require('../assets/animal/peacock.jpg'),
  'penguin.jpg': require('../assets/animal/penguin.jpg'),
  'puffin.jpg': require('../assets/animal/puffin.jpg'),
  'rabbit.jpg': require('../assets/animal/rabbit.jpg'),
  'raccoon.jpg': require('../assets/animal/raccoon.jpg'),
  'redfox.jpg': require('../assets/animal/redfox.jpg'),
  'redpanda.jpg': require('../assets/animal/redpanda.jpg'),
  'sealion.jpg': require('../assets/animal/sealion.jpg'),
  'sheap.jpg': require('../assets/animal/sheap.jpg'),
  'snail.jpg': require('../assets/animal/snail.jpg'),
  'Swampdeer.jpg': require('../assets/animal/Swampdeer.jpg'),
  'tiger.jpg': require('../assets/animal/tiger.jpg'),
  'turtle.jpg': require('../assets/animal/turtle.jpg'),
  'zibra.jpg': require('../assets/animal/zibra.jpg'),
};

const smallNumbers = [
  'Zero',
  'One',
  'Two',
  'Three',
  'Four',
  'Five',
  'Six',
  'Seven',
  'Eight',
  'Nine',
  'Ten',
  'Eleven',
  'Twelve',
  'Thirteen',
  'Fourteen',
  'Fifteen',
  'Sixteen',
  'Seventeen',
  'Eighteen',
  'Nineteen',
] as const;

const tensNumbers: Record<number, string> = {
  20: 'Twenty',
  30: 'Thirty',
  40: 'Forty',
  50: 'Fifty',
  60: 'Sixty',
  70: 'Seventy',
  80: 'Eighty',
  90: 'Ninety',
};

const numberToWords = (value: number): string => {
  if (value < 20) {
    return smallNumbers[value];
  }

  if (value === 100) {
    return 'One Hundred';
  }

  const tens = Math.floor(value / 10) * 10;
  const ones = value % 10;

  if (ones === 0) {
    return tensNumbers[tens];
  }

  return `${tensNumbers[tens]} ${smallNumbers[ones]}`;
};

export const getChildImageSource = (img: string): ImageSourcePropType =>
  childImageSources[img] ?? childImageSources['apple.jpeg'];

export const getAnimalImageSource = (img: string): ImageSourcePropType =>
  animalImageSources[img] ?? animalImageSources['bear.jpg'];

export const childAlphabetData: ChildAlphabetItem[] = [
  { symbol: 'A', img: 'apple.jpeg', speaking: 'Apple', hindi: '', punjabi: '' },
  { symbol: 'B', img: 'ball.jpeg', speaking: 'Ball', hindi: '', punjabi: '' },
  { symbol: 'C', img: 'cat.jpeg', speaking: 'Cat', hindi: '', punjabi: '' },
  { symbol: 'D', img: 'dog.jpeg', speaking: 'Dog', hindi: '', punjabi: '' },
  { symbol: 'E', img: 'elephant.jpeg', speaking: 'Elephant', hindi: '', punjabi: '' },
  { symbol: 'F', img: 'fish.jpeg', speaking: 'Fish', hindi: '', punjabi: '' },
  { symbol: 'G', img: 'girl.jpeg', speaking: 'Girl', hindi: '', punjabi: '' },
  { symbol: 'H', img: 'hat.jpg', speaking: 'Hat', hindi: '', punjabi: '' },
  { symbol: 'I', img: 'ice.jpeg', speaking: 'Ice', hindi: '', punjabi: '' },
  { symbol: 'J', img: 'joker.jpeg', speaking: 'Joker', hindi: '', punjabi: '' },
  { symbol: 'K', img: 'king.jpeg', speaking: 'King', hindi: '', punjabi: '' },
  { symbol: 'L', img: 'lion.jpeg', speaking: 'Lion', hindi: '', punjabi: '' },
  { symbol: 'M', img: 'mango.jpeg', speaking: 'Mango', hindi: '', punjabi: '' },
  { symbol: 'N', img: 'nest.jpeg', speaking: 'Nest', hindi: '', punjabi: '' },
  { symbol: 'O', img: 'optopus.jpeg', speaking: 'Octopus', hindi: '', punjabi: '' },
  { symbol: 'P', img: 'pumpkin.jpeg', speaking: 'Pumpkin', hindi: '', punjabi: '' },
  { symbol: 'Q', img: 'queen.jpeg', speaking: 'Queen', hindi: '', punjabi: '' },
  { symbol: 'R', img: 'rat.jpeg', speaking: 'Rat', hindi: '', punjabi: '' },
  { symbol: 'S', img: 'sun.jpeg', speaking: 'Sun', hindi: '', punjabi: '' },
  { symbol: 'T', img: 'turtle.jpeg', speaking: 'Turtle', hindi: '', punjabi: '' },
  { symbol: 'U', img: 'umbralla.jpeg', speaking: 'Umbrella', hindi: '', punjabi: '' },
  { symbol: 'V', img: 'van.jpeg', speaking: 'Van', hindi: '', punjabi: '' },
  { symbol: 'W', img: 'watch.jpeg', speaking: 'Watch', hindi: '', punjabi: '' },
  { symbol: 'X', img: 'xophone.jpeg', speaking: 'Xylophone', hindi: '', punjabi: '' },
  { symbol: 'Y', img: 'yoyo.jpeg', speaking: 'Yo-Yo', hindi: '', punjabi: '' },
  { symbol: 'Z', img: 'zibra.jpeg', speaking: 'Zebra', hindi: '', punjabi: '' },
];

export const childCountingData: ChildCountingItem[] = Array.from({ length: 100 }, (_, index) => {
  const value = index + 1;
  const label = numberToWords(value);

  return {
    symbol: String(value),
    speaking: label,
    displayText: label.toUpperCase(),
    hindi: '',
    punjabi: '',
  };
});

const animalNameCorrections: Record<string, string> = {
  bat: 'Bat',
  bear: 'Bear',
  butterfly: 'Butterfly',
  camel: 'Camel',
  cat: 'Cat',
  chimpangy: 'Chimpanzee',
  cow: 'Cow',
  deer: 'Deer',
  dog: 'Dog',
  duck: 'Duck',
  elephant: 'Elephant',
  fish: 'Fish',
  flamingos: 'Flamingo',
  horse: 'Horse',
  kangaroo: 'Kangaroo',
  lemur: 'Lemur',
  lion: 'Lion',
  monkey: 'Monkey',
  owl: 'Owl',
  panda: 'Panda',
  peacock: 'Peacock',
  penguin: 'Penguin',
  puffin: 'Puffin',
  rabbit: 'Rabbit',
  raccoon: 'Raccoon',
  redfox: 'Red Fox',
  redpanda: 'Red Panda',
  sealion: 'Sea Lion',
  sheap: 'Sheep',
  snail: 'Snail',
  swampdeer: 'Swamp Deer',
  tiger: 'Tiger',
  turtle: 'Turtle',
  zibra: 'Zebra',
};

const animalFileNames = [
  'bat.jpg',
  'bear.jpg',
  'butterfly.jpg',
  'camel.webp',
  'cat.jpg',
  'chimpangy.jpg',
  'cow.jpg',
  'deer.jpg',
  'dog.jpg',
  'duck.jpg',
  'elephant.jpg',
  'fish.jpg',
  'Flamingos.jpg',
  'horse.jpg',
  'Kangaroo.jpg',
  'lemur.jpg',
  'lion.jpg',
  'monkey.jpg',
  'owl.jpg',
  'panda.jpg',
  'peacock.jpg',
  'penguin.jpg',
  'puffin.jpg',
  'rabbit.jpg',
  'raccoon.jpg',
  'redfox.jpg',
  'redpanda.jpg',
  'sealion.jpg',
  'sheap.jpg',
  'snail.jpg',
  'Swampdeer.jpg',
  'tiger.jpg',
  'turtle.jpg',
  'zibra.jpg',
] as const;

const toAnimalName = (fileName: string) => {
  const stem = fileName.replace(/\.[^.]+$/, '').trim().toLowerCase();
  return animalNameCorrections[stem] ?? stem.replace(/([a-z])([A-Z])/g, '$1 $2');
};

export const childAnimalData: ChildAnimalItem[] = animalFileNames.map((fileName) => {
  const name = toAnimalName(fileName);

  return {
    symbol: name.charAt(0).toUpperCase(),
    speaking: name,
    displayText: name.toUpperCase(),
    hindi: '',
    punjabi: '',
    img: fileName,
  };
});

export const generateTableQuestions = (): TableQuestion[] =>
  Array.from({ length: 9 }, (_, tableOffset) => {
    const table = tableOffset + 2;

    return Array.from({ length: 10 }, (_, multiplierOffset) => {
      const multiplier = multiplierOffset + 1;
      const answer = table * multiplier;

      return {
        id: `${table}-${multiplier}`,
        table,
        multiplier,
        answer,
        displayQuestion: `${table} x ${multiplier}`,
        speechText: `${table} into ${multiplier} equals ${answer}`,
      };
    });
  }).flat();
