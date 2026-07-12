import { asyncHandler } from '../middleware/asyncHandler';
import { AuthService } from '../services/AuthService';

export class AuthController {
  constructor(private readonly authService: AuthService) {}

  register = asyncHandler(async (req, res) => {
    const { name, email, password } = req.body;
    res.status(201).json(await this.authService.register(name, email, password));
  });

  login = asyncHandler(async (req, res) => {
    const { email, password } = req.body;
    res.json(await this.authService.login(email, password));
  });

  google = asyncHandler(async (req, res) => {
    const { credential } = req.body;
    res.json(await this.authService.googleLogin(credential));
  });
}
