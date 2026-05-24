import { Faker, en } from '@faker-js/faker';

function test(seed: number) {
  const f = new Faker({ locale: [en] });
  f.seed(seed);
  console.log(`Seed ${seed}: ${f.string.uuid()}`);
  console.log(`Seed ${seed}: ${f.string.uuid()}`);
}

test(42);
test(42);
