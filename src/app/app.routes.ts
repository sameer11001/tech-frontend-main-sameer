import { Routes } from '@angular/router';
import { MainComponent } from './features/landing/landing.component';
import { authRoutes } from './features/auth/auth.routes';
import { HomeBaseRoutes } from './features/home/home-base.routes';
import { ChatbotRoutes } from './features/chatbot/chatbot.routes';

export const routes: Routes = [
    {
        path: '',
        component: MainComponent,
    },
    authRoutes,
    HomeBaseRoutes,
    ...ChatbotRoutes
];
