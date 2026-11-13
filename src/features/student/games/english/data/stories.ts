// Story Sequence bank: each story lists its steps in the right order (original text).
export interface Story {
  id: string;
  steps: string[];
}
export const STORIES_1: Story[] = [
  { id: 'seed', steps: ['Dig a small hole.', 'Put the seed in the hole.', 'Water the seed every day.'] },
  { id: 'teeth', steps: ['Put toothpaste on the brush.', 'Brush your teeth for two minutes.', 'Rinse your mouth with water.'] },
  { id: 'tea', steps: ['Boil some water.', 'Pour the water on the tea leaves.', 'Add a little milk.'] },
  { id: 'bread', steps: ['Take two slices of bread.', 'Spread butter on the bread.', 'Put the slices together.'] },
];
export const STORIES_2: Story[] = [
  { id: 'kite', steps: ['Kamal made a kite with paper and sticks.', 'The wind carried it high into the sky.', 'The string snapped and the kite flew away.', 'The next day Kamal found it in a tree.'] },
  { id: 'mango', steps: ['A boy ate a sweet mango.', 'He kept the seed.', 'He planted it in the garden.', 'Years later, a tall tree grew there.'] },
  { id: 'lemonade', steps: ['Squeeze the lemons into a jug.', 'Add water and sugar.', 'Stir it well.', 'Pour it into glasses.'] },
  { id: 'rain', steps: ['Rani looked out of the window.', 'It began to rain, so she took her umbrella.', 'She walked to school in the rain.', 'At school she shook the water off her umbrella.'] },
];
export const STORIES_3: Story[] = [
  { id: 'schoolday', steps: ['Nimal woke up at six o’clock.', 'He ate breakfast with his family.', 'He walked to school with his friends.', 'In class he read a story to the teacher.', 'After school he played cricket.'] },
  { id: 'zoo', steps: ['We bought tickets at the gate.', 'First we saw the elephants.', 'Then we watched the monkeys play.', 'We had lunch under a big tree.', 'At last we waved goodbye and went home.'] },
  { id: 'cake', steps: ['Mix flour, sugar and eggs in a bowl.', 'Pour the mixture into a tin.', 'Bake it in the oven for an hour.', 'Let the cake cool.', 'Put icing on top.'] },
  { id: 'puppy', steps: ['Saman heard a small noise outside.', 'He found a puppy under the bench.', 'He gave the puppy some water.', 'His mother let him keep it.', 'Now the puppy sleeps by his bed.'] },
];
