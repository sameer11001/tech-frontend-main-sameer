import { HomeBaseComponent } from "./home-base.component";
import { AuthGuard } from '../../core/guards/auth.guard';
import { userDashboardMainRoutes } from "./pages/user-management/user-management.routes";
import { profileSettingsRoutes } from "./pages/profile-settings/profile-settings.routes";
import { broadcastRoutes } from "./pages/broadcast/broadcast.routes";
import { contactsRoutes } from "./pages/contacts/contacts.routes";
import { teamInboxRoutes } from "./pages/team-inbox/team-inbox.routes";
import { ChatbotRoutes } from "../chatbot/chatbot.routes";
import { automationsRoutes } from "./pages/automations/automations.routes";


export const HomeBaseRoutes = {
  path: 'dashboard',
  component: HomeBaseComponent,
  children: [
    userDashboardMainRoutes,
    profileSettingsRoutes,
    broadcastRoutes,
    contactsRoutes,
    teamInboxRoutes,
    automationsRoutes,
    ...ChatbotRoutes
  ],
  canActivate: [AuthGuard],
  canMatch: [AuthGuard]
};
