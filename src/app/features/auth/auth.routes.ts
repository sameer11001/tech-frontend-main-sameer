import { signInRoutes } from "./components/sign-in/sign-in.routes";
import { AuthMainComponent } from "./auth-main.component";


export const authRoutes = {
    path: 'auth',
    component: AuthMainComponent,
    children:[
      signInRoutes
    ]
}
