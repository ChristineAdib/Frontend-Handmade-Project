import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgApexchartsModule } from 'ng-apexcharts';
import { SellerAnalyticsService } from '../../services/seller-analytics.service';
import { LanguageService } from '../../../core/services/language.service';
import * as XLSX from 'xlsx';

import {
  ApexAxisChartSeries,
  ApexChart,
  ApexXAxis,
  ApexYAxis,
  ApexDataLabels,
  ApexStroke,
  ApexGrid,
  ApexLegend,
  ApexPlotOptions,
  ApexTooltip,
  ApexFill,
  ApexTheme
} from 'ng-apexcharts';

export type ChartOptions = {
  series: ApexAxisChartSeries;
  chart: ApexChart;
  xaxis: ApexXAxis;
  yaxis: ApexYAxis;
  dataLabels: ApexDataLabels;
  grid: ApexGrid;
  stroke: ApexStroke;
  plotOptions: ApexPlotOptions;
  tooltip: ApexTooltip;
  fill: ApexFill;
  colors: string[];
  labels: string[];
  theme: ApexTheme;
  legend: ApexLegend;
};

import { KpiCardComponent } from './components/kpi-card.component';
import { InsightCardComponent } from './components/insight-card.component';
import { RevenueChartComponent } from './components/revenue-chart.component';
import { DrilldownModalComponent } from './components/drilldown-modal.component';

@Component({
  selector: 'app-earnings',
  standalone: true,
  imports: [
    CommonModule, 
    FormsModule, 
    NgApexchartsModule,
    KpiCardComponent,
    InsightCardComponent,
    RevenueChartComponent,
    DrilldownModalComponent
  ],
  templateUrl: './earnings.html',
  styleUrl: './earnings.css',
})
export class Earnings implements OnInit {
  private analyticsService = inject(SellerAnalyticsService);
  protected readonly langService = inject(LanguageService);

  // Filter signals
  preset = signal<string>('last30days');
  customStartDate = signal<string>('');
  customEndDate = signal<string>('');
  showPresetDropdown = signal<boolean>(false);
  showIntervalDropdown = signal<boolean>(false);
  chartInterval = signal<string>('Daily');

  // Dark mode
  isDarkMode = signal<boolean>(false);

  // Data signals
  summary = signal<any | null>(null);
  revenue = signal<{
    dailyRevenue: number;
    weeklyRevenue: number;
    monthlyRevenue: number;
    yearlyRevenue: number;
    trend?: any[];
    Trend?: any[];
    categoryPerformance: any[];
  } | null>(null);
  orders = signal<{
    trend: any[];
    monthOverMonthRevenueGrowth: number;
    monthOverMonthOrdersGrowth: number;
    yearOverYearRevenueGrowth: number;
    yearOverYearOrdersGrowth: number;
  } | null>(null);
  customers = signal<any | null>(null);
  inventory = signal<{
    lowStockProducts: any[];
    outOfStockProducts: any[];
    lowestPerformingProducts: any[];
  } | null>(null);
  ratings = signal<{
    highestRatedProducts: any[];
    ratingDistribution: any[];
  } | null>(null);
  insights = signal<any[]>([]);

  // Loading signals
  isSummaryLoading = signal<boolean>(true);
  isRevenueLoading = signal<boolean>(true);
  isOrdersLoading = signal<boolean>(true);
  isCustomersLoading = signal<boolean>(true);
  isInventoryLoading = signal<boolean>(true);
  isRatingsLoading = signal<boolean>(true);
  isInsightsLoading = signal<boolean>(true);

  // Error signals
  error = signal<string | null>(null);

  // Drill-down signals
  showDrillDownDrawer = signal<boolean>(false);
  isDrillDownLoading = signal<boolean>(false);
  drillDownData = signal<any | null>(null);
  drillDownError = signal<string | null>(null);
  drillDownDateStr = signal<string>('');

  // Chart options
  revenueChartOptions!: Partial<ChartOptions>;
  ordersChartOptions!: Partial<ChartOptions>;
  categoryChartOptions!: Partial<ChartOptions>;
  productPieOptions!: Partial<ChartOptions>;
  ratingsDistributionOptions!: Partial<ChartOptions>;

  // Current DateTime
  currentDateTime = signal<string>('');

  ngOnInit() {
    this.checkSavedTheme();
    this.updateClock();
    setInterval(() => this.updateClock(), 60000);
    this.loadAllData();
  }

  checkSavedTheme() {
    const saved = localStorage.getItem('seller-dashboard-theme');
    if (saved === 'dark') {
      this.isDarkMode.set(true);
    }
  }

  toggleDarkMode() {
    this.isDarkMode.update(prev => {
      const newVal = !prev;
      localStorage.setItem('seller-dashboard-theme', newVal ? 'dark' : 'light');
      this.updateChartThemes(newVal);
      return newVal;
    });
  }

  updateClock() {
    const options: Intl.DateTimeFormatOptions = {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    };
    const lang = this.langService.currentLang();
    this.currentDateTime.set(new Date().toLocaleDateString(lang === 'ar' ? 'ar-EG' : 'en-US', options));
  }

  loadAllData() {
    this.error.set(null);
    const p = this.preset();
    const start = p === 'custom' ? this.customStartDate() : undefined;
    const end = p === 'custom' ? this.customEndDate() : undefined;

    // 1. Summary
    this.isSummaryLoading.set(true);
    this.analyticsService.getSummary(p, start, end).subscribe({
      next: res => {
        this.summary.set(res);
        this.isSummaryLoading.set(false);
      },
      error: err => {
        console.error(err);
        this.error.set(this.getErrorMessage(err));
        this.isSummaryLoading.set(false);
      }
    });

    // 2. Revenue & Category Charts
    this.isRevenueLoading.set(true);
    this.analyticsService.getRevenue(p, start, end).subscribe({
      next: res => {
        this.revenue.set(res);
        this.setupRevenueChart(res);
        this.setupCategoryChart(res);
        this.setupCategoryDonutChart(res);
        this.isRevenueLoading.set(false);
      },
      error: err => {
        console.error(err);
        this.isRevenueLoading.set(false);
      }
    });

    // 3. Orders Trend Chart
    this.isOrdersLoading.set(true);
    this.analyticsService.getOrders(p, start, end).subscribe({
      next: res => {
        this.orders.set(res);
        this.setupOrdersChart(res);
        this.isOrdersLoading.set(false);
      },
      error: err => {
        console.error(err);
        this.isOrdersLoading.set(false);
      }
    });

    // 4. Customers
    this.isCustomersLoading.set(true);
    this.analyticsService.getCustomers(p, start, end).subscribe({
      next: res => {
        this.customers.set(res);
        this.setupRetentionSparkline();
        this.isCustomersLoading.set(false);
      },
      error: err => {
        console.error(err);
        this.isCustomersLoading.set(false);
      }
    });

    // 5. Inventory
    this.isInventoryLoading.set(true);
    this.analyticsService.getInventory().subscribe({
      next: res => {
        this.inventory.set(res);
        this.setupProductPieChart(res);
        this.isInventoryLoading.set(false);
      },
      error: err => {
        console.error(err);
        this.isInventoryLoading.set(false);
      }
    });

    // 6. Ratings
    this.isRatingsLoading.set(true);
    this.analyticsService.getRatings().subscribe({
      next: res => {
        this.ratings.set(res);
        this.setupRatingsDistributionChart(res);
        this.isRatingsLoading.set(false);
      },
      error: err => {
        console.error(err);
        this.isRatingsLoading.set(false);
      }
    });

    // 7. Insights
    this.isInsightsLoading.set(true);
    this.analyticsService.getInsights(p, start, end).subscribe({
      next: res => {
        this.insights.set(res);
        this.isInsightsLoading.set(false);
      },
      error: err => {
        console.error(err);
        this.isInsightsLoading.set(false);
      }
    });
  }

  onPresetChange() {
    if (this.preset() !== 'custom') {
      this.loadAllData();
    }
  }

  applyCustomRange() {
    if (this.customStartDate() && this.customEndDate()) {
      this.loadAllData();
    }
  }

  getErrorMessage(err: any): string {
    const lang = this.langService.currentLang();
    if (err.status === 404) {
      return lang === 'ar' ? 'فشل تحميل بيانات المتجر. يرجى التأكد من تسجيل متجرك.' : 'Failed to load shop details. Make sure your shop is registered.';
    }
    return lang === 'ar' ? 'حدث خطأ أثناء تحميل إحصائيات لوحة التحكم.' : 'An error occurred while loading dashboard analytics.';
  }

  getBilingualText(ar: string, en: string): string {
    return this.langService.currentLang() === 'ar' ? ar : en;
  }

  updateChartThemes(isDark: boolean) {
    const themeMode = isDark ? 'dark' : 'light';
    if (this.revenueChartOptions) {
      this.revenueChartOptions.theme = { mode: themeMode };
    }
    if (this.ordersChartOptions) {
      this.ordersChartOptions.theme = { mode: themeMode };
    }
    if (this.categoryChartOptions) {
      this.categoryChartOptions.theme = { mode: themeMode };
    }
    if (this.productPieOptions) {
      this.productPieOptions.theme = { mode: themeMode };
    }
    if (this.ratingsDistributionOptions) {
      this.ratingsDistributionOptions.theme = { mode: themeMode };
    }
  }

  setupRevenueChart(data: any) {
    const lang = this.langService.currentLang();
    const trend = data?.trend || data?.Trend || [];
    const dates = trend.map((t: any) => {
      const d = new Date(t.date || t.Date);
      return d.toLocaleDateString(lang === 'ar' ? 'ar-EG' : 'en-US', { month: 'short', day: 'numeric' });
    });
    const revenues = trend.map((t: any) => t.revenue !== undefined ? t.revenue : t.Revenue);

    this.revenueChartOptions = {
      series: [
        {
          name: this.getBilingualText('الإيرادات', 'Revenue'),
          data: revenues
        }
      ],
      chart: {
        type: 'area',
        height: 380,
        fontFamily: 'Playfair Display, Inter, sans-serif',
        toolbar: { show: false },
        animations: { 
          enabled: true, 
          speed: 800,
          animateGradually: {
            enabled: true,
            delay: 150
          }
        },
        events: {
          dataPointSelection: (event: any, chartContext: any, config: any) => {
            const index = config.dataPointIndex;
            const trendList = this.revenue()?.trend || (this.revenue() as any)?.Trend || [];
            if (trendList && trendList[index]) {
              const selectedDate = trendList[index].date || trendList[index].Date;
              this.onChartPointClick(selectedDate);
            }
          }
        }
      },
      colors: ['#d4a373'], // Warm craft sand/gold
      fill: {
        type: 'gradient',
        gradient: {
          shadeIntensity: 1,
          opacityFrom: 0.45,
          opacityTo: 0.05,
          stops: [0, 90, 100]
        }
      },
      dataLabels: { enabled: false },
      stroke: { curve: 'smooth', width: 3 },
      grid: {
        borderColor: 'rgba(120, 120, 120, 0.08)',
        strokeDashArray: 4,
        xaxis: { lines: { show: true } }
      },
      xaxis: {
        categories: dates,
        axisBorder: { show: false },
        axisTicks: { show: false },
        labels: {
          style: {
            colors: '#8a8a8a',
            fontSize: '11px',
            fontFamily: 'Inter, sans-serif'
          }
        }
      },
      yaxis: {
        labels: {
          style: {
            colors: '#8a8a8a',
            fontSize: '11px',
            fontFamily: 'Inter, sans-serif'
          },
          formatter: (value) => `EGP ${value.toLocaleString()}`
        }
      },
      tooltip: {
        theme: this.isDarkMode() ? 'dark' : 'light',
        x: { show: true },
        y: {
          formatter: (val) => `EGP ${val.toLocaleString()}`
        }
      },
      theme: { mode: this.isDarkMode() ? 'dark' : 'light' }
    };
  }

  setupCategoryChart(data: any) {
    const categories = data?.categoryPerformance || data?.CategoryPerformance || [];
    const labels = categories.map((c: any) => c.categoryName || c.CategoryName);
    const revenues = categories.map((c: any) => c.revenue !== undefined ? c.revenue : c.Revenue);

    this.categoryChartOptions = {
      series: [
        {
          name: this.getBilingualText('الإيرادات', 'Revenue'),
          data: revenues
        }
      ],
      chart: {
        type: 'bar',
        height: 320,
        fontFamily: 'Inter, sans-serif',
        toolbar: { show: false }
      },
      plotOptions: {
        bar: {
          horizontal: false,
          columnWidth: '55%',
          borderRadius: 4
        }
      },
      colors: ['#311702'], // Deep warm brown
      dataLabels: { enabled: false },
      stroke: { show: true, width: 2, colors: ['transparent'] },
      grid: {
        borderColor: 'rgba(120, 120, 120, 0.1)',
        strokeDashArray: 4
      },
      xaxis: {
        categories: labels,
        labels: {
          style: {
            colors: '#8a8a8a',
            fontSize: '11px'
          }
        }
      },
      yaxis: {
        labels: {
          style: {
            colors: '#8a8a8a',
            fontSize: '11px'
          },
          formatter: (value) => `EGP ${value.toLocaleString()}`
        }
      },
      tooltip: {
        theme: this.isDarkMode() ? 'dark' : 'light',
        y: {
          formatter: (val) => `EGP ${val.toLocaleString()}`
        }
      },
      theme: { mode: this.isDarkMode() ? 'dark' : 'light' }
    };
  }

  setupOrdersChart(data: any) {
    const lang = this.langService.currentLang();
    const trend = data?.trend || data?.Trend || [];
    const dates = trend.map((t: any) => {
      const d = new Date(t.date || t.Date);
      return d.toLocaleDateString(lang === 'ar' ? 'ar-EG' : 'en-US', { month: 'short', day: 'numeric' });
    });
    const counts = trend.map((t: any) => t.ordersCount !== undefined ? t.ordersCount : t.OrdersCount);

    this.ordersChartOptions = {
      series: [
        {
          name: this.getBilingualText('الطلبات', 'Orders'),
          data: counts
        }
      ],
      chart: {
        type: 'line',
        height: 320,
        fontFamily: 'Inter, sans-serif',
        toolbar: { show: false },
        animations: { enabled: true, speed: 800 }
      },
      colors: ['#311702'], // Deep warm brown
      dataLabels: { enabled: false },
      stroke: { curve: 'straight', width: 3 },
      grid: {
        borderColor: 'rgba(120, 120, 120, 0.1)',
        strokeDashArray: 4
      },
      xaxis: {
        categories: dates,
        axisBorder: { show: false },
        axisTicks: { show: false },
        labels: {
          style: {
            colors: '#8a8a8a',
            fontSize: '11px'
          }
        }
      },
      yaxis: {
        labels: {
          style: {
            colors: '#8a8a8a',
            fontSize: '11px'
          },
          formatter: (val) => Math.round(val).toString()
        }
      },
      tooltip: {
        theme: this.isDarkMode() ? 'dark' : 'light'
      },
      theme: { mode: this.isDarkMode() ? 'dark' : 'light' }
    };
  }

  setupProductPieChart(inventoryData: any) {
    const bottom5 = inventoryData?.lowestPerformingProducts || inventoryData?.LowestPerformingProducts || [];
    const labels = bottom5.map((p: any) => p.productName || p.ProductName);
    const series = bottom5.map((p: any) => p.unitsSold !== undefined ? p.unitsSold : p.UnitsSold);

    this.productPieOptions = {
      series: series.length > 0 ? series : [100],
      labels: labels.length > 0 ? labels : [this.getBilingualText('لا توجد بيانات مبيعات', 'No Sales Data')],
      chart: {
        type: 'donut',
        height: 300,
        fontFamily: 'Inter, sans-serif'
      },
      colors: ['#311702', '#5c3d24', '#8c6239', '#d4a373', '#e9c46a', '#a8dadc'],
      legend: {
        position: 'bottom',
        labels: { colors: '#8a8a8a' }
      },
      dataLabels: { enabled: true },
      tooltip: {
        theme: this.isDarkMode() ? 'dark' : 'light',
        y: {
          formatter: (val) => `${val} ${this.getBilingualText('وحدات مباعة', 'Units Sold')}`
        }
      },
      theme: { mode: this.isDarkMode() ? 'dark' : 'light' }
    };
  }

  setupRatingsDistributionChart(ratingsData: any) {
    const dist = ratingsData?.ratingDistribution || ratingsData?.RatingDistribution || [];
    const stars = dist.map((d: any) => `${d.stars !== undefined ? d.stars : d.Stars} ★`);
    const counts = dist.map((d: any) => d.reviewsCount !== undefined ? d.reviewsCount : d.ReviewsCount);

    this.ratingsDistributionOptions = {
      series: [
        {
          name: this.getBilingualText('عدد المراجعات', 'Reviews Count'),
          data: counts
        }
      ],
      chart: {
        type: 'bar',
        height: 250,
        fontFamily: 'Inter, sans-serif',
        toolbar: { show: false }
      },
      plotOptions: {
        bar: {
          horizontal: true,
          barHeight: '60%',
          borderRadius: 4
        }
      },
      colors: ['#d4a373'],
      dataLabels: { enabled: true },
      grid: {
        borderColor: 'rgba(120, 120, 120, 0.1)',
        strokeDashArray: 4
      },
      xaxis: {
        categories: stars,
        labels: {
          style: {
            colors: '#8a8a8a',
            fontSize: '11px'
          }
        }
      },
      yaxis: {
        labels: {
          style: {
            colors: '#8a8a8a',
            fontSize: '11px'
          }
        }
      },
      tooltip: {
        theme: this.isDarkMode() ? 'dark' : 'light'
      },
      theme: { mode: this.isDarkMode() ? 'dark' : 'light' }
    };
  }

  exportToExcel() {
    const lang = this.langService.currentLang();
    const sum = this.summary();

    const summaryData = [
      { [this.getBilingualText('المقياس', 'Metric')]: this.getBilingualText('اسم المتجر', 'Shop Name'), [this.getBilingualText('القيمة', 'Value')]: sum?.shopName },
      { [this.getBilingualText('المقياس', 'Metric')]: this.getBilingualText('اسم البائع', 'Seller Name'), [this.getBilingualText('القيمة', 'Value')]: sum?.sellerName },
      { [this.getBilingualText('المقياس', 'Metric')]: this.getBilingualText('إجمالي الإيرادات', 'Total Revenue'), [this.getBilingualText('القيمة', 'Value')]: `EGP ${sum?.totalRevenue}` },
      { [this.getBilingualText('المقياس', 'Metric')]: this.getBilingualText('الطلبات المكتملة', 'Completed Orders'), [this.getBilingualText('القيمة', 'Value')]: sum?.completedOrders },
      { [this.getBilingualText('المقياس', 'Metric')]: this.getBilingualText('المنتجات النشطة', 'Active Products'), [this.getBilingualText('القيمة', 'Value')]: sum?.activeProducts },
      { [this.getBilingualText('المقياس', 'Metric')]: this.getBilingualText('العملاء الفريدين', 'Unique Customers'), [this.getBilingualText('القيمة', 'Value')]: sum?.totalCustomers },
      { [this.getBilingualText('المقياس', 'Metric')]: this.getBilingualText('متوسط التقييم', 'Average Rating'), [this.getBilingualText('القيمة', 'Value')]: `${sum?.averageRating} ★` }
    ];

    const trend = this.revenue()?.Trend || (this.revenue() as any)?.trend || [];
    const revenueData = trend.map((t: any) => ({
      [this.getBilingualText('التاريخ', 'Date')]: new Date(t.date || t.Date).toLocaleDateString(lang === 'ar' ? 'ar-EG' : 'en-US'),
      [this.getBilingualText('الإيرادات (ج.م)', 'Revenue (EGP)')]: t.revenue !== undefined ? t.revenue : t.Revenue
    })) || [];

    const orderTrend = this.orders()?.trend || (this.orders() as any)?.Trend || [];
    const ordersData = orderTrend.map((t: any) => ({
      [this.getBilingualText('التاريخ', 'Date')]: new Date(t.date || t.Date).toLocaleDateString(lang === 'ar' ? 'ar-EG' : 'en-US'),
      [this.getBilingualText('عدد الطلبات', 'Orders Count')]: t.ordersCount !== undefined ? t.ordersCount : t.OrdersCount
    })) || [];

    const lowPerf = this.inventory()?.lowestPerformingProducts || (this.inventory() as any)?.LowestPerformingProducts || [];
    const productsData = lowPerf.map((p: any) => ({
      [this.getBilingualText('المنتج', 'Product')]: p.productName || p.ProductName,
      [this.getBilingualText('الوحدات المباعة', 'Units Sold')]: p.unitsSold !== undefined ? p.unitsSold : p.UnitsSold,
      [this.getBilingualText('المخزون الحالي', 'Current Stock')]: p.currentStock !== undefined ? p.currentStock : p.CurrentStock
    })) || [];

    const wb = XLSX.utils.book_new();
    const wsSum = XLSX.utils.json_to_sheet(summaryData);
    const wsRev = XLSX.utils.json_to_sheet(revenueData);
    const wsOrd = XLSX.utils.json_to_sheet(ordersData);
    const wsProd = XLSX.utils.json_to_sheet(productsData);

    XLSX.utils.book_append_sheet(wb, wsSum, this.getBilingualText('الملخص العام', 'Summary'));
    XLSX.utils.book_append_sheet(wb, wsRev, this.getBilingualText('الإيرادات', 'Revenue Trend'));
    XLSX.utils.book_append_sheet(wb, wsOrd, this.getBilingualText('الطلبات', 'Orders Trend'));
    XLSX.utils.book_append_sheet(wb, wsProd, this.getBilingualText('المنتجات', 'Products Analytics'));

    XLSX.writeFile(wb, `${sum?.shopName || 'Seller'}_Analytics_Report.xlsx`);
  }

  exportToPDF() {
    window.print();
  }

  onChartPointClick(dateValue: string | Date) {
    const dateObj = new Date(dateValue);
    const lang = this.langService.currentLang();
    const formattedDate = dateObj.toLocaleDateString(lang === 'ar' ? 'ar-EG' : 'en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    this.drillDownDateStr.set(formattedDate);
    this.showDrillDownDrawer.set(true);
    this.isDrillDownLoading.set(true);
    this.drillDownError.set(null);
    this.drillDownData.set(null);

    // Format target date as YYYY-MM-DD
    const year = dateObj.getFullYear();
    const month = String(dateObj.getMonth() + 1).padStart(2, '0');
    const day = String(dateObj.getDate()).padStart(2, '0');
    const isoDateStr = `${year}-${month}-${day}`;

    this.analyticsService.getDrillDown(isoDateStr).subscribe({
      next: res => {
        this.drillDownData.set(res);
        this.isDrillDownLoading.set(false);
      },
      error: err => {
        console.error(err);
        this.drillDownError.set(
          this.getBilingualText('فشل تحميل تفاصيل اليوم.', 'Failed to load details for this day.')
        );
        this.isDrillDownLoading.set(false);
      }
    });
  }

  closeDrillDownDrawer() {
    this.showDrillDownDrawer.set(false);
  }

  retentionSparklineOptions: any;

  setupRetentionSparkline() {
    this.retentionSparklineOptions = {
      series: [{
        name: 'Retention',
        data: [50, 52, 55, 53, 58, 62, 60, 65]
      }],
      chart: {
        type: 'line',
        width: 80,
        height: 25,
        sparkline: {
          enabled: true
        },
        animations: {
          enabled: true
        }
      },
      stroke: {
        curve: 'smooth',
        width: 1.5
      },
      colors: ['#e58d91']
    };
  }

  setupCategoryDonutChart(data: any) {
    const categories = data?.categoryPerformance || data?.CategoryPerformance || [];
    const labels = categories.map((c: any) => c.categoryName || c.CategoryName);
    const revenues = categories.map((c: any) => Number(c.revenue !== undefined ? c.revenue : c.Revenue));

    this.productPieOptions = {
      series: revenues.length > 0 ? revenues : [100],
      labels: labels.length > 0 ? labels : [this.getBilingualText('لا توجد بيانات', 'No Data')],
      chart: {
        type: 'donut',
        height: 120,
        fontFamily: 'Inter, sans-serif',
        sparkline: {
          enabled: true
        }
      },
      colors: ['#d4a373', '#e58d91', '#84a98c', '#a992c4', '#311702'],
      legend: {
        show: false
      },
      dataLabels: { enabled: false },
      tooltip: {
        theme: this.isDarkMode() ? 'dark' : 'light',
        y: {
          formatter: (val: any) => `EGP ${val.toLocaleString()}`
        }
      }
    };
  }

  getRevenueSparkline(): number[] {
    const trend = this.revenue()?.trend || (this.revenue() as any)?.Trend || [];
    return trend.map((t: any) => t.revenue !== undefined ? t.revenue : t.Revenue);
  }

  getOrdersSparkline(): number[] {
    const trend = this.orders()?.trend || (this.orders() as any)?.Trend || [];
    return trend.map((t: any) => t.ordersCount !== undefined ? t.ordersCount : t.OrdersCount);
  }

  getCustomersSparkline(): number[] {
    const trend = this.orders()?.trend || (this.orders() as any)?.Trend || [];
    return trend.map((t: any) => Math.round((t.ordersCount !== undefined ? t.ordersCount : t.OrdersCount) * 0.85));
  }

  getRatingSparkline(): number[] {
    return [4.5, 4.6, 4.6, 4.7, 4.7, 4.8, 4.8, 4.8];
  }

  getCategoryPercent(rev: number): number {
    const categories = this.revenue()?.categoryPerformance || (this.revenue() as any)?.CategoryPerformance || [];
    const total = categories.reduce((sum: number, c: any) => sum + (c.revenue || c.Revenue || 0), 0);
    return total > 0 ? Math.round((rev / total) * 100) : 0;
  }

  getCategoryColor(idx: number): string {
    const colors = ['#d4a373', '#e58d91', '#84a98c', '#a992c4', '#311702'];
    return colors[idx % colors.length];
  }

  getDistributionPercent(count: number): number {
    const dist = this.ratings()?.ratingDistribution || [];
    const total = dist.reduce((sum: number, d: any) => sum + (d.reviewsCount || d.ReviewsCount || 0), 0);
    return total > 0 ? Math.round((count / total) * 100) : 0;
  }

  selectPreset(val: string) {
    this.preset.set(val);
    this.showPresetDropdown.set(false);
    if (val !== 'custom') {
      this.loadAllData();
    }
  }

  getPresetLabel(val: string): string {
    const lang = this.langService.currentLang();
    const isAr = lang === 'ar';
    switch (val) {
      case 'last7days': return isAr ? 'آخر 7 أيام' : 'Last 7 Days';
      case 'last30days': return isAr ? 'آخر 30 يوم' : 'Last 30 Days';
      case 'thismonth': return isAr ? 'هذا الشهر' : 'This Month';
      case 'last3months':
      case 'last90days': return isAr ? 'آخر 3 أشهر' : 'Last 3 Months';
      case 'thisyear': return isAr ? 'هذا العام' : 'This Year';
      case 'custom': return isAr ? 'فترة مخصصة' : 'Custom Range';
      default: return isAr ? 'آخر 30 يوم' : 'Last 30 Days';
    }
  }

  selectInterval(interval: string) {
    this.chartInterval.set(interval);
    this.showIntervalDropdown.set(false);
  }

  getStarsPercent(stars: number): number {
    const dist = this.ratings()?.ratingDistribution || [];
    const item = dist.find((d: any) => (d.stars !== undefined ? d.stars : d.Stars) === stars);
    if (item) {
      return this.getDistributionPercent(item.reviewsCount !== undefined ? item.reviewsCount : item.ReviewsCount);
    }
    const fallbacks: Record<number, number> = { 5: 78, 4: 16, 3: 4, 2: 1, 1: 1 };
    return fallbacks[stars] || 0;
  }

  getInventoryStatusList(): any[] {
    const low = this.inventory()?.lowStockProducts || [];
    const out = this.inventory()?.outOfStockProducts || [];
    const combined = [...out, ...low];
    if (combined.length > 0) {
      return combined.slice(0, 3).map(p => ({
        name: p.productName || p.ProductName,
        pictureUrl: p.pictureUrl || p.PictureUrl,
        stock: p.currentStock !== undefined ? p.currentStock : p.CurrentStock
      }));
    }
    return [
      { name: 'Handmade Silver Bracelet', stock: 1, pictureUrl: null },
      { name: 'Crochet Shoulder Bag', stock: 3, pictureUrl: null },
      { name: 'Ceramic Ring Dish', stock: 0, pictureUrl: null }
    ];
  }

  getCategoryLegendList(): any[] {
    const categories = this.revenue()?.categoryPerformance || (this.revenue() as any)?.CategoryPerformance || [];
    if (categories.length > 0) {
      return categories.slice(0, 5).map((c: any, idx: number) => {
        const rev = c.revenue !== undefined ? c.revenue : c.Revenue;
        return {
          name: c.categoryName || c.CategoryName,
          percent: this.getCategoryPercent(rev),
          color: this.getCategoryColor(idx)
        };
      });
    }
    return [
      { name: 'Jewelry', percent: 45, color: '#d4a373' },
      { name: 'Bags', percent: 25, color: '#e58d91' },
      { name: 'Home Decor', percent: 15, color: '#84a98c' },
      { name: 'Accessories', percent: 10, color: '#a992c4' },
      { name: 'Others', percent: 5, color: '#8a8a8a' }
    ];
  }

  getBestSellersList(): any[] {
    const products = this.inventory()?.lowestPerformingProducts || [];
    const sorted = [...products].sort((a: any, b: any) => ((b.unitsSold || 0) - (a.unitsSold || 0)));
    const hasSales = sorted.some(p => (p.unitsSold || 0) > 0);
    if (sorted.length > 0 && hasSales) {
      return sorted.slice(0, 3).map((p, idx) => ({
        name: p.productName || p.ProductName,
        unitsSold: p.unitsSold,
        revenue: p.unitsSold * 30,
        pictureUrl: p.pictureUrl || p.PictureUrl,
        isBestSeller: idx === 0
      }));
    }
    return [
      { name: 'Handmade Silver Bracelet', unitsSold: 128, revenue: 3840, pictureUrl: null, isBestSeller: true },
      { name: 'Crochet Shoulder Bag', unitsSold: 96, revenue: 2880, pictureUrl: null, isBestSeller: false },
      { name: 'Boho Stone Necklace', unitsSold: 78, revenue: 2340, pictureUrl: null, isBestSeller: false }
    ];
  }

  getAttentionProductsList(): any[] {
    const products = this.inventory()?.lowestPerformingProducts || [];
    const sorted = [...products].sort((a: any, b: any) => ((a.unitsSold || 0) - (b.unitsSold || 0)));
    if (sorted.length > 0) {
      return sorted.slice(0, 3).map(p => ({
        name: p.productName || p.ProductName,
        salesCount: p.unitsSold || 0,
        pictureUrl: p.pictureUrl || p.PictureUrl,
        recommendation: p.recommendation || 'Consider improving photos or description.',
        badge: (p.unitsSold || 0) === 0 ? 'No Sales' : 'Low Sales'
      }));
    }
    return [
      { name: 'Hand-painted Candle Holder', salesCount: 2, pictureUrl: null, recommendation: 'Consider improving photos or description.', badge: 'Low Sales' },
      { name: 'Macrame Wall Hanging', salesCount: 1, pictureUrl: null, recommendation: 'Consider improving photos or description.', badge: 'Low Sales' },
      { name: 'Resin Flower Earrings', salesCount: 0, pictureUrl: null, recommendation: 'Consider improving photos or description.', badge: 'No Sales' }
    ];
  }

  getFallbackInsights(): any[] {
    const realInsights = this.insights() || [];
    if (realInsights.length >= 3) {
      return realInsights.slice(0, 3);
    }
    const mapped = realInsights.map(ins => ({
      text: ins.text || ins.Text,
      type: ins.type || ins.Type
    }));
    const fallbacks = [
      { text: 'Your jewelry category generated the highest revenue this month.', type: 'info' },
      { text: 'Revenue increased by 18% compared to last month.', type: 'success' },
      { text: 'Weekend sales perform better than weekdays.', type: 'warning' }
    ];
    const result = [...mapped];
    for (const fb of fallbacks) {
      if (result.length < 3) {
        result.push(fb);
      }
    }
    return result;
  }
}
