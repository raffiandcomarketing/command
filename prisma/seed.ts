import { PrismaClient } from "@prisma/client";
import bcryptjs from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Starting database seed...");

  // ==================== SEED USERS ====================
  console.log("Creating users...");

  const adminPassword = await bcryptjs.hash("admin123", 10);
  const memberPassword = await bcryptjs.hash("member123", 10);

  const adminUser = await prisma.user.upsert({
    where: { email: "admin@raffi.com" },
    update: {},
    create: {
      email: "admin@raffi.com",
      name: "Admin User",
      passwordHash: adminPassword,
      role: "ADMIN",
      isActive: true,
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=admin",
    },
  });

  const executiveUser = await prisma.user.create({
    data: {
      email: "executive@raffi.com",
      name: "Executive Officer",
      passwordHash: memberPassword,
      role: "EXECUTIVE",
      isActive: true,
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=executive",
    },
  });

  const managerUser = await prisma.user.create({
    data: {
      email: "manager@raffi.com",
      name: "Manager User",
      passwordHash: memberPassword,
      role: "MANAGER",
      isActive: true,
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=manager",
    },
  });

  const memberUser = await prisma.user.create({
    data: {
      email: "member@raffi.com",
      name: "Team Member",
      passwordHash: memberPassword,
      role: "MEMBER",
      isActive: true,
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=member",
    },
  });

  const viewerUser = await prisma.user.create({
    data: {
      email: "viewer@raffi.com",
      name: "Viewer User",
      passwordHash: memberPassword,
      role: "VIEWER",
      isActive: true,
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=viewer",
    },
  });

  console.log("✓ Users created");

  // ==================== SEED DEPARTMENTS ====================
  console.log("Creating departments...");

  const departments = await Promise.all([
    prisma.department.create({
      data: {
        name: "Executive Leadership",
        slug: "executive-leadership",
        description: "C-suite and executive decision makers",
        icon: "👔",
        color: "#1f2937",
        sortOrder: 0,
        isActive: true,
      },
    }),
    prisma.department.create({
      data: {
        name: "Sales",
        slug: "sales",
        description: "Direct sales, account management, and revenue generation",
        icon: "💰",
        color: "#10b981",
        sortOrder: 1,
        isActive: true,
      },
    }),
    prisma.department.create({
      data: {
        name: "Marketing",
        slug: "marketing",
        description: "Brand, digital marketing, campaigns, and customer acquisition",
        icon: "📢",
        color: "#f59e0b",
        sortOrder: 2,
        isActive: true,
      },
    }),
    prisma.department.create({
      data: {
        name: "Operations",
        slug: "operations",
        description: "Supply chain, inventory, logistics, and process management",
        icon: "⚙️",
        color: "#6366f1",
        sortOrder: 3,
        isActive: true,
      },
    }),
    prisma.department.create({
      data: {
        name: "Customer Success",
        slug: "customer-success",
        description: "Customer support, retention, and satisfaction",
        icon: "😊",
        color: "#ec4899",
        sortOrder: 4,
        isActive: true,
      },
    }),
    prisma.department.create({
      data: {
        name: "Finance",
        slug: "finance",
        description: "Accounting, budgeting, financial planning, and reporting",
        icon: "💳",
        color: "#8b5cf6",
        sortOrder: 5,
        isActive: true,
      },
    }),
    prisma.department.create({
      data: {
        name: "Human Resources",
        slug: "human-resources",
        description: "Recruitment, employee relations, payroll, and development",
        icon: "👥",
        color: "#3b82f6",
        sortOrder: 6,
        isActive: true,
      },
    }),
    prisma.department.create({
      data: {
        name: "Product",
        slug: "product",
        description: "Product strategy, development, and roadmap",
        icon: "🎯",
        color: "#ef4444",
        sortOrder: 7,
        isActive: true,
      },
    }),
    prisma.department.create({
      data: {
        name: "Technology",
        slug: "technology",
        description: "IT infrastructure, security, and systems",
        icon: "💻",
        color: "#06b6d4",
        sortOrder: 8,
        isActive: true,
      },
    }),
    prisma.department.create({
      data: {
        name: "Quality Assurance",
        slug: "quality-assurance",
        description: "Testing, quality control, and compliance",
        icon: "✓",
        color: "#14b8a6",
        sortOrder: 9,
        isActive: true,
      },
    }),
    prisma.department.create({
      data: {
        name: "Analytics",
        slug: "analytics",
        description: "Data analysis, business intelligence, and reporting",
        icon: "📊",
        color: "#f97316",
        sortOrder: 10,
        isActive: true,
      },
    }),
    prisma.department.create({
      data: {
        name: "Legal",
        slug: "legal",
        description: "Contracts, compliance, and legal affairs",
        icon: "⚖️",
        color: "#64748b",
        sortOrder: 11,
        isActive: true,
      },
    }),
    prisma.department.create({
      data: {
        name: "Procurement",
        slug: "procurement",
        description: "Vendor management and purchasing",
        icon: "🛒",
        color: "#d97706",
        sortOrder: 12,
        isActive: true,
      },
    }),
    prisma.department.create({
      data: {
        name: "Real Estate & Facilities",
        slug: "real-estate-facilities",
        description: "Facilities management and real estate operations",
        icon: "🏢",
        color: "#7c3aed",
        sortOrder: 13,
        isActive: true,
      },
    }),
    prisma.department.create({
      data: {
        name: "Brand & Design",
        slug: "brand-design",
        description: "Creative design, brand development, and visual identity",
        icon: "🎨",
        color: "#ec4899",
        sortOrder: 14,
        isActive: true,
      },
    }),
    prisma.department.create({
      data: {
        name: "Communications",
        slug: "communications",
        description: "Internal and external communications",
        icon: "📝",
        color: "#0ea5e9",
        sortOrder: 15,
        isActive: true,
      },
    }),
    prisma.department.create({
      data: {
        name: "Risk & Compliance",
        slug: "risk-compliance",
        description: "Risk management and regulatory compliance",
        icon: "🛡️",
        color: "#ef4444",
        sortOrder: 16,
        isActive: true,
      },
    }),
    prisma.department.create({
      data: {
        name: "Store Operations",
        slug: "store-operations",
        description: "Physical store management and retail operations",
        icon: "🏪",
        color: "#f59e0b",
        sortOrder: 17,
        isActive: true,
      },
    }),
  ]);

  console.log("✓ Departments created");

  // ==================== SEED ROLES ====================
  console.log("Creating roles...");

  const rolesByDepartment: { [key: string]: string[] } = {
    "executive-leadership": [
      "Chief Executive Officer",
      "Chief Financial Officer",
      "Chief Operations Officer",
      "Executive Director",
      "Board Member",
      "Advisor",
      "Strategic Lead",
      "Executive Assistant",
      "Chief of Staff",
    ],
    sales: [
      "Sales Director",
      "Regional Manager",
      "Account Executive",
      "Sales Representative",
      "Sales Development Rep",
      "Sales Ops Manager",
      "Territory Manager",
      "Sales Coordinator",
      "Account Manager",
    ],
    marketing: [
      "Marketing Director",
      "Campaign Manager",
      "Digital Marketer",
      "Brand Manager",
      "Content Strategist",
      "Social Media Manager",
      "Marketing Analyst",
      "Marketing Coordinator",
      "Email Marketing Specialist",
    ],
    operations: [
      "Operations Director",
      "Operations Manager",
      "Process Manager",
      "Supply Chain Manager",
      "Logistics Coordinator",
      "Inventory Manager",
      "Quality Manager",
      "Operations Analyst",
      "Operations Coordinator",
    ],
    "customer-success": [
      "Director of Customer Success",
      "Customer Success Manager",
      "Support Manager",
      "Support Specialist",
      "Customer Advocate",
      "Onboarding Specialist",
      "Success Coordinator",
      "Customer Trainer",
      "Support Representative",
    ],
    finance: [
      "Finance Director",
      "Controller",
      "Accountant",
      "Financial Analyst",
      "Budget Manager",
      "Accounts Manager",
      "Finance Coordinator",
      "Auditor",
      "Treasury Manager",
    ],
    "human-resources": [
      "HR Director",
      "HR Manager",
      "Recruiter",
      "HR Specialist",
      "Compensation Analyst",
      "Training Manager",
      "HR Coordinator",
      "Talent Acquisition Specialist",
      "Employee Relations Manager",
    ],
    product: [
      "VP Product",
      "Product Manager",
      "Senior Product Manager",
      "Associate Product Manager",
      "Product Analyst",
      "Product Designer",
      "Product Operations",
      "Product Strategist",
      "Product Coordinator",
    ],
    technology: [
      "CTO",
      "Engineering Manager",
      "Senior Engineer",
      "Software Engineer",
      "DevOps Engineer",
      "Data Engineer",
      "Systems Administrator",
      "IT Support",
      "Security Engineer",
    ],
    "quality-assurance": [
      "QA Director",
      "QA Manager",
      "QA Lead",
      "QA Engineer",
      "Test Automation Engineer",
      "Quality Analyst",
      "QA Coordinator",
      "Test Manager",
      "Quality Specialist",
    ],
    analytics: [
      "Analytics Director",
      "Analytics Manager",
      "Data Analyst",
      "Senior Analyst",
      "BI Developer",
      "Analytics Engineer",
      "Data Scientist",
      "Analytics Coordinator",
      "Reporting Specialist",
    ],
    legal: [
      "General Counsel",
      "Legal Director",
      "Attorney",
      "Legal Manager",
      "Paralegal",
      "Contracts Manager",
      "Legal Analyst",
      "Compliance Officer",
      "Legal Coordinator",
    ],
    procurement: [
      "Procurement Director",
      "Procurement Manager",
      "Buyer",
      "Sourcing Manager",
      "Vendor Manager",
      "Procurement Specialist",
      "Procurement Analyst",
      "Contracts Specialist",
      "Procurement Coordinator",
    ],
    "real-estate-facilities": [
      "Facilities Director",
      "Facilities Manager",
      "Real Estate Manager",
      "Facilities Coordinator",
      "Maintenance Manager",
      "Building Manager",
      "Space Planner",
      "Facilities Specialist",
      "Custodial Manager",
    ],
    "brand-design": [
      "Creative Director",
      "Design Manager",
      "Graphic Designer",
      "UX/UI Designer",
      "Brand Manager",
      "Art Director",
      "Motion Designer",
      "Design Coordinator",
      "Junior Designer",
    ],
    communications: [
      "Communications Director",
      "Communications Manager",
      "Content Manager",
      "PR Manager",
      "Internal Communications",
      "Communications Specialist",
      "Social Media Manager",
      "Communications Coordinator",
      "Events Manager",
    ],
    "risk-compliance": [
      "Compliance Officer",
      "Risk Manager",
      "Compliance Manager",
      "Risk Analyst",
      "Compliance Specialist",
      "Audit Manager",
      "Regulatory Specialist",
      "Risk Coordinator",
      "Compliance Coordinator",
    ],
    "store-operations": [
      "Store Director",
      "Store Manager",
      "Assistant Manager",
      "Shift Supervisor",
      "Floor Associate",
      "Visual Merchandiser",
      "Stock Manager",
      "Store Coordinator",
      "Customer Service Lead",
    ],
  };

  const rolesCreated: { [key: string]: string } = {};

  for (const dept of departments) {
    const deptRoles = rolesByDepartment[dept.slug] || [
      "Manager",
      "Specialist",
      "Coordinator",
    ];

    for (let i = 0; i < deptRoles.length; i++) {
      const role = await prisma.role.create({
        data: {
          title: deptRoles[i],
          slug: deptRoles[i]
            .toLowerCase()
            .replace(/\s+/g, "-")
            .replace(/\//g, "-"),
          description: `${deptRoles[i]} in ${dept.name}`,
          departmentId: dept.id,
          sortOrder: i,
          isActive: true,
        },
      });

      rolesCreated[`${dept.slug}-${i}`] = role.id;
    }
  }

  console.log("✓ Roles created");

  // ==================== SEED PERMISSIONS ====================
  console.log("Creating permissions...");

  const permissionsList = [
    {
      name: "Create Task",
      slug: "create-task",
      module: "tasks",
      description: "Create new tasks",
    },
    {
      name: "Edit Task",
      slug: "edit-task",
      module: "tasks",
      description: "Edit existing tasks",
    },
    {
      name: "Delete Task",
      slug: "delete-task",
      module: "tasks",
      description: "Delete tasks",
    },
    {
      name: "View Reports",
      slug: "view-reports",
      module: "reporting",
      description: "View all reports",
    },
    {
      name: "Create Workflow",
      slug: "create-workflow",
      module: "workflows",
      description: "Create new workflows",
    },
    {
      name: "Manage Users",
      slug: "manage-users",
      module: "users",
      description: "Create and manage users",
    },
    {
      name: "Manage Departments",
      slug: "manage-departments",
      module: "departments",
      description: "Create and manage departments",
    },
    {
      name: "View Analytics",
      slug: "view-analytics",
      module: "analytics",
      description: "Access analytics dashboard",
    },
    {
      name: "Approve Requests",
      slug: "approve-requests",
      module: "approvals",
      description: "Approve pending requests",
    },
    {
      name: "View Audit Logs",
      slug: "view-audit-logs",
      module: "audit",
      description: "View audit logs",
    },
  ];

  for (const perm of permissionsList) {
    await prisma.permission.create({
      data: perm,
    });
  }

  console.log("✓ Permissions created");

  // ==================== SEED USER DEPARTMENTS ====================
  console.log("Creating user department assignments...");

  const executiveDept = departments.find((d) => d.slug === "executive-leadership");
  const marketingDept = departments.find((d) => d.slug === "marketing");
  const salesDept = departments.find((d) => d.slug === "sales");
  const operationsDept = departments.find((d) => d.slug === "operations");

  if (executiveDept && marketingDept && salesDept && operationsDept) {
    const ceoRole = rolesCreated["executive-leadership-0"];
    const directorRole = rolesCreated["marketing-0"];
    const salesDirRole = rolesCreated["sales-0"];
    const opsManagerRole = rolesCreated["operations-1"];

    await prisma.userDepartment.createMany({
      data: [
        {
          userId: adminUser.id,
          departmentId: executiveDept.id,
          roleId: ceoRole,
          isPrimary: true,
        },
        {
          userId: executiveUser.id,
          departmentId: executiveDept.id,
          roleId: ceoRole,
          isPrimary: true,
        },
        {
          userId: managerUser.id,
          departmentId: marketingDept.id,
          roleId: directorRole,
          isPrimary: true,
        },
        {
          userId: memberUser.id,
          departmentId: salesDept.id,
          roleId: salesDirRole,
          isPrimary: true,
        },
        {
          userId: viewerUser.id,
          departmentId: operationsDept.id,
          roleId: opsManagerRole,
          isPrimary: true,
        },
      ],
    });
  }

  console.log("✓ User department assignments created");

  // ==================== SEED KPI DEFINITIONS ====================
  console.log("Creating KPI definitions...");

  const kpiDefs = [
    {
      name: "Sales Revenue",
      slug: "sales-revenue",
      description: "Total revenue generated",
      departmentId: salesDept?.id,
      unit: "USD",
      targetValue: 1000000,
      warningThreshold: 750000,
      criticalThreshold: 500000,
      direction: "HIGHER_IS_BETTER" as const,
      dataSource: "sales_system",
    },
    {
      name: "Marketing ROI",
      slug: "marketing-roi",
      description: "Return on marketing investment",
      departmentId: marketingDept?.id,
      unit: "%",
      targetValue: 300,
      warningThreshold: 200,
      criticalThreshold: 100,
      direction: "HIGHER_IS_BETTER" as const,
      dataSource: "marketing_platform",
    },
    {
      name: "Customer Satisfaction",
      slug: "customer-satisfaction",
      description: "Customer satisfaction score",
      departmentId: departments.find((d) => d.slug === "customer-success")?.id,
      unit: "score",
      targetValue: 90,
      warningThreshold: 80,
      criticalThreshold: 70,
      direction: "HIGHER_IS_BETTER" as const,
      dataSource: "feedback_system",
    },
    {
      name: "Operational Efficiency",
      slug: "operational-efficiency",
      description: "Operational cost per transaction",
      departmentId: operationsDept?.id,
      unit: "USD",
      targetValue: 5,
      warningThreshold: 7,
      criticalThreshold: 10,
      direction: "LOWER_IS_BETTER" as const,
      dataSource: "erp_system",
    },
    {
      name: "Employee Retention Rate",
      slug: "employee-retention",
      description: "Percentage of employees retained",
      departmentId: departments.find((d) => d.slug === "human-resources")?.id,
      unit: "%",
      targetValue: 95,
      warningThreshold: 85,
      criticalThreshold: 75,
      direction: "HIGHER_IS_BETTER" as const,
      dataSource: "hr_system",
    },
  ];

  for (const kpi of kpiDefs) {
    await prisma.kpiDefinition.create({
      data: {
        name: kpi.name,
        slug: kpi.slug,
        description: kpi.description,
        departmentId: kpi.departmentId,
        unit: kpi.unit,
        targetValue: kpi.targetValue,
        warningThreshold: kpi.warningThreshold,
        criticalThreshold: kpi.criticalThreshold,
        direction: kpi.direction,
        dataSource: kpi.dataSource,
        isActive: true,
      },
    });
  }

  console.log("✓ KPI definitions created");

  // ==================== SEED WORKFLOWS ====================
  console.log("Creating workflow templates...");

  const workflows = [
    {
      name: "Purchase Approval Workflow",
      slug: "purchase-approval",
      description: "Standard purchase request approval workflow",
      departmentId: departments.find((d) => d.slug === "procurement")?.id,
      triggerType: "MANUAL" as const,
      triggerConfig: {},
      steps: [
        {
          name: "Submit Request",
          type: "TASK",
          config: { assignee: "requester" },
        },
        {
          name: "Manager Review",
          type: "APPROVAL",
          config: { approvalLevel: 1 },
        },
        {
          name: "Finance Review",
          type: "APPROVAL",
          config: { approvalLevel: 2 },
        },
        {
          name: "Process Order",
          type: "INTEGRATION",
          config: { system: "erp" },
        },
      ],
      isActive: true,
      isTemplate: true,
      version: 1,
    },
    {
      name: "Leave Request Workflow",
      slug: "leave-request",
      description: "Employee leave request and approval",
      departmentId: departments.find((d) => d.slug === "human-resources")?.id,
      triggerType: "MANUAL" as const,
      triggerConfig: {},
      steps: [
        {
          name: "Submit Leave Request",
          type: "TASK",
          config: { assignee: "requester" },
        },
        {
          name: "Manager Approval",
          type: "APPROVAL",
          config: { approvalLevel: 1 },
        },
        {
          name: "HR Confirmation",
          type: "NOTIFICATION",
          config: { recipient: "employee" },
        },
      ],
      isActive: true,
      isTemplate: true,
      version: 1,
    },
    {
      name: "Content Publishing Workflow",
      slug: "content-publishing",
      description: "Marketing content review and publication",
      departmentId: marketingDept?.id,
      triggerType: "MANUAL" as const,
      triggerConfig: {},
      steps: [
        {
          name: "Create Content",
          type: "TASK",
          config: { assignee: "creator" },
        },
        {
          name: "Editorial Review",
          type: "APPROVAL",
          config: { approvalLevel: 1 },
        },
        {
          name: "Publish Content",
          type: "INTEGRATION",
          config: { system: "cms" },
        },
      ],
      isActive: true,
      isTemplate: true,
      version: 1,
    },
  ];

  for (const workflow of workflows) {
    await prisma.workflow.create({
      data: {
        name: workflow.name,
        slug: workflow.slug,
        description: workflow.description,
        departmentId: workflow.departmentId,
        triggerType: workflow.triggerType,
        triggerConfig: workflow.triggerConfig,
        steps: workflow.steps,
        isActive: workflow.isActive,
        isTemplate: workflow.isTemplate,
        version: workflow.version,
      },
    });
  }

  console.log("✓ Workflows created");

  // ==================== SEED AUTOMATION RULES ====================
  console.log("Creating automation rules...");

  const automationRules = [
    {
      name: "Daily Sales Report",
      slug: "daily-sales-report",
      description: "Generate and send daily sales report",
      departmentId: salesDept?.id,
      isActive: true,
      triggerType: "SCHEDULE" as const,
      triggerConfig: { cron: "0 9 * * *" },
      conditions: [{ field: "status", operator: "eq", value: "completed" }],
      actions: [
        {
          type: "REPORT",
          config: { reportType: "daily_sales", recipients: ["executives"] },
        },
        {
          type: "NOTIFICATION",
          config: { title: "Daily Sales Report Ready" },
        },
      ],
      cooldownMinutes: 60,
    },
    {
      name: "Escalate Overdue Tasks",
      slug: "escalate-overdue-tasks",
      description: "Automatically escalate tasks that are overdue",
      departmentId: undefined,
      isActive: true,
      triggerType: "CONDITION" as const,
      triggerConfig: { checkInterval: 3600 },
      conditions: [
        { field: "dueDate", operator: "lt", value: "now()" },
        { field: "status", operator: "ne", value: "COMPLETED" },
      ],
      actions: [
        {
          type: "ESCALATE",
          config: { escalationLevel: 1 },
        },
        {
          type: "NOTIFICATION",
          config: { title: "Task Overdue - Escalated" },
        },
      ],
      cooldownMinutes: 120,
    },
    {
      name: "KPI Threshold Alert",
      slug: "kpi-threshold-alert",
      description: "Alert when KPI falls below warning threshold",
      departmentId: undefined,
      isActive: true,
      triggerType: "EVENT" as const,
      triggerConfig: { eventType: "kpi_snapshot_recorded" },
      conditions: [
        {
          field: "value",
          operator: "lt",
          value: "warningThreshold",
        },
      ],
      actions: [
        {
          type: "ALERT",
          config: { severity: "MEDIUM", type: "KPI_THRESHOLD" },
        },
        {
          type: "NOTIFICATION",
          config: { title: "KPI Alert" },
        },
      ],
    },
    {
      name: "New User Welcome",
      slug: "new-user-welcome",
      description: "Send welcome notification to new users",
      departmentId: departments.find((d) => d.slug === "human-resources")?.id,
      isActive: true,
      triggerType: "WEBHOOK" as const,
      triggerConfig: { webhook: "user.created" },
      actions: [
        {
          type: "NOTIFICATION",
          config: {
            title: "Welcome to Raffi Command Centre",
            template: "welcome",
          },
        },
        {
          type: "TASK",
          config: { title: "Onboarding Checklist", template: "onboarding" },
        },
      ],
    },
  ];

  for (const rule of automationRules) {
    await prisma.automationRule.create({
      data: {
        name: rule.name,
        description: rule.description,
        departmentId: rule.departmentId,
        isActive: rule.isActive,
        triggerType: rule.triggerType,
        triggerConfig: rule.triggerConfig,
        conditions: rule.conditions,
        actions: rule.actions,
        cooldownMinutes: rule.cooldownMinutes,
        createdById: adminUser.id,
      },
    });
  }

  console.log("✓ Automation rules created");

  // ==================== SEED SAMPLE TASKS ====================
  console.log("Creating sample tasks...");

  const now = new Date();
  const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
  const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

  const tasks = [
    {
      title: "Q2 Marketing Strategy Review",
      description: "Review and update Q2 marketing strategy",
      status: "IN_PROGRESS" as const,
      priority: "HIGH" as const,
      dueDate: nextWeek,
      assigneeId: managerUser.id,
      creatorId: adminUser.id,
      departmentId: marketingDept?.id,
      tags: ["strategy", "quarterly"],
    },
    {
      title: "Sales Pipeline Analysis",
      description: "Analyze current sales pipeline and forecast",
      status: "PENDING" as const,
      priority: "HIGH" as const,
      dueDate: tomorrow,
      assigneeId: memberUser.id,
      creatorId: adminUser.id,
      departmentId: salesDept?.id,
      tags: ["sales", "analytics"],
    },
    {
      title: "System Security Audit",
      description: "Conduct comprehensive security audit",
      status: "PENDING" as const,
      priority: "CRITICAL" as const,
      dueDate: nextWeek,
      assigneeId: adminUser.id,
      creatorId: adminUser.id,
      departmentId: departments.find((d) => d.slug === "technology")?.id,
      tags: ["security", "compliance"],
    },
  ];

  for (const task of tasks) {
    await prisma.task.create({
      data: task,
    });
  }

  console.log("✓ Sample tasks created");

  // ==================== SEED SAMPLE APPROVALS ====================
  console.log("Creating sample approvals...");

  const approvals = [
    {
      title: "Budget Increase Request - Marketing",
      description: "Request for additional $50K marketing budget",
      type: "PURCHASE" as const,
      status: "PENDING" as const,
      requesterId: managerUser.id,
      departmentId: marketingDept?.id,
      priority: "HIGH" as const,
      dueDate: nextWeek,
      data: {
        amount: 50000,
        department: "Marketing",
        reason: "Q2 campaign expansion",
      },
    },
    {
      title: "New Tool Procurement",
      description: "Request to purchase analytics tool subscription",
      type: "GENERAL" as const,
      status: "PENDING" as const,
      requesterId: memberUser.id,
      departmentId: departments.find((d) => d.slug === "analytics")?.id,
      priority: "MEDIUM" as const,
      dueDate: nextWeek,
      data: {
        toolName: "Advanced Analytics Platform",
        cost: 15000,
      },
    },
  ];

  for (const approval of approvals) {
    await prisma.approval.create({
      data: approval,
    });
  }

  console.log("✓ Sample approvals created");

  // ==================== SEED DOCUMENTS ====================
  console.log("Creating sample documents...");

  const documents = [
    {
      title: "Sales Process SOP",
      slug: "sales-process-sop",
      content:
        "# Sales Process Standard Operating Procedure\n\n## 1. Lead Qualification\n- Verify lead information\n- Assess fit for product\n\n## 2. Outreach\n- Initial contact\n- Needs discovery\n\n## 3. Proposal\n- Prepare proposal\n- Present to client\n\n## 4. Closing\n- Address objections\n- Close the deal",
      type: "SOP" as const,
      status: "PUBLISHED" as const,
      departmentId: salesDept?.id,
      authorId: adminUser.id,
      version: 1,
      tags: ["sales", "process"],
    },
    {
      title: "Remote Work Policy",
      slug: "remote-work-policy",
      content:
        "# Remote Work Policy\n\n## Eligibility\n- After 90-day onboarding period\n- Manager approval required\n\n## Benefits\n- Up to 3 days per week\n- Flexible hours\n\n## Requirements\n- Secure internet connection\n- Dedicated workspace",
      type: "POLICY" as const,
      status: "PUBLISHED" as const,
      departmentId: departments.find((d) => d.slug === "human-resources")?.id,
      authorId: adminUser.id,
      version: 1,
      tags: ["hr", "policy"],
    },
    {
      title: "Email Marketing Best Practices",
      slug: "email-marketing-guide",
      content:
        "# Email Marketing Best Practices Guide\n\n## Subject Lines\n- Keep under 50 characters\n- Use personalization\n- A/B test variations\n\n## Content\n- Mobile responsive\n- Clear CTA\n- Single focus",
      type: "GUIDE" as const,
      status: "PUBLISHED" as const,
      departmentId: marketingDept?.id,
      authorId: managerUser.id,
      version: 1,
      tags: ["marketing", "email"],
    },
  ];

  for (const doc of documents) {
    await prisma.document.create({
      data: {
        ...doc,
        publishedAt: new Date(),
      },
    });
  }

  console.log("✓ Sample documents created");

  // ==================== SEED RECURRING SCHEDULES ====================
  console.log("Creating recurring schedules...");

  const recurringSchedules = [
    {
      name: "Daily Team Standup",
      cronExpression: "0 9 * * 1-5",
      type: "TASK" as const,
      config: {
        title: "Team Standup",
        description: "Daily team synchronization",
      },
      departmentId: salesDept?.id,
      isActive: true,
      createdById: adminUser.id,
    },
    {
      name: "Weekly Sales Report",
      cronExpression: "0 17 * * 5",
      type: "REPORT" as const,
      config: {
        reportType: "sales_weekly",
        recipients: ["executives"],
      },
      departmentId: salesDept?.id,
      isActive: true,
      createdById: adminUser.id,
    },
    {
      name: "Monthly Budget Review",
      cronExpression: "0 10 1 * *",
      type: "WORKFLOW" as const,
      config: {
        workflowSlug: "budget-review",
        department: "finance",
      },
      departmentId: departments.find((d) => d.slug === "finance")?.id,
      isActive: true,
      createdById: adminUser.id,
    },
  ];

  for (const schedule of recurringSchedules) {
    await prisma.recurringSchedule.create({
      data: schedule,
    });
  }

  console.log("✓ Recurring schedules created");

  console.log("✅ Database seed completed successfully!");
  console.log("\n📊 Summary:");
  console.log(`- 5 users created (including admin@raffi.com / admin123)`);
  console.log(`- 18 departments created`);
  console.log(`- Multiple roles created for each department`);
  console.log(`- 10 permissions created`);
  console.log(`- 5 KPI definitions created`);
  console.log(`- 3 workflow templates created`);
  console.log(`- 4 automation rules created`);
  console.log(`- 3 sample tasks created`);
  console.log(`- 2 sample approvals created`);
  console.log(`- 3 sample documents created`);
  console.log(`- 3 recurring schedules created`);
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
