import {Experience} from './experience.model';
import {SkillGroup} from './skill-group.model';
import {Link} from './link.model';
import {Project} from "./project.model";

export class Information {
  name: string;
  links: Link[];
  experience: Experience[];
  education: Experience[];
  skillGroups: SkillGroup[];
  interests: string[];
  projects: Project[];
}
