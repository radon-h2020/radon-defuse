import { ChangeDetectionStrategy, Component, Inject, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { ApexOptions } from 'ng-apexcharts';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
    selector       : 'dialog-analytics',
    templateUrl    : './dialog-analytics.component.html',
    encapsulation  : ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class DialogAnalyticsComponent implements OnInit, OnDestroy
{
    chartPerformance: ApexOptions;
//     data: any;
    private _unsubscribeAll: Subject<any> = new Subject<any>();

    /**
     * Constructor
     */
    constructor(
        private _router: Router,
        @Inject(MAT_DIALOG_DATA) public data: any) { }

    // -----------------------------------------------------------------------------------------------------
    // @ Lifecycle hooks
    // -----------------------------------------------------------------------------------------------------

    /**
     * On init
     */
    ngOnInit(): void
    {
        this._prepareChartData();

        // Attach SVG fill fixer to all ApexCharts
        window['Apex'] = {
            chart: {
                events: {
                    mounted: (chart: any, options?: any) => {
                        this._fixSvgFill(chart.el);
                    },
                    updated: (chart: any, options?: any) => {
                        this._fixSvgFill(chart.el);
                    }
                }
            }
        };
    }

    /**
     * On destroy
     */
    ngOnDestroy(): void
    {
        // Unsubscribe from all subscriptions
        this._unsubscribeAll.next();
        this._unsubscribeAll.complete();
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Private methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Fix the SVG fill references. This fix must be applied to all ApexCharts
     * charts in order to fix 'black color on gradient fills on certain browsers'
     * issue caused by the '<base>' tag.
     *
     * Fix based on https://gist.github.com/Kamshak/c84cdc175209d1a30f711abd6a81d472
     *
     * @param element
     * @private
     */
    private _fixSvgFill(element: Element): void
    {
        // Current URL
        const currentURL = this._router.url;

        // 1. Find all elements with 'fill' attribute within the element
        // 2. Filter out the ones that doesn't have cross reference so we only left with the ones that use the 'url(#id)' syntax
        // 3. Insert the 'currentURL' at the front of the 'fill' attribute value
        Array.from(element.querySelectorAll('*[fill]'))
             .filter((el) => el.getAttribute('fill').indexOf('url(') !== -1)
             .forEach((el) => {
                 const attrVal = el.getAttribute('fill');
                 el.setAttribute('fill', `url(${currentURL}${attrVal.slice(attrVal.indexOf('#'))}`);
             });
    }

    /**
     * Prepare the chart data from the data
     *
     * @private
     */
    private _prepareChartData(): void
    {
        // Performance chart
        this.chartPerformance = {
            chart     : {
                animations: {
                    speed           : 400,
                    animateGradually: {
                        enabled: false
                    }
                },
                fontFamily: 'inherit',
                foreColor : 'inherit',
                width     : '100%',
                height    : '100%',
                type      : 'area',
                toolbar   : {
                    show: false
                },
                zoom      : {
                    enabled: false
                }
            },
            colors    : ['#818CF8'],
            dataLabels: {
                enabled: false
            },
            fill      : {
                colors: ['#312E81']
            },
            grid      : {
                show       : false,
            },
            series    : this.data.performance.series,
            stroke    : {
                width: 2
            },
            tooltip   : {
                followCursor: true,
                theme       : 'dark',
                x           : {
                    formatter(value: number): string
                    {
                        return `Release: ${value}`;
                    }
                },
                y           : {
                    formatter(value: number): string
                    {
                        return `${value}`;
                    }
                }
            },
            xaxis     : {
                axisBorder: {
                    show: false
                },
                axisTicks : {
                    show: false
                },
                crosshairs: {
                    stroke: {
                        color    : '#475569',
                        dashArray: 0,
                        width    : 2
                    }
                },
                labels    : {
                    offsetY: 0,
                    style  : {
                        colors: '#CBD5E1'
                    }
                },
                tickAmount: 20,
                tooltip   : {
                    enabled: false
                },
                type      : 'category'
            },
            yaxis     : {
                axisTicks : {
                    show: false
                },
                axisBorder: {
                    show: false
                },
                min       : 0,
                max       : 1,
                tickAmount: 5,
                show      : true,
                labels    : {
                    style  : {
                        colors: '#CBD5E1'
                    }
                },
            }
        };

    }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Track by function for ngFor loops
     *
     * @param index
     * @param item
     */
    trackByFn(index: number, item: any): any
    {
        return item.id || index;
    }
}
