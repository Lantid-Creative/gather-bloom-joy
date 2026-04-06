import * as React from 'npm:react@18.3.1'
import {
  Body, Container, Head, Heading, Html, Preview, Text, Section, Hr,
} from 'npm:@react-email/components@0.0.22'
import type { TemplateEntry } from './registry.ts'

const SITE_NAME = "Qantid"

interface WithdrawalRejectedProps {
  amount?: string
  adminNote?: string
}

const WithdrawalRejectedEmail = ({ amount, adminNote }: WithdrawalRejectedProps) => (
  <Html lang="en" dir="ltr">
    <Head />
    <Preview>Your withdrawal of {amount || '$0.00'} was not approved</Preview>
    <Body style={main}>
      <Container style={container}>
        <Section style={headerSection}>
          <Heading style={h1}>Withdrawal Not Approved</Heading>
        </Section>
        <Text style={text}>
          Unfortunately, your withdrawal request of <strong>{amount || '$0.00'}</strong> was not approved. The funds have been returned to your available balance.
        </Text>
        {adminNote && (
          <Section style={noteSection}>
            <Text style={noteLabel}>Reason:</Text>
            <Text style={noteText}>{adminNote}</Text>
          </Section>
        )}
        <Hr style={hr} />
        <Text style={text}>
          If you have questions, please reach out to our support team. You can submit a new withdrawal request at any time.
        </Text>
        <Text style={footer}>— The {SITE_NAME} Team</Text>
      </Container>
    </Body>
  </Html>
)

export const template = {
  component: WithdrawalRejectedEmail,
  subject: (data: Record<string, any>) => `Withdrawal of ${data.amount || '$0.00'} was not approved`,
  displayName: 'Withdrawal rejected',
  previewData: { amount: '$150.00', adminNote: 'Please update your bank details and try again.' },
} satisfies TemplateEntry

const main = { backgroundColor: '#ffffff', fontFamily: "'DM Sans', Arial, sans-serif" }
const container = { padding: '20px 25px', maxWidth: '560px', margin: '0 auto' }
const headerSection = { marginBottom: '24px' }
const h1 = { fontSize: '22px', fontWeight: 'bold' as const, color: '#1e1e1e', margin: '0 0 8px' }
const text = { fontSize: '14px', color: '#55575d', lineHeight: '1.6', margin: '0 0 16px' }
const noteSection = { backgroundColor: '#fef2f2', borderLeft: '3px solid #ef4444', padding: '12px 16px', marginBottom: '20px', borderRadius: '0 8px 8px 0' }
const noteLabel = { fontSize: '12px', color: '#ef4444', fontWeight: 'bold' as const, margin: '0 0 4px' }
const noteText = { fontSize: '14px', color: '#55575d', margin: '0' }
const hr = { borderColor: '#eee', margin: '20px 0' }
const footer = { fontSize: '12px', color: '#999999', margin: '24px 0 0' }
