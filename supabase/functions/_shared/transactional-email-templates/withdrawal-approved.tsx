import * as React from 'npm:react@18.3.1'
import {
  Body, Container, Head, Heading, Html, Preview, Text, Section, Hr,
} from 'npm:@react-email/components@0.0.22'
import type { TemplateEntry } from './registry.ts'

const SITE_NAME = "Qantid"

interface WithdrawalApprovedProps {
  amount?: string
  bankName?: string
  accountName?: string
  adminNote?: string
}

const WithdrawalApprovedEmail = ({ amount, bankName, accountName, adminNote }: WithdrawalApprovedProps) => (
  <Html lang="en" dir="ltr">
    <Head />
    <Preview>Your withdrawal of {amount || '$0.00'} has been approved</Preview>
    <Body style={main}>
      <Container style={container}>
        <Section style={headerSection}>
          <Heading style={h1}>Withdrawal Approved ✅</Heading>
        </Section>
        <Text style={text}>
          Great news! Your withdrawal request has been approved and will be processed shortly.
        </Text>
        <Section style={detailsBox}>
          <Text style={detailLabel}>Amount</Text>
          <Text style={detailValue}>{amount || '$0.00'}</Text>
          {bankName && (
            <>
              <Text style={detailLabel}>Bank</Text>
              <Text style={detailValue}>{bankName}</Text>
            </>
          )}
          {accountName && (
            <>
              <Text style={detailLabel}>Account Name</Text>
              <Text style={detailValue}>{accountName}</Text>
            </>
          )}
        </Section>
        {adminNote && (
          <Section style={noteSection}>
            <Text style={noteLabel}>Note from admin:</Text>
            <Text style={noteText}>{adminNote}</Text>
          </Section>
        )}
        <Hr style={hr} />
        <Text style={text}>
          The funds will be sent to your bank account within 1-3 business days.
        </Text>
        <Text style={footer}>— The {SITE_NAME} Team</Text>
      </Container>
    </Body>
  </Html>
)

export const template = {
  component: WithdrawalApprovedEmail,
  subject: (data: Record<string, any>) => `Withdrawal of ${data.amount || '$0.00'} approved`,
  displayName: 'Withdrawal approved',
  previewData: { amount: '$150.00', bankName: 'GTBank', accountName: 'Jane Doe' },
} satisfies TemplateEntry

const main = { backgroundColor: '#ffffff', fontFamily: "'DM Sans', Arial, sans-serif" }
const container = { padding: '20px 25px', maxWidth: '560px', margin: '0 auto' }
const headerSection = { marginBottom: '24px' }
const h1 = { fontSize: '22px', fontWeight: 'bold' as const, color: '#1e1e1e', margin: '0 0 8px' }
const text = { fontSize: '14px', color: '#55575d', lineHeight: '1.6', margin: '0 0 16px' }
const detailsBox = { backgroundColor: '#f8f8f8', borderRadius: '8px', padding: '16px 20px', marginBottom: '20px' }
const detailLabel = { fontSize: '12px', color: '#888', margin: '0 0 2px', textTransform: 'uppercase' as const, letterSpacing: '0.5px' }
const detailValue = { fontSize: '16px', color: '#1e1e1e', fontWeight: 'bold' as const, margin: '0 0 12px' }
const noteSection = { backgroundColor: '#fff8f0', borderLeft: '3px solid #e8622a', padding: '12px 16px', marginBottom: '20px', borderRadius: '0 8px 8px 0' }
const noteLabel = { fontSize: '12px', color: '#e8622a', fontWeight: 'bold' as const, margin: '0 0 4px' }
const noteText = { fontSize: '14px', color: '#55575d', margin: '0' }
const hr = { borderColor: '#eee', margin: '20px 0' }
const footer = { fontSize: '12px', color: '#999999', margin: '24px 0 0' }
