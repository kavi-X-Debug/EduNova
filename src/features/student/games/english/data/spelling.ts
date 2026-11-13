// Spelling Bee word bank: every word has a short English clue (read aloud when the device has an English voice).
export interface SpellingWord {
  word: string;
  clue: string;
}

/** Level 1: 3-4 letters. */
export const WORDS_1: SpellingWord[] = [
  { word: 'cat', clue: 'A small pet that says meow.' },
  { word: 'sun', clue: 'It shines in the sky in the day.' },
  { word: 'hat', clue: 'You wear it on your head.' },
  { word: 'bag', clue: 'You carry your books in it.' },
  { word: 'pen', clue: 'You write with it.' },
  { word: 'dog', clue: 'A pet that says woof.' },
  { word: 'fish', clue: 'It lives in water and swims.' },
  { word: 'bird', clue: 'It has wings and can fly.' },
  { word: 'rain', clue: 'Water that falls from the clouds.' },
  { word: 'tree', clue: 'It is tall and has leaves.' },
  { word: 'milk', clue: 'A white drink from a cow.' },
  { word: 'cake', clue: 'A sweet food for a birthday.' },
  { word: 'book', clue: 'You read it.' },
  { word: 'door', clue: 'You open it to go in.' },
];
/** Level 2: 5-6 letters. */
export const WORDS_2: SpellingWord[] = [
  { word: 'apple', clue: 'A round red or green fruit.' },
  { word: 'chair', clue: 'You sit on it.' },
  { word: 'table', clue: 'You put your plate on it.' },
  { word: 'school', clue: 'A place where children learn.' },
  { word: 'window', clue: 'You look through it. It is made of glass.' },
  { word: 'garden', clue: 'A place where flowers and plants grow.' },
  { word: 'pencil', clue: 'You write and draw with it. You can rub it out.' },
  { word: 'flower', clue: 'A pretty plant part, often red or yellow.' },
  { word: 'mother', clue: 'Your mum.' },
  { word: 'yellow', clue: 'The colour of a banana.' },
  { word: 'rabbit', clue: 'A small animal with long ears.' },
  { word: 'banana', clue: 'A long yellow fruit.' },
  { word: 'monkey', clue: 'An animal that climbs trees and loves bananas.' },
  { word: 'friend', clue: 'A person you like to play with.' },
];
/** Level 3: 7-9 letters, typed. */
export const WORDS_3: SpellingWord[] = [
  { word: 'elephant', clue: 'The biggest animal on land. It has a long trunk.' },
  { word: 'teacher', clue: 'A person who helps you learn at school.' },
  { word: 'library', clue: 'A place where you can borrow books.' },
  { word: 'morning', clue: 'The first part of the day.' },
  { word: 'holiday', clue: 'A time when there is no school.' },
  { word: 'kitchen', clue: 'The room where food is cooked.' },
  { word: 'football', clue: 'A game with a round ball and two goals.' },
  { word: 'umbrella', clue: 'You hold it over your head when it rains.' },
  { word: 'mountain', clue: 'A very high hill.' },
  { word: 'birthday', clue: 'The day each year when you were born.' },
  { word: 'breakfast', clue: 'The first meal of the day.' },
  { word: 'vegetable', clue: 'Carrots and beans are this kind of food.' },
  { word: 'bicycle', clue: 'It has two wheels and pedals.' },
  { word: 'neighbour', clue: 'A person who lives next door.' },
];
