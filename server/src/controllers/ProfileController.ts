import type { Request, Response } from 'express';
import type { ProfileService } from '../services/ProfileService.js';

/** Endpoints del bloque personal del portafolio. */
export class ProfileController {
  constructor(private readonly profile: ProfileService) {}

  get = async (_req: Request, res: Response): Promise<void> => {
    res.json({ data: await this.profile.getProfile() });
  };

  timeline = async (_req: Request, res: Response): Promise<void> => {
    res.json({ data: await this.profile.getTimeline() });
  };

  skills = async (_req: Request, res: Response): Promise<void> => {
    res.json({ data: await this.profile.getSkills() });
  };
}
