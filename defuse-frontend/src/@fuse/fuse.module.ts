import { NgModule, Optional, SkipSelf } from '@angular/core';
import { MATERIAL_SANITY_CHECKS } from '@angular/material/core';
import { MAT_FORM_FIELD_DEFAULT_OPTIONS } from '@angular/material/form-field';
import { FuseConfirmationModule } from '@fuse/services/confirmation';
import { FuseLoadingModule } from '@fuse/services/loading';
import { FuseMediaWatcherModule } from '@fuse/services/media-watcher/media-watcher.module';
import { FusePlatformModule } from '@fuse/services/platform/platform.module';
import { FuseSplashScreenModule } from '@fuse/services/splash-screen/splash-screen.module';
import { FuseUtilsModule } from '@fuse/services/utils/utils.module';

@NgModule({
    imports  : [
        FuseConfirmationModule,
        FuseLoadingModule,
        FuseMediaWatcherModule,
        FusePlatformModule,
        FuseSplashScreenModule,
        FuseUtilsModule
    ],
    providers: [
        {
            // Disable 'theme' sanity check
            provide : MATERIAL_SANITY_CHECKS,
            useValue: {
                doctype: true,
                theme  : false,
                version: true
            }
        },
        {
            // Use the 'fill' appearance on Angular Material form fields by default
            provide : MAT_FORM_FIELD_DEFAULT_OPTIONS,
            useValue: {
                appearance: 'fill'
            }
        }
    ]
})
export class FuseModule
{
    /**
     * Constructor
     */
    constructor(@Optional() @SkipSelf() parentModule?: FuseModule)
    {
        if ( parentModule )
        {
            throw new Error('FuseModule has already been loaded. Import this module in the AppModule only!');
        }
    }
}
