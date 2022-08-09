import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ApexOptions } from 'ng-apexcharts';
import { Subject, takeUntil } from 'rxjs';
import { ModelManagerService } from 'app/modules/admin/model-manager/model-manager.service';
import { Item } from 'app/modules/admin/model-manager/model-manager.types';

@Component({
    selector       : 'model-manager-details',
    templateUrl    : './details.component.html',
    encapsulation  : ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ModelManagerDetailsComponent implements OnInit, OnDestroy
{

    chartAucPR: ApexOptions;
    chartMcc: ApexOptions;
    chartPrecisionVsRecall: ApexOptions;
    data: any;
    item: Item;
    private _unsubscribeAll: Subject<any> = new Subject<any>();

    /**
     * Constructor
     */
    constructor(
        private _activatedRoute: ActivatedRoute,
        private _changeDetectorRef: ChangeDetectorRef,
        private _modelManagerService: ModelManagerService
    )
    {
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Lifecycle hooks
    // -----------------------------------------------------------------------------------------------------

    /**
     * On init
     */
    ngOnInit(): void {

        // Get the item
        this._modelManagerService.getItemById(this._activatedRoute.snapshot.params.id)
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((item: Item) => {

                // Get the item
                this.item = item;

                // Mark for check
                this._changeDetectorRef.markForCheck();
            });

        // Get the data
        this._modelManagerService.getAnalytics(this._activatedRoute.snapshot.params.id)
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((data) => {
                this.data = data;
                this._prepareChartData();
                this._changeDetectorRef.markForCheck();
            });
    }

    /**
     * On destroy
     */
    ngOnDestroy(): void {
        // Unsubscribe from all subscriptions
        this._unsubscribeAll.next(null);
        this._unsubscribeAll.complete();
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------


    private _prepareChartData(): void {
        // AUC-PR
        this.chartAucPR = {
            chart  : {
                animations: {
                    enabled: false
                },
                fontFamily: 'inherit',
                foreColor : 'inherit',
                height    : '100%',
                type      : 'area',
                sparkline : {
                    enabled: true
                }
            },
            colors : ['#38BDF8'],
            fill   : {
                colors : ['#38BDF8'],
                opacity: 0.5
            },
            series : this.data.aucPR.series,
            stroke : {
                curve: 'smooth'
            },
            tooltip: {
                followCursor: true,
                theme       : 'dark'
            },
            xaxis  : {
                type      : 'category',
                tickAmount: this.data.aucPR.numReleases,
            },
            yaxis  : {
                labels: {
                    formatter: (val): string => 'Release ' + val.toString()
                },
                max       : 1,
                min       : 0,
                show      : false,
                tickAmount: 20
            }
        };

        // MCC
        this.chartMcc = {
            chart  : {
                animations: {
                    enabled: false
                },
                fontFamily: 'inherit',
                foreColor : 'inherit',
                height    : '100%',
                type      : 'area',
                sparkline : {
                    enabled: true
                }
            },
            colors : ['#34D399'],
            fill   : {
                colors : ['#34D399'],
                opacity: 0.5
            },
            series : this.data.mcc.series,
            stroke : {
                curve: 'smooth'
            },
            tooltip: {
                followCursor: true,
                theme       : 'dark'
            },
            xaxis  : {
                type      : 'category',
                tickAmount: this.data.mcc.numReleases,
            },
            yaxis  : {
                labels: {
                    formatter: (val): string => 'Release ' + val.toString()
                },
                max       : 1,
                min       : 0,
                show      : false,
                tickAmount: 20
            }
        };

        // Precision vs Recall
        this.chartPrecisionVsRecall = {
            chart     : {
                animations: {
                    enabled: false
                },
                fontFamily: 'inherit',
                foreColor : 'inherit',
                height    : '100%',
                type      : 'area',
                toolbar   : {
                    show: false
                },
                zoom      : {
                    enabled: false
                }
            },
            colors    : ['#3498DB', '#94A3B8'],
            dataLabels: {
                enabled: false
            },
            fill      : {
                colors : ['#AED6F1 ', '#94A3B8'],
                opacity: 0.5
            },
            grid      : {
                show   : false,
                padding: {
                    bottom: -40,
                    left  : 0,
                    right : -10
                }
            },
            legend    : {
                show: false
            },
            series    : this.data.precisionVsRecall.series,
            stroke    : {
                curve: 'smooth',
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
            },
            xaxis     : {
                axisBorder: {
                    show: false
                },
                labels    : {
                    offsetY: -20,
                    // offsetX: -20,
                    rotate : 0,
                    style  : {
                        colors: 'var(--fuse-text-secondary)'
                    }
                },
                tickAmount: this.data.precisionVsRecall.numReleases,
                tooltip   : {
                    enabled: false
                },
                type      : 'category'
            },
            yaxis     : {
                labels    : {
                    style: {
                        colors: 'var(--fuse-text-secondary)'
                    }
                },
                max       : 1,
                min       : 0,
                show      : false,
                tickAmount: 20
            }
        };

    }

    /**
     * Track by function for ngFor loops
     *
     * @param index
     * @param item
     */
    trackByFn(index: number, item: any): any {
        return item.id || index;
    }
}