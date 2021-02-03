const LABELS = ['conditional', 'configuration_data', 'dependency', 'documentation', 'idempotency', 'security', 'service', 'syntax']

function capitalizeFirstLetter(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

function swapItemText(item_id) {
  present_item = $("#dropdown-extract-metrics-label-btn").text().trim().toLowerCase()
  clicked_item = $("#dropdown-extract-metrics-label-item-"+item_id).text().trim().toLowerCase()

  present_item = LABELS.indexOf(present_item)
  clicked_item = LABELS.indexOf(clicked_item)

  $("#dropdown-extract-metrics-label-btn").html(capitalizeFirstLetter(LABELS[clicked_item]))
  $("#dropdown-extract-metrics-label-item-"+item_id).html(capitalizeFirstLetter(LABELS[present_item]))
}

$("#dropdown-extract-metrics-label-item-1").click(function(){
  swapItemText("1")
});

$("#dropdown-extract-metrics-label-item-2").click(function(){
  swapItemText("2")
});

$("#dropdown-extract-metrics-label-item-3").click(function(){
  swapItemText("3")
});

$("#dropdown-extract-metrics-label-item-4").click(function(){
  swapItemText("4")
});

$("#dropdown-extract-metrics-label-item-5").click(function(){
  swapItemText("5")
});

$("#dropdown-extract-metrics-label-item-6").click(function(){
  swapItemText("6")
});

$("#dropdown-extract-metrics-label-item-7").click(function(){
  swapItemText("7")
});

$("#dropdown-extract-metrics-label-item-8").click(function(){
  swapItemText("8")
});