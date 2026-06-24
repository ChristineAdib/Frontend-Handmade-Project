import { Routes } from '@angular/router';

export const CUSTOM_STUDIO_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/landing/landing.component').then(m => m.LandingComponent)
  },
  {
    path: 'wizard',
    loadComponent: () => import('./pages/wizard/wizard.component').then(m => m.WizardComponent)
  },
  {
    path: 'wizard/:id',
    loadComponent: () => import('./pages/wizard/wizard.component').then(m => m.WizardComponent)
  },
  {
    path: 'generating/:id',
    loadComponent: () => import('./pages/generating/generating.component').then(m => m.GeneratingComponent)
  },
  {
    path: 'results/:id',
    loadComponent: () => import('./pages/results/results.component').then(m => m.ResultsComponent)
  },
  {
    path: 'comparison/:id',
    loadComponent: () => import('./pages/comparison/comparison.component').then(m => m.ComparisonComponent)
  },
  {
    path: 'summary/:id',
    loadComponent: () => import('./pages/summary/summary.component').then(m => m.SummaryComponent)
  },
  {
    path: 'matching/:id',
    loadComponent: () => import('./pages/matching/matching.component').then(m => m.MatchingComponent)
  },
  {
    path: 'negotiation/:id',
    loadComponent: () => import('./pages/negotiation/negotiation.component').then(m => m.NegotiationComponent)
  },
  {
    path: 'offer-review/:id',
    loadComponent: () => import('./pages/offer-review/offer-review.component').then(m => m.OfferReviewComponent)
  },
  {
    path: 'workspace/:id',
    loadComponent: () => import('./pages/workspace/workspace.component').then(m => m.WorkspaceComponent)
  },
  {
    path: 'my-designs',
    loadComponent: () => import('./pages/history/history.component').then(m => m.HistoryComponent)
  }
];
