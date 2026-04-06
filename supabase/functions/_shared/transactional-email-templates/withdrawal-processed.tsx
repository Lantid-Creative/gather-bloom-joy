import * as React from 'npm:react@18.3.1'
import {
  Body, Container, Head, Heading, Html, Preview, Text, Section, Hr,
} from 'npm:@react-email/components@0.0.22'
import type { TemplateEntry } from './registry.ts'

const SITE_NAME = "Qantid"

interface WithdrawalProcessedProps {
  amount?: string
  bankName?: string
  accountName?: string
}

const WithdrawalProcessedEmail = ({ amount, bankName, accountName }: WithdrawalProcessedProps) => (
  <Html lang="en" dir="ltr">
    <Head />
    <Preview>Your withdrawal of {amount || '$0.00'} has been sent!</Preview>
    <Body style={main}>
      <Container style={container}>
        <Section style={headerSection}>
          <Heading style={h1}>Money Sent! 🎉</Heading>
        </Section>
        <Text style={text}>
          Your withdrawal has been processed and the funds are on their way to your bank account.
        </Text>
        <Section style={detailsBox}>
          <Text style={detailLabel}>Amount Sent</Text>
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
        <Hr style={hr} />
        <Text style={text}>
          Depending on your bank, it may take 1-3 business days for the funds to reflect in your account.
        </Text>
        <Text style={footer}>— The {SITE_NAME} Team</Text>
      </Container>
    </Body>
  </Html>
)

export const template = {
  component: WithdrawalProcessedEmail,
  subject: (data: Record<string, any>) => `${data.amount || '$0.00'} has been sent to your bank`,
  displayName: 'Withdrawal processed',
  previewData: { amount: '$150.00', bankName: 'GTBank', accountName: 'Jane Doe' },
} satisfies TemplateEntry

const main = { backgroundColor: '#ffffff', fontFamily: "'DM Sans', Arial, sans-serif" }
const container = { padding: '20px 25px', maxWidth: '560px', margin: '0 auto' }
const headerSection = { marginBottom: '24px' }
const h1 = { fontSize: '22px', fontWeight: 'bold' as const, color: '#1e1e1e', margin: '0 0 8px' }
const text = { fontSize: '14px', color: '#55575d', lineHeight: '1.6', margin: '0 0 16px' }
const detailsBox = { backgroundColor: '#f0fdf4', borderRadius: '8px', padding: '16px 20px', marginBottom: '20px' }
const detailLabel = { fontSize: '12px', color: '#888', margin: '0 0 2px', textTransform: 'uppercase' as const, letterSpacing: '0.5px' }
const detailValue = { fontSize: '16px', color: '#1e1e1e', fontWeight: 'bold' as const, margin: '0 0 12px' }
const hr = { borderColor: '#eee', margin: '20px 0' }
const footer = { fontSize: '12px', color: '#999999', margin: '24px 0 0' }
