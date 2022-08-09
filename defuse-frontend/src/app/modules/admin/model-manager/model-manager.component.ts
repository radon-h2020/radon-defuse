import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { MatDialog } from '@angular/material/dialog'
import { MatSnackBar } from '@angular/material/snack-bar';
import { TasksService } from 'app/modules/admin/tasks/tasks.service';
import { TrainModelDialog } from 'app/modules/admin/model-manager/dialogs/train.component';

@Component({
    selector       : 'model-manager',
    templateUrl    : './model-manager.component.html',
    encapsulation  : ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ModelManagerComponent
{
    /**
     * Constructor
     */
    constructor(public _dialog: MatDialog,
                private _snackBar: MatSnackBar,
                private _tasksService: TasksService
    )
    {
    }

    onTrainModel(): void {

        let dialogRef = this._dialog.open(TrainModelDialog);
        dialogRef.afterClosed().subscribe(selection => {
            if( selection && selection.repository && selection.defect && selection.language && selection.validation && selection.metrics ){

                this._tasksService.train(
                    selection.repository, 
                    selection.defect, 
                    selection.language, 
                    selection.validation, 
                    selection.metrics).subscribe(response => {

                    let message = ''
        
                    if (response.status === 202) {
                        message = 'Mining started'
                    } else {
                        message = 'Some errors have occurred'
                    }
        
                    this._snackBar.open(message, 'Dismiss', { duration: 3000 });
                })
            }
        })
    }
}