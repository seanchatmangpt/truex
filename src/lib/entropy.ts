import { Faker, en } from '@faker-js/faker';
import type { GraphDelta, Quad } from '../packages/truex-core/src/runtime-law.js';

export interface Member {
  id: string;
  name: string;
  email: string;
  joinDate: string;
  status: 'active' | 'inactive';
}

export interface Volunteer {
  id: string;
  memberId: string;
  role: string;
  availability: string[];
}

export interface Room {
  id: string;
  name: string;
  capacity: number;
}

export interface Event {
  id: string;
  name: string;
  date: string;
  roomId: string;
  organizerId: string;
}

export class EntropyGenerator {
  private fakerInstance: Faker;

  constructor(seed: number) {
    this.fakerInstance = new Faker({ locale: [en] });
    this.fakerInstance.seed(seed);
  }

  generateMember(): Member {
    const refDate = new Date(0);
    return {
      id: `member:${this.fakerInstance.string.uuid()}`,
      name: this.fakerInstance.person.fullName(),
      email: this.fakerInstance.internet.email(),
      joinDate: this.fakerInstance.date.past({ refDate }).toISOString(),
      status: this.fakerInstance.helpers.arrayElement(['active', 'inactive']),
    };
  }

  generateVolunteer(memberId: string): Volunteer {
    return {
      id: `volunteer:${this.fakerInstance.string.uuid()}`,
      memberId,
      role: this.fakerInstance.person.jobTitle(),
      availability: this.fakerInstance.helpers.arrayElements(['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'], { min: 1, max: 3 }),
    };
  }

  generateRoom(): Room {
    return {
      id: `room:${this.fakerInstance.string.uuid()}`,
      name: `Room ${this.fakerInstance.location.buildingNumber()}`,
      capacity: this.fakerInstance.number.int({ min: 10, max: 100 }),
    };
  }

  generateEvent(roomId: string, organizerId: string): Event {
    const refDate = new Date(0);
    return {
      id: `event:${this.fakerInstance.string.uuid()}`,
      name: this.fakerInstance.company.catchPhrase(),
      date: this.fakerInstance.date.future({ refDate }).toISOString(),
      roomId,
      organizerId,
    };
  }

  objectToGraphDelta(type: string, obj: any): GraphDelta {
    const adds: Quad[] = [];
    const subject = obj.id;

    adds.push({ subject, predicate: 'rdf:type', object: `church:${type}` });

    for (const [key, value] of Object.entries(obj)) {
      if (key === 'id') continue;
      if (Array.isArray(value)) {
        for (const item of value) {
          adds.push({ subject, predicate: `church:${key}`, object: String(item) });
        }
      } else {
        adds.push({ subject, predicate: `church:${key}`, object: String(value) });
      }
    }

    return {
      id: `delta:${this.fakerInstance.string.uuid()}`,
      adds,
      deletes: [],
    };
  }
}
