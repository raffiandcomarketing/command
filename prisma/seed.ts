import { PrismaClient } from "@prisma/client";
import bcryptjs from "bcryptjs";
import crypto from "crypto";

function createClient(): PrismaClient {
  if (process.env.PRISMA_PG_ADAPTER === "1") {
    // Test-environment escape hatch: pg driver adapter + WASM engine.
    // eslint-disable-next-line no-eval
    const req = eval("require") as NodeRequire;
    const { Pool } = req("pg");
    const { PrismaPg } = req("@prisma/adapter-pg");
    const { PrismaClient: WasmPrismaClient } = req("@prisma/client/wasm");
    return new WasmPrismaClient({
      adapter: new PrismaPg(new Pool({ connectionString: process.env.DATABASE_URL })),
    }) as unknown as PrismaClient;
  }
  return new PrismaClient();
}

const prisma = createClient();

const isProduction = process.env.NODE_ENV === "production";
const FORCE_RESET = process.env.SEED_FORCE_RESET === "true";
const DEMO_DATA = process.env.SEED_DEMO_DATA === "true";

/**
 * Seed strategy (reworked per production-readiness assessment R3/TD20):
 *  - Idempotent: safe to run repeatedly; upserts org structure by slug.
 *  - No default credentials: the admin account comes from ADMIN_EMAIL /
 *    ADMIN_PASSWORD env vars. In non-production, a random password is
 *    generated and printed ONCE if none is provided.
 *  - Never wipes data unless SEED_FORCE_RESET=true (and never in production
 *    without it).
 *  - Demo business data (contacts, deals, tasks) only with SEED_DEMO_DATA=true.
 */

// Keep the original slug algorithm so upserts match rows seeded by v1.
function roleSlug(title: string): string {
  return title.toLowerCase().replace(/\s+/g, "-").replace(/\//g, "-");
}

const departmentConfigs = [
  { name: "Executive / Leadership", slug: "executive-leadership", icon: "Crown", color: "#1f2937" },
  { name: "Marketing", slug: "marketing", icon: "Megaphone", color: "#f59e0b" },
  { name: "Ecommerce", slug: "ecommerce", icon: "ShoppingCart", color: "#8b5cf6" },
  { name: "Retail Operations", slug: "retail-operations", icon: "Store", color: "#10b981" },
  { name: "Sales", slug: "sales", icon: "TrendingUp", color: "#ef4444" },
  { name: "Client Experience / CRM", slug: "client-experience", icon: "Heart", color: "#ec4899" },
  { name: "Inventory / Merchandising", slug: "inventory-merchandising", icon: "Package", color: "#f97316" },
  { name: "Repairs / Service", slug: "repairs-service", icon: "Wrench", color: "#64748b" },
  { name: "Purchasing / Procurement", slug: "purchasing-procurement", icon: "ShoppingCart", color: "#d97706" },
  { name: "Finance / Accounting", slug: "finance-accounting", icon: "DollarSign", color: "#6366f1" },
  { name: "Human Resources", slug: "human-resources", icon: "Users", color: "#3b82f6" },
  { name: "IT / Systems", slug: "it-systems", icon: "Cpu", color: "#06b6d4" },
  { name: "Logistics / Shipping", slug: "logistics-shipping", icon: "Truck", color: "#14b8a6" },
  { name: "Events / Activations", slug: "events-activations", icon: "Sparkles", color: "#a855f7" },
  { name: "Visual Merchandising", slug: "visual-merchandising", icon: "Palette", color: "#ec4899" },
  { name: "Customer Care", slug: "customer-care", icon: "Headphones", color: "#0ea5e9" },
  { name: "Legal / Compliance", slug: "legal-compliance", icon: "Scale", color: "#64748b" },
  { name: "Facilities / Maintenance", slug: "facilities-maintenance", icon: "Hammer", color: "#78716c" },
];

const rolesByDepartment: Record<string, string[]> = {
  "executive-leadership": ["CEO / Owner", "COO", "CFO", "VP Operations"],
  marketing: [
    "Digital Marketing Manager", "Social Media Manager", "SEO Manager", "Web Development Manager",
    "Marketing Operations Manager", "Graphic Designer", "Content Manager", "Paid Media Manager", "Brand Manager",
  ],
  ecommerce: ["Ecommerce Director", "Ecommerce Manager", "Digital Merchandiser", "Web Analyst"],
  "retail-operations": [
    "Retail Operations Manager", "Store Manager", "Assistant Store Manager", "Service Counter Manager",
    "Client Advisor Lead", "Reception / Concierge", "Inventory Coordinator",
  ],
  sales: ["Sales Director", "Sales Manager", "Senior Sales Associate", "Sales Associate", "Client Advisor"],
  "client-experience": ["CX Director", "CRM Manager", "Client Relations Manager", "VIP Client Manager", "After-Sales Manager"],
  "inventory-merchandising": ["Inventory Director", "Merchandising Manager", "Inventory Analyst", "Buyer", "Stock Controller"],
  "repairs-service": ["Service Manager", "Repair Coordinator", "Watchmaker Coordinator", "Jewellery Repair Coordinator", "Quality Control"],
  "purchasing-procurement": ["Procurement Director", "Purchasing Manager", "Vendor Relations Manager", "Purchase Order Coordinator"],
  "finance-accounting": ["Controller", "Accounts Payable", "Accounts Receivable", "Payroll Administrator", "Financial Analyst"],
  "human-resources": ["HR Manager", "Recruiter", "Onboarding Coordinator", "Training Manager", "Benefits Administrator"],
  "it-systems": [
    "Systems Administrator", "Help Desk Manager", "ERP Administrator", "CRM Administrator",
    "POS Systems Manager", "Ecommerce Systems Manager",
  ],
  "logistics-shipping": ["Logistics Manager", "Shipping Coordinator", "Receiving Clerk", "Warehouse Manager"],
  "events-activations": ["Events Director", "Events Coordinator", "Brand Activation Manager", "PR Manager"],
  "visual-merchandising": ["Visual Merchandising Director", "Display Coordinator", "Store Designer"],
  "customer-care": ["Customer Care Manager", "Support Specialist", "Complaints Handler", "Returns Coordinator"],
  "legal-compliance": ["General Counsel", "Compliance Officer", "Contract Manager", "Privacy Officer"],
  "facilities-maintenance": ["Facilities Manager", "Maintenance Coordinator", "Security Manager", "Cleaning Supervisor"],
};

/** KPI definitions now use built-in, code-evaluated data sources. */
const kpiDefs = [
  {
    name: "Sales Revenue (30d)", slug: "sales-revenue", description: "Closed deal value over the last 30 days",
    departmentSlug: "sales", unit: "USD", targetValue: 1000000, warningThreshold: 750000, criticalThreshold: 500000,
    direction: "HIGHER_IS_BETTER" as const, dataSource: "crm.sales_value_30d",
  },
  {
    name: "Pipeline Value", slug: "pipeline-value", description: "Open pipeline (leads + opportunities)",
    departmentSlug: "sales", unit: "USD", targetValue: 2000000, warningThreshold: 1000000, criticalThreshold: 500000,
    direction: "HIGHER_IS_BETTER" as const, dataSource: "crm.pipeline_value",
  },
  {
    name: "Open Tasks", slug: "open-tasks", description: "Tasks currently pending, in progress or in review",
    departmentSlug: null, unit: "tasks", targetValue: 40, warningThreshold: 80, criticalThreshold: 120,
    direction: "LOWER_IS_BETTER" as const, dataSource: "tasks.open_count",
  },
  {
    name: "Overdue Tasks", slug: "overdue-tasks", description: "Open tasks past their due date",
    departmentSlug: null, unit: "tasks", targetValue: 0, warningThreshold: 5, criticalThreshold: 15,
    direction: "LOWER_IS_BETTER" as const, dataSource: "tasks.overdue_count",
  },
  {
    name: "Pending Approvals", slug: "pending-approvals", description: "Approval requests awaiting a decision",
    departmentSlug: null, unit: "requests", targetValue: 0, warningThreshold: 10, criticalThreshold: 25,
    direction: "LOWER_IS_BETTER" as const, dataSource: "approvals.pending_count",
  },
];

async function main() {
  console.log(`Seeding (production=${isProduction}, reset=${FORCE_RESET}, demo=${DEMO_DATA})...`);

  if (FORCE_RESET) {
    if (isProduction && process.env.SEED_ALLOW_PRODUCTION_RESET !== "true") {
      throw new Error(
        "SEED_FORCE_RESET in production also requires SEED_ALLOW_PRODUCTION_RESET=true. Refusing to wipe production data."
      );
    }
    console.log("Force reset: cleaning existing data...");
    await prisma.crmDeal.deleteMany();
    await prisma.crmContact.deleteMany();
    await prisma.document.deleteMany();
    await prisma.approval.deleteMany();
    await prisma.task.deleteMany();
    await prisma.workflow.deleteMany();
    await prisma.automationRule.deleteMany();
    await prisma.kpiDefinition.deleteMany();
    await prisma.recurringSchedule.deleteMany();
    await prisma.userDepartment.deleteMany();
    await prisma.permission.deleteMany();
    await prisma.role.deleteMany();
    await prisma.user.deleteMany();
    await prisma.department.deleteMany();
  }

  // ---------- Admin user (no default credentials - assessment R3) ----------
  const adminEmail = (process.env.ADMIN_EMAIL || "").trim().toLowerCase();
  const adminPassword = process.env.ADMIN_PASSWORD || "";
  const adminName = process.env.ADMIN_NAME || "Administrator";

  const existingAdmins = await prisma.user.count({ where: { role: "ADMIN", isActive: true } });

  if (adminEmail && adminPassword) {
    if (adminPassword.length < 10) {
      throw new Error("ADMIN_PASSWORD must be at least 10 characters");
    }
    const passwordHash = await bcryptjs.hash(adminPassword, 12);
    await prisma.user.upsert({
      where: { email: adminEmail },
      update: { passwordHash, role: "ADMIN", isActive: true },
      create: { email: adminEmail, name: adminName, passwordHash, role: "ADMIN", isActive: true },
    });
    console.log(`✓ Admin account ensured for ${adminEmail} (password from env)`);
  } else if (existingAdmins === 0) {
    if (isProduction) {
      throw new Error(
        "No active admin exists and ADMIN_EMAIL/ADMIN_PASSWORD are not set. Set them in the environment to create the first admin."
      );
    }
    const generated = crypto.randomBytes(9).toString("base64url") + "A1a";
    const passwordHash = await bcryptjs.hash(generated, 12);
    const email = adminEmail || "admin@localhost.dev";
    await prisma.user.upsert({
      where: { email },
      update: { passwordHash, role: "ADMIN", isActive: true },
      create: { email, name: adminName, passwordHash, role: "ADMIN", isActive: true },
    });
    console.log("──────────────────────────────────────────────────────────");
    console.log(`✓ DEV admin created: ${email}`);
    console.log(`  One-time generated password: ${generated}`);
    console.log("  Change it immediately after first login (Settings).");
    console.log("──────────────────────────────────────────────────────────");
  } else {
    console.log(`✓ ${existingAdmins} active admin(s) already present - no credential changes`);
  }

  // Legacy default-credential cleanup: force-deactivate the old seeded
  // demo logins if they still exist with well-known passwords.
  for (const legacyEmail of ["admin@raffi.com", "john@raffi.com", "alec@raffi.com"]) {
    const legacy = await prisma.user.findUnique({ where: { email: legacyEmail } });
    if (!legacy) continue;
    const knownDefault = legacyEmail === "admin@raffi.com" ? "admin123" : "member123";
    const stillDefault = await bcryptjs.compare(knownDefault, legacy.passwordHash);
    if (stillDefault) {
      if (legacy.role === "ADMIN") {
        const otherAdmins = await prisma.user.count({
          where: { role: "ADMIN", isActive: true, NOT: { id: legacy.id } },
        });
        if (otherAdmins === 0) {
          console.warn(
            `⚠ ${legacyEmail} still uses the default password but is the only admin. ` +
              `Set ADMIN_EMAIL/ADMIN_PASSWORD and re-run the seed to rotate it safely.`
          );
          continue;
        }
      }
      const randomHash = await bcryptjs.hash(crypto.randomBytes(24).toString("base64url"), 12);
      await prisma.user.update({
        where: { id: legacy.id },
        data: { passwordHash: randomHash, isActive: false },
      });
      console.log(`✓ Disabled legacy default-credential account ${legacyEmail}`);
    }
  }

  // ---------- Departments & roles (idempotent upserts) ----------
  const departments: Record<string, { id: string; name: string }> = {};
  for (let i = 0; i < departmentConfigs.length; i++) {
    const c = departmentConfigs[i];
    const dept = await prisma.department.upsert({
      where: { slug: c.slug },
      update: { name: c.name, icon: c.icon, color: c.color, sortOrder: i, isActive: true },
      create: {
        name: c.name, slug: c.slug, description: `${c.name} department`,
        icon: c.icon, color: c.color, sortOrder: i, isActive: true,
      },
    });
    departments[c.slug] = dept;
  }
  console.log(`✓ ${Object.keys(departments).length} departments ensured`);

  let roleCount = 0;
  for (const [deptSlug, titles] of Object.entries(rolesByDepartment)) {
    const dept = departments[deptSlug];
    if (!dept) continue;
    for (let i = 0; i < titles.length; i++) {
      await prisma.role.upsert({
        where: { departmentId_slug: { departmentId: dept.id, slug: roleSlug(titles[i]) } },
        update: { title: titles[i], sortOrder: i, isActive: true },
        create: {
          title: titles[i],
          slug: roleSlug(titles[i]),
          description: `${titles[i]} in ${dept.name}`,
          departmentId: dept.id,
          sortOrder: i,
          isActive: true,
        },
      });
      roleCount++;
    }
  }
  console.log(`✓ ${roleCount} roles ensured`);

  // ---------- KPI definitions (built-in data sources) ----------
  for (const kpi of kpiDefs) {
    await prisma.kpiDefinition.upsert({
      where: { slug: kpi.slug },
      update: {
        name: kpi.name, description: kpi.description, unit: kpi.unit,
        targetValue: kpi.targetValue, warningThreshold: kpi.warningThreshold,
        criticalThreshold: kpi.criticalThreshold, direction: kpi.direction,
        dataSource: kpi.dataSource, isActive: true,
        departmentId: kpi.departmentSlug ? departments[kpi.departmentSlug]?.id ?? null : null,
      },
      create: {
        name: kpi.name, slug: kpi.slug, description: kpi.description, unit: kpi.unit,
        targetValue: kpi.targetValue, warningThreshold: kpi.warningThreshold,
        criticalThreshold: kpi.criticalThreshold, direction: kpi.direction,
        dataSource: kpi.dataSource, isActive: true,
        departmentId: kpi.departmentSlug ? departments[kpi.departmentSlug]?.id ?? null : null,
      },
    });
  }
  // Retire the legacy external-source KPI stubs that can't be computed.
  await prisma.kpiDefinition.updateMany({
    where: { dataSource: { in: ["sales_system", "marketing_platform", "feedback_system", "erp_system", "hr_system"] } },
    data: { isActive: false },
  });
  console.log(`✓ ${kpiDefs.length} KPI definitions ensured (legacy external stubs deactivated)`);

  // ---------- Workflow templates ----------
  const workflowTemplates = [
    {
      name: "Purchase Approval Workflow", slug: "purchase-approval",
      description: "Standard purchase request approval workflow",
      departmentSlug: "purchasing-procurement",
      steps: [
        { name: "Submit Request", type: "TASK", config: { title: "Prepare purchase request" } },
        { name: "Manager Review", type: "APPROVAL", config: { title: "Manager approval for purchase" } },
        { name: "Finance Review", type: "APPROVAL", config: { title: "Finance approval for purchase" } },
        { name: "Notify Requester", type: "NOTIFICATION", config: { message: "Your purchase request has completed review." } },
      ],
    },
    {
      name: "Leave Request Workflow", slug: "leave-request",
      description: "Employee leave request and approval",
      departmentSlug: "human-resources",
      steps: [
        { name: "Submit Leave Request", type: "TASK", config: { title: "Complete leave request form" } },
        { name: "Manager Approval", type: "APPROVAL", config: { title: "Approve leave request" } },
        { name: "HR Confirmation", type: "NOTIFICATION", config: { message: "Leave request processed by HR." } },
      ],
    },
    {
      name: "Content Publishing Workflow", slug: "content-publishing",
      description: "Marketing content review and publication",
      departmentSlug: "marketing",
      steps: [
        { name: "Create Content", type: "TASK", config: { title: "Draft content piece" } },
        { name: "Editorial Review", type: "APPROVAL", config: { title: "Editorial approval" } },
        { name: "Publish Notice", type: "NOTIFICATION", config: { message: "Content approved and ready to publish." } },
      ],
    },
  ];

  for (const wf of workflowTemplates) {
    await prisma.workflow.upsert({
      where: { slug_version: { slug: wf.slug, version: 1 } },
      update: { name: wf.name, description: wf.description, steps: wf.steps, isTemplate: true, isActive: true },
      create: {
        name: wf.name, slug: wf.slug, description: wf.description,
        departmentId: departments[wf.departmentSlug]?.id ?? null,
        triggerType: "MANUAL", triggerConfig: {}, steps: wf.steps,
        isActive: true, isTemplate: true, version: 1,
      },
    });
  }
  console.log(`✓ ${workflowTemplates.length} workflow templates ensured`);

  // ---------- Demo data (opt-in only) ----------
  if (DEMO_DATA) {
    const admin = await prisma.user.findFirst({ where: { role: "ADMIN", isActive: true } });
    if (admin) {
      const demoContacts = [
        { name: "Sophie Laurent", email: "sophie.laurent@example.com", phone: "+33 1 42 65 00 00", company: "Laurent Jewelry Holdings", notes: "VIP client - luxury jewelry segment" },
        { name: "Marcus Chen", email: "marcus.chen@example.com", phone: "+852 2123 4567", company: "Asia Retail Group", notes: "Regional partner - Asia-Pacific" },
        { name: "Elena Rossi", email: "elena.rossi@example.com", phone: "+39 02 1234 5678", company: "Rossi Fashion Brands", notes: "Fashion distribution partner" },
      ];
      for (const c of demoContacts) {
        const existing = await prisma.crmContact.findFirst({ where: { name: c.name } });
        const contact = existing ?? (await prisma.crmContact.create({
          data: { ...c, createdById: admin.id, departmentId: departments["sales"]?.id ?? null },
        }));
        const hasDeal = await prisma.crmDeal.findFirst({ where: { contactId: contact.id } });
        if (!hasDeal) {
          await prisma.crmDeal.create({
            data: {
              title: `${c.company} - Opportunity`,
              value: 50000 + Math.floor(Math.random() * 200000),
              stage: "OPPORTUNITY",
              contactId: contact.id,
              assigneeId: admin.id,
              departmentId: departments["sales"]?.id ?? null,
              notes: "Demo data",
              expectedCloseDate: new Date(Date.now() + 30 * 24 * 3600 * 1000),
            },
          });
        }
      }
      console.log("✓ Demo CRM data ensured (SEED_DEMO_DATA=true)");
    }
  }

  console.log("✅ Seed completed");
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
