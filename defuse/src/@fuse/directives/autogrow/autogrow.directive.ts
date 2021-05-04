import { ChangeDetectorRef, Directive, ElementRef, HostBinding, HostListener, Input, NgZone, OnChanges, OnDestroy, OnInit, SimpleChanges } from '@angular/core';
import { Subject } from 'rxjs';

@Directive({
    selector: 'textarea[fuseAutogrow]',
    exportAs: 'fuseAutogrow'
})
export class FuseAutogrowDirective implements OnChanges, OnInit, OnDestroy
{
    // tslint:disable-next-line:no-input-rename
    @Input('fuseAutogrowVerticalPadding') padding: number = 8;
    @HostBinding('rows') private _rows: number = 1;

    private _height: string = 'auto';
    private _unsubscribeAll: Subject<any> = new Subject<any>();

    /**
     * Constructor
     */
    constructor(
        private _elementRef: ElementRef,
        private _changeDetectorRef: ChangeDetectorRef,
        private _ngZone: NgZone
    )
    {
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Accessors
    // -----------------------------------------------------------------------------------------------------

    /**
     * Host binding for component inline styles
     */
    @HostBinding('style') get styleList(): any
    {
        return {
            'height'  : this._height,
            'overflow': 'hidden',
            'resize'  : 'none'
        };
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Lifecycle hooks
    // -----------------------------------------------------------------------------------------------------

    /**
     * On changes
     *
     * @param changes
     */
    ngOnChanges(changes: SimpleChanges): void
    {
        // Padding
        if ( 'fuseAutogrowVerticalPadding' in changes )
        {
            // Resize
            this._resize();
        }
    }

    /**
     * On init
     */
    ngOnInit(): void
    {
        // Resize for the first time
        this._resize();
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
     * Resize on 'input' and 'ngModelChange' events
     *
     * @private
     */
    @HostListener('input')
    @HostListener('ngModelChange')
    private _resize(): void
    {
        // This doesn't need to trigger Angular's change detection by itself
        this._ngZone.runOutsideAngular(() => {

            setTimeout(() => {

                // Set the height to 'auto' so we can correctly read the scrollHeight
                this._height = 'auto';

                // Detect the changes so the height is applied
                this._changeDetectorRef.detectChanges();

                // Get the scrollHeight and subtract the vertical padding
                this._height = `${this._elementRef.nativeElement.scrollHeight - this.padding}px`;

                // Detect the changes one more time to apply the final height
                this._changeDetectorRef.detectChanges();
            });
        });
    }
}
