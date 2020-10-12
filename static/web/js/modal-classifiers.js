function is_on(checkbox_id){
    return $(checkbox_id).prop('checked')
}

function toggleOn(checkbox_id) {
    $(checkbox_id).bootstrapToggle('on')
    $(checkbox_id).prop('checked')
}

function toggleOff(checkbox_id) {
    $(checkbox_id).bootstrapToggle('off')
    $(checkbox_id).prop('unchecked')
}

$("#classifiers-save-btn").click(function(){
  if(!(is_on('#dt-classifier-checkbox')  ||
       is_on('#dlr-classifier-checkbox') ||
       is_on('#nb-classifier-checkbox')  ||
       is_on('#rf-classifier-checkbox')  ||
       is_on('#svm-classifier-checkbox'))){

       toastr.options.positionClass="toast-bottom-right"
       toastr.options.preventDuplicates=true
       toastr.warning('Please, select at least one classifier!')
  }else{
      $('#modal-classifiers').modal('hide');
  }
})
