/// <reference types="npm:@types/react@18.3.1" />
import * as React from 'npm:react@18.3.1'

export interface TemplateEntry {
  component: React.ComponentType<any>
  subject: string | ((data: Record<string, any>) => string)
  to?: string
  displayName?: string
  previewData?: Record<string, any>
}

import { template as withdrawalApproved } from './withdrawal-approved.tsx'
import { template as withdrawalRejected } from './withdrawal-rejected.tsx'
import { template as withdrawalProcessed } from './withdrawal-processed.tsx'

export const TEMPLATES: Record<string, TemplateEntry> = {
  'withdrawal-approved': withdrawalApproved,
  'withdrawal-rejected': withdrawalRejected,
  'withdrawal-processed': withdrawalProcessed,
}
