import {Experience} from './experience.model';
import {SkillGroup} from './skill-group.model';
import {Link} from './link.model';

export class Information {
  name: string;
  links: Link[];
  experience: Experience[];
  education: Experience[];
  skillGroups: SkillGroup[];
  interests: string[];
}
