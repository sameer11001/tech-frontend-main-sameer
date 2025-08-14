import { Injectable } from '@angular/core';
import { HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiService } from '../../api/api.service';
import { CreateUserModel, EditUserModel, GetRolesResponse, GetTeamsResponse, GetUsersResponse, Team, TeamUpdateModel } from '../../models/user-management.model';

@Injectable({ providedIn: 'root' })
export class UserManagementService {
  private readonly basePath = 'v1/user';
  private readonly teamBasePath = 'v1/team';

  constructor(private api: ApiService) {}


  getUsers(query: string, page: number, limit: number): Observable<GetUsersResponse> {
    const params = new HttpParams()
      .set('query', query)
      .set('page', page.toString())
      .set('limit', limit.toString());

    return this.api.get<GetUsersResponse>(`${this.basePath}/client`, { params });
  }

  createUser(user: CreateUserModel): Observable<void> {
    return this.api.post(`${this.basePath}/`, user);
  }

  updateUser(userId: string, user: EditUserModel): Observable<void> {
    return this.api.put(`${this.basePath}/${userId}`, user);
  }

  deleteUser(userId: string): Observable<void> {
    return this.api.delete(`${this.basePath}/${userId}`);
  }

  // Team Operations

  createTeam(teamName: string): Observable<void> {
    return this.api.post(`${this.teamBasePath}/`, { team_name: teamName });
  }

  getTeams(query: string, page: number, limit: number): Observable<GetTeamsResponse> {
    const params = new HttpParams()
      .set('query', query)
      .set('page', page.toString())
      .set('limit', limit.toString());

    return this.api.get<GetTeamsResponse>(`${this.teamBasePath}/`, { params });
  }

  updateTeam(teamId: string, team: TeamUpdateModel): Observable<void> {
    return this.api.put(`${this.teamBasePath}/${teamId}`, team);
  }

  deleteTeam(teamName: string): Observable<void> {
    const params = new HttpParams()
      .set('team_name', teamName);
    return this.api.delete(`${this.teamBasePath}/`, { params });
  }

  // Role Operations
  getRoles(): Observable<GetRolesResponse> {
    return this.api.get<GetRolesResponse>('v1/auth/roles');
  }

  // Security Operations
  forceResetPassword(userId: string, newPassword: string): Observable<void> {
    return this.api.put(`v1/auth/force-password-reset/${userId}`, { new_password: newPassword });
  }

  forceLogout(userId: string): Observable<void> {
    return this.api.post(`v1/auth/force-logout/${userId}`, {});
  }
}
