import { FeaturesPage, AboutPage, ContactPage } from '../pages/Public';

export const PublicRoutes = [
  {
    path: "/features",
    element: <FeaturesPage />
  },
  {
    path: "/about", 
    element: <AboutPage />
  },
  {
    path: "/contact",
    element: <ContactPage />
  }
];