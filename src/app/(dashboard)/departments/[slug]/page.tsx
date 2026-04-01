'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { getDepartmentBySlug, getDepartmentRoles } from '@/config/departments';
import {
  Users,
  CheckSquare,
  GitBranch,
  FileCheck,
  AlertCircle,
  Clock,
  ArrowRight,
  TrendingUp,
  Zap,
  FileText,
  Settings,
  Plus,
  Crown,
  Megaphone,
  ShoppingCart,
  Store,
  Heart,
  Package,
  Wrench,
  DollarSign,
  Cpu,
  Truck,
  Sparkles,
  Palette,
  Headphones,
  Scale,
  Hammer,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const iconMap: Record<string, any> = {
  Crown,
  Megaphone,
  ShoppingCart,
  Store,
  TrendingUp,
  Heart,
  Package,
  Wrench,
  DollarSign,
  Cpu,
  Truck,
  Sparkles,
  Palette,
  Headphones,
  Scale,
  Hammer,
  Users,
  GitBranch,
};

// Department-specific data configuration
const departmentData: Record<string, {
  kpis: Array<{ id: string; name: string; value: number; target: number; trend: 'up' | 'down'; trendPercent: number }>;
  tasks: Array<{ id: string; title: string; status: 'pending' | 'in-progress' | 'review'; priority: 'high' | 'medium'; assignee: string; dueDate: string }>;
  automations: Array<{ id: string; name: string; description: string; trigger: 'Scheduled' | 'Condition' | 'Event'; active: boolean; executions: number; lastTriggered: string }>;
  activities: Array<{ id: string; user: string; action: string; entity: string; timestamp: string }>;
  sops: Array<{ id: string; title: string; version: string; updated: string }>;
}> = {
  'executive-leadership': {
    kpis: [
      { id: '1', name: 'Revenue Growth', value: 1.2, target: 1.5, trend: 'up', trendPercent: 8 },
      { id: '2', name: 'Operational Efficiency', value: 87, target: 95, trend: 'up', trendPercent: 5 },
      { id: '3', name: 'Strategic Initiatives on Track', value: 92, target: 100, trend: 'down', trendPercent: -3 },
      { id: '4', name: 'Team Satisfaction Score', value: 8.2, target: 8.5, trend: 'up', trendPercent: 2 },
    ],
    tasks: [
      { id: '1', title: 'Q2 Board Report Preparation', status: 'in-progress', priority: 'high', assignee: 'CEO', dueDate: '2026-04-15' },
      { id: '2', title: 'Strategic Planning Session', status: 'pending', priority: 'high', assignee: 'CEO', dueDate: '2026-04-20' },
      { id: '3', title: 'Budget Allocation Review', status: 'review', priority: 'high', assignee: 'CFO', dueDate: '2026-04-10' },
      { id: '4', title: 'Annual Compliance Audit', status: 'pending', priority: 'medium', assignee: 'COO', dueDate: '2026-04-30' },
    ],
    automations: [
      { id: '1', name: 'Daily Executive Summary', description: 'Sends key metrics digest', trigger: 'Scheduled', active: true, executions: 87, lastTriggered: '2 hours ago' },
      { id: '2', name: 'Strategic Alert Escalation', description: 'Escalates critical business issues', trigger: 'Event', active: true, executions: 23, lastTriggered: '1 day ago' },
      { id: '3', name: 'Board Meeting Reminder', description: 'Reminds of upcoming board meetings', trigger: 'Scheduled', active: true, executions: 12, lastTriggered: '3 days ago' },
    ],
    activities: [
      { id: '1', user: 'John Smith', action: 'approved', entity: 'Q2 Strategic Plan', timestamp: 'Today at 3:15 PM' },
      { id: '2', user: 'Sarah Johnson', action: 'completed', entity: 'Annual Strategy Review', timestamp: 'Today at 1:45 PM' },
      { id: '3', user: 'Michael Chen', action: 'requested', entity: 'Budget Variance Analysis', timestamp: 'Yesterday' },
    ],
    sops: [
      { id: '1', title: 'Board Meeting Protocol', version: '1.5', updated: '2026-03-15' },
      { id: '2', title: 'Executive Decision Making Framework', version: '2.0', updated: '2026-03-10' },
      { id: '3', title: 'Strategic Planning Guidelines', version: '1.8', updated: '2026-03-05' },
    ],
  },
  marketing: {
    kpis: [
      { id: '1', name: 'Website Traffic', value: 45230, target: 50000, trend: 'up', trendPercent: 12 },
      { id: '2', name: 'Conversion Rate', value: 3.2, target: 4.0, trend: 'up', trendPercent: 5 },
      { id: '3', name: 'Email Open Rate', value: 24.5, target: 28.0, trend: 'down', trendPercent: -2 },
      { id: '4', name: 'Social Engagement', value: 8923, target: 10000, trend: 'up', trendPercent: 18 },
    ],
    tasks: [
      { id: '1', title: 'Q2 Campaign Strategy', status: 'in-progress', priority: 'high', assignee: 'Sarah Mitchell', dueDate: '2026-04-05' },
      { id: '2', title: 'Social Media Calendar', status: 'pending', priority: 'medium', assignee: 'James Wilson', dueDate: '2026-04-08' },
      { id: '3', title: 'Email A/B Testing', status: 'review', priority: 'high', assignee: 'Yuki Tanaka', dueDate: '2026-04-03' },
      { id: '4', title: 'Website Analytics Report', status: 'pending', priority: 'medium', assignee: 'Marcus Chen', dueDate: '2026-04-10' },
    ],
    automations: [
      { id: '1', name: 'Daily Marketing Report', description: 'Sends daily performance digest', trigger: 'Scheduled', active: true, executions: 45, lastTriggered: '2 hours ago' },
      { id: '2', name: 'Content Expiration Alerts', description: 'Notifies when content needs refresh', trigger: 'Condition', active: true, executions: 12, lastTriggered: '1 day ago' },
      { id: '3', name: 'Campaign Performance Escalation', description: 'Escalates underperforming campaigns', trigger: 'Event', active: false, executions: 8, lastTriggered: '5 days ago' },
    ],
    activities: [
      { id: '1', user: 'Sarah Mitchell', action: 'completed task', entity: 'Q1 Marketing Campaign Review', timestamp: 'Today at 2:30 PM' },
      { id: '2', user: 'Marcus Chen', action: 'submitted workflow', entity: 'Content Publishing', timestamp: 'Today at 11:45 AM' },
      { id: '3', user: 'Elena Rodriguez', action: 'requested approval', entity: 'Budget Allocation', timestamp: 'Yesterday' },
    ],
    sops: [
      { id: '1', title: 'Content Creation Guidelines', version: '2.1', updated: '2026-03-20' },
      { id: '2', title: 'Email Campaign SOP', version: '1.8', updated: '2026-03-18' },
      { id: '3', title: 'Social Media Posting Standards', version: '3.2', updated: '2026-03-15' },
    ],
  },
  ecommerce: {
    kpis: [
      { id: '1', name: 'Online Revenue', value: 285400, target: 350000, trend: 'up', trendPercent: 7 },
      { id: '2', name: 'Cart Abandonment Rate', value: 32, target: 25, trend: 'down', trendPercent: -8 },
      { id: '3', name: 'Average Order Value', value: 1850, target: 2000, trend: 'up', trendPercent: 6 },
      { id: '4', name: 'Website Sessions', value: 12450, target: 15000, trend: 'up', trendPercent: 14 },
    ],
    tasks: [
      { id: '1', title: 'Product Page Optimization', status: 'in-progress', priority: 'high', assignee: 'Alex Turner', dueDate: '2026-04-08' },
      { id: '2', title: 'Checkout Flow Update', status: 'pending', priority: 'high', assignee: 'Jordan Kim', dueDate: '2026-04-12' },
      { id: '3', title: 'Holiday Collection Launch', status: 'review', priority: 'medium', assignee: 'Casey Lee', dueDate: '2026-04-18' },
      { id: '4', title: 'Payment Gateway Integration', status: 'pending', priority: 'high', assignee: 'Taylor Brown', dueDate: '2026-04-15' },
    ],
    automations: [
      { id: '1', name: 'Abandoned Cart Emails', description: 'Sends recovery emails automatically', trigger: 'Event', active: true, executions: 234, lastTriggered: '30 minutes ago' },
      { id: '2', name: 'Low Stock Alerts', description: 'Notifies inventory team', trigger: 'Condition', active: true, executions: 67, lastTriggered: '2 hours ago' },
      { id: '3', name: 'Price Change Notifications', description: 'Updates customers on price changes', trigger: 'Event', active: true, executions: 42, lastTriggered: '1 day ago' },
    ],
    activities: [
      { id: '1', user: 'Jordan Kim', action: 'deployed', entity: 'Checkout Redesign', timestamp: 'Today at 9:20 AM' },
      { id: '2', user: 'Alex Turner', action: 'completed', entity: 'Performance Optimization', timestamp: 'Yesterday at 5:00 PM' },
      { id: '3', user: 'Casey Lee', action: 'requested review', entity: 'New Product Listings', timestamp: '2 days ago' },
    ],
    sops: [
      { id: '1', title: 'Product Listing SOP', version: '2.3', updated: '2026-03-22' },
      { id: '2', title: 'Order Processing Guidelines', version: '1.9', updated: '2026-03-19' },
      { id: '3', title: 'Returns & Refunds Process', version: '2.1', updated: '2026-03-17' },
    ],
  },
  'retail-operations': {
    kpis: [
      { id: '1', name: 'In-Store Sales Revenue', value: 542000, target: 600000, trend: 'up', trendPercent: 9 },
      { id: '2', name: 'Customer Satisfaction', value: 4.6, target: 4.8, trend: 'up', trendPercent: 3 },
      { id: '3', name: 'Inventory Accuracy', value: 98.2, target: 99.5, trend: 'up', trendPercent: 2 },
      { id: '4', name: 'Staff Attendance Rate', value: 94.5, target: 96, trend: 'down', trendPercent: -1 },
    ],
    tasks: [
      { id: '1', title: 'Store Layout Redesign', status: 'in-progress', priority: 'high', assignee: 'David Brooks', dueDate: '2026-04-22' },
      { id: '2', title: 'Staff Training Program', status: 'pending', priority: 'medium', assignee: 'Rebecca White', dueDate: '2026-04-14' },
      { id: '3', title: 'Inventory Count', status: 'in-progress', priority: 'high', assignee: 'Michael Garcia', dueDate: '2026-04-05' },
      { id: '4', title: 'Customer Service Policy Update', status: 'review', priority: 'medium', assignee: 'Lisa Anderson', dueDate: '2026-04-09' },
    ],
    automations: [
      { id: '1', name: 'Daily Sales Report', description: 'Sends store performance metrics', trigger: 'Scheduled', active: true, executions: 73, lastTriggered: '3 hours ago' },
      { id: '2', name: 'Stock Level Alerts', description: 'Alerts when items need replenishment', trigger: 'Condition', active: true, executions: 156, lastTriggered: '1 hour ago' },
      { id: '3', name: 'Staffing Schedule Notification', description: 'Notifies team of schedule changes', trigger: 'Event', active: true, executions: 28, lastTriggered: '2 days ago' },
    ],
    activities: [
      { id: '1', user: 'David Brooks', action: 'approved', entity: 'Store Renovation Plan', timestamp: 'Today at 10:30 AM' },
      { id: '2', user: 'Michael Garcia', action: 'completed', entity: 'Quarterly Inventory', timestamp: 'Yesterday at 6:00 PM' },
      { id: '3', user: 'Rebecca White', action: 'submitted', entity: 'Q2 Training Schedule', timestamp: '2 days ago' },
    ],
    sops: [
      { id: '1', title: 'Daily Store Opening Checklist', version: '1.7', updated: '2026-03-21' },
      { id: '2', title: 'Customer Service Standards', version: '2.4', updated: '2026-03-18' },
      { id: '3', title: 'Inventory Management Protocol', version: '1.6', updated: '2026-03-16' },
    ],
  },
  sales: {
    kpis: [
      { id: '1', name: 'Monthly Revenue', value: 425000, target: 500000, trend: 'up', trendPercent: 11 },
      { id: '2', name: 'Close Rate', value: 28, target: 35, trend: 'up', trendPercent: 4 },
      { id: '3', name: 'Avg Deal Size', value: 8500, target: 10000, trend: 'down', trendPercent: -2 },
      { id: '4', name: 'Pipeline Value', value: 1200000, target: 1500000, trend: 'up', trendPercent: 15 },
    ],
    tasks: [
      { id: '1', title: 'Q2 Sales Targets', status: 'in-progress', priority: 'high', assignee: 'Robert Miller', dueDate: '2026-04-05' },
      { id: '2', title: 'Client Follow-ups', status: 'in-progress', priority: 'high', assignee: 'Jennifer Davis', dueDate: '2026-04-03' },
      { id: '3', title: 'New Product Training', status: 'pending', priority: 'medium', assignee: 'Thomas Wilson', dueDate: '2026-04-12' },
      { id: '4', title: 'Territory Realignment', status: 'review', priority: 'medium', assignee: 'Patricia Moore', dueDate: '2026-04-25' },
    ],
    automations: [
      { id: '1', name: 'Daily Sales Report', description: 'Sends sales activity summary', trigger: 'Scheduled', active: true, executions: 89, lastTriggered: '4 hours ago' },
      { id: '2', name: 'Lead Assignment', description: 'Automatically assigns new leads', trigger: 'Event', active: true, executions: 245, lastTriggered: '30 minutes ago' },
      { id: '3', name: 'Deal Stage Alerts', description: 'Alerts on deal stage changes', trigger: 'Event', active: true, executions: 102, lastTriggered: '2 hours ago' },
    ],
    activities: [
      { id: '1', user: 'Jennifer Davis', action: 'closed', entity: 'Enterprise Contract $50K', timestamp: 'Today at 4:00 PM' },
      { id: '2', user: 'Robert Miller', action: 'advanced', entity: 'Pipeline Deals to Q2', timestamp: 'Today at 2:30 PM' },
      { id: '3', user: 'Thomas Wilson', action: 'conducted', entity: 'Client Product Demo', timestamp: 'Yesterday at 3:00 PM' },
    ],
    sops: [
      { id: '1', title: 'Sales Process Guidelines', version: '2.5', updated: '2026-03-20' },
      { id: '2', title: 'Deal Closing Procedures', version: '1.9', updated: '2026-03-18' },
      { id: '3', title: 'Client Onboarding SOP', version: '2.0', updated: '2026-03-15' },
    ],
  },
  'client-experience': {
    kpis: [
      { id: '1', name: 'Customer Retention Rate', value: 89, target: 95, trend: 'up', trendPercent: 6 },
      { id: '2', name: 'NPS Score', value: 72, target: 80, trend: 'up', trendPercent: 4 },
      { id: '3', name: 'First Contact Resolution', value: 82, target: 90, trend: 'down', trendPercent: -3 },
      { id: '4', name: 'Customer Lifetime Value', value: 12500, target: 15000, trend: 'up', trendPercent: 8 },
    ],
    tasks: [
      { id: '1', title: 'VIP Client Reviews', status: 'in-progress', priority: 'high', assignee: 'Victoria Chen', dueDate: '2026-04-06' },
      { id: '2', title: 'CRM Data Cleanup', status: 'pending', priority: 'medium', assignee: 'Nathan Rodriguez', dueDate: '2026-04-15' },
      { id: '3', title: 'Loyalty Program Redesign', status: 'review', priority: 'high', assignee: 'Sophie Martin', dueDate: '2026-04-18' },
      { id: '4', title: 'Customer Feedback Analysis', status: 'pending', priority: 'medium', assignee: 'Grace Zhang', dueDate: '2026-04-12' },
    ],
    automations: [
      { id: '1', name: 'Customer Journey Tracking', description: 'Tracks client interactions', trigger: 'Event', active: true, executions: 567, lastTriggered: '15 minutes ago' },
      { id: '2', name: 'Retention Alert System', description: 'Alerts on churn risk', trigger: 'Condition', active: true, executions: 34, lastTriggered: '3 hours ago' },
      { id: '3', name: 'Satisfaction Survey Trigger', description: 'Sends satisfaction surveys', trigger: 'Event', active: true, executions: 89, lastTriggered: '1 day ago' },
    ],
    activities: [
      { id: '1', user: 'Victoria Chen', action: 'completed', entity: 'VIP Account Review', timestamp: 'Today at 3:45 PM' },
      { id: '2', user: 'Sophie Martin', action: 'updated', entity: 'Loyalty Program Tier', timestamp: 'Today at 1:20 PM' },
      { id: '3', user: 'Nathan Rodriguez', action: 'resolved', entity: 'Customer Complaint', timestamp: 'Yesterday at 5:30 PM' },
    ],
    sops: [
      { id: '1', title: 'CRM System Guidelines', version: '2.2', updated: '2026-03-19' },
      { id: '2', title: 'Client Relations Best Practices', version: '1.8', updated: '2026-03-17' },
      { id: '3', title: 'VIP Account Management', version: '2.0', updated: '2026-03-14' },
    ],
  },
  'inventory-merchandising': {
    kpis: [
      { id: '1', name: 'Inventory Turnover', value: 5.8, target: 6.5, trend: 'up', trendPercent: 5 },
      { id: '2', name: 'Stock Accuracy', value: 97.3, target: 99, trend: 'up', trendPercent: 2 },
      { id: '3', name: 'Merchandise Mix Efficiency', value: 78, target: 85, trend: 'up', trendPercent: 6 },
      { id: '4', name: 'Shrink Rate', value: 2.1, target: 1.5, trend: 'down', trendPercent: -8 },
    ],
    tasks: [
      { id: '1', title: 'Spring Collection Setup', status: 'in-progress', priority: 'high', assignee: 'Marcus Thompson', dueDate: '2026-04-10' },
      { id: '2', title: 'Vendor Performance Review', status: 'pending', priority: 'medium', assignee: 'Olivia Santos', dueDate: '2026-04-14' },
      { id: '3', title: 'Stock Balance Planning', status: 'review', priority: 'high', assignee: 'Kevin O\'Brien', dueDate: '2026-04-08' },
      { id: '4', title: 'Markdown Strategy', status: 'pending', priority: 'medium', assignee: 'Nina Patel', dueDate: '2026-04-20' },
    ],
    automations: [
      { id: '1', name: 'Stock Level Monitoring', description: 'Monitors inventory levels', trigger: 'Condition', active: true, executions: 312, lastTriggered: '1 hour ago' },
      { id: '2', name: 'Reorder Point Alert', description: 'Alerts when stock is low', trigger: 'Condition', active: true, executions: 78, lastTriggered: '3 hours ago' },
      { id: '3', name: 'Seasonal Inventory Planning', description: 'Prepares seasonal stock adjustments', trigger: 'Scheduled', active: true, executions: 4, lastTriggered: '1 week ago' },
    ],
    activities: [
      { id: '1', user: 'Marcus Thompson', action: 'created', entity: 'Spring Merchandise Plan', timestamp: 'Today at 2:00 PM' },
      { id: '2', user: 'Olivia Santos', action: 'completed', entity: 'Vendor Evaluation', timestamp: 'Yesterday at 4:30 PM' },
      { id: '3', user: 'Kevin O\'Brien', action: 'adjusted', entity: 'Stock Allocation', timestamp: '2 days ago' },
    ],
    sops: [
      { id: '1', title: 'Inventory Receiving Procedure', version: '1.9', updated: '2026-03-21' },
      { id: '2', title: 'Merchandising Standards', version: '2.3', updated: '2026-03-19' },
      { id: '3', title: 'Shrink Prevention Protocol', version: '1.6', updated: '2026-03-16' },
    ],
  },
  'repairs-service': {
    kpis: [
      { id: '1', name: 'Service Completion Rate', value: 96, target: 98, trend: 'up', trendPercent: 3 },
      { id: '2', name: 'Average Repair Time', value: 8.2, target: 7.0, trend: 'down', trendPercent: -5 },
      { id: '3', name: 'Customer Satisfaction', value: 4.7, target: 4.9, trend: 'up', trendPercent: 2 },
      { id: '4', name: 'Service Backlog', value: 45, target: 20, trend: 'down', trendPercent: -12 },
    ],
    tasks: [
      { id: '1', title: 'Watch Repair Certification', status: 'pending', priority: 'medium', assignee: 'Adrian Foster', dueDate: '2026-04-16' },
      { id: '2', title: 'Service Quality Audit', status: 'in-progress', priority: 'high', assignee: 'Hannah Cross', dueDate: '2026-04-07' },
      { id: '3', title: 'Equipment Maintenance', status: 'pending', priority: 'medium', assignee: 'Lucas Gray', dueDate: '2026-04-19' },
      { id: '4', title: 'Repair SOP Update', status: 'review', priority: 'medium', assignee: 'Eleanor Hughes', dueDate: '2026-04-12' },
    ],
    automations: [
      { id: '1', name: 'Service Request Routing', description: 'Routes repairs to appropriate team', trigger: 'Event', active: true, executions: 187, lastTriggered: '45 minutes ago' },
      { id: '2', name: 'Repair Status Updates', description: 'Notifies customers of progress', trigger: 'Scheduled', active: true, executions: 156, lastTriggered: '2 hours ago' },
      { id: '3', name: 'Quality Control Review', description: 'Flags repairs for QC', trigger: 'Condition', active: true, executions: 89, lastTriggered: '3 hours ago' },
    ],
    activities: [
      { id: '1', user: 'Hannah Cross', action: 'inspected', entity: 'High-Value Repair', timestamp: 'Today at 5:00 PM' },
      { id: '2', user: 'Adrian Foster', action: 'completed', entity: 'Luxury Watch Service', timestamp: 'Today at 3:30 PM' },
      { id: '3', user: 'Lucas Gray', action: 'serviced', entity: 'Repair Equipment', timestamp: 'Yesterday at 4:00 PM' },
    ],
    sops: [
      { id: '1', title: 'Watch Repair Standards', version: '2.1', updated: '2026-03-20' },
      { id: '2', title: 'Jewelry Repair Procedures', version: '1.8', updated: '2026-03-18' },
      { id: '3', title: 'Quality Control Checklist', version: '1.9', updated: '2026-03-15' },
    ],
  },
  'purchasing-procurement': {
    kpis: [
      { id: '1', name: 'Procurement Cost Savings', value: 245000, target: 300000, trend: 'up', trendPercent: 10 },
      { id: '2', name: 'On-Time Delivery Rate', value: 94, target: 98, trend: 'up', trendPercent: 2 },
      { id: '3', name: 'Vendor Performance Score', value: 8.4, target: 8.8, trend: 'up', trendPercent: 3 },
      { id: '4', name: 'Purchase Order Cycle Time', value: 5.2, target: 4.0, trend: 'down', trendPercent: -8 },
    ],
    tasks: [
      { id: '1', title: 'Vendor RFP Process', status: 'in-progress', priority: 'high', assignee: 'Samuel Price', dueDate: '2026-04-13' },
      { id: '2', title: 'Contract Negotiation', status: 'pending', priority: 'high', assignee: 'Elizabeth Long', dueDate: '2026-04-18' },
      { id: '3', title: 'Supplier Compliance Audit', status: 'review', priority: 'medium', assignee: 'Andrew Ward', dueDate: '2026-04-11' },
      { id: '4', title: 'PO System Upgrade', status: 'pending', priority: 'medium', assignee: 'Monica Bell', dueDate: '2026-04-25' },
    ],
    automations: [
      { id: '1', name: 'PO Approval Workflow', description: 'Routes POs for approval', trigger: 'Event', active: true, executions: 234, lastTriggered: '1 hour ago' },
      { id: '2', name: 'Delivery Tracking', description: 'Tracks vendor deliveries', trigger: 'Scheduled', active: true, executions: 156, lastTriggered: '2 hours ago' },
      { id: '3', name: 'Invoice Matching', description: 'Validates invoice accuracy', trigger: 'Event', active: true, executions: 289, lastTriggered: '30 minutes ago' },
    ],
    activities: [
      { id: '1', user: 'Samuel Price', action: 'issued', entity: 'RFP for Materials', timestamp: 'Today at 10:00 AM' },
      { id: '2', user: 'Elizabeth Long', action: 'negotiated', entity: 'Volume Discount', timestamp: 'Yesterday at 3:45 PM' },
      { id: '3', user: 'Andrew Ward', action: 'audited', entity: 'Vendor Compliance', timestamp: '2 days ago' },
    ],
    sops: [
      { id: '1', title: 'Purchase Requisition Process', version: '2.0', updated: '2026-03-22' },
      { id: '2', title: 'Vendor Management Standards', version: '1.7', updated: '2026-03-19' },
      { id: '3', title: 'Contract Management Guidelines', version: '1.9', updated: '2026-03-17' },
    ],
  },
  'finance-accounting': {
    kpis: [
      { id: '1', name: 'Monthly Revenue', value: 1200000, target: 1500000, trend: 'up', trendPercent: 6 },
      { id: '2', name: 'Expenses Ratio', value: 32, target: 30, trend: 'up', trendPercent: 4 },
      { id: '3', name: 'AP Aging', value: 12, target: 10, trend: 'down', trendPercent: -3 },
      { id: '4', name: 'Collection Rate', value: 94, target: 98, trend: 'up', trendPercent: 2 },
    ],
    tasks: [
      { id: '1', title: 'Month-End Close', status: 'in-progress', priority: 'high', assignee: 'William Hayes', dueDate: '2026-04-05' },
      { id: '2', title: 'Q2 Budget Review', status: 'pending', priority: 'high', assignee: 'Karen Scott', dueDate: '2026-04-15' },
      { id: '3', title: 'Vendor Payment Processing', status: 'in-progress', priority: 'high', assignee: 'Richard Green', dueDate: '2026-04-03' },
      { id: '4', title: 'Tax Filing Prep', status: 'pending', priority: 'high', assignee: 'Susan Adams', dueDate: '2026-05-01' },
    ],
    automations: [
      { id: '1', name: 'Payroll Processing', description: 'Processes payroll automatically', trigger: 'Scheduled', active: true, executions: 26, lastTriggered: '2 days ago' },
      { id: '2', name: 'Invoice Reconciliation', description: 'Reconciles invoices to expenses', trigger: 'Scheduled', active: true, executions: 78, lastTriggered: '1 day ago' },
      { id: '3', name: 'Financial Report Generation', description: 'Generates monthly reports', trigger: 'Scheduled', active: true, executions: 13, lastTriggered: '3 days ago' },
    ],
    activities: [
      { id: '1', user: 'William Hayes', action: 'closed', entity: 'Q1 Financial Books', timestamp: 'Today at 5:30 PM' },
      { id: '2', user: 'Karen Scott', action: 'approved', entity: 'Q2 Budget Allocation', timestamp: 'Today at 2:00 PM' },
      { id: '3', user: 'Richard Green', action: 'processed', entity: 'Vendor Payments Batch', timestamp: 'Yesterday at 3:00 PM' },
    ],
    sops: [
      { id: '1', title: 'Month-End Close Procedures', version: '2.2', updated: '2026-03-20' },
      { id: '2', title: 'Accounts Payable Guidelines', version: '1.8', updated: '2026-03-18' },
      { id: '3', title: 'Financial Reporting Standards', version: '2.0', updated: '2026-03-15' },
    ],
  },
  'human-resources': {
    kpis: [
      { id: '1', name: 'Headcount', value: 156, target: 160, trend: 'up', trendPercent: 3 },
      { id: '2', name: 'Retention Rate', value: 92, target: 95, trend: 'up', trendPercent: 2 },
      { id: '3', name: 'Open Positions', value: 8, target: 5, trend: 'down', trendPercent: -5 },
      { id: '4', name: 'Training Completion', value: 78, target: 90, trend: 'up', trendPercent: 8 },
    ],
    tasks: [
      { id: '1', title: 'Benefits Renewal', status: 'in-progress', priority: 'high', assignee: 'Michelle Clark', dueDate: '2026-04-20' },
      { id: '2', title: 'Performance Review Cycle', status: 'pending', priority: 'high', assignee: 'David Harris', dueDate: '2026-05-01' },
      { id: '3', title: 'New Hire Onboarding', status: 'in-progress', priority: 'medium', assignee: 'Jennifer Taylor', dueDate: '2026-04-08' },
      { id: '4', title: 'Policy Update', status: 'review', priority: 'medium', assignee: 'Robert Jackson', dueDate: '2026-04-12' },
    ],
    automations: [
      { id: '1', name: 'Onboarding Workflow', description: 'Automates new hire setup', trigger: 'Event', active: true, executions: 34, lastTriggered: '5 days ago' },
      { id: '2', name: 'Employee Engagement Survey', description: 'Sends engagement surveys', trigger: 'Scheduled', active: true, executions: 4, lastTriggered: '1 month ago' },
      { id: '3', name: 'Certification Renewal Alert', description: 'Alerts on expiring certifications', trigger: 'Condition', active: true, executions: 23, lastTriggered: '2 days ago' },
    ],
    activities: [
      { id: '1', user: 'Michelle Clark', action: 'finalized', entity: 'Benefits Plan', timestamp: 'Today at 4:00 PM' },
      { id: '2', user: 'Jennifer Taylor', action: 'completed', entity: 'New Employee Onboarding', timestamp: 'Yesterday at 3:15 PM' },
      { id: '3', user: 'David Harris', action: 'scheduled', entity: 'Q2 Performance Reviews', timestamp: '3 days ago' },
    ],
    sops: [
      { id: '1', title: 'Employee Onboarding Checklist', version: '2.1', updated: '2026-03-21' },
      { id: '2', title: 'Performance Review Guidelines', version: '1.8', updated: '2026-03-19' },
      { id: '3', title: 'HR Policies and Procedures', version: '2.3', updated: '2026-03-16' },
    ],
  },
  'it-systems': {
    kpis: [
      { id: '1', name: 'System Uptime', value: 99.8, target: 99.9, trend: 'up', trendPercent: 1 },
      { id: '2', name: 'Help Desk Response Time', value: 0.5, target: 0.25, trend: 'down', trendPercent: -4 },
      { id: '3', name: 'User Satisfaction', value: 8.3, target: 8.8, trend: 'up', trendPercent: 3 },
      { id: '4', name: 'Security Incident Count', value: 2, target: 0, trend: 'down', trendPercent: -50 },
    ],
    tasks: [
      { id: '1', title: 'Network Security Audit', status: 'in-progress', priority: 'high', assignee: 'Christopher Martin', dueDate: '2026-04-16' },
      { id: '2', title: 'System Upgrade Planning', status: 'pending', priority: 'medium', assignee: 'Deborah Robinson', dueDate: '2026-04-22' },
      { id: '3', title: 'Disaster Recovery Test', status: 'review', priority: 'high', assignee: 'Edward Walker', dueDate: '2026-04-09' },
      { id: '4', title: 'User Access Provisioning', status: 'in-progress', priority: 'medium', assignee: 'Frances Hall', dueDate: '2026-04-06' },
    ],
    automations: [
      { id: '1', name: 'System Monitoring', description: 'Monitors system health', trigger: 'Scheduled', active: true, executions: 1440, lastTriggered: '1 minute ago' },
      { id: '2', name: 'Backup Verification', description: 'Verifies daily backups', trigger: 'Scheduled', active: true, executions: 90, lastTriggered: '1 hour ago' },
      { id: '3', name: 'Security Patch Deployment', description: 'Deploys security patches', trigger: 'Scheduled', active: true, executions: 26, lastTriggered: '1 week ago' },
    ],
    activities: [
      { id: '1', user: 'Christopher Martin', action: 'completed', entity: 'Network Vulnerability Scan', timestamp: 'Today at 6:00 PM' },
      { id: '2', user: 'Edward Walker', action: 'conducted', entity: 'Disaster Recovery Drill', timestamp: 'Today at 2:30 PM' },
      { id: '3', user: 'Deborah Robinson', action: 'updated', entity: 'System Infrastructure Plan', timestamp: 'Yesterday at 5:00 PM' },
    ],
    sops: [
      { id: '1', title: 'IT Security Policy', version: '2.4', updated: '2026-03-21' },
      { id: '2', title: 'System Administration Guide', version: '1.9', updated: '2026-03-19' },
      { id: '3', title: 'Help Desk Procedures', version: '2.1', updated: '2026-03-16' },
    ],
  },
  'logistics-shipping': {
    kpis: [
      { id: '1', name: 'On-Time Delivery Rate', value: 96, target: 98, trend: 'down', trendPercent: -2 },
      { id: '2', name: 'Shipping Cost per Unit', value: 4.2, target: 3.8, trend: 'down', trendPercent: -5 },
      { id: '3', name: 'Warehouse Efficiency', value: 87, target: 92, trend: 'up', trendPercent: 4 },
      { id: '4', name: 'Order Fulfillment Time', value: 1.5, target: 1.0, trend: 'down', trendPercent: -8 },
    ],
    tasks: [
      { id: '1', title: 'Warehouse Layout Optimization', status: 'in-progress', priority: 'high', assignee: 'George Allen', dueDate: '2026-04-19' },
      { id: '2', title: 'Shipping Partner Negotiation', status: 'pending', priority: 'high', assignee: 'Helen Young', dueDate: '2026-04-18' },
      { id: '3', title: 'Inventory Redistribution', status: 'in-progress', priority: 'medium', assignee: 'Isaac King', dueDate: '2026-04-12' },
      { id: '4', title: 'Returns Processing SOP Update', status: 'review', priority: 'medium', assignee: 'Julia Wright', dueDate: '2026-04-10' },
    ],
    automations: [
      { id: '1', name: 'Shipment Tracking', description: 'Tracks shipments in real-time', trigger: 'Event', active: true, executions: 1205, lastTriggered: '10 minutes ago' },
      { id: '2', name: 'Inventory to Warehouse', description: 'Allocates inventory to warehouses', trigger: 'Condition', active: true, executions: 89, lastTriggered: '2 hours ago' },
      { id: '3', name: 'Delivery Exception Alert', description: 'Alerts on delivery issues', trigger: 'Event', active: true, executions: 34, lastTriggered: '5 hours ago' },
    ],
    activities: [
      { id: '1', user: 'George Allen', action: 'redesigned', entity: 'Warehouse Flow', timestamp: 'Today at 4:30 PM' },
      { id: '2', user: 'Helen Young', action: 'negotiated', entity: 'Shipping Rates', timestamp: 'Yesterday at 3:00 PM' },
      { id: '3', user: 'Isaac King', action: 'redistributed', entity: 'Inventory Stock', timestamp: '2 days ago' },
    ],
    sops: [
      { id: '1', title: 'Order Fulfillment Process', version: '2.2', updated: '2026-03-20' },
      { id: '2', title: 'Warehouse Operations Manual', version: '1.9', updated: '2026-03-18' },
      { id: '3', title: 'Shipping Standards', version: '2.0', updated: '2026-03-15' },
    ],
  },
  'events-activations': {
    kpis: [
      { id: '1', name: 'Event Attendance', value: 4250, target: 5000, trend: 'up', trendPercent: 12 },
      { id: '2', name: 'Brand Awareness Lift', value: 34, target: 40, trend: 'up', trendPercent: 6 },
      { id: '3', name: 'Social Media Engagement', value: 12450, target: 15000, trend: 'up', trendPercent: 10 },
      { id: '4', name: 'Event ROI', value: 3.2, target: 3.5, trend: 'up', trendPercent: 4 },
    ],
    tasks: [
      { id: '1', title: 'Summer Festival Planning', status: 'in-progress', priority: 'high', assignee: 'Kevin Lopez', dueDate: '2026-05-15' },
      { id: '2', title: 'Influencer Activation', status: 'pending', priority: 'high', assignee: 'Linda Hill', dueDate: '2026-04-18' },
      { id: '3', title: 'Event Vendor Coordination', status: 'in-progress', priority: 'medium', assignee: 'Mark Scott', dueDate: '2026-04-15' },
      { id: '4', title: 'Post-Event Analysis', status: 'pending', priority: 'medium', assignee: 'Nancy Green', dueDate: '2026-04-22' },
    ],
    automations: [
      { id: '1', name: 'Event Registration', description: 'Automates attendee registration', trigger: 'Event', active: true, executions: 567, lastTriggered: '1 hour ago' },
      { id: '2', name: 'Reminder Notifications', description: 'Sends event reminders', trigger: 'Scheduled', active: true, executions: 45, lastTriggered: '5 days ago' },
      { id: '3', name: 'Media Compilation', description: 'Collects event content', trigger: 'Event', active: true, executions: 12, lastTriggered: '3 days ago' },
    ],
    activities: [
      { id: '1', user: 'Kevin Lopez', action: 'scheduled', entity: 'Summer Festival', timestamp: 'Today at 11:00 AM' },
      { id: '2', user: 'Linda Hill', action: 'confirmed', entity: 'Influencer Partnerships', timestamp: 'Yesterday at 2:30 PM' },
      { id: '3', user: 'Mark Scott', action: 'coordinated', entity: 'Vendor Logistics', timestamp: '2 days ago' },
    ],
    sops: [
      { id: '1', title: 'Event Management Process', version: '2.1', updated: '2026-03-20' },
      { id: '2', title: 'Brand Activation Guidelines', version: '1.8', updated: '2026-03-18' },
      { id: '3', title: 'PR and Communications Plan', version: '2.0', updated: '2026-03-15' },
    ],
  },
  'visual-merchandising': {
    kpis: [
      { id: '1', name: 'Retail Traffic Increase', value: 18, target: 25, trend: 'up', trendPercent: 8 },
      { id: '2', name: 'Display Effectiveness Score', value: 8.5, target: 9.0, trend: 'up', trendPercent: 2 },
      { id: '3', name: 'Product Visibility Rating', value: 82, target: 90, trend: 'up', trendPercent: 5 },
      { id: '4', name: 'Display Update Frequency', value: 2.5, target: 3.0, trend: 'down', trendPercent: -3 },
    ],
    tasks: [
      { id: '1', title: 'Spring Window Display', status: 'in-progress', priority: 'high', assignee: 'Olivia Johnson', dueDate: '2026-04-08' },
      { id: '2', title: 'Store Layout Redesign', status: 'pending', priority: 'high', assignee: 'Patricia Lee', dueDate: '2026-04-25' },
      { id: '3', title: 'Seasonal Fixture Update', status: 'in-progress', priority: 'medium', assignee: 'Quinn Martinez', dueDate: '2026-04-14' },
      { id: '4', title: 'Brand Consistency Audit', status: 'review', priority: 'medium', assignee: 'Rachel Davis', dueDate: '2026-04-09' },
    ],
    automations: [
      { id: '1', name: 'Display Schedule', description: 'Schedules monthly displays', trigger: 'Scheduled', active: true, executions: 12, lastTriggered: '1 month ago' },
      { id: '2', name: 'New Product Highlight', description: 'Highlights new arrivals', trigger: 'Event', active: true, executions: 89, lastTriggered: '2 days ago' },
      { id: '3', name: 'Promotional Display Setup', description: 'Creates promotional displays', trigger: 'Event', active: true, executions: 34, lastTriggered: '1 week ago' },
    ],
    activities: [
      { id: '1', user: 'Olivia Johnson', action: 'created', entity: 'Spring Window Display', timestamp: 'Today at 5:00 PM' },
      { id: '2', user: 'Patricia Lee', action: 'approved', entity: 'Store Layout Redesign', timestamp: 'Yesterday at 3:30 PM' },
      { id: '3', user: 'Quinn Martinez', action: 'installed', entity: 'New Fixtures', timestamp: '2 days ago' },
    ],
    sops: [
      { id: '1', title: 'Window Display Guidelines', version: '2.2', updated: '2026-03-20' },
      { id: '2', title: 'In-Store Merchandising Standards', version: '1.9', updated: '2026-03-18' },
      { id: '3', title: 'Seasonal Display Planning', version: '2.0', updated: '2026-03-15' },
    ],
  },
  'customer-care': {
    kpis: [
      { id: '1', name: 'First Contact Resolution', value: 85, target: 92, trend: 'up', trendPercent: 5 },
      { id: '2', name: 'Average Response Time', value: 2.1, target: 1.5, trend: 'down', trendPercent: -8 },
      { id: '3', name: 'Customer Satisfaction Score', value: 4.5, target: 4.8, trend: 'up', trendPercent: 3 },
      { id: '4', name: 'Return/Complaint Rate', value: 3.2, target: 2.0, trend: 'down', trendPercent: -5 },
    ],
    tasks: [
      { id: '1', title: 'Support Ticket Backlog Reduction', status: 'in-progress', priority: 'high', assignee: 'Steven Turner', dueDate: '2026-04-08' },
      { id: '2', title: 'Knowledge Base Update', status: 'pending', priority: 'medium', assignee: 'Tanya Phillips', dueDate: '2026-04-16' },
      { id: '3', title: 'Customer Care Training', status: 'in-progress', priority: 'high', assignee: 'Uma Campbell', dueDate: '2026-04-12' },
      { id: '4', title: 'Return Process Improvement', status: 'review', priority: 'medium', assignee: 'Victor Powell', dueDate: '2026-04-14' },
    ],
    automations: [
      { id: '1', name: 'Ticket Routing', description: 'Routes support tickets', trigger: 'Event', active: true, executions: 2341, lastTriggered: '5 minutes ago' },
      { id: '2', name: 'Satisfaction Survey', description: 'Sends post-interaction surveys', trigger: 'Event', active: true, executions: 456, lastTriggered: '30 minutes ago' },
      { id: '3', name: 'Escalation Alert', description: 'Alerts on escalations', trigger: 'Condition', active: true, executions: 78, lastTriggered: '2 hours ago' },
    ],
    activities: [
      { id: '1', user: 'Steven Turner', action: 'resolved', entity: 'Support Ticket Queue', timestamp: 'Today at 4:00 PM' },
      { id: '2', user: 'Tanya Phillips', action: 'updated', entity: 'Knowledge Base', timestamp: 'Yesterday at 3:15 PM' },
      { id: '3', user: 'Uma Campbell', action: 'conducted', entity: 'Team Training Session', timestamp: '2 days ago' },
    ],
    sops: [
      { id: '1', title: 'Support Ticket Handling', version: '2.1', updated: '2026-03-21' },
      { id: '2', title: 'Returns and Refunds Procedure', version: '1.8', updated: '2026-03-19' },
      { id: '3', title: 'Complaint Resolution Guidelines', version: '2.0', updated: '2026-03-16' },
    ],
  },
  'legal-compliance': {
    kpis: [
      { id: '1', name: 'Compliance Score', value: 96, target: 100, trend: 'up', trendPercent: 2 },
      { id: '2', name: 'Legal Issues Resolved', value: 18, target: 20, trend: 'down', trendPercent: -3 },
      { id: '3', name: 'Contract Turnaround Time', value: 7.2, target: 5.0, trend: 'down', trendPercent: -8 },
      { id: '4', name: 'Data Breach Incidents', value: 0, target: 0, trend: 'up', trendPercent: 0 },
    ],
    tasks: [
      { id: '1', title: 'Privacy Policy Update', status: 'in-progress', priority: 'high', assignee: 'Wendy Long', dueDate: '2026-04-12' },
      { id: '2', title: 'Contract Review Process', status: 'pending', priority: 'high', assignee: 'Xavier Ross', dueDate: '2026-04-20' },
      { id: '3', title: 'Compliance Training', status: 'in-progress', priority: 'medium', assignee: 'Yvonne Carter', dueDate: '2026-04-16' },
      { id: '4', title: 'Regulatory Filing', status: 'pending', priority: 'high', assignee: 'Zachary Evans', dueDate: '2026-04-30' },
    ],
    automations: [
      { id: '1', name: 'Compliance Monitoring', description: 'Monitors regulatory changes', trigger: 'Scheduled', active: true, executions: 52, lastTriggered: '2 hours ago' },
      { id: '2', name: 'Contract Renewal Alert', description: 'Alerts on contract renewals', trigger: 'Condition', active: true, executions: 16, lastTriggered: '5 days ago' },
      { id: '3', name: 'Policy Approval Workflow', description: 'Routes policies for approval', trigger: 'Event', active: true, executions: 23, lastTriggered: '1 week ago' },
    ],
    activities: [
      { id: '1', user: 'Wendy Long', action: 'updated', entity: 'Privacy Policy', timestamp: 'Today at 2:00 PM' },
      { id: '2', user: 'Xavier Ross', action: 'reviewed', entity: 'Vendor Contracts', timestamp: 'Yesterday at 4:30 PM' },
      { id: '3', user: 'Yvonne Carter', action: 'conducted', entity: 'Compliance Workshop', timestamp: '3 days ago' },
    ],
    sops: [
      { id: '1', title: 'Legal Document Standards', version: '2.1', updated: '2026-03-21' },
      { id: '2', title: 'Compliance Monitoring Protocol', version: '1.9', updated: '2026-03-19' },
      { id: '3', title: 'Data Privacy Guidelines', version: '2.2', updated: '2026-03-16' },
    ],
  },
  'facilities-maintenance': {
    kpis: [
      { id: '1', name: 'Facility Condition Index', value: 8.7, target: 9.2, trend: 'up', trendPercent: 3 },
      { id: '2', name: 'Maintenance Request Response', value: 4.2, target: 3.0, trend: 'down', trendPercent: -5 },
      { id: '3', name: 'Energy Cost per Sq Ft', value: 4.1, target: 3.8, trend: 'down', trendPercent: -4 },
      { id: '4', name: 'Asset Utilization', value: 78, target: 85, trend: 'up', trendPercent: 6 },
    ],
    tasks: [
      { id: '1', title: 'HVAC System Maintenance', status: 'pending', priority: 'high', assignee: 'Alice Murphy', dueDate: '2026-04-10' },
      { id: '2', title: 'Security System Upgrade', status: 'in-progress', priority: 'high', assignee: 'Brandon Rogers', dueDate: '2026-04-25' },
      { id: '3', title: 'Facility Deep Clean', status: 'pending', priority: 'medium', assignee: 'Chloe Reed', dueDate: '2026-04-20' },
      { id: '4', title: 'Energy Audit', status: 'review', priority: 'medium', assignee: 'Derek Cook', dueDate: '2026-04-16' },
    ],
    automations: [
      { id: '1', name: 'Preventive Maintenance', description: 'Schedules maintenance tasks', trigger: 'Scheduled', active: true, executions: 78, lastTriggered: '1 week ago' },
      { id: '2', name: 'Emergency Alert System', description: 'Alerts on facility emergencies', trigger: 'Event', active: true, executions: 12, lastTriggered: '2 days ago' },
      { id: '3', name: 'Utility Monitoring', description: 'Monitors utility consumption', trigger: 'Scheduled', active: true, executions: 30, lastTriggered: '1 day ago' },
    ],
    activities: [
      { id: '1', user: 'Alice Murphy', action: 'serviced', entity: 'HVAC System', timestamp: 'Today at 3:00 PM' },
      { id: '2', user: 'Brandon Rogers', action: 'installed', entity: 'Security Upgrade', timestamp: 'Yesterday at 5:30 PM' },
      { id: '3', user: 'Chloe Reed', action: 'completed', entity: 'Building Maintenance', timestamp: '2 days ago' },
    ],
    sops: [
      { id: '1', title: 'Facility Maintenance Standards', version: '2.0', updated: '2026-03-21' },
      { id: '2', title: 'Security Protocols', version: '1.9', updated: '2026-03-19' },
      { id: '3', title: 'Emergency Response Procedures', version: '2.1', updated: '2026-03-16' },
    ],
  },
};

export default function DepartmentPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;
  const dept = getDepartmentBySlug(slug);
  const roles = getDepartmentRoles(slug);
  const [activeTab, setActiveTab] = useState('overview');

  if (!dept) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Department not found</h2>
        <Button onClick={() => router.back()}>Go Back</Button>
      </div>
    );
  }

  const Icon = iconMap[dept.icon] || Users;
  const deptData = departmentData[slug] || departmentData.marketing;

  const StatCard = ({ icon: IconComp, label, value }: any) => (
    <Card className="bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md hover:border-gray-300 transition-all duration-200">
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <span className="text-gray-500 text-sm font-medium">{label}</span>
          <IconComp className="w-5 h-5 text-gray-400" />
        </div>
        <p className="text-2xl font-bold text-gray-900">{value}</p>
      </div>
    </Card>
  );

  const TaskItem = ({ task }: any) => (
    <div className="flex items-center justify-between p-4 border-b border-gray-200 last:border-0 hover:bg-gray-50 transition-colors">
      <div className="flex-1">
        <p className="font-medium text-gray-900">{task.title}</p>
        <p className="text-sm text-gray-500 mt-1">{task.assignee}</p>
      </div>
      <div className="flex items-center gap-3">
        <Badge
          className={cn(
            'text-xs',
            task.priority === 'high' && 'bg-red-500/10 text-red-700 border-red-200',
            task.priority === 'medium' && 'bg-yellow-500/10 text-yellow-700 border-yellow-200'
          )}
          variant="outline"
        >
          {task.priority}
        </Badge>
        <Badge
          className={cn(
            'text-xs',
            task.status === 'in-progress' &&
              'bg-blue-500/10 text-blue-700 border-blue-200',
            task.status === 'review' && 'bg-purple-500/10 text-purple-700 border-purple-200',
            task.status === 'pending' && 'bg-gray-500/10 text-gray-700 border-gray-200'
          )}
          variant="outline"
        >
          {task.status}
        </Badge>
      </div>
    </div>
  );

  return (
    <div className="space-y-8">
      {/* Department Header */}
      <div className="space-y-4">
        <div className="flex items-start gap-8">
          <div
            className="p-6 rounded-xl flex-shrink-0"
            style={{ backgroundColor: dept.color + '15' }}
          >
            <Icon className="w-12 h-12" style={{ color: dept.color }} />
          </div>
          <div className="flex-1">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">{dept.name}</h1>
            <p className="text-gray-600 text-lg">{dept.description}</p>
          </div>
        </div>

        {/* Color accent bar */}
        <div
          className="h-1 rounded-full"
          style={{ backgroundColor: dept.color }}
        />
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard icon={Users} label="Team Members" value={roles.length} />
        <StatCard icon={CheckSquare} label="Active Tasks" value={deptData.tasks.length} />
        <StatCard icon={Zap} label="Automations" value={deptData.automations.length} />
        <StatCard icon={FileText} label="SOPs" value={deptData.sops.length} />
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="bg-white border-b border-gray-200 w-full justify-start rounded-none p-0 h-auto gap-0">
          <TabsTrigger
            value="overview"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-[#09203F] data-[state=active]:bg-transparent px-4 py-3 text-sm font-medium transition-colors"
          >
            Overview
          </TabsTrigger>
          <TabsTrigger
            value="team"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-[#09203F] data-[state=active]:bg-transparent px-4 py-3 text-sm font-medium transition-colors"
          >
            Team
          </TabsTrigger>
          <TabsTrigger
            value="tasks"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-[#09203F] data-[state=active]:bg-transparent px-4 py-3 text-sm font-medium transition-colors"
          >
            Tasks
          </TabsTrigger>
          <TabsTrigger
            value="kpis"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-[#09203F] data-[state=active]:bg-transparent px-4 py-3 text-sm font-medium transition-colors"
          >
            KPIs
          </TabsTrigger>
          <TabsTrigger
            value="sops"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-[#09203F] data-[state=active]:bg-transparent px-4 py-3 text-sm font-medium transition-colors"
          >
            SOPs
          </TabsTrigger>
          <TabsTrigger
            value="automations"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-[#09203F] data-[state=active]:bg-transparent px-4 py-3 text-sm font-medium transition-colors"
          >
            Automations
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6 mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Recent Activity */}
            <div className="lg:col-span-2">
              <Card className="bg-white border border-gray-200 rounded-xl shadow-sm">
                <div className="border-b border-gray-200 p-6">
                  <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                    <Clock className="w-5 h-5 text-[#09203F]" />
                    Recent Activity
                  </h2>
                </div>
                <div className="divide-y divide-gray-200">
                  {deptData.activities.map((activity) => (
                    <div
                      key={activity.id}
                      className="p-6 hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-start gap-4">
                        <div className="w-10 h-10 rounded-full bg-[#09203F]/10 flex items-center justify-center flex-shrink-0">
                          <CheckSquare className="w-5 h-5 text-[#09203F]" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm text-gray-900">
                            <span className="font-medium">{activity.user}</span>
                            {' ' + activity.action + ' '}
                            <span className="text-[#09203F] font-medium">{activity.entity}</span>
                          </p>
                          <p className="text-xs text-gray-500 mt-1">{activity.timestamp}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </div>

            {/* Quick Actions */}
            <div>
              <Card className="bg-white border border-gray-200 rounded-xl shadow-sm">
                <div className="border-b border-gray-200 p-6">
                  <h3 className="text-lg font-semibold text-gray-900">Quick Actions</h3>
                </div>
                <div className="p-6 space-y-3">
                  <Button className="w-full bg-gray-50 hover:bg-gray-100 text-gray-900 border border-gray-200 justify-start transition-colors">
                    <Plus className="w-4 h-4 mr-2" />
                    New Task
                  </Button>
                  <Button className="w-full bg-gray-50 hover:bg-gray-100 text-gray-900 border border-gray-200 justify-start transition-colors">
                    <Zap className="w-4 h-4 mr-2" />
                    Create Automation
                  </Button>
                  <Button className="w-full bg-[#09203F] hover:bg-[#0a2651] text-white font-medium justify-start transition-colors">
                    <TrendingUp className="w-4 h-4 mr-2" />
                    View Reports
                  </Button>
                </div>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* Team Tab */}
        <TabsContent value="team" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {roles.map((role) => (
              <Card
                key={role.slug}
                className="bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-lg hover:border-[#09203F]/30 transition-all duration-200 group cursor-pointer"
              >
                <div className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 group-hover:text-[#09203F] mb-2 transition-colors">
                    {role.title}
                  </h3>
                  <p className="text-sm text-gray-500 mb-6">{role.description}</p>
                  <Button
                    variant="ghost"
                    className="w-full bg-gray-50 hover:bg-gray-100 text-gray-900 border border-gray-200 transition-colors"
                    asChild
                  >
                    <a href={`/departments/${slug}/roles/${role.slug}`}>
                      View Role Details
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </a>
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Tasks Tab */}
        <TabsContent value="tasks" className="mt-6">
          <Card className="bg-white border border-gray-200 rounded-xl shadow-sm">
            <div className="border-b border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900">Department Tasks</h2>
            </div>
            <div>
              {deptData.tasks.map((task) => (
                <TaskItem key={task.id} task={task} />
              ))}
            </div>
          </Card>
        </TabsContent>

        {/* KPIs Tab */}
        <TabsContent value="kpis" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {deptData.kpis.map((kpi) => (
              <Card key={kpi.id} className="bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-all duration-200">
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <h3 className="font-medium text-gray-900">{kpi.name}</h3>
                    <Badge
                      className={cn(
                        kpi.trend === 'up' && 'bg-emerald-500/10 text-emerald-700',
                        kpi.trend === 'down' && 'bg-red-500/10 text-red-700'
                      )}
                      variant="outline"
                    >
                      {kpi.trend === 'up' ? '+' : '-'}{kpi.trendPercent}%
                    </Badge>
                  </div>
                  <p className="text-2xl font-bold text-gray-900 mb-2">{kpi.value}</p>
                  <div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-[#09203F] h-full rounded-full transition-all duration-500"
                      style={{ width: `${(kpi.value / kpi.target) * 100}%` }}
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-2">Target: {kpi.target}</p>
                </div>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* SOPs Tab */}
        <TabsContent value="sops" className="mt-6">
          <Card className="bg-white border border-gray-200 rounded-xl shadow-sm">
            <div className="border-b border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <FileText className="w-5 h-5 text-[#09203F]" />
                Standard Operating Procedures
              </h2>
            </div>
            <div>
              {deptData.sops.map((sop) => (
                <div
                  key={sop.id}
                  className="flex items-center justify-between p-6 border-b border-gray-200 last:border-0 hover:bg-gray-50 transition-colors cursor-pointer"
                >
                  <div>
                    <p className="font-medium text-gray-900">{sop.title}</p>
                    <p className="text-sm text-gray-500 mt-1">v{sop.version}</p>
                  </div>
                  <p className="text-sm text-gray-500">{sop.updated}</p>
                </div>
              ))}
            </div>
          </Card>
        </TabsContent>

        {/* Automations Tab */}
        <TabsContent value="automations" className="mt-6">
          <Card className="bg-white border border-gray-200 rounded-xl shadow-sm">
            <div className="border-b border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <Zap className="w-5 h-5 text-[#09203F]" />
                  Automation Rules
                </h2>
                <Button size="sm" className="bg-[#09203F] hover:bg-[#0a2651] text-white transition-colors">
                  <Plus className="w-4 h-4 mr-2" />
                  New Rule
                </Button>
              </div>
            </div>
            <div className="divide-y divide-gray-200">
              {deptData.automations.map((auto) => (
                <div key={auto.id} className="p-6 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900">{auto.name}</h3>
                      <p className="text-sm text-gray-500 mt-1">{auto.description}</p>
                    </div>
                    <Badge
                      className={cn(
                        auto.active
                          ? 'bg-emerald-500/10 text-emerald-700 border-emerald-200'
                          : 'bg-gray-500/10 text-gray-700 border-gray-200'
                      )}
                      variant="outline"
                    >
                      {auto.active ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-4 text-xs text-gray-500">
                    <span>{auto.trigger} Trigger</span>
                    <span>•</span>
                    <span>{auto.executions} executions</span>
                    <span>•</span>
                    <span>Last: {auto.lastTriggered}</span>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
