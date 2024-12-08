import createMiddleware from 'next-intl/middleware';
import {routing} from '@com.synergy/frontend-shared-internationalization/routing';
 
export default createMiddleware(routing);
 
export const config = {
  // Match only internationalized pathnames
  matcher: ['/', '/(de-AT|en-US)/:path*']
};