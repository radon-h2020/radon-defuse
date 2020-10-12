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

$("#data-balancing-checkbox").change(function(){
  if(is_on('#data-balancing-checkbox')){
    if(!(is_on('#rus-checkbox') || is_on('#ros-checkbox'))){
        toggleOn('#rus-checkbox')
        toggleOn('#ros-checkbox')
    }
  }
})

$("#data-balancing-save-btn").click(function(){
  if(!(is_on('#rus-checkbox') || is_on('#ros-checkbox'))){
    toggleOff('#data-balancing-checkbox')
  }else{
    toggleOn('#data-balancing-checkbox')
  }

  $('#modal-data-balancing').modal('hide');
})
