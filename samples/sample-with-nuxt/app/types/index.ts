import type { AccountInfo } from '@azure/msal-browser'

export type UserInfo =
  | (Partial<AccountInfo> & {
      businessPhones?: Array<string>
      displayName?: string
      givenName?: string
      id?: string
      jobTitle?: string
      mail?: string
      mobilePhone?: string
      officeLocation?: string
      preferredLanguage?: string
      surname?: string
      userPrincipalName?: string
    })
  | null
