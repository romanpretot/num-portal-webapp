/**
 * Copyright 2021 Vitagroup AG
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { HttpClient } from '@angular/common/http'
import { Injectable } from '@angular/core'
import { Router } from '@angular/router'
import { OAuthService } from 'angular-oauth2-oidc'
import { BehaviorSubject, Observable, of } from 'rxjs'
import { catchError } from 'rxjs/operators'
import { AppConfigService } from 'src/app/config/app-config.service'
import { IAuthUserInfo } from 'src/app/shared/models/user/auth-user-info.interface'
import { ProfileService } from '../services/profile/profile.service'

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private userInfo: IAuthUserInfo = { sub: undefined }
  private userInfoSubject$ = new BehaviorSubject(this.userInfo)
  public userInfoObservable$ = this.userInfoSubject$.asObservable()

  constructor(
    private oauthService: OAuthService,
    private profileService: ProfileService,
    private appConfig: AppConfigService,
    private httpClient: HttpClient,
    private router: Router
  ) {}

  public initTokenHandling(): void {
    if (this.oauthService.state) {
      const url = new URL(decodeURIComponent(this.oauthService.state))
      this.router.navigate([url.pathname])
      this.oauthService.state = null
    }
    this.oauthService.events.subscribe((event) => {
      if (event.type === 'token_received') {
        this.fetchUserInfo()
      }
    })
  }

  public get isLoggedIn(): boolean {
    return this.oauthService.hasValidIdToken() && this.oauthService.hasValidAccessToken()
  }

  public login(redirectUri?: string): void {
    this.oauthService.initCodeFlow(redirectUri)
  }

  public logout(): void {
    this.clearUserInfo()
    this.oauthService.logOut()
  }

  private createUser(userId: string): Observable<any> {
    const httpOptions = {
      responseType: 'text' as 'json',
    }
    return this.httpClient
      .post<any>(
        `${this.appConfig.config.api.baseUrl}/admin/user/${userId}`,
        undefined,
        httpOptions
      )
      .pipe(catchError(() => of()))
  }

  fetchUserInfo(): Promise<void> {
    return new Promise(async (resolve, reject) => {
      if (!this.isLoggedIn) {
        return resolve()
      }

      let userInfo

      try {
        userInfo = await this.oauthService.loadUserProfile()
      } catch (error) {
        this.clearUserInfo()
        return reject('Failed to fetch userInfo')
      }

      if (this.userInfo.sub !== userInfo?.sub) {
        await this.createUser(userInfo.sub).toPromise()
      }

      this.userInfo = userInfo
      this.userInfoSubject$.next(this.userInfo)

      this.profileService.get().subscribe()
    })
  }

  private clearUserInfo(): void {
    this.userInfo = { sub: undefined }
    this.userInfoSubject$.next(this.userInfo)
  }
}
