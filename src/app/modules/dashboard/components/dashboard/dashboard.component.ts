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

import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core'
import { TranslateService } from '@ngx-translate/core'
import { Subscription } from 'rxjs'
import { AuthService } from 'src/app/core/auth/auth.service'
import { ContentService } from 'src/app/core/services/content/content.service'
import { AvailableRoles } from 'src/app/shared/models/available-roles.enum'
import { IDashboardCard } from 'src/app/shared/models/content/dashboard-card.interface'
import { AppConfigService } from '../../../../config/app-config.service'
import { INITIATIVE_CLINICS_LOGOS, LOGOS_BASE_URL, PARTICIPANT_CLINICS_LOGOS } from './constants'

@Component({
  selector: 'num-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
})
export class DashboardComponent implements OnInit, OnDestroy {
  private subscriptions = new Subscription()
  AvailableRoles = AvailableRoles
  constructor(
    private appConfig: AppConfigService,
    private authService: AuthService,
    private contentService: ContentService,
    private translateService: TranslateService
  ) {}

  config = this.appConfig.config
  participantLogosBaseUrl = LOGOS_BASE_URL
  participantLogos = PARTICIPANT_CLINICS_LOGOS
  initiativeLogos = INITIATIVE_CLINICS_LOGOS
  authTest: string
  cards: IDashboardCard[]
  displayLang: string
  isLoggedIn: boolean

  @ViewChild('participantsAnchor') participantsAnchor: ElementRef

  ngOnInit(): void {
    this.isLoggedIn = this.authService.isLoggedIn

    if (this.authService.isLoggedIn) {
      this.fetchContentCards()
      this.getCurrentLang()
    }
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe()
  }

  fetchContentCards(): void {
    this.contentService.getCards().subscribe((data) => {
      this.cards = data
    })
  }

  openCardUrl(cardUrl: string): void {
    window.open(cardUrl)
  }

  getCurrentLang(): void {
    this.displayLang = this.translateService.currentLang as 'en' | 'de'
    this.subscriptions.add(
      this.translateService.onLangChange.subscribe((newLang) => (this.displayLang = newLang.lang))
    )
  }

  scrollToParticipants(): void {
    const targetElement = this.participantsAnchor.nativeElement
    targetElement.scrollIntoView({ behavior: 'smooth' })
  }
}
