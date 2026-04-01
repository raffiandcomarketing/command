import { NavItem } from '@/types';

/**
 * Complete sidebar navigation configuration for luxury retail command centre
 */
export const navigationConfig: NavItem[] = [
  {
    label: 'Dashboard',
    href: '/',
    icon: 'Home',
  },
  {
    label: 'Departments',
    href: '/departments',
    icon: 'Building2',
    children: [
      {
        label: 'Executive / Leadership',
        href: '/departments/executive-leadership',
        icon: 'Crown',
        children: [
          {
            label: 'CEO / Owner',
            href: '/departments/executive-leadership/roles/ceo-owner',
            icon: 'User',
          },
          {
            label: 'COO',
            href: '/departments/executive-leadership/roles/coo',
            icon: 'User',
          },
          {
            label: 'CFO',
            href: '/departments/executive-leadership/roles/cfo',
            icon: 'User',
          },
          {
            label: 'VP Operations',
            href: '/departments/executive-leadership/roles/vp-operations',
            icon: 'User',
          },
        ],
      },
      {
        label: 'Marketing',
        href: '/departments/marketing',
        icon: 'Megaphone',
        children: [
          {
            label: 'Digital Marketing Manager',
            href: '/departments/marketing/roles/digital-marketing-manager',
            icon: 'User',
          },
          {
            label: 'Social Media Manager',
            href: '/departments/marketing/roles/social-media-manager',
            icon: 'User',
          },
          {
            label: 'SEO Manager',
            href: '/departments/marketing/roles/seo-manager',
            icon: 'User',
          },
          {
            label: 'Web Development Manager',
            href: '/departments/marketing/roles/web-development-manager',
            icon: 'User',
          },
          {
            label: 'Marketing Operations Manager',
            href: '/departments/marketing/roles/marketing-operations-manager',
            icon: 'User',
          },
          {
            label: 'Graphic Designer',
            href: '/departments/marketing/roles/graphic-designer',
            icon: 'User',
          },
          {
            label: 'Content Manager',
            href: '/departments/marketing/roles/content-manager',
            icon: 'User',
          },
          {
            label: 'Paid Media Manager',
            href: '/departments/marketing/roles/paid-media-manager',
            icon: 'User',
          },
          {
            label: 'Brand Manager',
            href: '/departments/marketing/roles/brand-manager',
            icon: 'User',
          },
        ],
      },
      {
        label: 'Ecommerce',
        href: '/departments/ecommerce',
        icon: 'ShoppingCart',
        children: [
          {
            label: 'Ecommerce Director',
            href: '/departments/ecommerce/roles/ecommerce-director',
            icon: 'User',
          },
          {
            label: 'Ecommerce Manager',
            href: '/departments/ecommerce/roles/ecommerce-manager',
            icon: 'User',
          },
          {
            label: 'Digital Merchandiser',
            href: '/departments/ecommerce/roles/digital-merchandiser',
            icon: 'User',
          },
          {
            label: 'Web Analyst',
            href: '/departments/ecommerce/roles/web-analyst',
            icon: 'User',
          },
        ],
      },
      {
        label: 'Retail Operations',
        href: '/departments/retail-operations',
        icon: 'Store',
        children: [
          {
            label: 'Retail Operations Manager',
            href: '/departments/retail-operations/roles/retail-operations-manager',
            icon: 'User',
          },
          {
            label: 'Store Manager',
            href: '/departments/retail-operations/roles/store-manager',
            icon: 'User',
          },
          {
            label: 'Assistant Store Manager',
            href: '/departments/retail-operations/roles/assistant-store-manager',
            icon: 'User',
          },
          {
            label: 'Service Counter Manager',
            href: '/departments/retail-operations/roles/service-counter-manager',
            icon: 'User',
          },
          {
            label: 'Client Advisor Lead',
            href: '/departments/retail-operations/roles/client-advisor-lead',
            icon: 'User',
          },
          {
            label: 'Reception / Concierge',
            href: '/departments/retail-operations/roles/reception-concierge',
            icon: 'User',
          },
          {
            label: 'Inventory Coordinator',
            href: '/departments/retail-operations/roles/inventory-coordinator',
            icon: 'User',
          },
        ],
      },
      {
        label: 'Sales',
        href: '/departments/sales',
        icon: 'TrendingUp',
        children: [
          {
            label: 'Sales Director',
            href: '/departments/sales/roles/sales-director',
            icon: 'User',
          },
          {
            label: 'Sales Manager',
            href: '/departments/sales/roles/sales-manager',
            icon: 'User',
          },
          {
            label: 'Senior Sales Associate',
            href: '/departments/sales/roles/senior-sales-associate',
            icon: 'User',
          },
          {
            label: 'Sales Associate',
            href: '/departments/sales/roles/sales-associate',
            icon: 'User',
          },
          {
            label: 'Client Advisor',
            href: '/departments/sales/roles/client-advisor',
            icon: 'User',
          },
        ],
      },
      {
        label: 'Client Experience / CRM',
        href: '/departments/client-experience',
        icon: 'Heart',
        children: [
          {
            label: 'CX Director',
            href: '/departments/client-experience/roles/cx-director',
            icon: 'User',
          },
          {
            label: 'CRM Manager',
            href: '/departments/client-experience/roles/crm-manager',
            icon: 'User',
          },
          {
            label: 'Client Relations Manager',
            href: '/departments/client-experience/roles/client-relations-manager',
            icon: 'User',
          },
          {
            label: 'VIP Client Manager',
            href: '/departments/client-experience/roles/vip-client-manager',
            icon: 'User',
          },
          {
            label: 'After-Sales Manager',
            href: '/departments/client-experience/roles/after-sales-manager',
            icon: 'User',
          },
        ],
      },
      {
        label: 'Inventory / Merchandising',
        href: '/departments/inventory-merchandising',
        icon: 'Package',
        children: [
          {
            label: 'Inventory Director',
            href: '/departments/inventory-merchandising/roles/inventory-director',
            icon: 'User',
          },
          {
            label: 'Merchandising Manager',
            href: '/departments/inventory-merchandising/roles/merchandising-manager',
            icon: 'User',
          },
          {
            label: 'Inventory Analyst',
            href: '/departments/inventory-merchandising/roles/inventory-analyst',
            icon: 'User',
          },
          {
            label: 'Buyer',
            href: '/departments/inventory-merchandising/roles/buyer',
            icon: 'User',
          },
          {
            label: 'Stock Controller',
            href: '/departments/inventory-merchandising/roles/stock-controller',
            icon: 'User',
          },
        ],
      },
      {
        label: 'Repairs / Service',
        href: '/departments/repairs-service',
        icon: 'Wrench',
        children: [
          {
            label: 'Service Manager',
            href: '/departments/repairs-service/roles/service-manager',
            icon: 'User',
          },
          {
            label: 'Repair Coordinator',
            href: '/departments/repairs-service/roles/repair-coordinator',
            icon: 'User',
          },
          {
            label: 'Watchmaker Coordinator',
            href: '/departments/repairs-service/roles/watchmaker-coordinator',
            icon: 'User',
          },
          {
            label: 'Jewellery Repair Coordinator',
            href: '/departments/repairs-service/roles/jewellery-repair-coordinator',
            icon: 'User',
          },
          {
            label: 'Quality Control',
            href: '/departments/repairs-service/roles/quality-control',
            icon: 'User',
          },
        ],
      },
      {
        label: 'Purchasing / Procurement',
        href: '/departments/purchasing-procurement',
        icon: 'ShoppingCart',
        children: [
          {
            label: 'Procurement Director',
            href: '/departments/purchasing-procurement/roles/procurement-director',
            icon: 'User',
          },
          {
            label: 'Purchasing Manager',
            href: '/departments/purchasing-procurement/roles/purchasing-manager',
            icon: 'User',
          },
          {
            label: 'Vendor Relations Manager',
            href: '/departments/purchasing-procurement/roles/vendor-relations-manager',
            icon: 'User',
          },
          {
            label: 'Purchase Order Coordinator',
            href: '/departments/purchasing-procurement/roles/purchase-order-coordinator',
            icon: 'User',
          },
        ],
      },
      {
        label: 'Finance / Accounting',
        href: '/departments/finance-accounting',
        icon: 'DollarSign',
        children: [
          {
            label: 'Controller',
            href: '/departments/finance-accounting/roles/controller',
            icon: 'User',
          },
          {
            label: 'Accounts Payable',
            href: '/departments/finance-accounting/roles/accounts-payable',
            icon: 'User',
          },
          {
            label: 'Accounts Receivable',
            href: '/departments/finance-accounting/roles/accounts-receivable',
            icon: 'User',
          },
          {
            label: 'Payroll Administrator',
            href: '/departments/finance-accounting/roles/payroll-administrator',
            icon: 'User',
          },
          {
            label: 'Financial Analyst',
            href: '/departments/finance-accounting/roles/financial-analyst',
            icon: 'User',
          },
        ],
      },
      {
        label: 'Human Resources',
        href: '/departments/human-resources',
        icon: 'Users',
        children: [
          {
            label: 'HR Manager',
            href: '/departments/human-resources/roles/hr-manager',
            icon: 'User',
          },
          {
            label: 'Recruiter',
            href: '/departments/human-resources/roles/recruiter',
            icon: 'User',
          },
          {
            label: 'Onboarding Coordinator',
            href: '/departments/human-resources/roles/onboarding-coordinator',
            icon: 'User',
          },
          {
            label: 'Training Manager',
            href: '/departments/human-resources/roles/training-manager',
            icon: 'User',
          },
          {
            label: 'Benefits Administrator',
            href: '/departments/human-resources/roles/benefits-administrator',
            icon: 'User',
          },
        ],
      },
      {
        label: 'IT / Systems',
        href: '/departments/it-systems',
        icon: 'Cpu',
        children: [
          {
            label: 'Systems Administrator',
            href: '/departments/it-systems/roles/systems-administrator',
            icon: 'User',
          },
          {
            label: 'Help Desk Manager',
            href: '/departments/it-systems/roles/help-desk-manager',
            icon: 'User',
          },
          {
            label: 'ERP Administrator',
            href: '/departments/it-systems/roles/erp-administrator',
            icon: 'User',
          },
          {
            label: 'CRM Administrator',
            href: '/departments/it-systems/roles/crm-administrator',
            icon: 'User',
          },
          {
            label: 'POS Systems Manager',
            href: '/departments/it-systems/roles/pos-systems-manager',
            icon: 'User',
          },
          {
            label: 'Ecommerce Systems Manager',
            href: '/departments/it-systems/roles/ecommerce-systems-manager',
            icon: 'User',
          },
        ],
      },
      {
        label: 'Logistics / Shipping',
        href: '/departments/logistics-shipping',
        icon: 'Truck',
        children: [
          {
            label: 'Logistics Manager',
            href: '/departments/logistics-shipping/roles/logistics-manager',
            icon: 'User',
          },
          {
            label: 'Shipping Coordinator',
            href: '/departments/logistics-shipping/roles/shipping-coordinator',
            icon: 'User',
          },
          {
            label: 'Receiving Clerk',
            href: '/departments/logistics-shipping/roles/receiving-clerk',
            icon: 'User',
          },
          {
            label: 'Warehouse Manager',
            href: '/departments/logistics-shipping/roles/warehouse-manager',
            icon: 'User',
          },
        ],
      },
      {
        label: 'Events / Activations',
        href: '/departments/events-activations',
        icon: 'Sparkles',
        children: [
          {
            label: 'Events Director',
            href: '/departments/events-activations/roles/events-director',
            icon: 'User',
          },
          {
            label: 'Events Coordinator',
            href: '/departments/events-activations/roles/events-coordinator',
            icon: 'User',
          },
          {
            label: 'Brand Activation Manager',
            href: '/departments/events-activations/roles/brand-activation-manager',
            icon: 'User',
          },
          {
            label: 'PR Manager',
            href: '/departments/events-activations/roles/pr-manager',
            icon: 'User',
          },
        ],
      },
      {
        label: 'Visual Merchandising',
        href: '/departments/visual-merchandising',
        icon: 'Palette',
        children: [
          {
            label: 'Visual Merchandising Director',
            href: '/departments/visual-merchandising/roles/visual-merchandising-director',
            icon: 'User',
          },
          {
            label: 'Display Coordinator',
            href: '/departments/visual-merchandising/roles/display-coordinator',
            icon: 'User',
          },
          {
            label: 'Store Designer',
            href: '/departments/visual-merchandising/roles/store-designer',
            icon: 'User',
          },
        ],
      },
      {
        label: 'Customer Care',
        href: '/departments/customer-care',
        icon: 'Headphones',
        children: [
          {
            label: 'Customer Care Manager',
            href: '/departments/customer-care/roles/customer-care-manager',
            icon: 'User',
          },
          {
            label: 'Support Specialist',
            href: '/departments/customer-care/roles/support-specialist',
            icon: 'User',
          },
          {
            label: 'Complaints Handler',
            href: '/departments/customer-care/roles/complaints-handler',
            icon: 'User',
          },
          {
            label: 'Returns Coordinator',
            href: '/departments/customer-care/roles/returns-coordinator',
            icon: 'User',
          },
        ],
      },
      {
        label: 'Legal / Compliance',
        href: '/departments/legal-compliance',
        icon: 'Scale',
        children: [
          {
            label: 'General Counsel',
            href: '/departments/legal-compliance/roles/general-counsel',
            icon: 'User',
          },
          {
            label: 'Compliance Officer',
            href: '/departments/legal-compliance/roles/compliance-officer',
            icon: 'User',
          },
          {
            label: 'Contract Manager',
            href: '/departments/legal-compliance/roles/contract-manager',
            icon: 'User',
          },
          {
            label: 'Privacy Officer',
            href: '/departments/legal-compliance/roles/privacy-officer',
            icon: 'User',
          },
        ],
      },
      {
        label: 'Facilities / Maintenance',
        href: '/departments/facilities-maintenance',
        icon: 'Hammer',
        children: [
          {
            label: 'Facilities Manager',
            href: '/departments/facilities-maintenance/roles/facilities-manager',
            icon: 'User',
          },
          {
            label: 'Maintenance Coordinator',
            href: '/departments/facilities-maintenance/roles/maintenance-coordinator',
            icon: 'User',
          },
          {
            label: 'Security Manager',
            href: '/departments/facilities-maintenance/roles/security-manager',
            icon: 'User',
          },
          {
            label: 'Cleaning Supervisor',
            href: '/departments/facilities-maintenance/roles/cleaning-supervisor',
            icon: 'User',
          },
        ],
      },
    ],
  },
  {
    label: 'Workflows',
    href: '/workflows',
    icon: 'GitBranch',
  },
  {
    label: 'Tasks',
    href: '/tasks',
    icon: 'CheckSquare',
  },
  {
    label: 'Approvals',
    href: '/approvals',
    icon: 'FileCheck',
    badge: 5,
  },
  {
    label: 'CRM',
    href: '/crm',
    icon: 'Briefcase',
  },
  {
    label: 'Automations',
    href: '/automations',
    icon: 'Zap',
  },
  {
    label: 'KPIs & Reports',
    href: '/kpis',
    icon: 'BarChart3',
  },
  {
    label: 'Notifications',
    href: '/notifications',
    icon: 'Bell',
    badge: 3,
  },
  {
    label: 'Admin',
    href: '/admin',
    icon: 'Settings',
    children: [
      {
        label: 'Departments',
        href: '/admin/departments',
        icon: 'Building2',
      },
      {
        label: 'Roles',
        href: '/admin/roles',
        icon: 'Shield',
      },
      {
        label: 'Users',
        href: '/admin/users',
        icon: 'Users',
      },
      {
        label: 'Workflows',
        href: '/admin/workflows',
        icon: 'GitBranch',
      },
      {
        label: 'Automations',
        href: '/admin/automations',
        icon: 'Zap',
      },
      {
        label: 'Integrations',
        href: '/admin/integrations',
        icon: 'Plug',
      },
      {
        label: 'Settings',
        href: '/admin/settings',
        icon: 'Sliders',
      },
    ],
  },
];
