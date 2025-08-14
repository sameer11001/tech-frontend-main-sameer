import { businessProfile } from "./components/business-profile/business-profile.routes";
import { tagsAndAttributesRoutes } from "./components/tags-attribute/tags-attribute.routes";
import { importExportChatsRoutes } from "./components/import-export-chats/import-export-chats.routes";
import { generalRoutes } from "./components/general/general.routes";
import { ProfileSettingsComponent } from "./profile-settings.component";

export const profileSettingsRoutes = {
    path: 'settings',
    component: ProfileSettingsComponent,
    children:[
      { path: '', redirectTo: 'business-profile', pathMatch: 'full' as const },
      businessProfile,
      // personalProfile,
      generalRoutes,
      tagsAndAttributesRoutes,
      importExportChatsRoutes
    ]
}
