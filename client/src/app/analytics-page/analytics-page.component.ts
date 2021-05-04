import {AfterViewInit, Component, ElementRef, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {AnalyticsService} from "../shared/services/analytics.service";
import {AnalyticsPage} from "../shared/interfaces";
import {Chart, ChartDataSets, ChartPluginsOptions, ChartType} from 'chart.js'
import {Subscription} from "rxjs";
import {Color, Label} from "ng2-charts";

@Component({
  selector: 'app-analytics-page',
  templateUrl: './analytics-page.component.html',
  styleUrls: ['./analytics-page.component.sass']
})
export class AnalyticsPageComponent implements AfterViewInit, OnDestroy {

  @ViewChild('gain') gainRef!: ElementRef
  @ViewChild('order') orderRef!: ElementRef

  aSub!: Subscription
  average!: number
  pending = true

  gainChartData: ChartDataSets[] = []
  ordersChartData: ChartDataSets[] = []
  lineChartLabels: Label[] = []
  lineChartOptions = {
    responsive: true,
  };
  lineChartColors: Color[] = [{
    borderColor: 'black',
    backgroundColor: 'rgba(255,255,0,0.28)',
  }]
  lineChartLegend = true
  lineChartPlugins = [];
  lineChartType: ChartType = 'line';

  constructor(private service: AnalyticsService) {
    this.aSub = this.service.getAnalytics().subscribe(
      (data: AnalyticsPage) => {
        this.average = data.average

        this.lineChartLabels = data.chart.map(item => item.label)

        this.ordersChartData.push({
          label: 'Orders',
          data: data.chart.map(item => item.order)
        })


        this.gainChartData.push({
          label: 'Gain',
          data: data.chart.map(item => item.gain)
        })

      },
      error => {},
      () => this.pending = false

    )

  }

  ngAfterViewInit(): void {

  }

  ngOnDestroy() {
    if (this.aSub)
      this.aSub.unsubscribe()
  }

}

