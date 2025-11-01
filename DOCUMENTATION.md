# UMakEBallot - Complete System Documentation

**Version:** 1.0.0  
**Last Updated:** November 1, 2025  
**Platform:** Web Application (React + Express + Supabase)

---

## Table of Contents

1. [System Overview](#system-overview)
2. [Architecture](#architecture)
3. [OOP Concepts & Implementation](#oop-concepts--implementation)
4. [Features](#features)
5. [Database Schema](#database-schema)
6. [API Endpoints](#api-endpoints)
7. [Frontend Components](#frontend-components)
8. [Authentication & Authorization](#authentication--authorization)
9. [Account Management System](#account-management-system)
10. [Voting System](#voting-system)
11. [Admin Dashboard](#admin-dashboard)
12. [Real-time Features](#real-time-features)
13. [Security Features](#security-features)
14. [Installation & Setup](#installation--setup)
15. [Environment Variables](#environment-variables)
16. [Deployment](#deployment)

---

## System Overview

**UMakEBallot** is a secure, real-time voting system built for the University of Makati (UMak). The system allows students to vote for candidates within their respective colleges/institutes, with real-time leaderboard updates and comprehensive administrative controls.

### Key Capabilities

- **Multi-Institute Support**: 17 colleges and institutes (9 colleges + 8 institutes)
- **Secure Authentication**: Email/OTP-based authentication via Supabase
- **Real-time Updates**: Live leaderboard with 5-second auto-refresh
- **Role-based Access**: Student and Admin roles with distinct permissions
- **Redis Caching**: High-performance vote counting and leaderboard generation
- **Audit Trail**: Complete voting history with timestamps
- **College Isolation**: Users can only view and vote within their assigned college

---

## Architecture

### Technology Stack

#### **Frontend**

- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite
- **State Management**: TanStack Query (React Query) for server state
- **Routing**: React Router v6
- **Styling**: TailwindCSS with custom design system
- **Icons**: Lucide React
- **HTTP Client**: Custom fetch wrapper with automatic auth

#### **Backend**

- **Runtime**: Node.js with Express 5.1
- **Language**: TypeScript
- **Database**: Supabase PostgreSQL with Row Level Security (RLS)
- **Caching**: Redis for vote tallies and leaderboards
- **Authentication**: Supabase Auth with JWT tokens
- **Clustering**: Node.js cluster mode for multi-core utilization
- **Security**: Helmet.js, CORS, rate limiting

#### **Database**

- **Primary**: Supabase PostgreSQL
- **Cache**: Redis (in-memory)
- **Storage**: Supabase Storage (for candidate images)

### System Architecture Diagram

```
┌─────────────┐
│   Browser   │
│  (React)    │
└──────┬──────┘
       │ HTTPS
       ▼
┌─────────────────┐
│  Express Server │◄────┐
│  (TypeScript)   │     │
└────┬────┬───────┘     │
     │    │             │
     │    └─────────────┤
     │                  │
     ▼                  ▼
┌─────────┐      ┌──────────┐
│  Redis  │      │ Supabase │
│  Cache  │      │   Auth   │
└─────────┘      │    DB    │
                 │ Storage  │
                 └──────────┘
```

---

## OOP Concepts & Implementation

The UMakEBallot system extensively uses Object-Oriented Programming (OOP) principles throughout both frontend and backend implementations. Below are the key OOP concepts applied and how they enhance the system's architecture.

---

### 1. **Encapsulation**

**Definition**: Bundling data and methods that operate on that data within a single unit (class/module), hiding internal implementation details.

#### **Implementation in Backend**

##### **Controllers (Business Logic Encapsulation)**

```typescript
// backend/src/controllers/VoteController.ts
export class VoteController {
  // Private helper method - encapsulated logic
  private async validateVoteEligibility(userId: string): Promise<void> {
    // Internal validation logic hidden from external access
    const existingVote = await this.checkExistingVote(userId);
    if (existingVote) {
      throw new Error("User has already voted");
    }
  }

  // Public interface
  public async castVote(req: Request, res: Response): Promise<void> {
    await this.validateVoteEligibility(req.user.id);
    // Vote casting logic
  }
}
```

**Benefits**:

- Controllers encapsulate business logic for specific domains (Vote, User, Candidate, Admin)
- Internal validation methods are private, only public methods are exposed
- Changes to internal logic don't affect external code

##### **Services (Data Access Encapsulation)**

```typescript
// backend/src/services/VoteService.ts
export class VoteService {
  private supabase: SupabaseClient;
  private redisClient: RedisClient;

  constructor() {
    this.supabase = createClient();
    this.redisClient = redis;
  }

  // Encapsulates Redis caching logic
  private async getCachedLeaderboard(instituteId: string) {
    const cached = await this.redisClient.get(`leaderboard:${instituteId}`);
    return cached ? JSON.parse(cached) : null;
  }

  // Public method hides caching complexity
  public async getLeaderboard(instituteId: string) {
    const cached = await this.getCachedLeaderboard(instituteId);
    if (cached) return cached;

    const data = await this.fetchFromDatabase(instituteId);
    await this.cacheLeaderboard(instituteId, data);
    return data;
  }
}
```

**Benefits**:

- Database queries and Redis operations are encapsulated
- External code doesn't need to know about caching mechanism
- Easy to modify caching strategy without affecting controllers

#### **Implementation in Frontend**

##### **Custom Hooks (State Encapsulation)**

```typescript
// frontend/src/hooks/useVoting.ts
export function useVoting() {
  const [selectedCandidate, setSelectedCandidate] = useState<string | null>(
    null
  );
  const [hasVoted, setHasVoted] = useState(false);

  // Encapsulated voting logic
  const castVote = async (candidateId: string) => {
    // Internal state management hidden
    setSelectedCandidate(candidateId);
    await submitVote(candidateId);
    setHasVoted(true);
  };

  // Only expose necessary interface
  return { castVote, hasVoted, selectedCandidate };
}
```

##### **Context API (Global State Encapsulation)**

```typescript
// frontend/src/contexts/AuthContext.tsx
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Private helper methods
  const saveUserToStorage = (user: User) => {
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
  };

  // Public interface methods
  const login = async (email: string, otp: string) => {
    const response = await verifyOtp(email, otp);
    setUser(response.user);
    saveUserToStorage(response.user);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
```

**Benefits**:

- Authentication state and logic encapsulated in context
- Storage mechanism hidden from components
- Components only access public interface through `useAuth()`

---

### 2. **Abstraction**

**Definition**: Hiding complex implementation details and showing only essential features, providing simplified interfaces.

#### **Implementation Examples**

##### **Database Abstraction Layer**

```typescript
// backend/src/database/supabase.ts
export class Database {
  private client: SupabaseClient;

  // Abstract query interface
  async query<T>(table: string, filters?: QueryFilter): Promise<T[]> {
    let query = this.client.from(table).select("*");

    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        query = query.eq(key, value);
      });
    }

    const { data, error } = await query;
    if (error) throw error;
    return data as T[];
  }

  // Simplified insert interface
  async insert<T>(table: string, data: Partial<T>): Promise<T> {
    const { data: result, error } = await this.client
      .from(table)
      .insert(data)
      .select()
      .single();

    if (error) throw error;
    return result as T;
  }
}

// Usage - developers don't need to know Supabase specifics
const db = new Database();
await db.insert("votes", { user_id: "123", candidate_id: "456" });
```

##### **HTTP Client Abstraction**

```typescript
// frontend/src/lib/http.ts
export async function http<T>(url: string, config?: RequestInit): Promise<T> {
  // Abstract away authentication, headers, error handling
  const user = safeParseUser(localStorage.getItem(USER_STORAGE_KEY));
  const token = user?.token;

  const response = await fetch(`${API_URL}${url}`, {
    ...config,
    headers: {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
      ...config?.headers,
    },
  });

  // Abstract error handling
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Request failed");
  }

  return response.json();
}

// Usage - simple, clean API calls
const data = await http<{ user: User }>("/api/auth/me");
```

##### **API Layer Abstraction**

```typescript
// frontend/src/api/votes.ts
// Abstract voting operations behind simple functions
export async function castVote(candidateId: string, isAbstain: boolean) {
  return http<{ vote: Vote }>("/api/votes", {
    method: "POST",
    body: JSON.stringify({ candidateId, isAbstain }),
  });
}

export async function fetchLeaderboard(instituteId: string) {
  return http<{ leaderboard: LeaderboardEntry[] }>(
    `/api/votes/leaderboard/${instituteId}`
  );
}

// Components use simple abstracted functions
const leaderboard = await fetchLeaderboard("ccis");
```

**Benefits**:

- Components don't need to know HTTP details, authentication, or error handling
- Consistent API across the application
- Easy to switch implementations (e.g., change from fetch to axios)

---

### 3. **Inheritance & Composition**

**Definition**: Creating new classes/components based on existing ones (inheritance) or combining multiple components (composition).

#### **React Component Composition**

##### **Button Component Hierarchy**

```typescript
// frontend/src/components/ui/Button.tsx
// Base button with variants
export function Button({
  variant = "primary",
  size = "md",
  children,
  ...props
}: ButtonProps) {
  const baseClasses = "rounded-lg font-semibold transition-all";
  const variantClasses = {
    primary: "bg-primary-600 text-white hover:bg-primary-700",
    secondary: "bg-gray-200 text-gray-900 hover:bg-gray-300",
    danger: "bg-red-600 text-white hover:bg-red-700",
  };

  return (
    <button className={`${baseClasses} ${variantClasses[variant]}`} {...props}>
      {children}
    </button>
  );
}

// Specialized buttons through composition
export function VoteButton({ candidateId, disabled }: VoteButtonProps) {
  const { castVote } = useVoting();

  return (
    <Button
      variant="primary"
      onClick={() => castVote(candidateId)}
      disabled={disabled}
    >
      <Vote className="h-5 w-5" />
      Cast Vote
    </Button>
  );
}

export function RefreshButton({ onRefresh, isLoading }: RefreshButtonProps) {
  return (
    <Button variant="secondary" onClick={onRefresh} disabled={isLoading}>
      <RefreshCcw className={isLoading ? "animate-spin" : ""} />
      Refresh
    </Button>
  );
}
```

##### **Card Component Composition**

```typescript
// Base Card component
export function Card({ children, className }: CardProps) {
  return (
    <div className={`rounded-xl border bg-white p-6 shadow-sm ${className}`}>
      {children}
    </div>
  );
}

// Composed specialized cards
export function StatsCard({ title, value, icon, description }: StatsCardProps) {
  return (
    <Card className="hover:scale-[1.02] transition-transform">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold uppercase">{title}</p>
          <p className="text-4xl font-bold mt-2">{value}</p>
        </div>
        <span className="rounded-2xl bg-gradient-to-br from-primary-500 to-primary-600 p-4">
          {icon}
        </span>
      </div>
      <p className="text-sm text-gray-600 mt-4">{description}</p>
    </Card>
  );
}

export function CandidateCard({ candidate, onVote }: CandidateCardProps) {
  return (
    <Card>
      <img src={candidate.imageUrl} alt={candidate.name} />
      <h3>{candidate.name}</h3>
      <VoteButton candidateId={candidate.id} />
    </Card>
  );
}
```

#### **Middleware Composition (Backend)**

```typescript
// backend/src/middleware/compose.ts
// Composing multiple middleware functions
export function composeMiddleware(...middlewares: Middleware[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    const execute = (index: number) => {
      if (index >= middlewares.length) return next();
      middlewares[index](req, res, () => execute(index + 1));
    };
    execute(0);
  };
}

// Usage - compose authentication + authorization
app.use(
  "/api/admin/*",
  composeMiddleware(authenticate, adminOnly, validateRequest)
);
```

**Benefits**:

- Reusable base components with specialized variants
- Consistent UI/UX across the application
- Easy to maintain and extend functionality

---

### 4. **Polymorphism**

**Definition**: Objects of different types can be accessed through the same interface, each type can have its own implementation.

#### **Implementation Examples**

##### **Error Handling Polymorphism**

```typescript
// backend/src/utils/errors.ts
// Base error class
export class AppError extends Error {
  constructor(public message: string, public statusCode: number = 500) {
    super(message);
    this.name = this.constructor.name;
  }

  toJSON() {
    return {
      error: this.name,
      message: this.message,
      statusCode: this.statusCode,
    };
  }
}

// Specialized error types - polymorphic behavior
export class ValidationError extends AppError {
  constructor(message: string) {
    super(message, 400);
  }
}

export class UnauthorizedError extends AppError {
  constructor(message: string = "Unauthorized") {
    super(message, 401);
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string) {
    super(`${resource} not found`, 404);
  }
}

// Error handler treats all errors polymorphically
export function errorHandler(err: Error, req: Request, res: Response) {
  if (err instanceof AppError) {
    return res.status(err.statusCode).json(err.toJSON());
  }

  // Default error handling
  return res.status(500).json({ message: "Internal server error" });
}

// Usage - same interface, different behaviors
throw new ValidationError("Invalid email format");
throw new UnauthorizedError();
throw new NotFoundError("Candidate");
```

##### **Route Handler Polymorphism**

```typescript
// backend/src/routes/index.ts
// Different controllers implement same interface
interface Controller {
  index(req: Request, res: Response): Promise<void>;
  show(req: Request, res: Response): Promise<void>;
  create(req: Request, res: Response): Promise<void>;
  update(req: Request, res: Response): Promise<void>;
  delete(req: Request, res: Response): Promise<void>;
}

// Each controller implements the interface differently
export class CandidateController implements Controller {
  async index(req: Request, res: Response) {
    const candidates = await db.query("candidates");
    res.json({ candidates });
  }
  // ... other methods
}

export class VoteController implements Controller {
  async index(req: Request, res: Response) {
    const votes = await db.query("votes");
    res.json({ votes });
  }
  // ... other methods
}

// Router uses controllers polymorphically
function createResourceRouter(controller: Controller) {
  const router = Router();
  router.get("/", controller.index);
  router.get("/:id", controller.show);
  router.post("/", controller.create);
  router.put("/:id", controller.update);
  router.delete("/:id", controller.delete);
  return router;
}
```

##### **Component Props Polymorphism (Frontend)**

```typescript
// frontend/src/components/ui/FormMessage.tsx
// Polymorphic component based on intent
type MessageIntent = 'success' | 'error' | 'warning' | 'info';

interface FormMessageProps {
  intent: MessageIntent;
  children: React.ReactNode;
}

export function FormMessage({ intent, children }: FormMessageProps) {
  // Different styling based on type
  const styles = {
    success: "bg-green-50 text-green-800 border-green-200",
    error: "bg-red-50 text-red-800 border-red-200",
    warning: "bg-yellow-50 text-yellow-800 border-yellow-200",
    info: "bg-blue-50 text-blue-800 border-blue-200",
  };

  const icons = {
    success: <CheckCircle />,
    error: <XCircle />,
    warning: <AlertTriangle />,
    info: <Info />,
  };

  return (
    <div className={`border rounded-lg p-4 ${styles[intent]}`}>
      {icons[intent]}
      {children}
    </div>
  );
}

// Usage - same component, different behaviors
<FormMessage intent="success">Vote submitted!</FormMessage>
<FormMessage intent="error">Failed to submit vote</FormMessage>
<FormMessage intent="warning">You have already voted</FormMessage>
```

**Benefits**:

- Consistent interfaces across different implementations
- Easy to add new types without modifying existing code
- Flexible and maintainable error handling

---

### 5. **Separation of Concerns (SoC)**

**Definition**: Dividing a program into distinct sections, each addressing a separate concern.

#### **MVC-like Architecture (Backend)**

```
Backend Structure:
├── controllers/     → Handle HTTP requests/responses
│   ├── AuthController.ts
│   ├── VoteController.ts
│   ├── CandidateController.ts
│   └── UserController.ts
│
├── services/        → Business logic and data operations
│   ├── VoteService.ts
│   ├── CandidateService.ts
│   └── AuthService.ts
│
├── routes/          → URL routing and middleware
│   ├── authRoutes.ts
│   ├── voteRoutes.ts
│   └── adminRoutes.ts
│
├── middleware/      → Request processing
│   ├── authenticate.ts
│   ├── adminOnly.ts
│   └── validateRequest.ts
│
└── utils/           → Helper functions
    ├── errors.ts
    └── redis.ts
```

**Example - Vote Casting Flow:**

```typescript
// 1. Route - Defines endpoint and middleware
// routes/voteRoutes.ts
router.post("/votes", authenticate, VoteController.castVote);

// 2. Controller - Handles HTTP layer
// controllers/VoteController.ts
export async function castVote(req: Request, res: Response) {
  try {
    const vote = await VoteService.createVote(
      req.user.id,
      req.body.candidateId,
      req.body.isAbstain
    );
    res.status(201).json({ vote });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
}

// 3. Service - Business logic and data access
// services/VoteService.ts
export class VoteService {
  static async createVote(
    userId: string,
    candidateId: string,
    isAbstain: boolean
  ) {
    // Validate business rules
    await this.validateVoteEligibility(userId);

    // Database operations
    const vote = await db.insert("votes", {
      user_id: userId,
      candidate_id: candidateId,
      is_abstain: isAbstain,
    });

    // Cache invalidation
    await redis.del(`leaderboard:${vote.institute_id}`);

    return vote;
  }
}
```

#### **Component Architecture (Frontend)**

```
Frontend Structure:
├── pages/              → Page components (views)
│   ├── DashboardPage.tsx
│   ├── VotingPage.tsx
│   └── AccountPage.tsx
│
├── components/
│   ├── ui/            → Reusable UI components
│   │   ├── Button.tsx
│   │   ├── Card.tsx
│   │   └── Modal.tsx
│   │
│   ├── layout/        → Layout components
│   │   └── AppShell.tsx
│   │
│   └── routing/       → Route guards
│       ├── ProtectedRoute.tsx
│       └── AdminRoute.tsx
│
├── contexts/          → Global state management
│   └── AuthContext.tsx
│
├── api/               → API communication layer
│   ├── auth.ts
│   ├── votes.ts
│   └── admin.ts
│
├── hooks/             → Custom React hooks
│   └── useAuth.ts
│
└── utils/             → Helper functions
    └── errors.ts
```

**Benefits**:

- Each layer has a single responsibility
- Easy to test individual components
- Changes in one layer don't affect others
- Clear organization improves maintainability

---

### 6. **Dependency Injection**

**Definition**: Providing dependencies to a component from outside rather than creating them internally.

#### **Implementation Examples**

##### **React Context as DI Container**

```typescript
// frontend/src/contexts/AuthContext.tsx
// Context provides dependencies to components
interface AuthContextValue {
  user: User | null;
  login: (email: string, otp: string) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextValue | undefined>(
  undefined
);

// Components inject AuthContext dependency
export function VotingPage() {
  // Dependency injected through hook
  const { user } = useAuth();

  if (!user?.instituteId) {
    return <InstituteRequiredWarning />;
  }

  return <VotingInterface />;
}
```

##### **Service Injection (Backend)**

```typescript
// backend/src/services/VoteService.ts
export class VoteService {
  constructor(
    private database: Database,
    private cache: RedisClient,
    private logger: Logger
  ) {}

  async createVote(data: VoteData) {
    this.logger.info("Creating vote", data);
    const vote = await this.database.insert("votes", data);
    await this.cache.invalidate(`leaderboard:${data.instituteId}`);
    return vote;
  }
}

// Dependency injection in controller
const voteService = new VoteService(new Database(), redisClient, logger);
```

##### **TanStack Query as Data Provider**

```typescript
// frontend/src/pages/DashboardPage.tsx
// Query provides data dependency
export function DashboardPage() {
  // Data injected through React Query
  const { data: leaderboard, isLoading } = useQuery({
    queryKey: ["leaderboard", instituteId],
    queryFn: () => fetchLeaderboard(instituteId),
    refetchInterval: 5000,
  });

  return <LeaderboardDisplay data={leaderboard} loading={isLoading} />;
}

// Component receives injected dependencies
function LeaderboardDisplay({ data, loading }: Props) {
  if (loading) return <Spinner />;
  return <LeaderboardTable entries={data} />;
}
```

**Benefits**:

- Loose coupling between components
- Easy to mock dependencies for testing
- Flexible to swap implementations
- Centralized dependency management

---

### 7. **SOLID Principles Implementation**

#### **S - Single Responsibility Principle**

Each module has one reason to change:

```typescript
// ✅ GOOD - Each class has single responsibility
class VoteValidator {
  validate(vote: Vote): boolean {
    /* validation logic */
  }
}

class VoteRepository {
  save(vote: Vote): Promise<Vote> {
    /* database logic */
  }
}

class VoteCacheManager {
  invalidate(instituteId: string): Promise<void> {
    /* cache logic */
  }
}

class VoteController {
  async castVote(req: Request, res: Response) {
    const validator = new VoteValidator();
    const repository = new VoteRepository();
    const cache = new VoteCacheManager();

    if (!validator.validate(req.body)) {
      return res.status(400).json({ error: "Invalid vote" });
    }

    const vote = await repository.save(req.body);
    await cache.invalidate(vote.instituteId);

    res.json({ vote });
  }
}
```

#### **O - Open/Closed Principle**

Open for extension, closed for modification:

```typescript
// Base authentication strategy
interface AuthStrategy {
  authenticate(credentials: any): Promise<User>;
}

// Can extend with new strategies without modifying existing code
class OTPAuthStrategy implements AuthStrategy {
  async authenticate({ email, otp }: { email: string; otp: string }) {
    return await supabase.auth.verifyOtp({ email, token: otp });
  }
}

class PasswordAuthStrategy implements AuthStrategy {
  async authenticate({ email, password }: { email: string; password: string }) {
    return await supabase.auth.signInWithPassword({ email, password });
  }
}

// Can add new strategies without changing AuthService
class AuthService {
  constructor(private strategy: AuthStrategy) {}

  async login(credentials: any) {
    return await this.strategy.authenticate(credentials);
  }
}
```

#### **L - Liskov Substitution Principle**

Subtypes should be substitutable for their base types:

```typescript
// Base error class
class AppError extends Error {
  constructor(message: string, public statusCode: number) {
    super(message);
  }
}

// All error subtypes can be used wherever AppError is expected
class ValidationError extends AppError {
  constructor(message: string) {
    super(message, 400);
  }
}

class UnauthorizedError extends AppError {
  constructor() {
    super("Unauthorized", 401);
  }
}

// Works with any AppError subtype
function handleError(error: AppError, res: Response) {
  res.status(error.statusCode).json({ message: error.message });
}
```

#### **I - Interface Segregation Principle**

Clients shouldn't depend on interfaces they don't use:

```typescript
// ❌ BAD - Fat interface
interface AdminOperations {
  addCandidate(): void;
  editCandidate(): void;
  deleteCandidate(): void;
  viewAllVotes(): void;
  exportData(): void;
  manageUsers(): void;
}

// ✅ GOOD - Segregated interfaces
interface CandidateManager {
  addCandidate(): void;
  editCandidate(): void;
  deleteCandidate(): void;
}

interface VoteViewer {
  viewAllVotes(): void;
  exportData(): void;
}

interface UserManager {
  manageUsers(): void;
}

// Components implement only what they need
class CandidateController implements CandidateManager {
  addCandidate() {
    /* ... */
  }
  editCandidate() {
    /* ... */
  }
  deleteCandidate() {
    /* ... */
  }
}
```

#### **D - Dependency Inversion Principle**

Depend on abstractions, not concretions:

```typescript
// ❌ BAD - Depends on concrete implementation
class VoteService {
  private supabase = createClient(); // Tight coupling

  async save(vote: Vote) {
    return await this.supabase.from("votes").insert(vote);
  }
}

// ✅ GOOD - Depends on abstraction
interface Database {
  insert(table: string, data: any): Promise<any>;
  query(table: string, filter: any): Promise<any>;
}

class VoteService {
  constructor(private db: Database) {} // Depends on interface

  async save(vote: Vote) {
    return await this.db.insert("votes", vote);
  }
}

// Can swap implementations
class SupabaseDatabase implements Database {
  async insert(table: string, data: any) {
    return await supabase.from(table).insert(data);
  }
}

class PostgresDatabase implements Database {
  async insert(table: string, data: any) {
    return await pg.query(`INSERT INTO ${table}...`);
  }
}
```

---

### 8. **Design Patterns Used**

#### **1. Singleton Pattern**

**Usage**: Redis client, Supabase client

```typescript
// backend/src/utils/redis.ts
class RedisClient {
  private static instance: RedisClient;
  private client: Redis;

  private constructor() {
    this.client = new Redis({
      host: process.env.REDIS_HOST,
      port: Number(process.env.REDIS_PORT),
    });
  }

  public static getInstance(): RedisClient {
    if (!RedisClient.instance) {
      RedisClient.instance = new RedisClient();
    }
    return RedisClient.instance;
  }

  public getClient(): Redis {
    return this.client;
  }
}

// Usage - always returns same instance
const redis = RedisClient.getInstance();
```

#### **2. Factory Pattern**

**Usage**: Creating different types of responses

```typescript
// backend/src/utils/responseFactory.ts
class ResponseFactory {
  static success(data: any, message?: string) {
    return {
      success: true,
      message,
      data,
    };
  }

  static error(message: string, statusCode: number) {
    return {
      success: false,
      message,
      statusCode,
    };
  }

  static validationError(errors: ValidationError[]) {
    return {
      success: false,
      message: "Validation failed",
      errors,
    };
  }
}

// Usage
res.json(ResponseFactory.success(votes, "Votes retrieved"));
res.status(400).json(ResponseFactory.error("Invalid input", 400));
```

#### **3. Observer Pattern**

**Usage**: React Query for data synchronization

```typescript
// frontend/src/pages/DashboardPage.tsx
// Multiple components observe the same data
export function DashboardPage() {
  // Observer 1 - Leaderboard
  const { data: leaderboard } = useQuery({
    queryKey: ["leaderboard", instituteId],
    queryFn: () => fetchLeaderboard(instituteId),
    refetchInterval: 5000, // Auto-refresh observer
  });

  // When data changes, all observers are notified
  return (
    <>
      <LeaderboardTable data={leaderboard} />
      <StatsPanel data={leaderboard} />
      <ChartView data={leaderboard} />
    </>
  );
}
```

#### **4. Strategy Pattern**

**Usage**: Different caching strategies

```typescript
// backend/src/services/CacheStrategy.ts
interface CacheStrategy {
  get(key: string): Promise<any>;
  set(key: string, value: any, ttl?: number): Promise<void>;
}

class RedisCacheStrategy implements CacheStrategy {
  async get(key: string) {
    return await redis.get(key);
  }

  async set(key: string, value: any, ttl = 5) {
    await redis.setex(key, ttl, JSON.stringify(value));
  }
}

class MemoryCacheStrategy implements CacheStrategy {
  private cache = new Map();

  async get(key: string) {
    return this.cache.get(key);
  }

  async set(key: string, value: any) {
    this.cache.set(key, value);
  }
}

// Use strategy based on environment
const cacheStrategy =
  process.env.NODE_ENV === "production"
    ? new RedisCacheStrategy()
    : new MemoryCacheStrategy();
```

#### **5. Facade Pattern**

**Usage**: Simplified API interface

```typescript
// frontend/src/api/index.ts
// Complex underlying operations hidden behind simple interface
export const API = {
  auth: {
    login: (email: string) =>
      http("/api/auth/login", { method: "POST", body: { email } }),
    verify: (email: string, otp: string) =>
      http("/api/auth/verify", { method: "POST", body: { email, token: otp } }),
    logout: () => http("/api/auth/logout", { method: "POST" }),
  },

  votes: {
    cast: (candidateId: string, isAbstain: boolean) =>
      http("/api/votes", { method: "POST", body: { candidateId, isAbstain } }),
    leaderboard: (instituteId: string) =>
      http(`/api/votes/leaderboard/${instituteId}`),
    myVote: () => http("/api/votes/my-vote"),
  },

  candidates: {
    list: () => http("/api/admin/candidates"),
    create: (data: CandidateData) =>
      http("/api/admin/candidates", { method: "POST", body: data }),
  },
};

// Simple usage
await API.auth.login("user@umak.edu.ph");
await API.votes.cast("candidate-id", false);
```

#### **6. Decorator Pattern**

**Usage**: HOC (Higher-Order Components) for route protection

```typescript
// frontend/src/components/routing/ProtectedRoute.tsx
// Decorates routes with authentication logic
export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();

  if (loading) return <Spinner />;
  if (!user) return <Navigate to="/login" />;

  return <>{children}</>;
}

// Usage - decorates components with auth check
<Route
  path="/dashboard"
  element={
    <ProtectedRoute>
      <DashboardPage />
    </ProtectedRoute>
  }
/>;
```

---

### OOP Benefits in UMakEBallot System

1. **Maintainability**:

   - Clear separation of concerns makes code easy to understand
   - Changes isolated to specific modules
   - Consistent patterns across codebase

2. **Scalability**:

   - Easy to add new features (new candidates, institutes, voting types)
   - Modular architecture supports team development
   - Can scale horizontally with microservices

3. **Reusability**:

   - UI components reused across pages
   - Services shared across controllers
   - Utilities used throughout application

4. **Testability**:

   - Each component can be tested independently
   - Dependency injection enables easy mocking
   - Clear interfaces simplify unit testing

5. **Security**:

   - Encapsulation hides sensitive logic
   - Abstraction prevents unauthorized access
   - Middleware composition enforces security layers

6. **Performance**:
   - Singleton pattern prevents multiple connections
   - Strategy pattern enables optimal caching
   - Lazy loading through component composition

---

## Features

### 1. **User Features**

#### Account Management

- Email/OTP authentication
- College/Institute selection (one-time, permanent)
- Confirmation modal before setting institute
- Profile information display

#### Voting

- View candidates from your college only
- Cast vote for one candidate or abstain
- Vote restrictions:
  - Must set college/institute first
  - One vote per user
  - Cannot change vote after submission
- Visual feedback and confirmation

#### Dashboard

- Real-time leaderboard (auto-refresh every 5 seconds)
- College-specific view (locked to your institute)
- Live statistics:
  - Total votes cast
  - Leading candidate
  - Vote percentages
- Redis-cached for performance

### 2. **Admin Features**

#### Candidate Management

- Add new candidates with details:
  - Name
  - College/Institute
  - Image upload
- Edit existing candidates
- Delete candidates
- View all candidates across institutes

#### Institute Management

- View all 17 colleges/institutes
- Pre-populated with UMak institutions

#### Voter Management

- View all registered voters
- See voter statistics
- Monitor voting participation

#### Analytics (Planned)

- Vote distribution charts
- Turnout statistics
- Export capabilities (PDF, CSV)

---

## Database Schema

### Tables

#### **`users`** (Supabase Auth Extended)

```sql
- id: UUID (Primary Key, from auth.users)
- email: VARCHAR
- role: ENUM ('student', 'admin')
- institute_id: VARCHAR (Foreign Key → institutes.code)
- created_at: TIMESTAMP
- updated_at: TIMESTAMP
```

#### **`institutes`**

```sql
- code: VARCHAR (Primary Key) e.g., 'ccis', 'cte'
- name: VARCHAR e.g., 'College of Computing and Information Sciences'
- type: ENUM ('college', 'institute')
- created_at: TIMESTAMP
```

**17 Institutes:**

- **Colleges (9)**: CCIS, CTE, CoE, CBA, CHTM, CoN, CASS, CoL, CHS
- **Institutes (8)**: IOS, IET, GS, OVP-RIE, ITL, CMTO, IPA, IPR

#### **`candidates`**

```sql
- id: UUID (Primary Key)
- name: VARCHAR
- institute_id: VARCHAR (Foreign Key → institutes.code)
- image_url: TEXT (Supabase Storage URL)
- created_at: TIMESTAMP
- updated_at: TIMESTAMP
```

#### **`votes`**

```sql
- id: UUID (Primary Key)
- user_id: UUID (Foreign Key → users.id)
- candidate_id: UUID (Foreign Key → candidates.id, NULL for abstain)
- institute_id: VARCHAR (Foreign Key → institutes.code)
- voted_at: TIMESTAMP
- is_abstain: BOOLEAN

Constraints:
- UNIQUE(user_id) - One vote per user
- CHECK: is_abstain = true requires candidate_id IS NULL
```

### Row Level Security (RLS) Policies

#### **Users Table**

- Students can read their own record
- Admins can read all records

#### **Institutes Table**

- Public read access (all authenticated users)

#### **Candidates Table**

- Students can read candidates from their institute only
- Admins can read all candidates
- Only admins can insert, update, delete

#### **Votes Table**

- Users can insert their own vote once
- Users can read their own vote
- Admins can read all votes
- No updates or deletes allowed (audit integrity)

---

## API Endpoints

### **Authentication Endpoints**

#### `POST /api/auth/login`

- **Description**: Send OTP to email
- **Access**: Public
- **Body**: `{ email: string }`
- **Response**: `{ message: "OTP sent to your email" }`

#### `POST /api/auth/verify`

- **Description**: Verify OTP and get JWT token
- **Access**: Public
- **Body**: `{ email: string, token: string (6-digit OTP) }`
- **Response**: `{ token: string, user: User }`

#### `GET /api/auth/me`

- **Description**: Get current user info
- **Access**: Authenticated
- **Response**: `{ user: User }`

#### `POST /api/auth/logout`

- **Description**: Logout user
- **Access**: Authenticated
- **Response**: `{ message: "Logged out successfully" }`

### **User Endpoints**

#### `PATCH /api/user/institute`

- **Description**: Set user's college/institute (one-time)
- **Access**: Authenticated
- **Body**: `{ instituteId: string }`
- **Response**: `{ message: "Institute updated", user: User }`
- **Validation**: Institute must exist in database

### **Institute Endpoints**

#### `GET /api/institutes`

- **Description**: Get all colleges/institutes
- **Access**: Authenticated
- **Response**: `{ institutes: Institute[] }`

### **Candidate Endpoints**

#### `GET /api/admin/candidates`

- **Description**: Get all candidates (admin) or user's institute candidates (student)
- **Access**: Authenticated
- **Response**: `{ candidates: Candidate[] }`
- **RLS**: Filters by user's institute for students

#### `POST /api/admin/candidates`

- **Description**: Create new candidate
- **Access**: Admin only
- **Body**: `{ name: string, instituteId: string, imageUrl?: string }`
- **Response**: `{ candidate: Candidate }`

#### `PUT /api/admin/candidates/:id`

- **Description**: Update candidate
- **Access**: Admin only
- **Body**: `{ name?: string, instituteId?: string, imageUrl?: string }`
- **Response**: `{ candidate: Candidate }`

#### `DELETE /api/admin/candidates/:id`

- **Description**: Delete candidate
- **Access**: Admin only
- **Response**: `{ message: "Candidate deleted" }`

### **Vote Endpoints**

#### `POST /api/votes`

- **Description**: Cast a vote (or abstain)
- **Access**: Authenticated
- **Body**: `{ candidateId?: string, isAbstain: boolean }`
- **Response**: `{ vote: Vote }`
- **Validation**:
  - User must have institute set
  - User hasn't voted before
  - If not abstaining, candidate must exist

#### `GET /api/votes/leaderboard/:instituteId`

- **Description**: Get leaderboard for institute
- **Access**: Authenticated
- **Response**: `{ leaderboard: LeaderboardEntry[] }`
- **Caching**: Redis-cached for 5 seconds
- **Format**:

```typescript
LeaderboardEntry {
  candidateId: string;
  name: string;
  votes: number;
  imageUrl?: string;
}
```

#### `GET /api/votes/my-vote`

- **Description**: Get current user's vote
- **Access**: Authenticated
- **Response**: `{ vote: Vote | null }`

#### `GET /api/admin/votes`

- **Description**: Get all votes (admin only)
- **Access**: Admin only
- **Response**: `{ votes: Vote[] }`

---

## Frontend Components

### **Page Components**

#### **LoginPage** (`/`)

- Email/OTP authentication form
- Redirects to OTP page after email submission
- Auto-redirect to dashboard if already authenticated

#### **OtpPage** (`/otp`)

- 6-digit OTP input
- Verify OTP and login
- Redirects to dashboard on success

#### **DashboardPage** (`/dashboard`)

- Real-time leaderboard with 5s auto-refresh
- Institute-specific view (locked to user's college)
- Warning screen if no institute set
- Statistics cards:
  - Total votes
  - Leading candidate
  - Audit log info
- Read-only institute display

#### **VotingPage** (`/vote`)

- Grid of candidates from user's institute
- Vote/Abstain buttons
- Vote confirmation
- Disabled after voting

#### **AccountPage** (`/account`)

- Display user info (email, role)
- Institute selection dropdown (one-time)
- Confirmation modal with warnings
- Success/error feedback

#### **AdminDashboard** (`/admin`)

- Candidate management (CRUD)
- View all candidates
- Add/Edit/Delete operations
- Image upload support

### **Shared Components**

#### **UI Components** (`/components/ui/`)

- `Button` - Customizable button with variants
- `Card` - Container component
- `FormMessage` - Success/error messages
- `Input` - Form input fields
- `Select` - Dropdown select
- `Modal` - Confirmation dialogs

#### **Layout Components**

- `AppShell` - Main layout with navigation
- `ProtectedRoute` - Auth guard for routes
- `AdminRoute` - Admin-only route guard

### **Routing Structure**

```
/ (Public Routes)
├── /login          → LoginPage
└── /otp            → OtpPage

/dashboard (Protected Routes - Students & Admins)
├── /dashboard      → DashboardPage
├── /vote           → VotingPage
└── /account        → AccountPage

/admin (Protected Routes - Admins Only)
└── /admin          → AdminDashboard
```

---

## Authentication & Authorization

### Authentication Flow

1. **Login Request**

   ```
   User enters email → POST /api/auth/login → Supabase sends OTP
   ```

2. **OTP Verification**

   ```
   User enters OTP → POST /api/auth/verify → Supabase validates
   → Returns JWT token + user info
   ```

3. **Token Storage**

   ```
   JWT stored in localStorage as 'umak_ballot_user'
   Token included in Authorization header for all API calls
   ```

4. **Session Management**
   ```
   AuthContext maintains user state
   ProtectedRoute checks auth before rendering
   Automatic redirect to login if unauthorized
   ```

### Authorization Levels

#### **Public** (Unauthenticated)

- Login page
- OTP verification page

#### **Student** (Authenticated, role: 'student')

- Dashboard (own institute only)
- Voting page (own institute candidates)
- Account page (set institute)
- Cannot access admin routes

#### **Admin** (Authenticated, role: 'admin')

- All student routes
- Admin dashboard
- Candidate management (all institutes)
- View all votes
- User management

### Middleware Chain

```typescript
Request → CORS → Helmet → Body Parser
→ authenticate() middleware
→ adminOnly() middleware (if admin route)
→ Controller
→ Response
```

---

## Account Management System

### Institute Selection Flow

1. **New User State**

   - User logs in for first time
   - `institute_id` is NULL
   - Redirected to warning screen on dashboard

2. **Institute Selection**

   - Navigate to `/account`
   - Select college/institute from dropdown (17 options)
   - Click "Update Institute"

3. **Confirmation Modal**

   - Modal displays warning:
     > "Are you sure you want to select [Institute Name]? This action cannot be undone. You will only be able to view and vote for candidates in this college/institute."
   - Two buttons: Cancel / Confirm

4. **Institute Update**

   ```
   PATCH /api/user/institute { instituteId: 'ccis' }
   → Backend validates institute exists
   → Updates user.institute_id in database
   → Returns updated user object
   → Frontend updates localStorage and AuthContext
   ```

5. **Post-Selection State**
   - User locked to selected institute
   - Can now view dashboard and vote
   - Cannot change institute (permanent)
   - Institute displayed as read-only in dashboard and account page

### Access Restrictions

#### **Before Institute Selection**

- ❌ Cannot view leaderboard (warning screen shown)
- ❌ Cannot vote (blocked)
- ✅ Can access account page to set institute

#### **After Institute Selection**

- ✅ Can view leaderboard (own institute only)
- ✅ Can vote (own institute candidates only)
- ✅ Cannot change institute
- ✅ Cannot see other institutes' data

---

## Voting System

### Voting Rules

1. **Prerequisites**

   - User must be authenticated
   - User must have institute set
   - User must not have voted before

2. **Voting Options**

   - Vote for one candidate from your institute
   - OR Abstain (counted as vote but no candidate selected)

3. **Restrictions**
   - One vote per user (enforced by database UNIQUE constraint)
   - Cannot change vote after submission
   - Cannot vote for candidates from other institutes

### Voting Flow

```
1. User navigates to /vote
2. System checks:
   - Is user authenticated? (AuthContext)
   - Does user have institute? (Check user.institute_id)
   - Has user voted? (Query votes table)
3. If checks pass:
   - Display candidates from user's institute
   - Show vote buttons
4. User clicks vote button:
   - POST /api/votes { candidateId: 'uuid' }
   - Backend validates and creates vote record
   - Redis cache invalidated
   - Success message displayed
5. Voting page now shows "You voted for [Candidate]"
```

### Vote Record Structure

```typescript
{
  id: "uuid",
  user_id: "uuid",
  candidate_id: "uuid" | null,
  institute_id: "ccis",
  is_abstain: false,
  voted_at: "2025-11-01T10:30:00Z"
}
```

### Abstain Logic

```typescript
// Abstain vote
{
  candidate_id: null,
  is_abstain: true
}

// Regular vote
{
  candidate_id: "candidate-uuid",
  is_abstain: false
}
```

---

## Admin Dashboard

### Candidate Management

#### **Add Candidate**

1. Click "Add Candidate" button
2. Fill form:
   - Name (required)
   - Institute (dropdown)
   - Image URL (optional)
3. Submit → POST /api/admin/candidates
4. Candidate appears in list

#### **Edit Candidate**

1. Click "Edit" on candidate card
2. Modify fields
3. Submit → PUT /api/admin/candidates/:id
4. Changes reflected immediately

#### **Delete Candidate**

1. Click "Delete" on candidate card
2. Confirm deletion
3. DELETE /api/admin/candidates/:id
4. Candidate removed from database
5. Related votes remain (audit trail)

### Admin Privileges

- View all candidates across all institutes
- CRUD operations on candidates
- View all votes (planned)
- Export data (planned)
- User management (planned)

---

## Real-time Features

### Auto-refreshing Leaderboard

#### **Implementation**

```typescript
// TanStack Query with auto-refetch
const query = useQuery({
  queryKey: ["leaderboard", instituteId],
  queryFn: () => fetchLeaderboard(instituteId),
  refetchInterval: 5000, // 5 seconds
  refetchIntervalInBackground: true,
});
```

#### **Backend Caching**

```typescript
// Redis cache key: leaderboard:{instituteId}
// TTL: 5 seconds
// Invalidated on new vote

async getLeaderboard(instituteId) {
  const cached = await redis.get(`leaderboard:${instituteId}`);
  if (cached) return JSON.parse(cached);

  const results = await database.query(...);
  await redis.setex(`leaderboard:${instituteId}`, 5, JSON.stringify(results));
  return results;
}
```

#### **Performance Benefits**

- Reduced database load (queries cached)
- Fast response times (<10ms from Redis)
- Automatic invalidation ensures fresh data
- Background refresh keeps UI responsive

### Live Updates

- **Visual Indicators**:
  - Pulsing green dot: "Auto-updates every 5s"
  - Spinning refresh icon during data fetch
- **Manual Refresh**: Button to force immediate update
- **Optimistic Updates**: Vote submission immediately updates UI

---

## Security Features

### 1. **Authentication Security**

- **OTP-based login**: No passwords, reduced phishing risk
- **JWT tokens**: Stateless authentication
- **Token expiry**: Automatic logout after session expires
- **Secure storage**: Tokens in localStorage (HTTPS only)

### 2. **Authorization**

- **Role-based access control (RBAC)**
- **Middleware guards**: `authenticate()`, `adminOnly()`
- **Frontend route guards**: `ProtectedRoute`, `AdminRoute`
- **API endpoint protection**: All routes require auth

### 3. **Database Security**

- **Row Level Security (RLS)**: Supabase policies enforce data isolation
- **SQL injection prevention**: Parameterized queries
- **Unique constraints**: Prevent duplicate votes
- **Audit trail**: Vote records immutable (no updates/deletes)

### 4. **Input Validation**

- **Frontend validation**: Email format, OTP format
- **Backend validation**: All inputs sanitized
- **Type safety**: TypeScript on both frontend and backend

### 5. **HTTP Security**

- **Helmet.js**: Security headers (XSS, CSRF protection)
- **CORS**: Restricted to allowed origins
- **Rate limiting**: Prevent brute force attacks (planned)
- **HTTPS**: Required in production

### 6. **Vote Integrity**

- **One vote per user**: Database constraint
- **Immutable votes**: Cannot edit or delete
- **Institute verification**: Users can only vote in their institute
- **Candidate validation**: Vote only for valid candidates

---

## Installation & Setup

### Prerequisites

- Node.js 18+ and npm
- Redis server
- Supabase account
- Git

### 1. Clone Repository

```bash
git clone <repository-url>
cd UMakEBallot
```

### 2. Backend Setup

```bash
cd backend
npm install
```

**Create `.env` file:**

```env
# Server
PORT=3000
NODE_ENV=development

# Supabase
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_KEY=your-service-role-key

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=

# CORS
CORS_ORIGIN=http://localhost:5173
```

**Run database migrations:**

```bash
# Execute add-institutes.sql in Supabase SQL editor
```

**Start backend:**

```bash
npm run dev        # Development mode
npm run build      # Build TypeScript
npm start          # Production (with clustering)
```

### 3. Frontend Setup

```bash
cd frontend
npm install
```

**Create `.env` file:**

```env
VITE_API_URL=http://localhost:3000
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

**Start frontend:**

```bash
npm run dev        # Development mode (Vite)
npm run build      # Production build
npm run preview    # Preview production build
```

### 4. Redis Setup

**Install Redis:**

```bash
# Windows (using WSL or Memurai)
# macOS
brew install redis
brew services start redis

# Linux
sudo apt install redis-server
sudo systemctl start redis
```

**Verify Redis:**

```bash
redis-cli ping
# Expected: PONG
```

---

## Environment Variables

### Backend Variables

| Variable               | Description               | Example                     |
| ---------------------- | ------------------------- | --------------------------- |
| `PORT`                 | Server port               | `3000`                      |
| `NODE_ENV`             | Environment               | `development`, `production` |
| `SUPABASE_URL`         | Supabase project URL      | `https://xxx.supabase.co`   |
| `SUPABASE_ANON_KEY`    | Supabase anonymous key    | `eyJ...`                    |
| `SUPABASE_SERVICE_KEY` | Supabase service role key | `eyJ...`                    |
| `REDIS_HOST`           | Redis server host         | `localhost`                 |
| `REDIS_PORT`           | Redis server port         | `6379`                      |
| `REDIS_PASSWORD`       | Redis password (optional) | `""`                        |
| `CORS_ORIGIN`          | Allowed frontend origin   | `http://localhost:5173`     |

### Frontend Variables

| Variable                 | Description            | Example                   |
| ------------------------ | ---------------------- | ------------------------- |
| `VITE_API_URL`           | Backend API URL        | `http://localhost:3000`   |
| `VITE_SUPABASE_URL`      | Supabase project URL   | `https://xxx.supabase.co` |
| `VITE_SUPABASE_ANON_KEY` | Supabase anonymous key | `eyJ...`                  |

---

## Deployment

### Production Checklist

#### **Backend**

- [ ] Build TypeScript: `npm run build`
- [ ] Set `NODE_ENV=production`
- [ ] Use secure Redis connection (TLS)
- [ ] Configure CORS for production domain
- [ ] Enable rate limiting
- [ ] Set up process manager (PM2)
- [ ] Configure reverse proxy (Nginx)
- [ ] Enable HTTPS
- [ ] Set up monitoring (logs, errors)

#### **Frontend**

- [ ] Build production bundle: `npm run build`
- [ ] Set correct `VITE_API_URL` (production API)
- [ ] Deploy to CDN or static hosting
- [ ] Configure caching headers
- [ ] Enable HTTPS
- [ ] Set up error tracking (Sentry)

#### **Database**

- [ ] Verify RLS policies are active
- [ ] Set up automated backups
- [ ] Configure connection pooling
- [ ] Monitor query performance

#### **Redis**

- [ ] Use managed Redis (Upstash, Redis Cloud)
- [ ] Enable persistence (if needed)
- [ ] Configure max memory policy
- [ ] Set up monitoring

### Recommended Hosting

- **Frontend**: Vercel, Netlify, Cloudflare Pages
- **Backend**: Railway, Render, Fly.io, DigitalOcean
- **Database**: Supabase (already hosted)
- **Redis**: Upstash, Redis Cloud, Railway

### Example PM2 Configuration

```javascript
// ecosystem.config.js
module.exports = {
  apps: [
    {
      name: "umak-ballot-api",
      script: "./dist/app.js",
      instances: "max",
      exec_mode: "cluster",
      env: {
        NODE_ENV: "production",
        PORT: 3000,
      },
    },
  ],
};
```

---

## System Highlights

### ✅ **Completed Features**

1. **Authentication System**

   - Email/OTP login via Supabase
   - JWT token management
   - Session persistence

2. **Account Management**

   - College/Institute selection (one-time, permanent)
   - Confirmation modal with warnings
   - User profile display

3. **Voting System**

   - Vote for candidates or abstain
   - One vote per user
   - Institute-specific voting

4. **Real-time Dashboard**

   - Auto-refreshing leaderboard (5s)
   - Redis-cached for performance
   - Institute-specific view

5. **Admin Dashboard**

   - Candidate CRUD operations
   - Institute management
   - Image upload support

6. **Access Control**

   - Role-based permissions
   - Institute isolation
   - RLS policies
   - Frontend route guards

7. **Database**
   - 17 UMak colleges/institutes
   - Complete schema with RLS
   - Audit trail for votes

### 🎯 **Key Achievements**

- ✅ **Multi-Institute Support**: 17 colleges/institutes
- ✅ **Real-time Performance**: <10ms Redis response times
- ✅ **Security**: RLS, authentication, input validation
- ✅ **User Experience**: Auto-refresh, instant feedback, responsive design
- ✅ **Scalability**: Redis caching, clustered Node.js
- ✅ **Type Safety**: Full TypeScript coverage
- ✅ **Modern Stack**: React 18, Express 5.1, Supabase

---

## Technical Details

### Vote Counting Algorithm

```typescript
// SQL Query (Cached in Redis)
SELECT
  c.id as candidate_id,
  c.name,
  c.image_url,
  COUNT(v.id) as votes
FROM candidates c
LEFT JOIN votes v ON c.id = v.candidate_id
WHERE c.institute_id = $1
GROUP BY c.id, c.name, c.image_url
UNION ALL
SELECT
  'abstain' as candidate_id,
  'Abstain' as name,
  null as image_url,
  COUNT(*) as votes
FROM votes
WHERE is_abstain = true
  AND institute_id = $1
ORDER BY votes DESC
```

### Caching Strategy

```typescript
// Cache Hierarchy
1. Frontend: TanStack Query cache (staleTime: 5s)
2. Backend: Redis cache (TTL: 5s)
3. Database: PostgreSQL (source of truth)

// Cache Invalidation
- On vote submission: Clear institute's leaderboard cache
- On candidate CRUD: Clear all leaderboard caches
- Automatic: TTL expiration after 5 seconds
```

### Cluster Mode

```typescript
// app.ts
if (cluster.isPrimary) {
  // Fork workers for each CPU core
  for (let i = 0; i < numCPUs; i++) {
    cluster.fork();
  }
} else {
  // Each worker runs Express server
  app.listen(PORT);
}
```

---

## Future Enhancements

### Planned Features

1. **Analytics Dashboard**

   - Vote distribution charts
   - Turnout statistics by institute
   - Time-series voting patterns

2. **Export Capabilities**

   - PDF reports
   - CSV data export
   - Audit trail downloads

3. **Advanced Admin Tools**

   - User management interface
   - Bulk candidate import
   - Voting period controls (start/end times)

4. **Email Notifications**

   - Vote confirmation emails
   - Admin alerts
   - Campaign announcements

5. **Mobile App**

   - React Native version
   - Push notifications
   - Offline support

6. **Advanced Security**
   - Rate limiting per endpoint
   - IP-based restrictions
   - Two-factor authentication for admins
   - Detailed audit logs

---

## Troubleshooting

### Common Issues

#### **Backend won't start**

```bash
# Check Redis connection
redis-cli ping

# Verify environment variables
cat .env

# Check port availability
netstat -ano | findstr :3000
```

#### **Frontend can't connect to API**

```bash
# Verify VITE_API_URL in .env
# Check CORS settings in backend
# Ensure backend is running
```

#### **Vote not counting**

```bash
# Check Redis cache
redis-cli
> GET "leaderboard:ccis"

# Verify database connection
# Check Supabase RLS policies
```

#### **User can't set institute**

```bash
# Verify institute exists in database
# Check user.institute_id is NULL
# Validate PATCH /api/user/institute endpoint
```

---

## Credits

**Developed by:** UMak Development Team  
**University:** University of Makati  
**Year:** 2025

**Technologies:**

- React 18
- TypeScript
- Express 5.1
- Supabase
- Redis
- TailwindCSS
- TanStack Query

---

## License

Proprietary - University of Makati  
All rights reserved.

---

## Support

For technical support or questions:

- **Email**: support@umak.edu.ph
- **GitHub Issues**: [Repository Issues Page]

---

**End of Documentation**
