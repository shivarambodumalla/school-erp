---
description: Complete tech stack requirements for the School ERP project. Must be referenced before installing any package or choosing any tool.
---

# School ERP — Tech Stack Requirements

## Frontend
| Tool | Version | Purpose |
|---|---|---|
| Next.js | 14 App Router | React framework with routing, SSR, API routes |
| TypeScript | 5.x strict | Mandatory for financial ERP |
| Tailwind CSS | v3 | Utility CSS, mobile-first |
| shadcn/ui | Latest | Owned component library, themeable per portal/school |
| Framer Motion | v11 | Animations, page transitions, native PWA feel |
| Recharts | v2 | Dashboard charts — bar, line, donut, area |
| React Email | Latest | Email templates as React components |
| react-swipeable | Latest | Swipe gestures for native-like navigation |

## API Layer
| Tool | Version | Purpose |
|---|---|---|
| tRPC | v11 | Type-safe API, shared via packages/api-client |
| Zod | v3 | Runtime schema validation, pairs with tRPC |

## Auth
| Tool | Version | Purpose |
|---|---|---|
| NextAuth | v5 beta | Sessions, JWT, credentials, OAuth, 2FA. Role + institutionId in JWT |

## Database
| Tool | Version | Purpose |
|---|---|---|
| PostgreSQL | v15 | Relational DB, ACID transactions for fee payments |
| AWS RDS | db.t4g.medium | Managed PostgreSQL, Mumbai region (DPDP compliance) |
| Prisma | v5 | ORM, type-safe queries, migrations |
| pgvector | Extension | Vector storage for RAG bot, no extra DB |

## Storage & Media
| Tool | Purpose |
|---|---|
| AWS S3 | File storage — photos, PDFs, ID cards, receipts |
| AWS CloudFront | CDN with India edge, docs site hosting |
| Cloudflare Stream | Video hosting, auto-transcode, HLS streaming |

## Real-Time & Background
| Tool | Purpose |
|---|---|
| Pusher | Managed WebSockets — GPS bus map, real-time events |
| BullMQ | Job queue — payroll, bulk notifications, AI scoring |
| Redis (ElastiCache) | BullMQ backend, session cache, rate limits |

## Payments & Communication
| Tool | Purpose |
|---|---|
| Razorpay | Indian payment gateway — UPI, cards, netbanking, EMI |
| Resend | Transactional email (3,000/day free) |
| Fast2SMS | Indian SMS — attendance alerts, OTPs |
| WATI | WhatsApp Business API (Phase 4+) |

## AI / LLM
| Tool | Purpose |
|---|---|
| Claude API (claude-sonnet-4-5) | Lesson plans, quiz gen, report remarks, help bot |

## AI / ML Service (Python — Phase 10)
| Tool | Purpose |
|---|---|
| Python FastAPI | ML service framework |
| scikit-learn + pandas | Risk scoring models |
| Pydantic | Input validation, Swagger docs |

## Infrastructure
| Tool | Purpose |
|---|---|
| AWS IoT Core | Managed MQTT for GPS pings from bus devices |
| AWS EC2 (t4g.small) | Runs Next.js + BullMQ workers |
| GitHub Actions | CI/CD — lint, build, deploy |
| AWS Secrets Manager | Secure secret storage (DPDP compliance) |
| Turborepo | Monorepo task runner, parallel builds |

## Monitoring, Docs, Mobile
| Tool | Purpose |
|---|---|
| Sentry | Error tracking |
| AWS CloudWatch | Infra monitoring, auto-alarms |
| Starlight (Astro) | Docs site — Pagefind search, MDX |
| next-pwa + manifest.json | PWA — Android install, iOS 16.4+ push |
| Capacitor (Phase 6+) | Native iOS/Android shell for app stores |
| pnpm Workspaces + Turborepo | Monorepo tooling, shared packages |
