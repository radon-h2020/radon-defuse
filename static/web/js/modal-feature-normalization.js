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

$("#feature-normalization-checkbox").change(function(){
  if(is_on('#feature-normalization-checkbox')){
    if(!(is_on('#minmax-scaler-checkbox') || is_on('#std-scaler-checkbox'))){
      toggleOn('#minmax-scaler-checkbox')
      toggleOn('#std-scaler-checkbox')
    }
  }
})

$("#feature-normalization-save-btn").click(function(){
  if(!(is_on('#minmax-scaler-checkbox') || is_on('#std-scaler-checkbox'))){
    toggleOff('#feature-normalization-checkbox')
  }else{
    toggleOn('#feature-normalization-checkbox')
  }

  $('#modal-feature-normalization').modal('hide');
})
