import { FeatureModule } from '@/types/buildtime';

export const FEATURE_CATALOG: FeatureModule[] = [
  {
    id: 'auth',
    name: 'Authentication',
    category: 'Core',
    baseHours: 24,
    description: 'User sign-up, sign-in, OAuth (Google/GitHub), and password recovery.'
  },
  {
    id: 'roles',
    name: 'User Roles & Permissions',
    category: 'Core',
    baseHours: 16,
    description: 'RBAC (Role-Based Access Control) for admins, members, and custom roles.'
  },
  {
    id: 'profile',
    name: 'Profile Management',
    category: 'Core',
    baseHours: 12,
    description: 'User profile settings, avatar upload, and account deletion.'
  },
  {
    id: 'dashboard',
    name: 'Dashboard',
    category: 'UI/UX',
    baseHours: 32,
    description: 'A landing dashboard page showing key statistics and aggregated data widgets.'
  },
  {
    id: 'crud',
    name: 'CRUD Modules',
    category: 'Database',
    baseHours: 20,
    description: 'Standard Create, Read, Update, Delete modules for entities.'
  },
  {
    id: 'search',
    name: 'Search & Filters',
    category: 'UI/UX',
    baseHours: 16,
    description: 'Fuzzy text search, pagination, and multi-parameter filtering.'
  },
  {
    id: 'notifications',
    name: 'Notifications',
    category: 'Utility',
    baseHours: 24,
    description: 'In-app notification center plus transactional emails or SMS alerts.'
  },
  {
    id: 'payments',
    name: 'Payments & Subscriptions',
    category: 'Business',
    baseHours: 40,
    description: 'Stripe subscription plans, checkout flow, invoices, and billing portal.'
  },
  {
    id: 'upload',
    name: 'File Upload',
    category: 'Storage',
    baseHours: 16,
    description: 'Direct uploads to S3/Cloud Storage, file validation, and asset delivery.'
  },
  {
    id: 'ocr',
    name: 'OCR & Document Processing',
    category: 'Advanced/AI',
    baseHours: 48,
    description: 'Scanning documents, PDFs, extracting text, and parsing structured fields.'
  },
  {
    id: 'ai_analysis',
    name: 'AI Analysis & Insights',
    category: 'Advanced/AI',
    baseHours: 40,
    description: 'LLM integration, context window mapping, custom prompt engineering, and report outputs.'
  },
  {
    id: 'reports',
    name: 'Reports & Export',
    category: 'Utility',
    baseHours: 20,
    description: 'PDF generation, CSV/Excel export, and customized print tables.'
  },
  {
    id: 'chat',
    name: 'Real-time Chat',
    category: 'Advanced/AI',
    baseHours: 48,
    description: 'WebSocket channels, online status, message history, and push notifications.'
  },
  {
    id: 'calendar',
    name: 'Calendar & Booking',
    category: 'Core',
    baseHours: 32,
    description: 'Time-slot availability management, booking wizard, and calendar sync.'
  },
  {
    id: 'analytics',
    name: 'Internal Analytics',
    category: 'Utility',
    baseHours: 24,
    description: 'Tracking user events, views, conversion funnels, and retention charts.'
  },
  {
    id: 'multilingual',
    name: 'Multi-language Support',
    category: 'Utility',
    baseHours: 24,
    description: 'i18n translation framework, locale selectors, and language-specific SEO routing.'
  },
  {
    id: 'integrations',
    name: 'Third-party Integrations',
    category: 'Core',
    baseHours: 28,
    description: 'API connections to external systems, webhooks, and background jobs.'
  },
  {
    id: 'admin_panel',
    name: 'Admin Panel',
    category: 'UI/UX',
    baseHours: 36,
    description: 'Internal dashboards to manage users, configurations, and review system logs.'
  },
  {
    id: 'api_access',
    name: 'API Access',
    category: 'Business',
    baseHours: 28,
    description: 'Generating developer API keys, rate-limiting, and documentation routes.'
  }
];

// Multipliers for final estimation
export const PLATFORM_MULTIPLIERS = {
  web: 1.0,
  ios: 1.2,
  android: 1.2,
  adminDashboard: 0.15, // added to base if checked
  landingPage: 0.1,    // added to base if checked
};

export const SPEED_QUALITY_MULTIPLIERS = {
  speed: 0.85, // faster but potentially lower quality/tech debt
  balanced: 1.0,
  quality: 1.25, // highly polished, testing, security audits
};

export const REQUIREMENT_CLARITY_MULTIPLIERS = {
  clear: 0.9,
  vague: 1.3,
  evolving: 1.15,
};
export const WORKFLOW_NOT_FINALIZED_MULTIPLIER = 1.15;
export const COMPLIANCE_NEED_MULTIPLIER = 1.20;
export const DATA_MIGRATION_MULTIPLIER = 1.15;

export const TEAM_TYPE_MULTIPLIERS = {
  solo: 1.3,      // solo development takes longer total hours due to context switching
  freelancer: 1.1,
  startup: 1.0,   // collaborative but agile team
  agency: 0.9,    // structured team, predefined pipelines
};
