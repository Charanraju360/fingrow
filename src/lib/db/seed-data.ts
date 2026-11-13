import { hashPassword } from "../auth/crypto.ts";

export interface UserEntity {
  id: string;
  email: string;
  passwordHash: string;
  name: string;
  role: "student" | "young_professional" | "educator" | "institution_admin" | "platform_admin";
  xp: number;
  streakDays: number;
  lastActiveDate: string;
  createdAt: string;
}

export interface ProfileEntity {
  userId: string;
  interests: string[];
  experienceLevel: "beginner" | "intermediate" | "advanced";
  goals: string[];
  completedOnboarding: boolean;
  institution?: string;
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  incorrectExplanation?: string;
  optionExplanations?: string[];
}

export interface LessonContentBlock {
  type: "text" | "callout" | "stat" | "key_takeaway" | "interactive_formula";
  title?: string;
  content: string;
  meta?: Record<string, any>;
}

export interface LessonEntity {
  id: string;
  courseSlug: string;
  slug: string;
  title: string;
  summary: string;
  order: number;
  estimatedMinutes: number;
  blocks: LessonContentBlock[];
  quiz: QuizQuestion[];
}

export interface CourseEntity {
  id: string;
  slug: string;
  title: string;
  description: string;
  category: "foundations" | "investing" | "business" | "career";
  level: "Beginner" | "Intermediate" | "Advanced";
  estimatedMinutes: number;
  iconName: string;
  badgeCode: string;
}

export interface ProgressEntity {
  id: string;
  userId: string;
  courseSlug: string;
  lessonSlug: string;
  completed: boolean;
  score: number;
  completedAt: string;
}

export interface XPEventEntity {
  id: string;
  userId: string;
  amount: number;
  reason: string;
  idempotencyKey: string;
  createdAt: string;
}

export interface AchievementEntity {
  code: string;
  title: string;
  description: string;
  icon: string;
  xpBonus: number;
}

export interface UserAchievementEntity {
  id: string;
  userId: string;
  achievementCode: string;
  unlockedAt: string;
}

export interface GameSessionEntity {
  id: string;
  mode: "quick" | "battle" | "group";
  joinCode: string;
  status: "waiting" | "in_progress" | "completed";
  hostId: string;
  hostName: string;
  guestId?: string;
  guestName?: string;
  scores: Record<string, number>;
  questions: Array<{
    id: string;
    question: string;
    options: string[];
    correctIndex: number;
    explanation: string;
  }>;
  winnerId?: string;
  createdAt: string;
  completedAt?: string;
  answers?: Record<
    string,
    Record<
      string,
      {
        answerIndex: number;
        isCorrect: boolean;
        pointsAwarded: number;
        timeRemaining?: number;
        answeredAt: string;
      }
    >
  >;
  playerProgress?: Record<string, { isFinished: boolean; finishedAt?: string }>;
}

export interface SimulationRunEntity {
  id: string;
  userId: string;
  scenarioType: "first_salary" | "monthly_budget" | "investment_challenge" | "sip_growth" | "startup_builder";
  virtualBalance: number;
  netWorth: number;
  currentPeriod: number; // Month or year
  status: "active" | "completed";
  history: Array<{
    period: number;
    action: string;
    amount: number;
    balanceAfter: number;
    outcomeMessage: string;
  }>;
  parameters: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

export interface ClassroomEntity {
  id: string;
  code: string;
  name: string;
  subject: string;
  educatorId: string;
  educatorName: string;
  institution: string;
  studentIds: string[];
  createdAt: string;
}

export interface AssignmentEntity {
  id: string;
  classroomId: string;
  title: string;
  courseSlug: string;
  lessonSlug: string;
  dueDate: string;
  createdAt: string;
}

export interface AssignmentSubmissionEntity {
  id: string;
  assignmentId: string;
  classroomId: string;
  studentId: string;
  studentName: string;
  score: number;
  completedAt: string;
}

export interface CommunityPostEntity {
  id: string;
  userId: string;
  authorName: string;
  authorRole: string;
  category: "Personal Finance" | "Stock Investing" | "Startups & Business" | "Career & Hustles" | "General";
  title: string;
  content: string;
  likes: number;
  likedBy: string[];
  commentsCount: number;
  isPinned?: boolean;
  createdAt: string;
}

export interface CommunityCommentEntity {
  id: string;
  postId: string;
  parentId?: string;
  userId: string;
  authorName: string;
  authorRole: string;
  content: string;
  createdAt: string;
}

export interface ModerationReportEntity {
  id: string;
  targetType: "post" | "comment" | "user";
  targetId: string;
  reporterUserId: string;
  reporterName: string;
  reason: string;
  notes?: string;
  status: "pending" | "resolved" | "dismissed";
  resolutionNotes?: string;
  createdAt: string;
  resolvedAt?: string;
}

export interface AuditLogEntity {
  id: string;
  actorId: string;
  actorName: string;
  action: string;
  target: string;
  metadata?: Record<string, any>;
  timestamp: string;
}

export function getInitialSeedData() {
  const defaultPassword = hashPassword("FinGrowDemo2026!");

  const users: UserEntity[] = [
    {
      id: "usr_student_alex",
      email: "alex.student@fingrow.dev",
      passwordHash: defaultPassword,
      name: "Alex Chen",
      role: "student",
      xp: 420,
      streakDays: 4,
      lastActiveDate: new Date().toISOString().split("T")[0],
      createdAt: "2026-11-01T10:00:00Z",
    },
    {
      id: "usr_pro_priya",
      email: "priya.pro@fingrow.dev",
      passwordHash: defaultPassword,
      name: "Priya Sharma",
      role: "young_professional",
      xp: 890,
      streakDays: 7,
      lastActiveDate: new Date().toISOString().split("T")[0],
      createdAt: "2026-10-25T14:30:00Z",
    },
    {
      id: "usr_edu_sarah",
      email: "sarah.teacher@fingrow.dev",
      passwordHash: defaultPassword,
      name: "Sarah Jenkins",
      role: "educator",
      xp: 1550,
      streakDays: 14,
      lastActiveDate: new Date().toISOString().split("T")[0],
      createdAt: "2026-09-15T09:00:00Z",
    },
    {
      id: "usr_inst_marcus",
      email: "marcus.admin@fingrow.dev",
      passwordHash: defaultPassword,
      name: "Marcus Vance",
      role: "institution_admin",
      xp: 600,
      streakDays: 2,
      lastActiveDate: new Date().toISOString().split("T")[0],
      createdAt: "2026-09-10T11:00:00Z",
    },
    {
      id: "usr_admin_root",
      email: "admin@fingrow.dev",
      passwordHash: defaultPassword,
      name: "FinGrow Platform Admin",
      role: "platform_admin",
      xp: 2500,
      streakDays: 21,
      lastActiveDate: new Date().toISOString().split("T")[0],
      createdAt: "2026-08-01T08:00:00Z",
    },
  ];

  const profiles: ProfileEntity[] = [
    {
      userId: "usr_student_alex",
      interests: ["Stock Market", "Compound Interest", "Budgeting"],
      experienceLevel: "beginner",
      goals: ["Learn to invest safely", "Understand student credit"],
      completedOnboarding: true,
      institution: "Oakridge Academy",
    },
    {
      userId: "usr_pro_priya",
      interests: ["Mutual Funds & SIPs", "Portfolio Diversification", "Startup Building"],
      experienceLevel: "intermediate",
      goals: ["Optimize salary allocation", "Build wealth index portfolio"],
      completedOnboarding: true,
    },
    {
      userId: "usr_edu_sarah",
      interests: ["Economics Education", "Gamified Classrooms", "Financial Literacy"],
      experienceLevel: "advanced",
      goals: ["Empower high school students with practical financial skills"],
      completedOnboarding: true,
      institution: "Oakridge High School",
    },
  ];

  const courses: CourseEntity[] = [
    {
      id: "crs_stocks",
      slug: "stock-market-fundamentals",
      title: "Stock Market Fundamentals",
      description: "Demystify equity ownership, market capitalization, order books, and how price discovery really works.",
      category: "foundations",
      level: "Beginner",
      estimatedMinutes: 25,
      iconName: "TrendingUp",
      badgeCode: "STOCK_SCOUT",
    },
    {
      id: "crs_mf_sip",
      slug: "mutual-funds-and-sips",
      title: "Mutual Funds & Systematic Investment Plans (SIPs)",
      description: "Learn how pooled funds work, active vs index investing, dollar-cost averaging, and NAV calculation.",
      category: "foundations",
      level: "Beginner",
      estimatedMinutes: 30,
      iconName: "PieChart",
      badgeCode: "SIP_CHAMPION",
    },
    {
      id: "crs_risk_portfolio",
      slug: "risk-and-diversification",
      title: "Risk & Portfolio Diversification",
      description: "Discover why modern portfolio theory matters, asset correlation, volatility vs permanent loss, and rebalancing.",
      category: "foundations",
      level: "Intermediate",
      estimatedMinutes: 35,
      iconName: "ShieldCheck",
      badgeCode: "RISK_ARCHITECT",
    },
    {
      id: "crs_compound_interest",
      slug: "inflation-and-compound-interest",
      title: "Inflation, Interest & The Power of Compounding",
      description: "Experience the real mathematics of compound growth, real vs nominal returns, and the eroding power of inflation.",
      category: "foundations",
      level: "Beginner",
      estimatedMinutes: 20,
      iconName: "Zap",
      badgeCode: "COMPOUND_MASTER",
    },
    {
      id: "crs_credit_debit",
      slug: "credit-and-debit-mastery",
      title: "Credit & Debit: Tools, Traps & Strategy",
      description: "Master credit utilization, APR interest compounding, credit scores, and debt repayment frameworks.",
      category: "foundations",
      level: "Beginner",
      estimatedMinutes: 25,
      iconName: "CreditCard",
      badgeCode: "CREDIT_SMART",
    },
    {
      id: "crs_personal_finance",
      slug: "personal-finance-and-budgeting",
      title: "Personal Finance & The 50/30/20 Rule",
      description: "Architect a resilient personal budget, build emergency runway, and automate cash flow effortlessly.",
      category: "foundations",
      level: "Beginner",
      estimatedMinutes: 25,
      iconName: "Wallet",
      badgeCode: "BUDGET_WIZARD",
    },
    {
      id: "crs_business_ebitda",
      slug: "business-fundamentals-and-ebitda",
      title: "Business Fundamentals: Revenue, Profit & EBITDA",
      description: "Decode corporate balance sheets, Gross Margins, Operating Income, EBITDA, and Return on Investment (ROI).",
      category: "business",
      level: "Intermediate",
      estimatedMinutes: 40,
      iconName: "Briefcase",
      badgeCode: "BUSINESS_ACUMEN",
    },
    {
      id: "crs_career_hustles",
      slug: "career-skills-and-side-hustles",
      title: "Career Strategy, Pricing Skills & Side Hustles",
      description: "Turn your skills into scalable income streams with unit economics, client negotiation, and automated side projects.",
      category: "career",
      level: "Beginner",
      estimatedMinutes: 30,
      iconName: "Compass",
      badgeCode: "HUSTLE_FOUNDER",
    },
  ];

  const lessons: LessonEntity[] = [
    {
      "id": "lsn_stocks_1",
      "courseSlug": "stock-market-fundamentals",
      "slug": "what-is-a-stock",
      "title": "What Owning a Stock Actually Means",
      "summary": "Shares are not lottery tickets—they represent fractional legal ownership of real businesses with real assets.",
      "order": 1,
      "estimatedMinutes": 10,
      "blocks": [
        {
          "type": "text",
          "title": "The Fractional Ownership Reality",
          "content": "When you purchase one share of Apple, Microsoft, or any publicly listed enterprise, you are buying a fractional stake in their factories, intellectual property, patents, and future cash flows. You become an equity holder, with legal rights to earnings distributions (dividends) and shareholder votes."
        },
        {
          "type": "stat",
          "title": "Ownership vs Speculation",
          "content": "Benjamin Graham famously stated: 'In the short run, the market is a voting machine, but in the long run, it is a weighing machine.' Price fluctuations reflect crowd psychology today; long-term value reflects corporate earnings."
        },
        {
          "type": "key_takeaway",
          "content": "Market capitalization equals Total Outstanding Shares multiplied by Current Share Price. A company with a $10 stock price can be 100x bigger than a company with a $100 stock price if it has more shares outstanding."
        },
        {
          "type": "callout",
          "title": "Dividends vs Capital Appreciation",
          "content": "Investors make money in stocks in two primary ways: capital appreciation (the stock price rises as the underlying business becomes more valuable) and cash dividend distributions (the board votes to return profits directly to shareholders)."
        }
      ],
      "quiz": [
        {
          "id": "q_stocks_1",
          "question": "Company A has 10 million shares at $50 each ($500M market cap). Company B has 1 billion shares at $2 each ($2B market cap). Which company is larger?",
          "options": [
            "Company A, because $50 per share is higher than $2",
            "Company B, because its market capitalization ($2 Billion) is higher than Company A's ($500 Million)",
            "Both companies are identical in size",
            "Stock price alone determines corporate value"
          ],
          "correctIndex": 1,
          "explanation": "Total business value is determined by Market Capitalization (Share Price × Outstanding Shares), not by the standalone price of a single share.",
          "incorrectExplanation": "Confusing nominal share price with business valuation is a classic beginner trap. A low share price does not mean a company is smaller or 'cheaper'.",
          "optionExplanations": [
            "Incorrect: Nominal share price ignores the total number of shares created by the corporation.",
            "Correct: 1 billion shares at $2 yields a $2 Billion market capitalization, four times larger than $500 Million.",
            "Incorrect: $2B is 4x larger than $500M.",
            "Incorrect: Share price alone tells you nothing about the total value without knowing outstanding shares."
          ]
        },
        {
          "id": "q_stocks_2",
          "question": "What legal right does purchasing common stock grant you as an investor?",
          "options": [
            "Guaranteed 10% annual return backed by the government",
            "Fractional claim on corporate assets, residual earnings, and shareholder voting privileges",
            "Right to take company physical inventory home directly",
            "Immunity from capital losses during economic recessions"
          ],
          "correctIndex": 1,
          "explanation": "Stockholders own equity: a residual claim on corporate assets and earnings after debt obligations are satisfied.",
          "incorrectExplanation": "Stocks carry no guaranteed returns and rank junior to debt holders during bankruptcy.",
          "optionExplanations": [
            "Incorrect: Stocks have no guaranteed return; equity is subject to market and operational risks.",
            "Correct: As equity owners, stockholders have a proportional claim on residual cash flows and voting rights.",
            "Incorrect: Physical corporate assets belong to the corporation as a separate legal entity.",
            "Incorrect: Equity investors bear the risk of capital loss in market downturns."
          ]
        }
      ]
    },
    {
      "id": "lsn_stocks_2",
      "courseSlug": "stock-market-fundamentals",
      "slug": "how-order-books-work",
      "title": "Bids, Asks & Price Discovery",
      "summary": "Understand how the order book continuously matches buyers and sellers without human middlemen.",
      "order": 2,
      "estimatedMinutes": 15,
      "blocks": [
        {
          "type": "text",
          "title": "The Mechanics of Bid & Ask",
          "content": "The Bid is the highest price a buyer is currently willing to pay. The Ask (or Offer) is the lowest price a seller is willing to accept. The difference between them is the Spread. When a buyer submits a Market Order, they agree to cross the spread and accept the current lowest ask instantly."
        },
        {
          "type": "callout",
          "title": "Market Order vs Limit Order",
          "content": "A Market Order guarantees execution speed but NOT price. A Limit Order guarantees price limit but NOT execution speed if the market moves away."
        },
        {
          "type": "stat",
          "title": "Liquidity & The Bid-Ask Spread",
          "content": "Heavily traded mega-cap stocks usually have tight spreads of just 1 cent ($0.01). Thinly traded small-cap stocks can have spreads of 5% or more, resulting in immediate slippage if bought with market orders."
        },
        {
          "type": "key_takeaway",
          "content": "Always use Limit Orders when trading volatile or thinly traded assets to prevent severe execution slippage."
        }
      ],
      "quiz": [
        {
          "id": "q_stocks_3",
          "question": "If Stock XYZ has a Bid of $100.00 and an Ask of $100.25, what price will your Market Buy Order execute at?",
          "options": [
            "$100.00 (the Bid)",
            "$100.25 (the lowest available Ask)",
            "$100.125 (the exact midpoint)",
            "$99.75 (discounted broker rate)"
          ],
          "correctIndex": 1,
          "explanation": "A market buy order executes immediately against the best available seller in the order book, which is the Ask price ($100.25).",
          "incorrectExplanation": "When buying at market, you pay the seller's asking price, not the buyer's bid price.",
          "optionExplanations": [
            "Incorrect: $100.00 is the Bid (what buyers are offering to pay). Sellers want $100.25.",
            "Correct: Market buy orders match immediately with the lowest existing Ask on the book ($100.25).",
            "Incorrect: The order matches existing limit asks directly rather than splitting the difference.",
            "Incorrect: Brokers execute against exchange order book rates without arbitrary discounts."
          ]
        },
        {
          "id": "q_stocks_4",
          "question": "You want to buy 100 shares of a stock currently quoted at $150, but you only want to pay $145 or less. Which order type should you use?",
          "options": [
            "Market Buy Order",
            "Limit Buy Order with a limit price of $145.00",
            "Stop Loss Sell Order",
            "Margin Call Execution"
          ],
          "correctIndex": 1,
          "explanation": "A Limit Buy order instructs the broker to execute only at your specified limit price ($145) or better, never higher.",
          "incorrectExplanation": "A market order would execute immediately at the current market ask (~$150) rather than waiting for $145.",
          "optionExplanations": [
            "Incorrect: A market order executes immediately at current asking prices (~$150).",
            "Correct: A Limit Buy Order guarantees you will never pay more than your designated ceiling price of $145.",
            "Incorrect: A stop loss sell order is designed to liquidate existing positions to cap losses.",
            "Incorrect: A margin call occurs when a broker forces position liquidation due to collateral deficit."
          ]
        }
      ]
    },
    {
      "id": "lsn_mf_1",
      "courseSlug": "mutual-funds-and-sips",
      "slug": "index-funds-vs-active-funds",
      "title": "Index Funds vs Actively Managed Funds",
      "summary": "Why low-cost broad index funds outperform the vast majority of active fund managers over 15+ year horizons.",
      "order": 1,
      "estimatedMinutes": 12,
      "blocks": [
        {
          "type": "text",
          "title": "The Mathematics of Expense Ratios",
          "content": "An active fund manager charges an annual fee (typically 1.0% to 2.5%) trying to pick individual winning stocks. An Index Fund automatically tracks a benchmark index (like the S&P 500 or Nifty 50) for a tiny fee (typically 0.03% to 0.15%). Over 30 years, a 2% annual fee drag can consume up to 45% of your total compounded wealth!"
        },
        {
          "type": "stat",
          "title": "SPIVA Scorecard Findings",
          "content": "Over a 15-year period, more than 88% of actively managed large-cap funds underperform their benchmark index after accounting for management fees and trading transaction costs."
        },
        {
          "type": "key_takeaway",
          "content": "In investing, you get what you don't pay for. Lower expense ratios leave more capital compounding in your account year after year."
        }
      ],
      "quiz": [
        {
          "id": "q_mf_1",
          "question": "Why does an expense ratio of 1.5% have such a devastating impact on a 30-year investment horizon?",
          "options": [
            "It is deducted only if the fund generates positive returns",
            "It compounds annually against your total portfolio value regardless of market gains or losses, reducing compound interest exponential velocity",
            "Government regulations triple the fee during bear markets",
            "It forces you to pay higher capital gains taxes automatically"
          ],
          "correctIndex": 1,
          "explanation": "Fees are deducted annually from the total assets under management (AUM). Lost compounding on those deducted fees drastically shrinks terminal wealth.",
          "incorrectExplanation": "Expense ratios are not one-time fees and are deducted continuously regardless of performance.",
          "optionExplanations": [
            "Incorrect: Management fees are deducted continuously, even in years when the fund loses money.",
            "Correct: Because fees compound against the total portfolio value, a 1.5% fee can devour over 30-40% of lifetime gains.",
            "Incorrect: Regulatory agencies do not alter fund management fees during downturns.",
            "Incorrect: Taxes are separate from fund management expense ratios."
          ]
        },
        {
          "id": "q_mf_3",
          "question": "Why do most active mutual fund managers fail to beat low-cost passive index benchmarks over a 15-year horizon?",
          "options": [
            "They are legally forbidden from buying technology companies",
            "Higher management fees, cash drag, and frequent trading turnover create compounding performance headwinds that active stock picking rarely overcomes",
            "Index funds receive special tax subsidies that active funds are denied",
            "Active managers are required to keep 80% of assets in cash"
          ],
          "correctIndex": 1,
          "explanation": "After accounting for 1-2% annual management fees, trading transaction costs, and turnover friction, fewer than 15% of active funds beat passive index funds over long horizons.",
          "incorrectExplanation": "Active managers fail due to structural fee and friction hurdles, not arbitrary regulatory restrictions.",
          "optionExplanations": [
            "Incorrect: Active funds have wide discretion to hold equities across all market sectors.",
            "Correct: The arithmetic of active management proves that fees and trading friction mathematically reduce net returns below the market average.",
            "Incorrect: Index funds and mutual funds operate under the same tax code frameworks.",
            "Incorrect: Active funds are usually fully invested and maintain minimal cash reserves."
          ]
        }
      ]
    },
    {
      "id": "lsn_mf_2",
      "courseSlug": "mutual-funds-and-sips",
      "slug": "dollar-cost-averaging-sip",
      "title": "The Magic of SIP & Dollar-Cost Averaging",
      "summary": "How investing a fixed sum every month transforms market downturns into buying opportunities.",
      "order": 2,
      "estimatedMinutes": 18,
      "blocks": [
        {
          "type": "text",
          "title": "Automating Emotional Discipline",
          "content": "When markets crash, investor emotions scream to sell. A Systematic Investment Plan (SIP) or Dollar-Cost Averaging (DCA) automatically buys more units when prices are cheap and fewer units when prices are expensive, resulting in a lower average cost per unit without timing the market."
        },
        {
          "type": "stat",
          "title": "The Volatility Paradox",
          "content": "In a volatile sideways market, a disciplined SIP investor often generates higher returns than a lump-sum investor because they systematically scooped up cheap shares at each cyclical valley."
        },
        {
          "type": "key_takeaway",
          "content": "Time in the market beats timing the market. Automating your investments on payday removes emotional decision-making."
        }
      ],
      "quiz": [
        {
          "id": "q_mf_2",
          "question": "If you invest $500 monthly and the share price drops from $50 to $25, what happens to your SIP execution?",
          "options": [
            "Your order is rejected due to volatility",
            "You automatically buy 20 shares instead of 10 shares, lowering your overall average cost basis",
            "Your monthly investment drops to $250",
            "You lose all accumulated shares from previous months"
          ],
          "correctIndex": 1,
          "explanation": "With fixed-dollar contributions ($500), lower share prices buy more shares ($500 / $25 = 20 units). When prices recover, those discounted units accelerate your returns.",
          "incorrectExplanation": "A fixed dollar contribution automatically acquires more shares at lower valuations without manual intervention.",
          "optionExplanations": [
            "Incorrect: Automated SIPs execute consistently regardless of normal market volatility.",
            "Correct: $500 buys 10 units at $50, but 20 units at $25, automatically dollar-cost averaging downward.",
            "Incorrect: Your scheduled contribution remains $500 unless you manually adjust it.",
            "Incorrect: Previous units remain owned in your account balance."
          ]
        },
        {
          "id": "q_mf_4",
          "question": "What psychological benefit does a Systematic Investment Plan (SIP) provide during severe market corrections?",
          "options": [
            "It guarantees that market downturns will be declared illegal",
            "It eliminates emotional market timing anxiety by automatically accumulating more units at discounted valuations",
            "It doubles your bank account balance instantly",
            "It allows you to bypass capital gains taxes indefinitely"
          ],
          "correctIndex": 1,
          "explanation": "Automating periodic investments neutralizes emotional fear and greed, preventing investors from panic-selling at market bottoms.",
          "incorrectExplanation": "SIP is an investment execution strategy that instills discipline; it does not change tax law or banking balances.",
          "optionExplanations": [
            "Incorrect: Market fluctuations are natural and legal economic realities.",
            "Correct: Automating contributions forces discipline, purchasing undervalued units when human instinct prompts selling.",
            "Incorrect: SIP invests money from your account into securities; it doesn't duplicate cash.",
            "Incorrect: Capital gains taxes still apply upon eventual liquidation of investments."
          ]
        }
      ]
    },
    {
      "id": "lsn_risk_1",
      "courseSlug": "risk-and-diversification",
      "slug": "asset-allocation-and-correlation",
      "title": "Asset Allocation: The Only Free Lunch in Finance",
      "summary": "Nobel Laureate Harry Markowitz proved that combining uncorrelated assets maximizes return per unit of risk.",
      "order": 1,
      "estimatedMinutes": 15,
      "blocks": [
        {
          "type": "text",
          "title": "Correlation Between Asset Classes",
          "content": "Holding 20 different airline stocks is NOT diversification—if jet fuel prices spike or travel bans occur, all 20 plunge together. True diversification means allocating across different asset classes (Equities, Bonds, Real Estate, Cash equivalents, Commodities) with low or negative price correlation."
        },
        {
          "type": "callout",
          "title": "The Efficient Frontier",
          "content": "By blending non-correlated assets, you can build a portfolio with the same expected return as an all-stock portfolio, but with significantly shallower peak-to-trough drawdowns."
        },
        {
          "type": "key_takeaway",
          "content": "Asset allocation determines over 90% of portfolio return variance over time, far outweighing individual security selection or market timing."
        }
      ],
      "quiz": [
        {
          "id": "q_risk_1",
          "question": "Which of the following portfolios represents true strategic diversification?",
          "options": [
            "100% invested in 10 different AI chip companies",
            "A mix of global total-market equities, government treasury bonds, real estate index, and emergency cash",
            "100% invested in high-yield cryptocurrency tokens",
            "All money placed in a single company's employee stock purchase plan"
          ],
          "correctIndex": 1,
          "explanation": "True diversification balances different asset classes with low correlation so market distress in one sector is cushioned by others.",
          "incorrectExplanation": "Holding many assets within the exact same category or industry is concentration risk, not diversification.",
          "optionExplanations": [
            "Incorrect: Concentrating in one sub-sector exposes you to systemic technological or supply-chain shocks.",
            "Correct: Combining equities, bonds, real estate, and liquid cash provides balance across varying economic environments.",
            "Incorrect: Single-asset crypto portfolios carry high volatility and zero traditional asset diversification.",
            "Incorrect: Tying both your salary and investment net worth to one company is catastrophic single-point risk."
          ]
        },
        {
          "id": "q_risk_2",
          "question": "If two asset classes have a correlation coefficient of -0.30, how do their prices typically behave?",
          "options": [
            "They always move in the exact same direction simultaneously",
            "They tend to move inversely, meaning when one dips, the other often remains resilient or rises",
            "Both assets immediately lose 30% of their value",
            "One asset is guaranteed to go bankrupt within a year"
          ],
          "correctIndex": 1,
          "explanation": "Negative correlation indicates that assets tend to fluctuate in opposite directions, dampening overall portfolio volatility.",
          "incorrectExplanation": "A negative correlation is a mathematical relationship between price movements, not a loss percentage or insolvency signal.",
          "optionExplanations": [
            "Incorrect: Identical movement reflects a positive correlation (+1.0).",
            "Correct: A correlation of -0.30 means the assets exhibit slight inverse co-movement, reducing overall risk.",
            "Incorrect: The correlation coefficient measures statistical co-variance, not price percentage drops.",
            "Incorrect: Correlation reflects price dynamics, not corporate bankruptcy probability."
          ]
        }
      ]
    },
    {
      "id": "lsn_risk_2",
      "courseSlug": "risk-and-diversification",
      "slug": "volatility-vs-capital-loss-and-rebalancing",
      "title": "Volatility vs Permanent Capital Loss & Rebalancing",
      "summary": "Why price fluctuations are the price of admission for equities, and how disciplined rebalancing systematically buys low and sells high.",
      "order": 2,
      "estimatedMinutes": 20,
      "blocks": [
        {
          "type": "text",
          "title": "Volatility vs Permanent Loss of Capital",
          "content": "Stock prices oscillate constantly based on interest rate headlines, geopolitical tension, and trader sentiment. This is volatility. Permanent loss of capital occurs when a bankrupt company's equity is wiped out, or when an emotional investor sells at the bottom of a bear market."
        },
        {
          "type": "stat",
          "title": "The Math of Drawdowns",
          "content": "If a portfolio drops by 50%, it requires a 100% gain just to break even! Avoiding catastrophic drawdowns through diversification preserves compounding velocity."
        },
        {
          "type": "callout",
          "title": "Disciplined Rebalancing",
          "content": "Rebalancing forces you to sell what has gone up (taking profits) and buy what has lagged (buying value), adhering strictly to predetermined risk targets without emotional bias."
        }
      ],
      "quiz": [
        {
          "id": "q_risk_3",
          "question": "What is the critical difference between market volatility and permanent capital loss?",
          "options": [
            "There is no difference; all paper losses are permanent losses",
            "Volatility is the temporary quotation price fluctuations of sound assets; permanent loss happens when an investment goes to zero or you panic-sell at the trough",
            "Permanent loss only happens when you invest in index funds",
            "Volatility guarantees that your portfolio will never recover"
          ],
          "correctIndex": 1,
          "explanation": "Fluctuations in price are normal market turbulence. Permanent loss occurs when underlying capital is permanently destroyed or liquidated in a panic.",
          "incorrectExplanation": "Paper losses only become realized, permanent capital destruction when an investor capitulates or when an insolvent asset collapses.",
          "optionExplanations": [
            "Incorrect: Market quotes fluctuate daily without destroying the earnings generation of strong businesses.",
            "Correct: True long-term investors tolerate temporary volatility because productive business assets recover over economic cycles.",
            "Incorrect: Broad index funds historically recover from recessions because world economies expand over time.",
            "Incorrect: Volatility includes upside upward moves as well as downside corrections."
          ]
        },
        {
          "id": "q_risk_4",
          "question": "A target portfolio is set to 80% Stocks and 20% Bonds. After a massive bull run, the portfolio becomes 90% Stocks and 10% Bonds. What does disciplined rebalancing require?",
          "options": [
            "Selling some appreciated stocks and buying bonds to restore the 80/20 risk allocation",
            "Borrowing money to buy more stocks at all-time highs",
            "Liquidating all bonds and going 100% into stocks",
            "Ignoring the allocation because winners always keep rising forever"
          ],
          "correctIndex": 0,
          "explanation": "Rebalancing systematically trims overweight (expensive) assets and buys underweight (cheaper) assets, maintaining your chosen risk profile.",
          "incorrectExplanation": "Allowing equity weight to drift higher increases portfolio vulnerability right before market corrections.",
          "optionExplanations": [
            "Correct: Trimming stocks and purchasing bonds re-anchors your portfolio to your risk tolerance, locking in gains.",
            "Incorrect: Taking leverage at market peaks significantly increases downside vulnerability.",
            "Incorrect: Eliminating bonds leaves the portfolio fully exposed to the next bear market shock.",
            "Incorrect: Markets move in cycles; letting asset drift unchecked exposes investors to excessive drawdown."
          ]
        }
      ]
    },
    {
      "id": "lsn_compound_1",
      "courseSlug": "inflation-and-compound-interest",
      "slug": "rule-of-72-and-compound-growth",
      "title": "The Rule of 72 & Geometric Growth",
      "summary": "Discover how quickly money doubles and why starting 5 years earlier can double your retirement nest egg.",
      "order": 1,
      "estimatedMinutes": 12,
      "blocks": [
        {
          "type": "text",
          "title": "Mental Math: The Rule of 72",
          "content": "To calculate approximately how many years it takes for your investment to double, divide 72 by your annual rate of return. At 8% annual return: 72 / 8 = 9 years. At 12% return: 72 / 12 = 6 years."
        },
        {
          "type": "stat",
          "title": "The Cost of Waiting",
          "content": "Investing $200/month from age 20 to 30 and then stopping yields more money at age 65 than someone who starts investing $200/month at age 30 and continues every single month until age 65!"
        },
        {
          "type": "key_takeaway",
          "content": "In the compound interest equation, time is an exponent. An extra decade in the market creates exponential wealth multiplication."
        }
      ],
      "quiz": [
        {
          "id": "q_compound_1",
          "question": "According to the Rule of 72, approximately how many years will it take an investment to double at a 9% annual compound return?",
          "options": [
            "9 years",
            "8 years (72 / 9 = 8)",
            "18 years",
            "4 years"
          ],
          "correctIndex": 1,
          "explanation": "72 divided by 9 equals 8 years to double your initial capital.",
          "incorrectExplanation": "The formula is 72 / Interest Rate = Years to double.",
          "optionExplanations": [
            "Incorrect: 72 / 9 is not 9.",
            "Correct: 72 / 9 = 8 years for the principal to double.",
            "Incorrect: At 9%, capital doubles much faster than 18 years.",
            "Incorrect: A 4-year doubling time would require an 18% compound annual return (72 / 18 = 4)."
          ]
        },
        {
          "id": "q_compound_2",
          "question": "Why does an investor who starts saving $300/month at age 22 end up with significantly more wealth at age 60 than someone saving $600/month starting at age 35?",
          "options": [
            "Older investors are charged higher transaction fees by law",
            "Compound interest is exponential; the extra 13 years of geometric compounding outweighs the larger principal contributions made later",
            "Stock markets only grow when young people buy shares",
            "The tax code confiscates 50% of late contributions"
          ],
          "correctIndex": 1,
          "explanation": "In compound interest formula A = P(1 + r/n)^(nt), time (t) is in the exponent. Time is the most powerful multiplier in wealth creation.",
          "incorrectExplanation": "Compounding power comes from the mathematical exponent of time, not from legal fees or taxes.",
          "optionExplanations": [
            "Incorrect: Brokerage commissions and platform fees are identical regardless of age.",
            "Correct: Exponential time compounding allows earnings to generate earnings over multiple doubling cycles.",
            "Incorrect: Markets reflect corporate productivity regardless of investor demographics.",
            "Incorrect: Tax-advantaged retirement accounts apply equally across eligible working age brackets."
          ]
        }
      ]
    },
    {
      "id": "lsn_compound_2",
      "courseSlug": "inflation-and-compound-interest",
      "slug": "real-vs-nominal-returns",
      "title": "Real vs Nominal Returns & Inflation Drag",
      "summary": "Why cash in a zero-interest checking account is a guaranteed loss in real purchasing power over time.",
      "order": 2,
      "estimatedMinutes": 16,
      "blocks": [
        {
          "type": "text",
          "title": "Nominal vs Real Returns",
          "content": "Nominal return is the raw percentage gain on paper. Real return is your gain AFTER subtracting consumer price inflation. If your bank pays 3% interest but inflation is 5%, your real return is -2%. Every year, your cash buys fewer goods and services."
        },
        {
          "type": "stat",
          "title": "The Silent Thief of Inflation",
          "content": "At a 3.5% average inflation rate, the purchasing power of $100,000 in cash is cut in half in roughly 20 years without ever losing a nominal penny."
        },
        {
          "type": "callout",
          "title": "Asset Classes That Beat Inflation",
          "content": "Productive assets (equities, real estate, inflation-protected securities) possess pricing power: as costs rise, businesses raise prices and properties adjust rents, defending investor purchasing power."
        }
      ],
      "quiz": [
        {
          "id": "q_compound_3",
          "question": "If your savings account yields a 4% nominal annual interest rate, but headline inflation is running at 6%, what is your approximate real return?",
          "options": [
            "+10% positive return",
            "+4% real gain",
            "-2% real purchasing power loss (4% - 6% = -2%)",
            "0% neutral break-even"
          ],
          "correctIndex": 2,
          "explanation": "Real Return ≈ Nominal Return - Inflation Rate (4% - 6% = -2%). Although your nominal dollar balance grew, your purchasing power declined.",
          "incorrectExplanation": "Nominal returns tell you how many dollars you have; real returns tell you how many actual goods and services those dollars can buy.",
          "optionExplanations": [
            "Incorrect: Inflation subtracts from nominal returns rather than adding to them.",
            "Incorrect: Ignoring inflation gives a false illusion of positive wealth accumulation.",
            "Correct: When inflation outpaces interest, your purchasing power is actively eroding by 2% each year.",
            "Incorrect: A 2% difference creates an active net erosion in real wealth."
          ]
        },
        {
          "id": "q_compound_4",
          "question": "Which asset class has historically served as the most effective long-term hedge against consumer price inflation over multi-decade horizons?",
          "options": [
            "Physical cash notes hidden under a mattress",
            "Productive equities and real estate, because businesses can raise prices and properties adjust rents with inflation",
            "Fixed-interest long term bonds with no inflation adjustments",
            "Lottery scratch tickets"
          ],
          "correctIndex": 1,
          "explanation": "Productive real assets (equities and real estate) hold pricing power: companies raise prices as input costs rise, preserving real shareholder returns.",
          "incorrectExplanation": "Cash and fixed unadjusted payments are directly degraded by rising consumer prices.",
          "optionExplanations": [
            "Incorrect: Cash under a mattress is guaranteed to lose purchasing power to inflation year after year.",
            "Correct: Equities and real estate possess inherent pricing power that reflects economic output and inflation adjustments.",
            "Incorrect: Fixed bonds receive fixed coupon payments that buy less and less as prices increase.",
            "Incorrect: Gambling carries negative expected value and offers zero inflation protection."
          ]
        }
      ]
    },
    {
      "id": "lsn_credit_1",
      "courseSlug": "credit-and-debit-mastery",
      "slug": "credit-utilization-and-apr",
      "title": "Credit Scores, Utilization & The Minimum Payment Trap",
      "summary": "How credit cards make money off compound interest working against you, and how to use them as an interest-free float.",
      "order": 1,
      "estimatedMinutes": 15,
      "blocks": [
        {
          "type": "text",
          "title": "The 30% Credit Utilization Benchmark",
          "content": "Credit rating agencies heavily weight your credit utilization ratio (Total Balance divided by Total Credit Limit). Keeping your utilization under 30% (ideally under 10%) maximizes your credit score rating."
        },
        {
          "type": "callout",
          "title": "The Minimum Payment Trap",
          "content": "If you carry a $5,000 balance at 24% APR and pay only the minimum $120 monthly payment, it will take over 22 years to pay off and cost you more than $8,000 in pure interest!"
        },
        {
          "type": "key_takeaway",
          "content": "Treat your credit card like a debit card: never charge what you cannot pay off from your bank checking account before the statement due date."
        }
      ],
      "quiz": [
        {
          "id": "q_credit_1",
          "question": "What is the financially optimal way to use a credit card rewards program?",
          "options": [
            "Carry a large balance from month to month to show credit activity",
            "Pay the entire statement balance in full before the grace period due date every month, incurring zero interest while earning points and consumer protection",
            "Pay only the minimum payment each month",
            "Max out the card to 100% credit limit to prove financial need"
          ],
          "correctIndex": 1,
          "explanation": "Paying the full statement balance every billing cycle incurs $0 interest while providing credit score building, fraud protection, and reward points.",
          "incorrectExplanation": "Carrying a revolving balance incurs high double-digit APR interest that completely wipes out any rewards earned.",
          "optionExplanations": [
            "Incorrect: Carrying a balance triggers 20-30% APR charges; you do not need to pay interest to build credit.",
            "Correct: Paying the statement balance in full incurs 0% interest while capturing rewards and building credit history.",
            "Incorrect: Paying minimums triggers the compound interest debt trap, keeping you in debt for decades.",
            "Incorrect: Maxing out your credit line spikes utilization above 30%, which lowers credit scores."
          ]
        },
        {
          "id": "q_credit_2",
          "question": "You have two credit cards with limits of $4,000 and $6,000 (total credit limit: $10,000). Your statement balance is $2,000. What is your credit utilization ratio?",
          "options": [
            "50%",
            "20% ($2,000 / $10,000)",
            "5%",
            "80%"
          ],
          "correctIndex": 1,
          "explanation": "Credit Utilization = Total Balance / Total Credit Limit ($2,000 / $10,000 = 20%). Keeping utilization under 30% helps your credit score.",
          "incorrectExplanation": "Utilization is calculated against your aggregate available credit limits across revolving accounts.",
          "optionExplanations": [
            "Incorrect: $2,000 out of $10,000 is far lower than 50%.",
            "Correct: $2,000 divided by total $10,000 limit equals exactly 20%, which is comfortably beneath the 30% warning threshold.",
            "Incorrect: 5% of $10,000 would be only $500.",
            "Incorrect: 80% utilization would mean carrying an $8,000 balance."
          ]
        }
      ]
    },
    {
      "id": "lsn_credit_2",
      "courseSlug": "credit-and-debit-mastery",
      "slug": "debt-payoff-snowball-vs-avalanche",
      "title": "Debt Payoff Strategies: Avalanche vs Snowball",
      "summary": "Compare the mathematical precision of the Debt Avalanche against the psychological momentum of the Debt Snowball.",
      "order": 2,
      "estimatedMinutes": 18,
      "blocks": [
        {
          "type": "text",
          "title": "Mathematical Optimization vs Behavioral Psychology",
          "content": "The Debt Avalanche targets the debt with the highest interest rate (APR) first, saving the most total interest. The Debt Snowball targets the smallest dollar balance first, creating quick psychological wins that build behavioral momentum."
        },
        {
          "type": "stat",
          "title": "The Power of the Snowball Effect",
          "content": "Research by the Harvard Business Review found that consumers who tackled small balances first were significantly more likely to eliminate all debt, because emotional motivation is the primary bottleneck in personal finance."
        },
        {
          "type": "key_takeaway",
          "content": "The best debt payoff strategy is the one you will actually stick with until every dollar of high-interest debt is wiped out."
        }
      ],
      "quiz": [
        {
          "id": "q_credit_3",
          "question": "Under the Debt Avalanche method, how do you prioritize multiple debt repayments?",
          "options": [
            "Pay debts alphabetically by bank name",
            "Make minimum payments on all debts, and throw all extra cash at the debt with the highest interest rate (APR) to minimize total interest paid",
            "Pay off the debt with the largest monthly payment first",
            "Stop paying all debts and wait 7 years"
          ],
          "correctIndex": 1,
          "explanation": "The Debt Avalanche targets the highest APR first, saving the absolute maximum amount of interest mathematically.",
          "incorrectExplanation": "Avalanche focuses on interest rate optimization rather than loan balance size or bank names.",
          "optionExplanations": [
            "Incorrect: Alphabetical ordering has zero financial or mathematical basis.",
            "Correct: By eliminating the highest APR loans first, you extinguish the fastest-compounding liabilities first.",
            "Incorrect: Payment size does not reflect the interest rate burden.",
            "Incorrect: Defaulting destroys credit scores and invites legal wage garnishment."
          ]
        },
        {
          "id": "q_credit_4",
          "question": "Why do many financial planners recommend the Debt Snowball (paying smallest balance first) despite it being slightly more expensive mathematically?",
          "options": [
            "Banks pay you a cash bonus when you pay small balances",
            "Quick psychological wins of wiping out accounts build motivational momentum, keeping indebted people from giving up",
            "Credit bureaus do not track balances over $1,000",
            "Small debts compound interest faster than large debts"
          ],
          "correctIndex": 1,
          "explanation": "Personal finance is 20% knowledge and 80% behavior. Early psychological wins from closing accounts keep people committed.",
          "incorrectExplanation": "The Debt Snowball is celebrated for behavioral psychology, not for banking bonuses or false credit reporting rules.",
          "optionExplanations": [
            "Incorrect: Banks do not issue bonuses for closing small debt balances.",
            "Correct: Behavioral psychology shows that visible momentum from eliminating accounts prevents emotional burnout.",
            "Incorrect: Credit reporting agencies track all balances regardless of size.",
            "Incorrect: Compound interest rate depends on the APR percentage, not the balance size."
          ]
        }
      ]
    },
    {
      "id": "lsn_budget_1",
      "courseSlug": "personal-finance-and-budgeting",
      "slug": "the-50-30-20-framework",
      "title": "The 50/30/20 Budgeting Blueprint",
      "summary": "A practical framework: 50% Needs, 30% Wants, and 20% Financial Freedom (Debt reduction & Investing).",
      "order": 1,
      "estimatedMinutes": 12,
      "blocks": [
        {
          "type": "text",
          "title": "Structuring Your Inflow",
          "content": "50% Needs (Housing, food, utilities, health insurance, minimum transportation). 30% Wants (Dining out, entertainment, hobbies, travel). 20% Wealth Building (Emergency fund until 3-6 months covered, retirement investing, extra debt payoff)."
        },
        {
          "type": "callout",
          "title": "Adjusting for High Cost of Living",
          "content": "In high-cost metro areas, your Needs might initially reach 60%. If so, trim your Wants to 20% while protecting your 20% wealth-building allocation."
        },
        {
          "type": "key_takeaway",
          "content": "A budget is not a financial straitjacket; it is permission to spend guilt-free on the things you truly love because your essentials and savings are already locked down."
        }
      ],
      "quiz": [
        {
          "id": "q_budget_1",
          "question": "With a monthly take-home pay of $4,000, how much should be allocated to wealth building under the 50/30/20 rule?",
          "options": [
            "$400 (10%)",
            "$800 (20%)",
            "$1,200 (30%)",
            "$2,000 (50%)"
          ],
          "correctIndex": 1,
          "explanation": "20% of $4,000 equals $800 directed toward emergency reserves, investments, and accelerated debt payoff.",
          "incorrectExplanation": "20% of monthly take-home pay is dedicated to the savings & wealth building category.",
          "optionExplanations": [
            "Incorrect: $400 is only 10% of $4,000.",
            "Correct: 20% of $4,000 = $800, funding emergency funds, debt retirement, and investment accounts.",
            "Incorrect: $1,200 is 30% (the Wants budget).",
            "Incorrect: $2,000 is 50% (the Needs budget)."
          ]
        },
        {
          "id": "q_budget_2",
          "question": "In the 50/30/20 framework, where does a streaming video subscription and dining at upscale restaurants belong?",
          "options": [
            "50% Needs",
            "30% Wants (discretionary lifestyle choices)",
            "20% Savings & Debt",
            "Tax Deductions"
          ],
          "correctIndex": 1,
          "explanation": "Needs are essential for survival and working (groceries, rent, basic utilities). Streaming services and restaurant dining are discretionary Wants.",
          "incorrectExplanation": "Wants include lifestyle upgrades that can be paused during a financial emergency.",
          "optionExplanations": [
            "Incorrect: You can survive and retain employment without streaming services or restaurant meals.",
            "Correct: Entertainment, subscriptions, and restaurant dining are discretionary wants.",
            "Incorrect: Savings involves accumulating capital or extinguishing liabilities.",
            "Incorrect: Personal streaming and leisure dining are not business tax deductions."
          ]
        }
      ]
    },
    {
      "id": "lsn_budget_2",
      "courseSlug": "personal-finance-and-budgeting",
      "slug": "emergency-funds-and-automation",
      "title": "Emergency Reserves & Automated Cash Flow",
      "summary": "How a 3 to 6-month liquid runway protects your portfolio from forced selling during unexpected life shocks.",
      "order": 2,
      "estimatedMinutes": 16,
      "blocks": [
        {
          "type": "text",
          "title": "The Shield of an Emergency Runway",
          "content": "Without cash savings, a single car repair or medical bill forces you into credit card debt or requires liquidating long-term investments during market dips. A 3-6 month emergency fund in a High-Yield Savings Account gives you resilience and peace of mind."
        },
        {
          "type": "stat",
          "title": "The Cost of Forced Selling",
          "content": "Liquidating $10,000 in equities during a market downturn locks in temporary paper losses permanently. An emergency fund guarantees you never sell under duress."
        },
        {
          "type": "callout",
          "title": "Automate Everything",
          "content": "Configure automatic transfers on the day your paycheck deposits: 20% directly into savings and index investments. When savings happens automatically, willpower is never tested."
        }
      ],
      "quiz": [
        {
          "id": "q_budget_3",
          "question": "If your essential monthly living expenses (rent, food, insurance, utilities) total $3,000, how large should a 6-month emergency reserve be?",
          "options": [
            "$3,000",
            "$18,000 ($3,000 × 6 months) kept in a liquid High-Yield Savings Account",
            "$50,000 in volatile penny stocks",
            "$100,000 locked in a 30-year bond"
          ],
          "correctIndex": 1,
          "explanation": "An emergency runway must cover 3 to 6 months of essential survival expenses ($3,000 × 6 = $18,000) kept completely liquid and capital-safe.",
          "incorrectExplanation": "Emergency funds should be liquid and sized against necessary expenses, not invested in speculative or locked instruments.",
          "optionExplanations": [
            "Incorrect: $3,000 only provides 1 month of survival buffer.",
            "Correct: 6 months of $3,000 monthly needs equals $18,000 held in a safe, liquid HYSA.",
            "Incorrect: Speculative stocks can lose 50%+ right when you lose your job during a recession.",
            "Incorrect: Long-term bonds lock up liquidity and can lose market value when interest rates rise."
          ]
        },
        {
          "id": "q_budget_4",
          "question": "What does the 'Pay Yourself First' principle mean in automated personal finance?",
          "options": [
            "Spend all your paycheck first, and save whatever scraps are left at the end of the month",
            "Automatically route your savings and investments immediately on payday before you have the chance to spend it on discretionary wants",
            "Buy luxury goods on credit cards before paying rent",
            "Take out a payday loan every Friday"
          ],
          "correctIndex": 1,
          "explanation": "Paying yourself first automates saving on payday, removing emotional discipline friction so you live on what remains.",
          "incorrectExplanation": "Saving what is left over fails because lifestyle spending naturally expands to consume all available checking account cash.",
          "optionExplanations": [
            "Incorrect: Leaving savings to the end of the month almost always results in saving zero.",
            "Correct: Automatically diverting savings on payday guarantees wealth accumulation occurs before discretionary spending.",
            "Incorrect: Buying luxury goods on credit destroys financial health.",
            "Incorrect: Payday loans carry predatory 400%+ APR rates."
          ]
        }
      ]
    },
    {
      "id": "lsn_ebitda_1",
      "courseSlug": "business-fundamentals-and-ebitda",
      "slug": "understanding-ebitda-and-margins",
      "title": "Decoding EBITDA & Financial Statements",
      "summary": "Earnings Before Interest, Taxes, Depreciation, and Amortization—why investors use it to measure core operational profitability.",
      "order": 1,
      "estimatedMinutes": 18,
      "blocks": [
        {
          "type": "text",
          "title": "Why EBITDA Matters",
          "content": "EBITDA strips away accounting distortions (depreciation schedules) and financing decisions (interest expense from debt), allowing analysts to compare the pure operating cash generating ability of two competing companies side-by-side."
        },
        {
          "type": "stat",
          "title": "The Bridge from Revenue to Net Income",
          "content": "Revenue - COGS = Gross Profit; Gross Profit - Operating Expenses = EBITDA; EBITDA - D&A = Operating Profit (EBIT); EBIT - Interest - Taxes = Net Income (The Bottom Line)."
        },
        {
          "type": "key_takeaway",
          "content": "EBITDA margin (EBITDA divided by Total Revenue) measures how many cents of raw operating profit a company keeps from every dollar of sales."
        }
      ],
      "quiz": [
        {
          "id": "q_ebitda_1",
          "question": "A company has $1,000,000 in Revenue, $400,000 in Cost of Goods Sold, and $300,000 in Operating Expenses (excluding depreciation). What is its EBITDA?",
          "options": [
            "$1,000,000",
            "$300,000 ($1,000,000 - $400,000 - $300,000)",
            "$600,000",
            "$100,000"
          ],
          "correctIndex": 1,
          "explanation": "Gross Profit = $1,000,000 - $400,000 = $600,000. EBITDA = Gross Profit - Operating Expenses ($600,000 - $300,000) = $300,000.",
          "incorrectExplanation": "EBITDA reflects operating revenue minus direct production costs (COGS) and operational overhead (OpEx), prior to interest, taxes, and depreciation.",
          "optionExplanations": [
            "Incorrect: $1,000,000 is top-line Gross Revenue before any expenses.",
            "Correct: $1,000,000 Revenue - $400,000 COGS - $300,000 OpEx leaves $300,000 in core operating EBITDA.",
            "Incorrect: $600,000 is Gross Profit ($1M - $400K) before operating expenses.",
            "Incorrect: Subtracting extra items that were already excluded produces an incorrect figure."
          ]
        },
        {
          "id": "q_ebitda_2",
          "question": "Why do private equity investors and corporate acquirers add back Depreciation and Amortization to operating profit when calculating EBITDA?",
          "options": [
            "Because depreciation is illegal under GAAP accounting",
            "Depreciation is a non-cash accounting expense reflecting past capital expenditures rather than current operating cash flows",
            "To make unprofitable companies look artificially profitable to fool tax authorities",
            "Because amortization represents money paid to company employees"
          ],
          "correctIndex": 1,
          "explanation": "Depreciation allocates historical equipment purchases over useful life. It does not require writing a check this year, so adding it back reveals raw operating cash flow.",
          "incorrectExplanation": "Depreciation is a standard GAAP convention, but it is non-cash in the current period.",
          "optionExplanations": [
            "Incorrect: Depreciation is a required GAAP and IFRS accounting standard.",
            "Correct: Depreciation spreads prior capital expenditure across years without draining current cash reserves.",
            "Incorrect: EBITDA is a non-GAAP operational metric and is not used for IRS tax calculations.",
            "Incorrect: Employee payroll is an operating expense, not amortization of intangible assets."
          ]
        }
      ]
    },
    {
      "id": "lsn_ebitda_2",
      "courseSlug": "business-fundamentals-and-ebitda",
      "slug": "unit-economics-cac-and-ltv",
      "title": "Unit Economics: Customer Acquisition Cost & Lifetime Value",
      "summary": "Why high top-line growth burns startups to the ground if LTV:CAC unit economics are inverted.",
      "order": 2,
      "estimatedMinutes": 20,
      "blocks": [
        {
          "type": "text",
          "title": "The Pillars of Unit Economics",
          "content": "Customer Acquisition Cost (CAC) is the total marketing and sales expense spent to acquire one paying customer. Customer Lifetime Value (LTV) is the gross profit that customer will generate over their entire relationship with your business."
        },
        {
          "type": "stat",
          "title": "The Golden 3:1 Ratio",
          "content": "A healthy business strives for an LTV:CAC ratio of at least 3:1. An LTV:CAC under 1:1 means the company loses money on every customer acquired and cannot survive without constant external funding."
        },
        {
          "type": "key_takeaway",
          "content": "You cannot make up for negative unit margins with volume. Growth only creates value if unit economics are fundamentally profitable."
        }
      ],
      "quiz": [
        {
          "id": "q_ebitda_3",
          "question": "A SaaS startup spends $200 on marketing to acquire a subscriber who pays $50/month and stays for an average of 16 months ($800 Customer Lifetime Value). What is their LTV:CAC ratio?",
          "options": [
            "1:4 (Losing money on every user)",
            "4:1 ($800 LTV / $200 CAC), indicating strong, highly profitable unit economics",
            "1:1 break-even",
            "50:1"
          ],
          "correctIndex": 1,
          "explanation": "LTV:CAC = $800 / $200 = 4.0x. A healthy business generally aims for an LTV:CAC of 3:1 or higher.",
          "incorrectExplanation": "Divide Lifetime Value ($800) by Acquisition Cost ($200) to find the unit economics return multiplier.",
          "optionExplanations": [
            "Incorrect: The ratio is $800 to $200, which is positive 4:1, not an inverted 1:4.",
            "Correct: An LTV of $800 divided by a CAC of $200 yields a stellar 4:1 return on customer acquisition.",
            "Incorrect: 1:1 would mean LTV equals CAC ($200), leaving zero room for overhead.",
            "Incorrect: 50:1 would require an LTV of $10,000 for a $200 CAC."
          ]
        },
        {
          "id": "q_ebitda_4",
          "question": "Why can a business with $10 million in revenue still face bankruptcy even if its sales are growing by 100% year-over-year?",
          "options": [
            "Growth is legally penalized by commercial banks",
            "If Cost of Goods Sold and Customer Acquisition exceed revenue (negative unit margins), every incremental sale burns more cash than it collects",
            "Companies are forced to shut down when they cross 100 employees",
            "Customers are not allowed to pay for goods with digital currency"
          ],
          "correctIndex": 1,
          "explanation": "You cannot make up for negative unit margins with volume. Selling a $10 widget for $8 means the faster you grow, the faster you run out of cash.",
          "incorrectExplanation": "Growth magnifies underlying flaws in unit economics. Unprofitable unit sales accelerate cash burn.",
          "optionExplanations": [
            "Incorrect: Banks celebrate profitable growth and lend against healthy balance sheets.",
            "Correct: Fast growth with negative unit contribution margins burns cash reserves at exponential speed.",
            "Incorrect: Headcount size has no statutory shutdown triggers.",
            "Incorrect: Payment methods have no direct relationship to fundamental corporate solvency."
          ]
        }
      ]
    },
    {
      "id": "lsn_career_1",
      "courseSlug": "career-skills-and-side-hustles",
      "slug": "unit-economics-of-freelancing",
      "title": "Unit Economics of Skills & Side Hustles",
      "summary": "Transitioning from trading linear hours for dollars into productized services and recurring revenue.",
      "order": 1,
      "estimatedMinutes": 15,
      "blocks": [
        {
          "type": "text",
          "title": "The Hourly Rate Trap",
          "content": "If you charge $50/hour, you can never scale past 40 hours a week without burning out. By pricing on value created (Value-Based Pricing) or productizing your delivery, you decouple income from linear time expenditure."
        },
        {
          "type": "stat",
          "title": "Effective Hourly Rate (EHR)",
          "content": "EHR = Total Revenue / Total Hours Invested (including client acquisition, scoping, revisions, and administration). Many freelancers charging $100/hour discover their actual EHR is under $35/hour due to unbilled administrative scope creep."
        },
        {
          "type": "key_takeaway",
          "content": "Price on the financial value your solution unlocks for the client, not on the minutes it takes you to produce it."
        }
      ],
      "quiz": [
        {
          "id": "q_career_1",
          "question": "What is the primary advantage of Value-Based Pricing over Hourly Billing?",
          "options": [
            "It forces you to work longer hours every week",
            "It aligns your compensation with the financial impact generated for the client rather than the time taken to deliver it",
            "It eliminates the need to sign contracts",
            "It makes tax reporting unnecessary"
          ],
          "correctIndex": 1,
          "explanation": "Value-based pricing captures a percentage of the economic upside created, rewarding efficiency and expertise rather than slow work.",
          "incorrectExplanation": "Hourly billing penalizes mastery: the faster you solve a client's problem, the less money you earn.",
          "optionExplanations": [
            "Incorrect: Hourly billing forces long hours; value pricing decouples income from time spent.",
            "Correct: Pricing based on the economic value generated aligns your rewards with client success rather than slow hours.",
            "Incorrect: Professional engagements still require clear legal agreements and scopes of work.",
            "Incorrect: All commercial side income remains subject to local income tax regulations."
          ]
        },
        {
          "id": "q_career_2",
          "question": "You take on a freelance website project for a fixed fee of $3,000. It takes you 20 hours to design, 5 hours of client communication, and 5 hours of revisions (30 hours total). What was your Effective Hourly Rate (EHR)?",
          "options": [
            "$50/hour",
            "$100/hour ($3,000 / 30 hours)",
            "$150/hour",
            "$300/hour"
          ],
          "correctIndex": 1,
          "explanation": "EHR = Total Project Fee / Total Hours Spent ($3,000 / 30 hours = $100/hr). Tracking communication and revision time prevents scope creep.",
          "incorrectExplanation": "Always include all overhead, communication, and revision hours when calculating true project hourly realization.",
          "optionExplanations": [
            "Incorrect: $3,000 divided by 30 hours is $100, not $50.",
            "Correct: Total revenue ($3,000) divided by all 30 invested hours yields an Effective Hourly Rate of $100/hr.",
            "Incorrect: $150/hr would require completing the entire project in 20 hours.",
            "Incorrect: $300/hr would require finishing the project in only 10 hours."
          ]
        }
      ]
    },
    {
      "id": "lsn_career_2",
      "courseSlug": "career-skills-and-side-hustles",
      "slug": "productizing-services-and-scalability",
      "title": "Productizing Services & Scalable Income Engines",
      "summary": "How to package bespoke freelance tasks into standardized products, retainers, and digital assets that generate leverage.",
      "order": 2,
      "estimatedMinutes": 20,
      "blocks": [
        {
          "type": "text",
          "title": "The Architecture of a Productized Service",
          "content": "Instead of writing bespoke 10-page proposals for every prospect, productized services offer a standardized scope, transparent fixed price, defined turnaround time, and repeatable process. For example: 'Conversion Audit for $997 in 48 hours.'"
        },
        {
          "type": "callout",
          "title": "Permissionless Leverage: Code & Media",
          "content": "Naval Ravikant highlights that code and media are forms of permissionless leverage. You build a digital product, software tool, or educational video once, and it can be purchased by thousands while you sleep with zero marginal replication cost."
        },
        {
          "type": "key_takeaway",
          "content": "Move up the value chain: from Hourly Worker -> Specialized Freelancer -> Productized Service Provider -> Asset Owner."
        }
      ],
      "quiz": [
        {
          "id": "q_career_3",
          "question": "What distinguishes a 'productized service' from custom bespoke freelancing?",
          "options": [
            "Productized services are only sold to government agencies",
            "It features a standardized scope, fixed price, predictable turnaround time, and repeatable process, making it easily delegable and scalable",
            "It requires hiring 50 full-time software engineers before launching",
            "Clients are charged random amounts based on emotional feelings"
          ],
          "correctIndex": 1,
          "explanation": "Productization turns service delivery into a standardized product with clear boundaries, predictable margins, and repeatable workflows.",
          "incorrectExplanation": "Productized services turn complex custom proposals into standardized packages with predictable boundaries.",
          "optionExplanations": [
            "Incorrect: Productized services can be sold to individuals, small businesses, and enterprise clients alike.",
            "Correct: Fixed scope, transparent pricing, and structured workflows eliminate custom proposal friction and enable scaling.",
            "Incorrect: Solo founders regularly run productized services with zero employees.",
            "Incorrect: Transparent, upfront pricing is the core hallmark of a productized offering."
          ]
        },
        {
          "id": "q_career_4",
          "question": "According to modern wealth principles, which form of leverage has near-zero marginal cost of replication and requires no permission to build?",
          "options": [
            "Borrowing bank capital",
            "Code and media (software, digital courses, written guides, content)",
            "Hiring physical human labor",
            "Buying expensive office real estate"
          ],
          "correctIndex": 1,
          "explanation": "Code and media allow you to create an asset once and distribute it to a million people at near-zero marginal cost without seeking permission.",
          "incorrectExplanation": "Labor and capital require permission and linear management; code and media scale permissionlessly.",
          "optionExplanations": [
            "Incorrect: Bank capital requires loan approvals, collateral, and interest payments.",
            "Correct: Code and digital media work for you while you sleep, duplicating infinite copies at near-zero marginal cost.",
            "Incorrect: Managing human employees carries significant coordination overhead and employment permission.",
            "Incorrect: Office real estate is capital-intensive and carries high fixed overhead costs."
          ]
        }
      ]
    }
  ];

  const achievements: AchievementEntity[] = [
    {
      code: "FIRST_STEP",
      title: "First Step",
      description: "Complete your very first financial knowledge lesson.",
      icon: "Footprints",
      xpBonus: 50,
    },
    {
      code: "PERFECT_SCORE",
      title: "Quiz Whiz",
      description: "Score 100% on any interactive lesson quiz.",
      icon: "Award",
      xpBonus: 100,
    },
    {
      code: "STREAK_3",
      title: "Daily Habit",
      description: "Maintain a 3-day active learning streak.",
      icon: "Flame",
      xpBonus: 150,
    },
    {
      code: "SIM_COMPLETED",
      title: "Simulator Master",
      description: "Complete a full financial simulation scenario.",
      icon: "Cpu",
      xpBonus: 200,
    },
    {
      code: "BATTLE_CHAMP",
      title: "Battle Tested",
      description: "Compete and win a 1v1 financial trivia battle.",
      icon: "Swords",
      xpBonus: 250,
    },
    {
      code: "CLASSROOM_SCHOLAR",
      title: "Classroom Scholar",
      description: "Enroll in a verified educator classroom.",
      icon: "GraduationCap",
      xpBonus: 100,
    },
  ];

  const userAchievements: UserAchievementEntity[] = [
    {
      id: "ua_1",
      userId: "usr_student_alex",
      achievementCode: "FIRST_STEP",
      unlockedAt: "2026-11-02T12:00:00Z",
    },
    {
      id: "ua_2",
      userId: "usr_student_alex",
      achievementCode: "STREAK_3",
      unlockedAt: "2026-11-05T09:30:00Z",
    },
    {
      id: "ua_3",
      userId: "usr_pro_priya",
      achievementCode: "FIRST_STEP",
      unlockedAt: "2026-10-26T16:00:00Z",
    },
    {
      id: "ua_4",
      userId: "usr_pro_priya",
      achievementCode: "PERFECT_SCORE",
      unlockedAt: "2026-10-28T18:15:00Z",
    },
    {
      id: "ua_5",
      userId: "usr_pro_priya",
      achievementCode: "SIM_COMPLETED",
      unlockedAt: "2026-11-01T20:00:00Z",
    },
  ];

  const classrooms: ClassroomEntity[] = [
    {
      id: "cls_oak_econ",
      code: "OAK-ECON",
      name: "AP Economics & Wealth Building 2026",
      subject: "Economics & Personal Finance",
      educatorId: "usr_edu_sarah",
      educatorName: "Sarah Jenkins",
      institution: "Oakridge High School",
      studentIds: ["usr_student_alex"],
      createdAt: "2026-09-20T10:00:00Z",
    },
    {
      id: "cls_young_investors",
      code: "GROW-2026",
      name: "Young Entrepreneurs & Investors Club",
      subject: "Business & Investments",
      educatorId: "usr_edu_sarah",
      educatorName: "Sarah Jenkins",
      institution: "Oakridge High School",
      studentIds: ["usr_student_alex"],
      createdAt: "2026-10-05T11:00:00Z",
    },
  ];

  const assignments: AssignmentEntity[] = [
    {
      id: "asg_1",
      classroomId: "cls_oak_econ",
      title: "Master Equity Ownership & Order Books",
      courseSlug: "stock-market-fundamentals",
      lessonSlug: "what-is-a-stock",
      dueDate: "2026-12-01T23:59:59Z",
      createdAt: "2026-11-01T08:00:00Z",
    },
    {
      id: "asg_2",
      classroomId: "cls_oak_econ",
      title: "Analyze The Power of Compound Interest",
      courseSlug: "inflation-and-compound-interest",
      lessonSlug: "rule-of-72-and-compound-growth",
      dueDate: "2026-12-15T23:59:59Z",
      createdAt: "2026-11-05T08:00:00Z",
    },
  ];

  const assignmentSubmissions: AssignmentSubmissionEntity[] = [
    {
      id: "sub_1",
      assignmentId: "asg_1",
      classroomId: "cls_oak_econ",
      studentId: "usr_student_alex",
      studentName: "Alex Chen",
      score: 100,
      completedAt: "2026-11-02T12:05:00Z",
    },
  ];

  const communityPosts: CommunityPostEntity[] = [
    {
      id: "post_1",
      userId: "usr_pro_priya",
      authorName: "Priya Sharma",
      authorRole: "Young Professional",
      category: "Stock Investing",
      title: "Why broad market index funds beat 90% of stock pickers over 15 years",
      content: "After running multiple simulations in FinGrow's Investment Challenge, I noticed how trading fees and short-term taxes drastically eat away at returns. When you hold an all-weather index fund, your time horizon does the heavy lifting. How do you all split your index vs individual company stock allocations?",
      likes: 18,
      likedBy: ["usr_student_alex"],
      commentsCount: 3,
      createdAt: "2026-11-08T15:20:00Z",
    },
    {
      id: "post_2",
      userId: "usr_student_alex",
      authorName: "Alex Chen",
      authorRole: "Student",
      category: "Personal Finance",
      title: "First time managing a budget: emergency funds feel amazing",
      content: "I just finished the First Salary Simulator. Realizing that having 3 months of emergency expenses saved prevents taking high-interest credit card debt was an eye-opener. Excited to graduate and put the 50/30/20 rule to work in real life!",
      likes: 24,
      likedBy: ["usr_pro_priya", "usr_edu_sarah"],
      commentsCount: 2,
      createdAt: "2026-11-10T11:45:00Z",
    },
    {
      id: "post_3",
      userId: "usr_edu_sarah",
      authorName: "Sarah Jenkins",
      authorRole: "Educator",
      category: "Startups & Business",
      title: "Teaching EBITDA to high schoolers using the Startup Builder simulation",
      content: "My class ran the Startup Builder simulation yesterday! Watching students realize that high revenue doesn't equal profit if customer acquisition costs (CAC) outpace customer lifetime value (LTV) sparked incredible classroom debates.",
      likes: 31,
      likedBy: ["usr_student_alex", "usr_pro_priya"],
      commentsCount: 4,
      createdAt: "2026-11-11T09:10:00Z",
    },
  ];

  const communityComments: CommunityCommentEntity[] = [
    {
      id: "cmt_1",
      postId: "post_1",
      userId: "usr_student_alex",
      authorName: "Alex Chen",
      authorRole: "Student",
      content: "I follow an 80/20 rule: 80% in broad global index funds, and 20% in individual companies that I actually understand and use daily.",
      createdAt: "2026-11-08T16:00:00Z",
    },
    {
      id: "cmt_2",
      postId: "post_2",
      userId: "usr_pro_priya",
      authorName: "Priya Sharma",
      authorRole: "Young Professional",
      content: "Awesome insight Alex! High yield savings accounts (HYSA) make emergency funds even better since your safety net earns 4-5% interest while staying completely liquid.",
      createdAt: "2026-11-10T12:30:00Z",
    },
  ];

  const moderationReports: ModerationReportEntity[] = [
    {
      id: "rep_1",
      targetType: "post",
      targetId: "post_sample_spam",
      reporterUserId: "usr_pro_priya",
      reporterName: "Priya Sharma",
      reason: "Potential external promotional spam link detected",
      status: "resolved",
      resolutionNotes: "Content reviewed and flagged per FinGrow educational community guidelines.",
      createdAt: "2026-11-05T14:00:00Z",
      resolvedAt: "2026-11-05T14:30:00Z",
    },
  ];

  const auditLogs: AuditLogEntity[] = [
    {
      id: "aud_1",
      actorId: "usr_admin_root",
      actorName: "FinGrow Platform Admin",
      action: "PLATFORM_INITIALIZATION",
      target: "System Core",
      metadata: { version: "1.0.0", environment: "Production Ready" },
      timestamp: "2026-11-01T00:00:00Z",
    },
    {
      id: "aud_2",
      actorId: "usr_edu_sarah",
      actorName: "Sarah Jenkins",
      action: "CLASSROOM_CREATED",
      target: "cls_oak_econ",
      metadata: { code: "OAK-ECON", subject: "Economics" },
      timestamp: "2026-09-20T10:00:00Z",
    },
    {
      id: "aud_3",
      actorId: "usr_admin_root",
      actorName: "FinGrow Platform Admin",
      action: "MODERATION_ACTION",
      target: "rep_1",
      metadata: { decision: "Resolved", notes: "Safe community policy enforced" },
      timestamp: "2026-11-05T14:30:00Z",
    },
  ];

  return {
    users,
    profiles,
    courses,
    lessons,
    achievements,
    userAchievements,
    classrooms,
    assignments,
    assignmentSubmissions,
    communityPosts,
    communityComments,
    moderationReports,
    auditLogs,
  };
}

