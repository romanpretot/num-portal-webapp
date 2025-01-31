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

import { Component, Input, OnInit } from '@angular/core'
import { TranslateService } from '@ngx-translate/core'
import { IBarChart } from 'src/app/shared/models/charts/bar-chart.interface'

@Component({
  selector: 'num-bar-chart',
  templateUrl: './bar-chart.component.html',
  styleUrls: ['./bar-chart.component.scss'],
})
export class BarChartComponent implements OnInit {
  private chart: IBarChart
  @Input() set chartData(chart: IBarChart) {
    if (chart) {
      this.chart = chart
      this.handleData()
    }
  }
  get chartData(): IBarChart {
    return this.chart
  }

  constructor(private translateService: TranslateService) {}

  showXAxis = true
  showYAxis = true
  gradient = false
  showLegend = false
  showXAxisLabel = true
  xAxisLabel: string
  showYAxisLabel = true
  yAxisLabel: string
  roundEdges = false
  colorScheme = {
    domain: [],
  }

  results: any[] = []

  ngOnInit(): void {}

  handleData(): void {
    this.xAxisLabel = this.translateService.instant(this.chart.xLabel)
    this.yAxisLabel = this.translateService.instant(this.chart.yLabel)
    this.colorScheme.domain = [this.chart.color]
    this.results = this.chart.data
  }
}
