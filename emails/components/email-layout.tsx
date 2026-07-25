import {
  Body,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Link,
  Preview,
  Section,
  Text,
} from '@react-email/components'
import type { ReactNode } from 'react'

const brandRed = '#C70F11'

export function EmailLayout({
  preview,
  title,
  children,
}: {
  preview: string
  title: string
  children: ReactNode
}) {
  return (
    <Html lang="es">
      <Head />
      <Preview>{preview}</Preview>
      <Body style={body}>
        <Container style={container}>
          <Heading style={heading}>{title}</Heading>
          <Section>{children}</Section>
          <Hr style={hr} />
          <Text style={footer}>TikkiGuau · Collares y correas personalizados</Text>
        </Container>
      </Body>
    </Html>
  )
}

export function EmailLink({ href, children }: { href: string; children: string }) {
  return (
    <Link href={href} style={link}>
      {children}
    </Link>
  )
}

const body = {
  backgroundColor: '#f4f4f5',
  fontFamily:
    '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
  margin: 0,
  padding: '24px 0',
}

const container = {
  backgroundColor: '#ffffff',
  borderRadius: '12px',
  margin: '0 auto',
  maxWidth: '560px',
  padding: '32px 28px',
}

const heading = {
  color: brandRed,
  fontSize: '22px',
  fontWeight: 700,
  lineHeight: '1.3',
  margin: '0 0 20px',
}

const hr = {
  borderColor: '#e4e4e7',
  margin: '28px 0 16px',
}

const footer = {
  color: '#71717a',
  fontSize: '12px',
  lineHeight: '1.5',
  margin: 0,
}

const link = {
  color: brandRed,
  textDecoration: 'underline',
}
