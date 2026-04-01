/**
 * Department metadata configuration with colors, icons, and descriptions
 */
export const departmentConfig = {
  'executive-leadership': {
    name: 'Executive / Leadership',
    slug: 'executive-leadership',
    icon: 'Crown',
    color: '#8B5CF6',
    description: 'C-level executives and strategic leadership team',
    roles: [
      {
        title: 'CEO / Owner',
        slug: 'ceo-owner',
        description: 'Chief Executive Officer and owner of the organization',
      },
      {
        title: 'COO',
        slug: 'coo',
        description: 'Chief Operating Officer overseeing daily operations',
      },
      {
        title: 'CFO',
        slug: 'cfo',
        description: 'Chief Financial Officer managing financial strategy',
      },
      {
        title: 'VP Operations',
        slug: 'vp-operations',
        description: 'Vice President overseeing operational excellence',
      },
    ],
  },
  marketing: {
    name: 'Marketing',
    slug: 'marketing',
    icon: 'Megaphone',
    color: '#EC4899',
    description: 'Digital marketing, brand, and promotional campaigns',
    roles: [
      {
        title: 'Digital Marketing Manager',
        slug: 'digital-marketing-manager',
        description: 'Oversees digital marketing campaigns and strategy',
      },
      {
        title: 'Social Media Manager',
        slug: 'social-media-manager',
        description: 'Manages social media presence and engagement',
      },
      {
        title: 'SEO Manager',
        slug: 'seo-manager',
        description: 'Manages search engine optimization strategy',
      },
      {
        title: 'Web Development Manager',
        slug: 'web-development-manager',
        description: 'Oversees web development and technical implementation',
      },
      {
        title: 'Marketing Operations Manager',
        slug: 'marketing-operations-manager',
        description: 'Manages marketing operations and tools',
      },
      {
        title: 'Graphic Designer',
        slug: 'graphic-designer',
        description: 'Creates visual content and design materials',
      },
      {
        title: 'Content Manager',
        slug: 'content-manager',
        description: 'Manages content creation and distribution',
      },
      {
        title: 'Paid Media Manager',
        slug: 'paid-media-manager',
        description: 'Manages paid advertising campaigns',
      },
      {
        title: 'Brand Manager',
        slug: 'brand-manager',
        description: 'Manages brand strategy and consistency',
      },
    ],
  },
  ecommerce: {
    name: 'Ecommerce',
    slug: 'ecommerce',
    icon: 'ShoppingCart',
    color: '#06B6D4',
    description: 'Online sales, digital merchandising, and web analytics',
    roles: [
      {
        title: 'Ecommerce Director',
        slug: 'ecommerce-director',
        description: 'Directs overall ecommerce strategy and performance',
      },
      {
        title: 'Ecommerce Manager',
        slug: 'ecommerce-manager',
        description: 'Manages day-to-day ecommerce operations',
      },
      {
        title: 'Digital Merchandiser',
        slug: 'digital-merchandiser',
        description: 'Plans and optimizes product assortment online',
      },
      {
        title: 'Web Analyst',
        slug: 'web-analyst',
        description: 'Analyzes website performance and user behavior',
      },
    ],
  },
  'retail-operations': {
    name: 'Retail Operations',
    slug: 'retail-operations',
    icon: 'Store',
    color: '#F59E0B',
    description: 'In-store operations, customer service, and store management',
    roles: [
      {
        title: 'Retail Operations Manager',
        slug: 'retail-operations-manager',
        description: 'Oversees all store operations and performance',
      },
      {
        title: 'Store Manager',
        slug: 'store-manager',
        description: 'Manages individual store operations',
      },
      {
        title: 'Assistant Store Manager',
        slug: 'assistant-store-manager',
        description: 'Assists store manager in daily operations',
      },
      {
        title: 'Service Counter Manager',
        slug: 'service-counter-manager',
        description: 'Manages service counter operations and staff',
      },
      {
        title: 'Client Advisor Lead',
        slug: 'client-advisor-lead',
        description: 'Leads client advisory team and drives sales',
      },
      {
        title: 'Reception / Concierge',
        slug: 'reception-concierge',
        description: 'Manages reception and concierge services',
      },
      {
        title: 'Inventory Coordinator',
        slug: 'inventory-coordinator',
        description: 'Coordinates in-store inventory management',
      },
    ],
  },
  sales: {
    name: 'Sales',
    slug: 'sales',
    icon: 'TrendingUp',
    color: '#10B981',
    description: 'Sales team, client acquisition, and revenue generation',
    roles: [
      {
        title: 'Sales Director',
        slug: 'sales-director',
        description: 'Directs sales strategy and performance',
      },
      {
        title: 'Sales Manager',
        slug: 'sales-manager',
        description: 'Manages sales team and targets',
      },
      {
        title: 'Senior Sales Associate',
        slug: 'senior-sales-associate',
        description: 'Senior-level sales professional',
      },
      {
        title: 'Sales Associate',
        slug: 'sales-associate',
        description: 'Sales professional driving transactions',
      },
      {
        title: 'Client Advisor',
        slug: 'client-advisor',
        description: 'Provides personalized client advisory services',
      },
    ],
  },
  'client-experience': {
    name: 'Client Experience / CRM',
    slug: 'client-experience',
    icon: 'Heart',
    color: '#EF4444',
    description: 'Customer relationship management and client satisfaction',
    roles: [
      {
        title: 'CX Director',
        slug: 'cx-director',
        description: 'Directs customer experience strategy',
      },
      {
        title: 'CRM Manager',
        slug: 'crm-manager',
        description: 'Manages CRM systems and data',
      },
      {
        title: 'Client Relations Manager',
        slug: 'client-relations-manager',
        description: 'Manages client relationships and retention',
      },
      {
        title: 'VIP Client Manager',
        slug: 'vip-client-manager',
        description: 'Manages VIP and high-value client accounts',
      },
      {
        title: 'After-Sales Manager',
        slug: 'after-sales-manager',
        description: 'Manages post-purchase client support',
      },
    ],
  },
  'inventory-merchandising': {
    name: 'Inventory / Merchandising',
    slug: 'inventory-merchandising',
    icon: 'Package',
    color: '#8B5CF6',
    description: 'Inventory management, merchandising, and product assortment',
    roles: [
      {
        title: 'Inventory Director',
        slug: 'inventory-director',
        description: 'Directs inventory strategy and planning',
      },
      {
        title: 'Merchandising Manager',
        slug: 'merchandising-manager',
        description: 'Manages product assortment and displays',
      },
      {
        title: 'Inventory Analyst',
        slug: 'inventory-analyst',
        description: 'Analyzes inventory levels and trends',
      },
      {
        title: 'Buyer',
        slug: 'buyer',
        description: 'Purchases inventory from suppliers',
      },
      {
        title: 'Stock Controller',
        slug: 'stock-controller',
        description: 'Controls and manages stock levels',
      },
    ],
  },
  'repairs-service': {
    name: 'Repairs / Service',
    slug: 'repairs-service',
    icon: 'Wrench',
    color: '#3B82F6',
    description: 'Repair services, maintenance, and quality control',
    roles: [
      {
        title: 'Service Manager',
        slug: 'service-manager',
        description: 'Manages all repair and service operations',
      },
      {
        title: 'Repair Coordinator',
        slug: 'repair-coordinator',
        description: 'Coordinates general repair services',
      },
      {
        title: 'Watchmaker Coordinator',
        slug: 'watchmaker-coordinator',
        description: 'Coordinates watch repair services',
      },
      {
        title: 'Jewellery Repair Coordinator',
        slug: 'jewellery-repair-coordinator',
        description: 'Coordinates jewellery repair services',
      },
      {
        title: 'Quality Control',
        slug: 'quality-control',
        description: 'Ensures quality of repair work',
      },
    ],
  },
  'purchasing-procurement': {
    name: 'Purchasing / Procurement',
    slug: 'purchasing-procurement',
    icon: 'ShoppingCart',
    color: '#6366F1',
    description: 'Vendor management, purchasing, and procurement operations',
    roles: [
      {
        title: 'Procurement Director',
        slug: 'procurement-director',
        description: 'Directs procurement strategy',
      },
      {
        title: 'Purchasing Manager',
        slug: 'purchasing-manager',
        description: 'Manages purchasing operations',
      },
      {
        title: 'Vendor Relations Manager',
        slug: 'vendor-relations-manager',
        description: 'Manages vendor relationships',
      },
      {
        title: 'Purchase Order Coordinator',
        slug: 'purchase-order-coordinator',
        description: 'Coordinates purchase orders',
      },
    ],
  },
  'finance-accounting': {
    name: 'Finance / Accounting',
    slug: 'finance-accounting',
    icon: 'DollarSign',
    color: '#14B8A6',
    description: 'Financial management, accounting, and reporting',
    roles: [
      {
        title: 'Controller',
        slug: 'controller',
        description: 'Controls accounting operations',
      },
      {
        title: 'Accounts Payable',
        slug: 'accounts-payable',
        description: 'Manages accounts payable',
      },
      {
        title: 'Accounts Receivable',
        slug: 'accounts-receivable',
        description: 'Manages accounts receivable',
      },
      {
        title: 'Payroll Administrator',
        slug: 'payroll-administrator',
        description: 'Administers payroll',
      },
      {
        title: 'Financial Analyst',
        slug: 'financial-analyst',
        description: 'Analyzes financial data',
      },
    ],
  },
  'human-resources': {
    name: 'Human Resources',
    slug: 'human-resources',
    icon: 'Users',
    color: '#F97316',
    description: 'Recruitment, onboarding, training, and employee relations',
    roles: [
      {
        title: 'HR Manager',
        slug: 'hr-manager',
        description: 'Manages human resources operations',
      },
      {
        title: 'Recruiter',
        slug: 'recruiter',
        description: 'Recruits and sources talent',
      },
      {
        title: 'Onboarding Coordinator',
        slug: 'onboarding-coordinator',
        description: 'Coordinates employee onboarding',
      },
      {
        title: 'Training Manager',
        slug: 'training-manager',
        description: 'Manages training and development',
      },
      {
        title: 'Benefits Administrator',
        slug: 'benefits-administrator',
        description: 'Administers employee benefits',
      },
    ],
  },
  'it-systems': {
    name: 'IT / Systems',
    slug: 'it-systems',
    icon: 'Cpu',
    color: '#0EA5E9',
    description: 'IT infrastructure, systems administration, and support',
    roles: [
      {
        title: 'Systems Administrator',
        slug: 'systems-administrator',
        description: 'Administers IT systems and infrastructure',
      },
      {
        title: 'Help Desk Manager',
        slug: 'help-desk-manager',
        description: 'Manages IT support and help desk',
      },
      {
        title: 'ERP Administrator',
        slug: 'erp-administrator',
        description: 'Administers ERP system',
      },
      {
        title: 'CRM Administrator',
        slug: 'crm-administrator',
        description: 'Administers CRM system',
      },
      {
        title: 'POS Systems Manager',
        slug: 'pos-systems-manager',
        description: 'Manages POS systems',
      },
      {
        title: 'Ecommerce Systems Manager',
        slug: 'ecommerce-systems-manager',
        description: 'Manages ecommerce platform',
      },
    ],
  },
  'logistics-shipping': {
    name: 'Logistics / Shipping',
    slug: 'logistics-shipping',
    icon: 'Truck',
    color: '#84CC16',
    description: 'Logistics, shipping, warehousing, and fulfillment',
    roles: [
      {
        title: 'Logistics Manager',
        slug: 'logistics-manager',
        description: 'Manages logistics operations',
      },
      {
        title: 'Shipping Coordinator',
        slug: 'shipping-coordinator',
        description: 'Coordinates shipping operations',
      },
      {
        title: 'Receiving Clerk',
        slug: 'receiving-clerk',
        description: 'Manages receiving operations',
      },
      {
        title: 'Warehouse Manager',
        slug: 'warehouse-manager',
        description: 'Manages warehouse operations',
      },
    ],
  },
  'events-activations': {
    name: 'Events / Activations',
    slug: 'events-activations',
    icon: 'Sparkles',
    color: '#A855F7',
    description: 'Events, activations, promotions, and PR',
    roles: [
      {
        title: 'Events Director',
        slug: 'events-director',
        description: 'Directs events and activations',
      },
      {
        title: 'Events Coordinator',
        slug: 'events-coordinator',
        description: 'Coordinates events and logistics',
      },
      {
        title: 'Brand Activation Manager',
        slug: 'brand-activation-manager',
        description: 'Manages brand activations',
      },
      {
        title: 'PR Manager',
        slug: 'pr-manager',
        description: 'Manages public relations',
      },
    ],
  },
  'visual-merchandising': {
    name: 'Visual Merchandising',
    slug: 'visual-merchandising',
    icon: 'Palette',
    color: '#EC4899',
    description: 'Visual displays, store design, and product presentation',
    roles: [
      {
        title: 'Visual Merchandising Director',
        slug: 'visual-merchandising-director',
        description: 'Directs visual merchandising strategy',
      },
      {
        title: 'Display Coordinator',
        slug: 'display-coordinator',
        description: 'Coordinates display creation',
      },
      {
        title: 'Store Designer',
        slug: 'store-designer',
        description: 'Designs store layouts and environments',
      },
    ],
  },
  'customer-care': {
    name: 'Customer Care',
    slug: 'customer-care',
    icon: 'Headphones',
    color: '#F43F5E',
    description: 'Customer support, complaints handling, and returns management',
    roles: [
      {
        title: 'Customer Care Manager',
        slug: 'customer-care-manager',
        description: 'Manages customer care operations',
      },
      {
        title: 'Support Specialist',
        slug: 'support-specialist',
        description: 'Provides customer support',
      },
      {
        title: 'Complaints Handler',
        slug: 'complaints-handler',
        description: 'Handles customer complaints',
      },
      {
        title: 'Returns Coordinator',
        slug: 'returns-coordinator',
        description: 'Coordinates returns and exchanges',
      },
    ],
  },
  'legal-compliance': {
    name: 'Legal / Compliance',
    slug: 'legal-compliance',
    icon: 'Scale',
    color: '#7C3AED',
    description: 'Legal affairs, compliance, contracts, and privacy',
    roles: [
      {
        title: 'General Counsel',
        slug: 'general-counsel',
        description: 'Provides legal counsel',
      },
      {
        title: 'Compliance Officer',
        slug: 'compliance-officer',
        description: 'Ensures regulatory compliance',
      },
      {
        title: 'Contract Manager',
        slug: 'contract-manager',
        description: 'Manages contracts',
      },
      {
        title: 'Privacy Officer',
        slug: 'privacy-officer',
        description: 'Manages data privacy',
      },
    ],
  },
  'facilities-maintenance': {
    name: 'Facilities / Maintenance',
    slug: 'facilities-maintenance',
    icon: 'Hammer',
    color: '#92400E',
    description: 'Facilities management, maintenance, security, and cleaning',
    roles: [
      {
        title: 'Facilities Manager',
        slug: 'facilities-manager',
        description: 'Manages facilities operations',
      },
      {
        title: 'Maintenance Coordinator',
        slug: 'maintenance-coordinator',
        description: 'Coordinates maintenance work',
      },
      {
        title: 'Security Manager',
        slug: 'security-manager',
        description: 'Manages security operations',
      },
      {
        title: 'Cleaning Supervisor',
        slug: 'cleaning-supervisor',
        description: 'Supervises cleaning operations',
      },
    ],
  },
};

/**
 * Get all departments
 */
export function getAllDepartments() {
  return Object.values(departmentConfig);
}

/**
 * Get department by slug
 */
export function getDepartmentBySlug(slug: string) {
  return departmentConfig[slug as keyof typeof departmentConfig];
}

/**
 * Get all roles for a department
 */
export function getDepartmentRoles(departmentSlug: string) {
  const dept = getDepartmentBySlug(departmentSlug);
  return dept?.roles || [];
}

/**
 * Get role by department slug and role slug
 */
export function getRoleBySlug(departmentSlug: string, roleSlug: string) {
  const roles = getDepartmentRoles(departmentSlug);
  return roles.find((role) => role.slug === roleSlug);
}
