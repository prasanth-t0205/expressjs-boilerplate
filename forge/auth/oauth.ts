import { AppError } from '@forge/errors';

export interface OAuthProfile {
  provider: 'google' | 'github';
  id: string;
  email: string;
  name: string;
  avatarUrl?: string;
}

export class OAuthService {
  /**
   * GOOGLE OAUTH
   */
  static getGoogleAuthUrl(clientId: string, redirectUri: string): string {
    const rootUrl = 'https://accounts.google.com/o/oauth2/v2/auth';
    const options = new URLSearchParams({
      redirect_uri: redirectUri,
      client_id: clientId,
      access_type: 'offline',
      response_type: 'code',
      prompt: 'consent',
      scope: [
        'https://www.googleapis.com/auth/userinfo.profile',
        'https://www.googleapis.com/auth/userinfo.email',
      ].join(' '),
    });

    return `${rootUrl}?${options.toString()}`;
  }

  static async exchangeGoogleCode(
    code: string,
    clientId: string,
    clientSecret: string,
    redirectUri: string,
  ): Promise<OAuthProfile> {
    const url = 'https://oauth2.googleapis.com/token';
    const values = {
      code,
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: redirectUri,
      grant_type: 'authorization_code',
    };

    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams(values).toString(),
    });

    if (!res.ok) {
      throw new AppError('Failed to fetch Google OAuth Tokens', 401);
    }

    const tokens = await res.json();

    // Fetch user profile
    const profileRes = await fetch(
      `https://www.googleapis.com/oauth2/v1/userinfo?alt=json&access_token=${tokens.access_token}`,
      { headers: { Authorization: `Bearer ${tokens.id_token}` } },
    );

    if (!profileRes.ok) {
      throw new AppError('Failed to fetch Google User Profile', 401);
    }

    const profile = await profileRes.json();

    return {
      provider: 'google',
      id: profile.id,
      email: profile.email,
      name: profile.name,
      avatarUrl: profile.picture,
    };
  }

  /**
   * GITHUB OAUTH
   */
  static getGitHubAuthUrl(clientId: string, redirectUri: string): string {
    const rootUrl = 'https://github.com/login/oauth/authorize';
    const options = new URLSearchParams({
      client_id: clientId,
      redirect_uri: redirectUri,
      scope: 'user:email',
    });

    return `${rootUrl}?${options.toString()}`;
  }

  static async exchangeGitHubCode(
    code: string,
    clientId: string,
    clientSecret: string,
    redirectUri: string,
  ): Promise<OAuthProfile> {
    const url = 'https://github.com/login/oauth/access_token';
    const values = {
      client_id: clientId,
      client_secret: clientSecret,
      code,
      redirect_uri: redirectUri,
    };

    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify(values),
    });

    if (!res.ok) {
      throw new AppError('Failed to fetch GitHub OAuth Tokens', 401);
    }

    const tokens = await res.json();
    if (tokens.error) {
      throw new AppError(`GitHub OAuth Error: ${tokens.error_description}`, 401);
    }

    // Fetch user profile
    const profileRes = await fetch('https://api.github.com/user', {
      headers: { Authorization: `Bearer ${tokens.access_token}` },
    });

    if (!profileRes.ok) {
      throw new AppError('Failed to fetch GitHub User Profile', 401);
    }

    const profile = await profileRes.json();

    // GitHub might not return public email in profile, fetch emails separately
    let email = profile.email;
    if (!email) {
      const emailRes = await fetch('https://api.github.com/user/emails', {
        headers: { Authorization: `Bearer ${tokens.access_token}` },
      });
      if (emailRes.ok) {
        const emails = await emailRes.json();
        const primaryEmail = emails.find((e: any) => e.primary && e.verified);
        if (primaryEmail) email = primaryEmail.email;
      }
    }

    if (!email) {
      throw new AppError('GitHub account must have a verified primary email', 400);
    }

    return {
      provider: 'github',
      id: profile.id.toString(),
      email,
      name: profile.name || profile.login,
      avatarUrl: profile.avatar_url,
    };
  }
}
