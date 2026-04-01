import { PrismaClient } from "@prisma/client";
import bcryptjs from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Starting database seed...");

  try {
    // ==================== CLEAN EXISTING DATA ====================
    console.log("Cleaning existing data...");

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

    console.log("✓ Existing data cleaned");

    // ==================== SEED USERS ====================
    console.log("Creating users...");

    const adminPassword = await bcryptjs.hash("admin123", 10);
    const memberPassword = await bcryptjs.hash("member123", 10);

    const adminUser = await prisma.user.upsert({
      where: { email: "admin@raffi.com" },
      update: {},
      create: {
        email: "admin@raffi.com",
        name: "Al Sukara",
        passwordHash: adminPassword,
        role: "ADMIN",
        isActive: true,
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=al",
      },
    });

    const johnUser = await prisma.user.create({
      data: {
        email: "john@raffi.com",
        name: "John Lim",
        passwordHash: memberPassword,
        role: "MANAGER",
        isActive: true,
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=john",
      },
    });

    const alecUser = await prisma.user.create({
      data: {
        email: "alec@raffi.com",
        name: "Alec Vandebelt",
        passwordHash: memberPassword,
        role: "MANAGER",
        isActive: true,
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=alec",
      },
    });

    console.log("✓ Users created");

    // ==================== SEED DEPARTMENTS ====================
    console.log("Creating departments...");

    const departmentConfigs = [
      {
        name: "Executive / Leadership",
        slug: "executive-leadership",
        icon: "Crown",
        color: "#1f2937",
      },
      {
        name: "Marketing",
        slug: "marketing",
        icon: "Megaphone",
        color: "#f59e0b",
      },
      {
        name: "Ecommerce",
        slug: "ecommerce",
        icon: "ShoppingCart",
        color: "#8b5cf6",
      },
      {
        name: "Retail Operations",
        slug: "retail-operations",
        icon: "Store",
        color: "#10b981",
      },
      {
        name: "Sales",
        slug: "sales",
        icon: "TrendingUp",
        color: "#ef4444",
      },
      {
        name: "Client Experience / CRM",
        slug: "client-experience",
        icon: "Heart",
        color: "#ec4899",
      },
      {
        name: "Inventory / Merchandising",
        slug: "inventory-merchandising",
        icon: "Package",
        color: "#f97316",
      },
      {
        name: "Repairs / Service",
        slug: "repairs-service",
        icon: "Wrench",
        color: "#64748b",
      },
      {
        name: "Purchasing / Procurement",
        slug: "purchasing-procurement",
        icon: "ShoppingCart",
        color: "#d97706",
      },
      {
        name: "Finance / Accounting",
        slug: "finance-accounting",
        icon: "DollarSign",
        color: "#6366f1",
      },
      {
        name: "Human Resources",
        slug: "human-resources",
        icon: "Users",
        color: "#3b82f6",
      },
      {
        name: "IT / Systems",
        slug: "it-systems",
        icon: "Cpu",
        color: "#06b6d4",
      },
      {
        name: "Logistics / Shipping",
        slug: "logistics-shipping",
        icon: "Truck",
        color: "#14b8a6",
      },
      {
        name: "Events / Activations",
        slug: "events-activations",
        icon: "Sparkles",
        color: "#a855f7",
      },
      {
        name: "Visual Merchandising",
        slug: "visual-merchandising",
        icon: "Palette",
        color: "#ec4899",
      },
      {
        name: "Customer Care",
        slug: "customer-care",
        icon: "Headphones",
        color: "#0ea5e9",
      },
      {
        name: "Legal / Compliance",
        slug: "legal-compliance",
        icon: "Scale",
        color: "#64748b",
      },
      {
        name: "Facilities / Maintenance",
        slug: "facilities-maintenance",
        icon: "Hammer",
        color: "#78716c",
      },
    ];

    const departments: { [key: string]: any } = {};

    for (let i = 0; i < departmentConfigs.length; i++) {
      const config = departmentConfigs[i];
      const dept = await prisma.department.create({
        data: {
          name: config.name,
          slug: config.slug,
          description: `${config.name} department`,
          icon: config.icon,
          color: config.color,
          sortOrder: i,
          isActive: true,
        },
      });
      departments[config.slug] = dept;
    }

    console.log("✓ Departments created");

    // ==================== SEED ROLES ====================
    console.log("Creating roles...");

    const rolesByDepartment: { [key: string]: string[] } = {
      "executive-leadership": [
        "CEO / Owner",
        "COO",
        "CFO",
        "VP Operations",
      ],
      marketing: [
        "Digital Marketing Manager",
        "Social Media Manager",
        "SEO Manager",
        "Web Development Manager",
        "Marketing Operations Manager",
        "Graphic Designer",
        "Content Manager",
        "Paid Media Manager",
        "Brand Manager",
      ],
      ecommerce: [
        "Ecommerce Director",
        "Ecommerce Manager",
        "Digital Merchandiser",
        "Web Analyst",
      ],
      "retail-operations": [
        "Retail Operations Manager",
        "Store Manager",
        "Assistant Store Manager",
        "Service Counter Manager",
        "Client Advisor Lead",
        "Reception / Concierge",
        "Inventory Coordinator",
      ],
      sales: [
        "Sales Director",
        "Sales Manager",
        "Senior Sales Associate",
        "Sales Associate",
        "Client Advisor",
      ],
      "client-experience": [
        "CX Director",
        "CRM Manager",
        "Client Relations Manager",
        "VIP Client Manager",
        "After-Sales Manager",
      ],
      "inventory-merchandising": [
        "Inventory Director",
        "Merchandising Manager",
        "Inventory Analyst",
        "Buyer",
        "Stock Controller",
      ],
      "repairs-service": [
        "Service Manager",
        "Repair Coordinator",
        "Watchmaker Coordinator",
        "Jewellery Repair Coordinator",
        "Quality Control",
      ],
      "purchasing-procurement": [
        "Procurement Director",
        "Purchasing Manager",
        "Vendor Relations Manager",
        "Purchase Order Coordinator",
      ],
      "finance-accounting": [
        "Controller",
        "Accounts Payable",
        "Accounts Receivable",
        "Payroll Administrator",
        "Financial Analyst",
      ],
      "human-resources": [
        "HR Manager",
        "Recruiter",
        "Onboarding Coordinator",
        "Training Manager",
        "Benefits Administrator",
      ],
      "it-systems": [
        "Systems Administrator",
        "Help Desk Manager",
        "ERP Administrator",
        "CRM Administrator",
        "POS Systems Manager",
        "Ecommerce Systems Manager",
      ],
      "logistics-shipping": [
        "Logistics Manager",
        "Shipping Coordinator",
        "Receiving Clerk",
        "Warehouse Manager",
      ],
      "events-activations": [
        "Events Director",
        "Events Coordinator",
        "Brand Activation Manager",
        "PR Manager",
      ],
      "visual-merchandising": [
        "Visual Merchandising Director",
        "Display Coordinator",
        "Store Designer",
      ],
      "customer-care": [
        "Customer Care Manager",
        "Support Specialist",
        "Complaints Handler",
        "Returns Coordinator",
      ],
      "legal-compliance": [
        "General Counsel",
        "Compliance Officer",
        "Contract Manager",
        "Privacy Officer",
      ],
      "facilities-maintenance": [
        "Facilities Manager",
        "Maintenance Coordinator",
        "Security Manager",
        "Cleaning Supervisor",
      ],
    };

    const rolesCreated: { [key: string]: string } = {};

    for (const [deptSlug, dept] of Object.entries(departments)) {
      const deptRoles = rolesByDepartment[deptSlug] || [
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

        rolesCreated[`${deptSlug}-${i}`] = role.id;
      }
    }

    console.log("✓ Roles created");

    // ==================== SEED USER DEPARTMENTS ====================
    console.log("Creating user department assignments...");

    const executiveDept = departments["executive-leadership"];
    const marketingDept = departments["marketing"];
    const ecommerceDept = departments["ecommerce"];

    const ceoRole = rolesCreated["executive-leadership-0"];
    const digitalMarketingRole = rolesCreated["marketing-0"];
    const ecommerceManagerRole = rolesCreated["ecommerce-1"];

    await prisma.userDepartment.createMany({
      data: [
        {
          userId: adminUser.id,
          departmentId: executiveDept.id,
          roleId: ceoRole,
          isPrimary: true,
        },
        {
          userId: johnUser.id,
          departmentId: ecommerceDept.id,
          roleId: ecommerceManagerRole,
          isPrimary: true,
        },
        {
          userId: alecUser.id,
          departmentId: marketingDept.id,
          roleId: digitalMarketingRole,
          isPrimary: true,
        },
      ],
    });

    console.log("✓ User department assignments created");

    // ==================== SEED KPI DEFINITIONS ====================
    console.log("Creating KPI definitions...");

    const kpiDefs = [
      {
        name: "Sales Revenue",
        slug: "sales-revenue",
        description: "Total revenue generated",
        departmentId: departments["sales"].id,
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
        departmentId: marketingDept.id,
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
        departmentId: departments["customer-care"].id,
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
        departmentId: departments["retail-operations"].id,
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
        departmentId: departments["human-resources"].id,
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
        departmentId: departments["purchasing-procurement"].id,
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
        departmentId: departments["human-resources"].id,
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
        departmentId: marketingDept.id,
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
        assigneeId: alecUser.id,
        creatorId: adminUser.id,
        departmentId: marketingDept.id,
        tags: ["strategy", "quarterly"],
      },
      {
        title: "Ecommerce Platform Migration",
        description: "Plan and execute ecommerce platform migration",
        status: "PENDING" as const,
        priority: "HIGH" as const,
        dueDate: nextWeek,
        assigneeId: johnUser.id,
        creatorId: adminUser.id,
        departmentId: ecommerceDept.id,
        tags: ["ecommerce", "technical"],
      },
      {
        title: "System Security Audit",
        description: "Conduct comprehensive security audit",
        status: "PENDING" as const,
        priority: "CRITICAL" as const,
        dueDate: nextWeek,
        assigneeId: adminUser.id,
        creatorId: adminUser.id,
        departmentId: departments["it-systems"].id,
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
        requesterId: alecUser.id,
        departmentId: marketingDept.id,
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
        requesterId: johnUser.id,
        departmentId: departments["it-systems"].id,
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

    // ==================== SEED CRM CONTACTS ====================
    console.log("Creating CRM contacts...");

    const crmContacts = [
      {
        name: "Sophie Laurent",
        email: "sophie.laurent@luxury.com",
        phone: "+33 1 42 65 00 00",
        company: "Laurent Jewelry Holdings",
        notes: "VIP client - luxury jewelry segment",
        createdById: adminUser.id,
        departmentId: departments["client-experience"].id,
      },
      {
        name: "Marcus Chen",
        email: "marcus.chen@asiashop.com",
        phone: "+852 2123 4567",
        company: "Asia Retail Group",
        notes: "Regional partner - Asia-Pacific",
        createdById: adminUser.id,
        departmentId: departments["sales"].id,
      },
      {
        name: "Elena Rossi",
        email: "elena.rossi@fashion.it",
        phone: "+39 02 1234 5678",
        company: "Rossi Fashion Brands",
        notes: "Fashion distribution partner",
        createdById: adminUser.id,
        departmentId: departments["sales"].id,
      },
      {
        name: "James Morrison",
        email: "james.morrison@retail.uk",
        phone: "+44 20 7946 0000",
        company: "Morrison Retail Group",
        notes: "Prospect - UK retail market",
        createdById: adminUser.id,
        departmentId: departments["sales"].id,
      },
      {
        name: "Yuki Tanaka",
        email: "yuki.tanaka@japan-retail.jp",
        phone: "+81 3 1234 5678",
        company: "Tanaka Distribution",
        notes: "Supplier potential - Japan",
        createdById: adminUser.id,
        departmentId: departments["purchasing-procurement"].id,
      },
    ];

    const contacts: any[] = [];
    for (const contact of crmContacts) {
      const created = await prisma.crmContact.create({
        data: contact,
      });
      contacts.push(created);
    }

    console.log("✓ CRM contacts created");

    // ==================== SEED CRM DEALS ====================
    console.log("Creating CRM deals...");

    const crmDeals = [
      {
        title: "Laurent Jewelry - Luxury Collection Order",
        value: 450000,
        stage: "SALE" as const,
        contactId: contacts[0].id,
        assigneeId: adminUser.id,
        departmentId: departments["client-experience"].id,
        notes: "Large order for luxury watch collection - CLOSED",
        expectedCloseDate: new Date("2026-03-15"),
        closedAt: new Date("2026-03-15"),
      },
      {
        title: "Asia Retail - Q2 Expansion",
        value: 320000,
        stage: "OPPORTUNITY" as const,
        contactId: contacts[1].id,
        assigneeId: johnUser.id,
        departmentId: departments["sales"].id,
        notes: "Regional expansion with 5 new stores - negotiating",
        expectedCloseDate: new Date("2026-04-30"),
      },
      {
        title: "Rossi Fashion - Product Line Agreement",
        value: 200000,
        stage: "OPPORTUNITY" as const,
        contactId: contacts[2].id,
        assigneeId: alecUser.id,
        departmentId: departments["sales"].id,
        notes: "Exclusive distribution agreement - proposal sent",
        expectedCloseDate: new Date("2026-05-15"),
      },
      {
        title: "Morrison Retail - Initial Consultation",
        value: 150000,
        stage: "LEAD" as const,
        contactId: contacts[3].id,
        assigneeId: adminUser.id,
        departmentId: departments["sales"].id,
        notes: "First discussion for partnership - just contacted",
        expectedCloseDate: new Date("2026-06-30"),
      },
      {
        title: "Tanaka Distribution - Jewelry Supply",
        value: 280000,
        stage: "LEAD" as const,
        contactId: contacts[4].id,
        assigneeId: johnUser.id,
        departmentId: departments["purchasing-procurement"].id,
        notes: "Potential supplier relationship - qualified",
        expectedCloseDate: new Date("2026-07-15"),
      },
      {
        title: "European Boutique Chain - Wholesale",
        value: 500000,
        stage: "OPPORTUNITY" as const,
        contactId: contacts[0].id,
        assigneeId: alecUser.id,
        departmentId: departments["sales"].id,
        notes: "Multi-location wholesale arrangement - discovery phase",
        expectedCloseDate: new Date("2026-06-01"),
      },
      {
        title: "Asian Market Entry - Distribution Deal",
        value: 750000,
        stage: "SALE" as const,
        contactId: contacts[1].id,
        assigneeId: adminUser.id,
        departmentId: departments["sales"].id,
        notes: "Exclusive rights for Asia-Pacific region - WON",
        expectedCloseDate: new Date("2026-02-20"),
        closedAt: new Date("2026-02-20"),
      },
      {
        title: "Specialty Retailer - Franchise Opportunity",
        value: 100000,
        stage: "LEAD" as const,
        contactId: contacts[3].id,
        assigneeId: johnUser.id,
        departmentId: departments["sales"].id,
        notes: "Franchise partnership exploration - initial contact",
        expectedCloseDate: new Date("2026-08-01"),
      },
    ];

    for (const deal of crmDeals) {
      await prisma.crmDeal.create({
        data: deal,
      });
    }

    console.log("✓ CRM deals created");

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
        departmentId: departments["sales"].id,
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
        departmentId: departments["human-resources"].id,
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
        departmentId: marketingDept.id,
        authorId: alecUser.id,
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

    console.log("✅ Database seed completed successfully!");
    console.log("\n📊 Summary:");
    console.log(`- 3 users created:`);
    console.log(`  • Al Sukara (ADMIN) - admin@raffi.com`);
    console.log(`  • John Lim (MANAGER) - john@raffi.com`);
    console.log(`  • Alec Vandebelt (MANAGER) - alec@raffi.com`);
    console.log(`- 18 departments created (matching navigation config)`);
    console.log(`- 71 roles created across departments`);
    console.log(`- 5 KPI definitions created`);
    console.log(`- 3 workflow templates created`);
    console.log(`- 3 sample tasks created`);
    console.log(`- 2 sample approvals created`);
    console.log(`- 5 CRM contacts created`);
    console.log(`- 8 CRM deals created (LEAD, OPPORTUNITY, SALE stages)`);
    console.log(`- 3 sample documents created`);
  } catch (error) {
    console.error("Error during seed:", error);
    throw error;
  }
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
